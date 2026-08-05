-- 20260802000700_core_loyalty_criar_lancamento_fix.sql
-- CORE-002.1: corrige criar_lancamento para nao aplicar a checagem de saldo
-- suficiente em estornos.
--
-- Achado durante a execucao da matriz de testes obrigatorios: um estorno
-- (source_type = 'estorno', reversao de um lancamento especifico via
-- estorno_de) e sempre um debito de compensacao referente a um credito
-- ANTERIOR -- se o consumidor ja gastou parte do valor creditado, o saldo
-- atual pode ser menor que o valor original, e a checagem de saldo
-- suficiente (pensada para impedir GASTO discricionario além do saldo)
-- bloqueava incorretamente a correcao/estorno em si. Um estorno precisa
-- sempre poder ser lancado, mesmo que reduza o saldo a zero (o cache nunca
-- fica negativo por constraint da tabela -- ver nota de escopo abaixo).
--
-- CREATE OR REPLACE preserva os grants (REVOKE FROM PUBLIC/anon,
-- GRANT TO authenticated/service_role) ja aplicados em
-- 20260802000400/20260802000600, pois a assinatura da funcao nao muda.
--
-- Idempotente: seguro reexecutar.

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

  -- saldo nao-negativo: exigido apenas para debitos de GASTO discricionario
  -- (cashback, points). Estornos (p_estorno_de informado) sempre podem ser
  -- lancados -- sao a correcao de um lancamento especifico anterior, nao um
  -- novo gasto, e bloquear a correcao deixaria o ledger permanentemente
  -- errado. O cache de saldo nunca fica negativo (constraint da tabela);
  -- recalcular_saldo_conta_fidelidade usa greatest(..., 0) -- o valor
  -- assinado exato sempre pode ser obtido somando o ledger diretamente.
  if p_natureza = 'debito' and p_asset_type in ('cashback', 'points') and p_estorno_de is null then
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
