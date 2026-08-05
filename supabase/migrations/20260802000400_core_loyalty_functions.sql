-- 20260802000400_core_loyalty_functions.sql
-- CORE-002.1: funcoes de apoio a Conta Fidelidade / Lancamentos.
-- Todas security definer, search_path fixo, EXECUTE revogado de PUBLIC.
-- Idempotente: seguro reexecutar.

-- has_permission: estende is_tenant_member para granularidade de permissao,
-- necessaria porque contas_fidelidade/lancamentos exigem mais que "ser membro
-- do tenant" para colaboradores administrativos verem dados de consumidores.
create or replace function public.has_permission(check_tenant_id uuid, permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    join public.membership_roles mr on mr.membership_id = tm.id
    join public.role_permissions rp on rp.role_id = mr.role_id
    join public.permissions p on p.id = rp.permission_id
    where tm.profile_id = auth.uid()
      and tm.status = 'active'
      and p.code = permission_code
      and (
        tm.tenant_id = check_tenant_id
        or exists (
          select 1 from public.roles r
          where r.id = mr.role_id and r.tenant_id is null and r.name = 'platform.admin'
        )
      )
  );
$$;

revoke all on function public.has_permission(uuid, text) from public;
grant execute on function public.has_permission(uuid, text) to authenticated, service_role;

-- recalcular_saldo_conta_fidelidade: o cache de saldo e sempre reconstruido a
-- partir do ledger (fonte de verdade). Considera apenas lancamentos com
-- estado = 'disponivel' -- ver nota de escopo no plano tecnico (CORE-002.1 §3.2).
create or replace function public.recalcular_saldo_conta_fidelidade(p_conta_fidelidade_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cashback numeric(12,2);
  v_points integer;
  v_xp integer;
begin
  select
    coalesce(sum(valor) filter (where asset_type = 'cashback' and natureza = 'credito'), 0)
      - coalesce(sum(valor) filter (where asset_type = 'cashback' and natureza = 'debito'), 0),
    coalesce(sum(valor) filter (where asset_type = 'points' and natureza = 'credito'), 0)
      - coalesce(sum(valor) filter (where asset_type = 'points' and natureza = 'debito'), 0),
    coalesce(sum(valor) filter (where asset_type = 'xp' and natureza = 'credito'), 0)
      - coalesce(sum(valor) filter (where asset_type = 'xp' and natureza = 'debito'), 0)
  into v_cashback, v_points, v_xp
  from public.lancamentos
  where conta_fidelidade_id = p_conta_fidelidade_id
    and estado = 'disponivel';

  update public.contas_fidelidade
  set balance_cashback = greatest(coalesce(v_cashback, 0), 0),
      balance_points = greatest(coalesce(v_points, 0), 0)::integer,
      xp_atual = greatest(coalesce(v_xp, 0), 0)::integer
  where id = p_conta_fidelidade_id;
end;
$$;

revoke all on function public.recalcular_saldo_conta_fidelidade(uuid) from public;
grant execute on function public.recalcular_saldo_conta_fidelidade(uuid) to service_role;

-- join_tenant_loyalty: cria a Conta Fidelidade do consumidor autenticado na
-- empresa informada. Uma conta fechada nunca gera outra automaticamente para
-- o mesmo par (decisao da Direcao) -- reabertura e um processo administrativo
-- excepcional, fora desta funcao.
create or replace function public.join_tenant_loyalty(p_tenant_id uuid)
returns public.contas_fidelidade
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.contas_fidelidade;
  v_result public.contas_fidelidade;
begin
  if auth.uid() is null then
    raise exception 'requer usuario autenticado';
  end if;

  select * into v_existing
  from public.contas_fidelidade
  where consumer_id = auth.uid() and tenant_id = p_tenant_id;

  if found then
    if v_existing.status = 'closed' then
      raise exception 'conta fidelidade encerrada para esta empresa; reabertura exige processo administrativo';
    end if;
    return v_existing;
  end if;

  insert into public.contas_fidelidade (consumer_id, tenant_id, status)
  values (auth.uid(), p_tenant_id, 'active')
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.join_tenant_loyalty(uuid) from public;
grant execute on function public.join_tenant_loyalty(uuid) to authenticated, service_role;

-- alterar_status_conta_fidelidade: transicoes active <-> suspended ou -> closed,
-- restrito a colaboradores com tenant.consumers.manage. closed e terminal:
-- nenhuma transicao a partir dele e permitida por esta funcao.
create or replace function public.alterar_status_conta_fidelidade(
  p_conta_fidelidade_id uuid,
  p_novo_status text,
  p_motivo text default null
)
returns public.contas_fidelidade
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_status_atual text;
  v_result public.contas_fidelidade;
begin
  select tenant_id, status into v_tenant_id, v_status_atual
  from public.contas_fidelidade
  where id = p_conta_fidelidade_id;

  if v_tenant_id is null then
    raise exception 'conta_fidelidade % nao encontrada', p_conta_fidelidade_id;
  end if;

  if not public.has_permission(v_tenant_id, 'tenant.consumers.manage') then
    raise exception 'nao autorizado a alterar esta conta';
  end if;

  if p_novo_status not in ('active', 'suspended', 'closed') then
    raise exception 'status % invalido', p_novo_status;
  end if;

  if v_status_atual = 'closed' then
    raise exception 'conta encerrada e estado terminal; reabertura exige processo administrativo proprio';
  end if;

  update public.contas_fidelidade
  set status = p_novo_status,
      closed_at = case when p_novo_status = 'closed' then now() else closed_at end,
      closed_reason = case when p_novo_status = 'closed' then p_motivo else closed_reason end
  where id = p_conta_fidelidade_id
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.alterar_status_conta_fidelidade(uuid, text, text) from public;
grant execute on function public.alterar_status_conta_fidelidade(uuid, text, text) to authenticated, service_role;

-- criar_lancamento: unica via de escrita em lancamentos. Nenhum INSERT direto
-- de cliente e permitido (RLS, migration seguinte). Idempotente por
-- (tenant_id, idempotency_key).
create or replace function public.criar_lancamento(
  p_conta_fidelidade_id uuid,
  p_asset_type text,
  p_natureza text,
  p_valor numeric,
  p_estado text,
  p_source_type text,
  p_source_reference text,
  p_idempotency_key text,
  p_estorno_de uuid default null,
  p_currency text default null,
  p_data_efetiva timestamptz default null,
  p_data_expiracao timestamptz default null
)
returns public.lancamentos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_owner uuid;
  v_saldo_atual numeric;
  v_result public.lancamentos;
begin
  if auth.uid() is null then
    raise exception 'requer usuario autenticado';
  end if;

  select tenant_id, consumer_id into v_tenant_id, v_owner
  from public.contas_fidelidade
  where id = p_conta_fidelidade_id;

  if v_tenant_id is null then
    raise exception 'conta_fidelidade % nao encontrada', p_conta_fidelidade_id;
  end if;

  if not (
    v_owner = auth.uid()
    or public.has_permission(v_tenant_id, 'tenant.consumers.manage')
  ) then
    raise exception 'nao autorizado a criar lancamento nesta conta';
  end if;

  if p_asset_type not in ('cashback', 'points', 'xp', 'tickets') then
    raise exception 'asset_type % invalido', p_asset_type;
  end if;

  if p_natureza not in ('credito', 'debito') then
    raise exception 'natureza % invalida', p_natureza;
  end if;

  if p_valor is null or p_valor <= 0 then
    raise exception 'valor deve ser positivo';
  end if;

  if p_asset_type <> 'cashback' and p_valor <> floor(p_valor) then
    raise exception 'valor de % deve ser inteiro', p_asset_type;
  end if;

  if p_asset_type = 'cashback' and p_currency is null then
    raise exception 'cashback exige moeda';
  end if;

  if p_asset_type <> 'cashback' and p_currency is not null then
    raise exception '% nao aceita moeda', p_asset_type;
  end if;

  if p_source_type = 'estorno' and p_estorno_de is null then
    raise exception 'estorno exige referencia ao lancamento original';
  end if;

  -- saldo nao-negativo: exigido para os ativos ja em producao nesta fase
  -- (cashback, points); xp/tickets ainda nao sao escritos em CORE-002.
  if p_natureza = 'debito' and p_asset_type in ('cashback', 'points') then
    select case p_asset_type
      when 'cashback' then balance_cashback
      when 'points' then balance_points
    end
    into v_saldo_atual
    from public.contas_fidelidade
    where id = p_conta_fidelidade_id;

    if v_saldo_atual is null or v_saldo_atual < p_valor then
      raise exception 'saldo insuficiente para debito de % em %', p_valor, p_asset_type;
    end if;
  end if;

  insert into public.lancamentos (
    conta_fidelidade_id, tenant_id, asset_type, natureza, valor, currency, estado,
    source_type, source_reference, idempotency_key, estorno_de, autor_id,
    data_efetiva, data_expiracao
  ) values (
    p_conta_fidelidade_id, v_tenant_id, p_asset_type, p_natureza, p_valor, p_currency, p_estado,
    p_source_type, p_source_reference, p_idempotency_key, p_estorno_de, auth.uid(),
    coalesce(p_data_efetiva, now()), p_data_expiracao
  )
  on conflict (tenant_id, idempotency_key) do nothing
  returning * into v_result;

  if v_result.id is null then
    select * into v_result
    from public.lancamentos
    where tenant_id = v_tenant_id and idempotency_key = p_idempotency_key;
  else
    perform public.recalcular_saldo_conta_fidelidade(p_conta_fidelidade_id);
  end if;

  return v_result;
end;
$$;

revoke all on function public.criar_lancamento(
  uuid, text, text, numeric, text, text, text, text, uuid, text, timestamptz, timestamptz
) from public;
grant execute on function public.criar_lancamento(
  uuid, text, text, numeric, text, text, text, text, uuid, text, timestamptz, timestamptz
) to authenticated, service_role;
