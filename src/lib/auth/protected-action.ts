import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { AuthContext } from "@/types/auth";
import type { PermissionCode } from "@/modules/auth/permission-catalog";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/session";
import { requirePermission, requireTenantAccess, AuthorizationError } from "@/lib/auth/permissions";

/**
 * Padrão reutilizável para proteger uma Server Action com uma permissão.
 *
 * Cobre, nesta ordem, os passos exigidos por qualquer ação protegida:
 * 1. usuário autenticado (via `getAuthContext`);
 * 2. membership ativa e tenant ativo (implícito em `ctx.activeTenantId`);
 * 3. permissão necessária (`requirePermission`);
 * 4. (se `tenantId` for informado) confirma que esse tenant é o mesmo já
 *    validado como ativo — nunca confia num `tenantId` vindo do cliente.
 *
 * Validação de entrada (Zod) fica a cargo de quem chama, antes ou depois —
 * este wrapper cuida só de autenticação/autorização, não do formato dos dados.
 *
 * @example
 * ```ts
 * "use server";
 *
 * const renameTenantSchema = z.object({ tenantId: z.string().uuid(), name: z.string().min(1) });
 *
 * export async function renameTenant(formData: FormData) {
 *   const parsed = renameTenantSchema.safeParse({
 *     tenantId: formData.get("tenantId"),
 *     name: formData.get("name"),
 *   });
 *   if (!parsed.success) return { error: "Dados inválidos." };
 *
 *   return withPermission("tenant.update", parsed.data.tenantId, async (ctx, supabase) => {
 *     const { error } = await supabase
 *       .from("tenants")
 *       .update({ name: parsed.data.name })
 *       .eq("id", parsed.data.tenantId); // RLS ainda se aplica como barreira final
 *     return error ? { error: "Não foi possível atualizar." } : { error: null };
 *   });
 * }
 * ```
 */
export async function withPermission<T>(
  permission: PermissionCode,
  tenantId: string | null,
  handler: (ctx: AuthContext, supabase: SupabaseClient<Database>) => Promise<T>,
): Promise<T> {
  const supabase = await createClient();
  const rawCtx = await getAuthContext();

  if (tenantId) {
    requireTenantAccess(rawCtx, tenantId);
  }

  const ctx = await requirePermission(supabase, rawCtx, permission);
  return handler(ctx, supabase);
}

export { AuthorizationError };
