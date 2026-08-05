-- 20260802000300_core_loyalty_ledger.sql
-- CORE-002.1: Lancamento (DATA-001 §2.2) -- ledger unificado, append-only.
-- Tabela aditiva, nenhuma tabela existente do Core e alterada.
-- Idempotente: seguro reexecutar.

create table if not exists public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  conta_fidelidade_id uuid not null references public.contas_fidelidade (id) on delete restrict,
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  asset_type text not null,
  natureza text not null,
  valor numeric(14,4) not null,
  currency text,
  estado text not null,
  source_type text not null,
  source_reference text,
  idempotency_key text not null,
  estorno_de uuid references public.lancamentos (id),
  autor_id uuid references auth.users (id),
  data_efetiva timestamptz not null default now(),
  data_expiracao timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, idempotency_key)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'lancamentos_asset_type_check'
  ) then
    alter table public.lancamentos
      add constraint lancamentos_asset_type_check
      check (asset_type in ('cashback', 'points', 'xp', 'tickets'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'lancamentos_natureza_check'
  ) then
    alter table public.lancamentos
      add constraint lancamentos_natureza_check
      check (natureza in ('credito', 'debito'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'lancamentos_valor_positivo_check'
  ) then
    alter table public.lancamentos
      add constraint lancamentos_valor_positivo_check
      check (valor > 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'lancamentos_valor_inteiro_check'
  ) then
    alter table public.lancamentos
      add constraint lancamentos_valor_inteiro_check
      check (asset_type = 'cashback' or valor = floor(valor));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'lancamentos_currency_check'
  ) then
    alter table public.lancamentos
      add constraint lancamentos_currency_check
      check (
        (asset_type = 'cashback' and currency is not null)
        or (asset_type <> 'cashback' and currency is null)
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'lancamentos_estado_check'
  ) then
    alter table public.lancamentos
      add constraint lancamentos_estado_check
      check (estado in ('pendente', 'confirmado', 'disponivel', 'resgatado', 'expirado', 'estornado'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'lancamentos_source_type_check'
  ) then
    alter table public.lancamentos
      add constraint lancamentos_source_type_check
      check (source_type in ('compra', 'campanha', 'missao', 'estorno', 'ajuste_manual'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'lancamentos_estorno_referencia_check'
  ) then
    alter table public.lancamentos
      add constraint lancamentos_estorno_referencia_check
      check (source_type <> 'estorno' or estorno_de is not null);
  end if;
end $$;

create index if not exists lancamentos_conta_created_idx
  on public.lancamentos (conta_fidelidade_id, created_at);

create index if not exists lancamentos_tenant_created_idx
  on public.lancamentos (tenant_id, created_at);

create index if not exists lancamentos_source_idx
  on public.lancamentos (source_type, source_reference);

-- Sem trigger de updated_at: a tabela e append-only por design (nunca ha UPDATE).
