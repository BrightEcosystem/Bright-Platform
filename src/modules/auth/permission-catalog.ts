/**
 * Catálogo de códigos de permissão — espelha `database/migrations/0010_permissions_catalog.sql`.
 * Usar este tipo (em vez de `string` solto) em qualquer lugar que receba um
 * código de permissão, para reduzir erro de digitação detectável em tempo de
 * compilação. Se o catálogo no banco mudar, atualizar esta lista também.
 */
export const PERMISSION_CODES = [
  "platform.access",
  "platform.manage",
  "tenant.view",
  "tenant.update",
  "tenant.members.view",
  "tenant.members.manage",
  "tenant.roles.view",
  "tenant.roles.manage",
  "user.profile.view",
  "user.profile.update",
  "product.view",
  "product.manage",
  "tenant_product.view",
  "tenant_product.manage",
  "audit.view",
] as const;

export type PermissionCode = (typeof PERMISSION_CODES)[number];

/** Papéis de sistema — espelha `database/migrations/0009_seed_system_roles.sql`. */
export const ROLE_NAMES = [
  "platform.admin",
  "tenant.admin",
  "project.manager",
  "project.viewer",
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];
