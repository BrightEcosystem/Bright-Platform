-- 0005_products_subscriptions.sql
-- Catálogo de produtos Bright e habilitação de produtos por empresa (tenant_products).
-- Idempotente: seguro reexecutar.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists products_code_unique on public.products (code);

drop trigger if exists set_updated_at on public.products;
create trigger set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

create table if not exists public.tenant_products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  status text not null default 'inactive' check (status in ('inactive', 'active', 'suspended')),
  plan text,
  activated_at timestamptz,
  deactivated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, product_id)
);

create index if not exists tenant_products_tenant_id_idx on public.tenant_products (tenant_id);
create index if not exists tenant_products_product_id_idx on public.tenant_products (product_id);

drop trigger if exists set_updated_at on public.tenant_products;
create trigger set_updated_at
  before update on public.tenant_products
  for each row
  execute function public.set_updated_at();
