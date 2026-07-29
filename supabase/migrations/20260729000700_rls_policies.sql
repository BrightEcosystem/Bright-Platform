-- 0007_rls_policies.sql
-- Row Level Security: isolamento multiempresa desde a origem (BE-002 §4).
-- Idempotente: seguro reexecutar.
--
-- IMPORTANTE: estas políticas assumem que a autenticação real do Supabase está
-- conectada (auth.uid()) e que "public.tenant_memberships.status = 'active'"
-- reflete o vínculo vigente do usuário com a empresa. Nenhuma dessas condições
-- é verdadeira nesta fase (fundação técnica, sem Supabase real conectado) —
-- este arquivo prepara a política para quando a conexão real acontecer, e
-- deve ser revisado antes de ir para produção.

-- Função utilitária: o usuário autenticado pertence (ativamente) a um tenant?
create or replace function public.is_tenant_member(check_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = check_tenant_id
      and tm.profile_id = auth.uid()
      and tm.status = 'active'
  );
$$;

-- tenants: visível apenas para membros ativos da empresa.
alter table public.tenants enable row level security;

drop policy if exists tenants_select_member on public.tenants;
create policy tenants_select_member
  on public.tenants
  for select
  using (public.is_tenant_member(id));

-- profiles: cada usuário só enxerga e edita o próprio perfil nesta fase.
-- Visibilidade entre membros da mesma empresa será definida em um BE-XXX futuro,
-- junto com a funcionalidade de "Empresas"/"Clientes" (evita antecipar regra de negócio).
alter table public.profiles enable row level security;

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self
  on public.profiles
  for select
  using (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles
  for update
  using (id = auth.uid());

-- tenant_memberships: visível para membros ativos da mesma empresa.
alter table public.tenant_memberships enable row level security;

drop policy if exists tenant_memberships_select_member on public.tenant_memberships;
create policy tenant_memberships_select_member
  on public.tenant_memberships
  for select
  using (public.is_tenant_member(tenant_id));

-- roles: papéis de sistema (tenant_id nulo) são visíveis a qualquer usuário
-- autenticado; papéis de empresa, só para membros daquela empresa.
alter table public.roles enable row level security;

drop policy if exists roles_select_system_or_member on public.roles;
create policy roles_select_system_or_member
  on public.roles
  for select
  using (
    tenant_id is null
    or public.is_tenant_member(tenant_id)
  );

-- permissions: catálogo global, leitura liberada a qualquer usuário autenticado.
-- Escrita fica restrita ao service_role (que ignora RLS por padrão no Supabase).
alter table public.permissions enable row level security;

drop policy if exists permissions_select_authenticated on public.permissions;
create policy permissions_select_authenticated
  on public.permissions
  for select
  using (auth.role() = 'authenticated');

-- role_permissions: visível se o papel relacionado for visível.
alter table public.role_permissions enable row level security;

drop policy if exists role_permissions_select_via_role on public.role_permissions;
create policy role_permissions_select_via_role
  on public.role_permissions
  for select
  using (
    exists (
      select 1 from public.roles r
      where r.id = role_permissions.role_id
        and (r.tenant_id is null or public.is_tenant_member(r.tenant_id))
    )
  );

-- membership_roles: visível se o vínculo (membership) pertencer a uma empresa do usuário.
alter table public.membership_roles enable row level security;

drop policy if exists membership_roles_select_via_membership on public.membership_roles;
create policy membership_roles_select_via_membership
  on public.membership_roles
  for select
  using (
    exists (
      select 1 from public.tenant_memberships tm
      where tm.id = membership_roles.membership_id
        and public.is_tenant_member(tm.tenant_id)
    )
  );

-- products: catálogo global, leitura liberada a qualquer usuário autenticado.
alter table public.products enable row level security;

drop policy if exists products_select_authenticated on public.products;
create policy products_select_authenticated
  on public.products
  for select
  using (auth.role() = 'authenticated');

-- tenant_products: visível apenas para membros ativos da empresa.
alter table public.tenant_products enable row level security;

drop policy if exists tenant_products_select_member on public.tenant_products;
create policy tenant_products_select_member
  on public.tenant_products
  for select
  using (public.is_tenant_member(tenant_id));

-- audit_logs: visível apenas para membros ativos da empresa auditada.
-- Escrita destinada ao service_role (backend), nunca ao cliente.
alter table public.audit_logs enable row level security;

drop policy if exists audit_logs_select_member on public.audit_logs;
create policy audit_logs_select_member
  on public.audit_logs
  for select
  using (
    tenant_id is not null
    and public.is_tenant_member(tenant_id)
  );
