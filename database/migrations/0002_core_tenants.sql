-- 0002_core_tenants.sql
-- Entidade central de multiempresa (tenants) e função utilitária de updated_at.
-- Idempotente: seguro reexecutar.

-- Função compartilhada para manter updated_at atualizado em qualquer tabela.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists tenants_slug_unique on public.tenants (slug);
create index if not exists tenants_status_idx on public.tenants (status);

drop trigger if exists set_updated_at on public.tenants;
create trigger set_updated_at
  before update on public.tenants
  for each row
  execute function public.set_updated_at();
