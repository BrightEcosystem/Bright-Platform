import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { AuthContext } from "@/types/auth";
import type { PermissionCode, RoleName } from "@/modules/auth/permission-catalog";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/session";
import {
  requirePermission,
  requireAnyPermission,
  requireRole,
  AuthorizationError,
} from "@/lib/auth/permissions";

type PageAuth = { ctx: AuthContext; supabase: SupabaseClient<Database> };

/**
 * Guardas para Server Components de página — nunca para Server Actions (ver
 * `protected-action.ts` para isso). Ao negar, redireciona para `/sem-permissao`
 * em vez de lançar, já que uma página não tem como devolver um `ActionState`.
 * A mensagem exibida ao usuário é sempre genérica (ver `AccessDenied`); nenhum
 * detalhe sobre qual verificação falhou é exposto.
 */
export async function requirePagePermission(permission: PermissionCode): Promise<PageAuth> {
  const supabase = await createClient();
  const rawCtx = await getAuthContext();
  try {
    const ctx = await requirePermission(supabase, rawCtx, permission);
    return { ctx, supabase };
  } catch (err) {
    if (err instanceof AuthorizationError) redirect("/sem-permissao");
    throw err;
  }
}

export async function requirePageAnyPermission(permissions: PermissionCode[]): Promise<PageAuth> {
  const supabase = await createClient();
  const rawCtx = await getAuthContext();
  try {
    const ctx = await requireAnyPermission(supabase, rawCtx, permissions);
    return { ctx, supabase };
  } catch (err) {
    if (err instanceof AuthorizationError) redirect("/sem-permissao");
    throw err;
  }
}

export async function requirePageRole(roleName: RoleName | (string & {})): Promise<PageAuth> {
  const supabase = await createClient();
  const rawCtx = await getAuthContext();
  try {
    const ctx = requireRole(rawCtx, roleName);
    return { ctx, supabase };
  } catch (err) {
    if (err instanceof AuthorizationError) redirect("/sem-permissao");
    throw err;
  }
}
