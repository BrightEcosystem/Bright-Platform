-- 0010_permissions_catalog.sql
-- PERM-001: catálogo inicial de permissões e mapeamento aos papéis estruturais.
-- Idempotente: seguro reexecutar. Nenhuma migration anterior foi alterada.

alter table public.permissions
  add column if not exists name text,
  add column if not exists module text,
  add column if not exists action text,
  add column if not exists status text not null default 'active';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'permissions_status_check'
  ) then
    alter table public.permissions
      add constraint permissions_status_check check (status in ('active', 'inactive'));
  end if;
end $$;

create index if not exists permissions_module_idx on public.permissions (module);

-- Catálogo inicial — apenas o necessário para a fundação da plataforma
-- (nenhuma permissão de módulo ainda inexistente, ex.: Bright Gestão de Projetos).
insert into public.permissions (code, name, description, module, action, status)
values
  ('platform.access', 'Acessar a plataforma', 'Permite autenticar e acessar a Bright Platform.', 'platform', 'access', 'active'),
  ('platform.manage', 'Administrar a plataforma', 'Permite administrar configurações globais da plataforma.', 'platform', 'manage', 'active'),
  ('tenant.view', 'Visualizar empresa', 'Permite visualizar os dados cadastrais da empresa.', 'tenant', 'view', 'active'),
  ('tenant.update', 'Atualizar empresa', 'Permite atualizar os dados cadastrais da empresa.', 'tenant', 'update', 'active'),
  ('tenant.members.view', 'Visualizar membros da empresa', 'Permite visualizar os membros vinculados à empresa.', 'tenant', 'members.view', 'active'),
  ('tenant.members.manage', 'Gerenciar membros da empresa', 'Permite convidar, remover e alterar membros da empresa.', 'tenant', 'members.manage', 'active'),
  ('tenant.roles.view', 'Visualizar papéis da empresa', 'Permite visualizar os papéis atribuídos aos membros da empresa.', 'tenant', 'roles.view', 'active'),
  ('tenant.roles.manage', 'Gerenciar papéis da empresa', 'Permite atribuir e revogar papéis dos membros da empresa.', 'tenant', 'roles.manage', 'active'),
  ('user.profile.view', 'Visualizar perfil de usuário', 'Permite visualizar o perfil de um usuário.', 'user', 'profile.view', 'active'),
  ('user.profile.update', 'Atualizar perfil de usuário', 'Permite atualizar o próprio perfil de usuário.', 'user', 'profile.update', 'active'),
  ('product.view', 'Visualizar catálogo de produtos', 'Permite visualizar o catálogo global de produtos Bright.', 'product', 'view', 'active'),
  ('product.manage', 'Gerenciar catálogo de produtos', 'Permite criar e alterar produtos do catálogo global.', 'product', 'manage', 'active'),
  ('tenant_product.view', 'Visualizar produtos da empresa', 'Permite visualizar quais produtos estão habilitados para a empresa.', 'tenant_product', 'view', 'active'),
  ('tenant_product.manage', 'Gerenciar produtos da empresa', 'Permite habilitar, desabilitar ou alterar o plano de produtos da empresa.', 'tenant_product', 'manage', 'active'),
  ('audit.view', 'Visualizar auditoria', 'Permite visualizar os registros de auditoria da empresa.', 'audit', 'view', 'active')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  module = excluded.module,
  action = excluded.action;

-- Mapeamento: platform.admin recebe TODAS as permissões do catálogo.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'platform.admin' and r.tenant_id is null
on conflict (role_id, permission_id) do nothing;

-- Mapeamento: tenant.admin recebe as permissões de nível de empresa
-- (não recebe platform.access/platform.manage, que são de sistema).
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'tenant.admin'
  and r.tenant_id is null
  and p.code in (
    'tenant.view', 'tenant.update',
    'tenant.members.view', 'tenant.members.manage',
    'tenant.roles.view', 'tenant.roles.manage',
    'user.profile.view', 'user.profile.update',
    'product.view', 'product.manage',
    'tenant_product.view', 'tenant_product.manage',
    'audit.view'
  )
on conflict (role_id, permission_id) do nothing;

-- project.manager e project.viewer permanecem reservados nesta etapa, sem
-- nenhuma permissão mapeada — são papéis de um produto futuro (Bright Gestão
-- de Projetos), fora do escopo do catálogo atual (ver BE-006).
