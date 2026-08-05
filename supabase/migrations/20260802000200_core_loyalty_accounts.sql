-- 20260802000200_core_loyalty_accounts.sql
-- CORE-002.1: Conta Fidelidade (IDENT-001 §8) -- tabela aditiva, nenhuma tabela
-- existente do Core e alterada. Idempotente: seguro reexecutar.

create table if not exists public.contas_fidelidade (
  id uuid primary key default gen_random_uuid(),
  consumer_id uuid not null references auth.users (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  status text not null default 'active',
  closed_at timestamptz,
  closed_reason text,
  balance_cashback numeric(12,2) not null default 0,
  balance_cashback_currency text not null default 'BRL',
  balance_points integer not null default 0,
  nivel text not null default 'bronze',
  xp_atual integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (consumer_id, tenant_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contas_fidelidade_status_check'
  ) then
    alter table public.contas_fidelidade
      add constraint contas_fidelidade_status_check
      check (status in ('active', 'suspended', 'closed'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'contas_fidelidade_closed_at_check'
  ) then
    alter table public.contas_fidelidade
      add constraint contas_fidelidade_closed_at_check
      check (status <> 'closed' or closed_at is not null);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'contas_fidelidade_nivel_check'
  ) then
    alter table public.contas_fidelidade
      add constraint contas_fidelidade_nivel_check
      check (nivel in ('bronze', 'prata', 'ouro'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'contas_fidelidade_balances_check'
  ) then
    alter table public.contas_fidelidade
      add constraint contas_fidelidade_balances_check
      check (balance_cashback >= 0 and balance_points >= 0 and xp_atual >= 0);
  end if;
end $$;

create index if not exists contas_fidelidade_tenant_status_idx
  on public.contas_fidelidade (tenant_id, status);

drop trigger if exists set_updated_at on public.contas_fidelidade;
create trigger set_updated_at
  before update on public.contas_fidelidade
  for each row
  execute function public.set_updated_at();
