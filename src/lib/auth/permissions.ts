import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { AuthContext } from "@/types/auth";
import type { PermissionCode, RoleName } from "@/modules/auth/permission-catalog";
import { getActiveMembership } from "@/lib/auth/session";

/**
 * Lançada por qualquer `require*` quando o acesso é negado. Mensagem sempre
 * genérica — nunca revela qual verificação específica falhou (evita vazar
 * detalhe de segurança útil para um atacante mapear o sistema).
 */
export class AuthorizationError extends Error {
  constructor(message = "Acesso negado.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Aceita os papéis conhecidos do catálogo (com autocomplete) e também
 * qualquer outro nome — empresas podem ter papéis próprios além dos 4
 * papéis de sistema (ver BE-003 §2.4).
 */
type RoleLike = RoleName | (string & {});

/** O usuário tem este papel na empresa ativa? */
export function hasRole(ctx: AuthContext, roleName: RoleLike): boolean {
  return getActiveMembership(ctx)?.roles.includes(roleName) ?? false;
}

/** O usuário tem algum destes papéis na empresa ativa? */
export function hasAnyRole(ctx: AuthContext, roleNames: RoleLike[]): boolean {
  return roleNames.some((role) => hasRole(ctx, role));
}

/** O usuário tem acesso (qualquer papel ativo) ao tenant informado? */
export function hasAccessToTenant(ctx: AuthContext, tenantId: string): boolean {
  return ctx.memberships.some((m) => m.tenantId === tenantId);
}

/**
 * Verifica uma permissão específica (catálogo `permissions`/`role_permissions`),
 * na empresa ativa do contexto. Nega por padrão: sem membership, sem papel,
 * papel sem a permissão, ou papel/permissão inexistente — tudo resulta em `false`.
 */
export async function hasPermission(
  supabase: SupabaseClient<Database>,
  ctx: AuthContext,
  permissionCode: PermissionCode,
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

/** O usuário tem ao menos uma destas permissões na empresa ativa? */
export async function hasAnyPermission(
  supabase: SupabaseClient<Database>,
  ctx: AuthContext,
  permissionCodes: PermissionCode[],
): Promise<boolean> {
  for (const code of permissionCodes) {
    if (await hasPermission(supabase, ctx, code)) return true;
  }
  return false;
}

/**
 * Retorna o conjunto (sem duplicatas) de códigos de permissão concedidos pelos
 * papéis da membership ativa. Usado onde o número/lista completa de permissões
 * é necessário (ex.: dashboard institucional) em vez de uma checagem booleana
 * código a código.
 */
export async function getGrantedPermissions(
  supabase: SupabaseClient<Database>,
  ctx: AuthContext,
): Promise<string[]> {
  const membership = getActiveMembership(ctx);
  if (!membership || membership.roles.length === 0) return [];

  const { data: roles } = await supabase
    .from("roles")
    .select("id")
    .in("name", membership.roles)
    .returns<{ id: string }[]>();

  const roleIds = (roles ?? []).map((role) => role.id);
  if (roleIds.length === 0) return [];

  const { data: rolePermissions } = await supabase
    .from("role_permissions")
    .select("permission:permissions(code)")
    .in("role_id", roleIds)
    .returns<{ permission: { code: string } | null }[]>();

  const codes = (rolePermissions ?? [])
    .map((rp) => rp.permission?.code)
    .filter((code): code is string => Boolean(code));

  return Array.from(new Set(codes));
}

/** O usuário tem todas estas permissões na empresa ativa? */
export async function hasAllPermissions(
  supabase: SupabaseClient<Database>,
  ctx: AuthContext,
  permissionCodes: PermissionCode[],
): Promise<boolean> {
  for (const code of permissionCodes) {
    if (!(await hasPermission(supabase, ctx, code))) return false;
  }
  return true;
}

/**
 * Garante que o usuário tem a permissão informada — lança `AuthorizationError`
 * caso contrário. Retorna o `AuthContext` (não nulo) em caso de sucesso, para
 * uso direto por quem chamou (evita checagem de nulidade repetida).
 */
export async function requirePermission(
  supabase: SupabaseClient<Database>,
  ctx: AuthContext | null,
  permissionCode: PermissionCode,
): Promise<AuthContext> {
  if (!ctx || !ctx.activeTenantId) throw new AuthorizationError();
  if (!(await hasPermission(supabase, ctx, permissionCode))) throw new AuthorizationError();
  return ctx;
}

/** Como `requirePermission`, mas basta uma das permissões da lista. */
export async function requireAnyPermission(
  supabase: SupabaseClient<Database>,
  ctx: AuthContext | null,
  permissionCodes: PermissionCode[],
): Promise<AuthContext> {
  if (!ctx || !ctx.activeTenantId) throw new AuthorizationError();
  if (!(await hasAnyPermission(supabase, ctx, permissionCodes))) throw new AuthorizationError();
  return ctx;
}

/** Garante que o usuário tem o papel informado na empresa ativa. */
export function requireRole(ctx: AuthContext | null, roleName: RoleLike): AuthContext {
  if (!ctx || !ctx.activeTenantId) throw new AuthorizationError();
  if (!hasRole(ctx, roleName)) throw new AuthorizationError();
  return ctx;
}

/**
 * Garante que o usuário tem acesso ao tenant informado — usar quando uma
 * ação recebe um `tenantId` explícito (parâmetro, formulário) em vez de
 * depender só do tenant ativo da sessão. Nunca confiar no `tenantId` do
 * cliente sem essa revalidação.
 */
export function requireTenantAccess(ctx: AuthContext | null, tenantId: string): AuthContext {
  if (!ctx) throw new AuthorizationError();
  if (!hasAccessToTenant(ctx, tenantId)) throw new AuthorizationError();
  return ctx;
}
