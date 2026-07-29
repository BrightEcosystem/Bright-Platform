import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { AuthContext } from "@/types/auth";
import { getActiveMembership } from "@/lib/auth/session";

/** Papéis de sistema criados em 0009_seed_system_roles.sql. */
export const SYSTEM_ROLES = {
  PLATFORM_ADMIN: "platform.admin",
  TENANT_ADMIN: "tenant.admin",
  PROJECT_MANAGER: "project.manager",
  PROJECT_VIEWER: "project.viewer",
} as const;

/** O usuário tem este papel na empresa ativa? */
export function hasRole(ctx: AuthContext, roleName: string): boolean {
  return getActiveMembership(ctx)?.roles.includes(roleName) ?? false;
}

/** O usuário tem algum destes papéis na empresa ativa? */
export function hasAnyRole(ctx: AuthContext, roleNames: string[]): boolean {
  return roleNames.some((role) => hasRole(ctx, role));
}

/** O usuário tem acesso (qualquer papel ativo) ao tenant informado? */
export function hasAccessToTenant(ctx: AuthContext, tenantId: string): boolean {
  return ctx.memberships.some((m) => m.tenantId === tenantId);
}

/**
 * Verifica uma permissão específica (catálogo `permissions`/`role_permissions`).
 *
 * O catálogo de permissões ainda não tem nenhum registro (ver BE-003/AUTH-001 —
 * só os 4 papéis de sistema foram semeados nesta fase). Esta função já
 * funciona corretamente assim que permissões forem cadastradas; até lá,
 * sempre retorna `false` porque não há nada para conceder.
 */
export async function hasPermission(
  supabase: SupabaseClient<Database>,
  ctx: AuthContext,
  permissionCode: string,
): Promise<boolean> {
  const membership = getActiveMembership(ctx);
  if (!membership || membership.roles.length === 0) return false;

  const { data: roles } = await supabase
    .from("roles")
    .select("id")
    .in("name", membership.roles)
    .returns<{ id: string }[]>();

  const roleIds = (roles ?? []).map((role) => role.id);
  if (roleIds.length === 0) return false;

  const { data: rolePermissions } = await supabase
    .from("role_permissions")
    .select("permission:permissions(code)")
    .in("role_id", roleIds)
    .returns<{ permission: { code: string } | null }[]>();

  return (rolePermissions ?? []).some((rp) => rp.permission?.code === permissionCode);
}
