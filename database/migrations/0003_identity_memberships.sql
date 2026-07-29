-- 0003_identity_memberships.sql
-- Identidade (profiles vinculado a auth.users do Supabase) e vínculo usuário-empresa (tenant_memberships).
-- Idempotente: seguro reexecutar.
-- Requer o schema "auth" do Supabase Auth (existe automaticamente em qualquer projeto Supabase).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists profiles_email_unique on public.profiles (email);

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  job_title text,
  status text not null default 'active' check (status in ('active', 'suspended', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, profile_id)
);

create index if not exists tenant_memberships_tenant_id_idx on public.tenant_memberships (tenant_id);
create index if not exists tenant_memberships_profile_id_idx on public.tenant_memberships (profile_id);

drop trigger if exists set_updated_at on public.tenant_memberships;
create trigger set_updated_at
  before update on public.tenant_memberships
  for each row
  execute function public.set_updated_at();
