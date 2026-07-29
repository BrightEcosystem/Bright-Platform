-- 0009_seed_system_roles.sql
-- AUTH-001: catálogo inicial e mínimo de papéis de sistema (RBAC).
-- Seed ESTRUTURAL (definição do sistema), não é dado de cliente —
-- por isso vive como migration, não em database/seeds/.
-- Idempotente: seguro reexecutar.

insert into public.roles (tenant_id, name, is_system)
values
  (null, 'platform.admin', true),
  (null, 'tenant.admin', true),
  (null, 'project.manager', true),
  (null, 'project.viewer', true)
on conflict (name) where tenant_id is null do nothing;
