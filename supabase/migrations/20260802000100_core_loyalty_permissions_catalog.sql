-- 20260802000100_core_loyalty_permissions_catalog.sql
-- CORE-002.1: extensao aditiva do catalogo de PERM-001 para Conta Fidelidade.
-- Idempotente: seguro reexecutar. Nenhuma linha existente alterada.

insert into public.permissions (code, name, description, module, action, status)
values
  ('tenant.consumers.view', 'Visualizar consumidores', 'Permite visualizar as Contas Fidelidade de consumidores da propria empresa.', 'tenant_consumer', 'view', 'active'),
  ('tenant.consumers.manage', 'Gerenciar consumidores', 'Permite gerenciar Contas Fidelidade e criar lancamentos administrativos da propria empresa.', 'tenant_consumer', 'manage', 'active')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  module = excluded.module,
  action = excluded.action;

-- Mapeamento: tenant.admin recebe as duas novas permissoes.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'tenant.admin'
  and r.tenant_id is null
  and p.code in ('tenant.consumers.view', 'tenant.consumers.manage')
on conflict (role_id, permission_id) do nothing;

-- Mapeamento: platform.admin recebe TODAS as permissoes do catalogo, incluindo as novas
-- (mesmo bloco usado em 20260729001000_permissions_catalog.sql, reexecutado para as novas linhas).
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'platform.admin' and r.tenant_id is null
on conflict (role_id, permission_id) do nothing;

-- tenant.member NAO recebe estas permissoes por padrao (decisao explicita da Direcao).
