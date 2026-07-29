-- 0004_roles_permissions.sql
-- RBAC: roles (por empresa ou de sistema), permissions (catálogo), e os relacionamentos
-- role_permissions e membership_roles.
-- Idempotente: seguro reexecutar.

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants (id) on delete cascade,
  name text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- tenant_id nulo representa papel de sistema (global). NULL não é comparável em
-- constraints UNIQUE comuns, por isso usamos índices únicos parciais.
create unique index if not exists roles_tenant_name_unique
  on public.roles (tenant_id, name)
  where tenant_id is not null;

create unique index if not exists roles_system_name_unique
  on public.roles (name)
  where tenant_id is null;

create index if not exists roles_tenant_id_idx on public.roles (tenant_id);

drop trigger if exists set_updated_at on public.roles;
create trigger set_updated_at
  before update on public.roles
  for each row
  execute function public.set_updated_at();

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists permissions_code_unique on public.permissions (code);

drop trigger if exists set_updated_at on public.permissions;
create trigger set_updated_at
  before update on public.permissions
  for each row
  execute function public.set_updated_at();

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create index if not exists role_permissions_permission_id_idx on public.role_permissions (permission_id);

create table if not exists public.membership_roles (
  membership_id uuid not null references public.tenant_memberships (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (membership_id, role_id)
);

create index if not exists membership_roles_role_id_idx on public.membership_roles (role_id);
