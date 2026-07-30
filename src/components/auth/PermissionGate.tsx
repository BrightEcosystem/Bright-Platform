import type { ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { AuthContext } from "@/types/auth";
import type { PermissionCode } from "@/modules/auth/permission-catalog";
import { hasAnyPermission, hasPermission } from "@/lib/auth/permissions";

/**
 * Oculta/mostra a interface conforme a permissão do usuário na empresa ativa.
 * Server Component assíncrono (a checagem consulta o banco) — se usado
 * dentro de uma lista, envolva com `<Suspense>` no ponto de chamada para um
 * estado de carregamento, se a latência importar.
 *
 * Isto é só conforto visual — NUNCA substitui a verificação real, que
 * acontece no servidor (Server Action / RLS). Ver `RoleGate` para o mesmo
 * aviso e `protected-action.ts` para a proteção real.
 */
export async function PermissionGate({
  supabase,
  ctx,
  permission,
  anyOf,
  children,
  fallback = null,
}: {
  supabase: SupabaseClient<Database>;
  ctx: AuthContext | null;
  permission?: PermissionCode;
  anyOf?: PermissionCode[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  if (!ctx) return <>{fallback}</>;

  const allowed = anyOf
    ? await hasAnyPermission(supabase, ctx, anyOf)
    : permission
      ? await hasPermission(supabase, ctx, permission)
      : false;

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
