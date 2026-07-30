import type { ReactNode } from "react";
import type { AuthContext } from "@/types/auth";
import { hasAnyRole, hasRole } from "@/lib/auth/permissions";

/**
 * Oculta/mostra a interface conforme o papel do usuário na empresa ativa.
 *
 * Isto é só conforto visual — NUNCA substitui a verificação real, que
 * acontece no servidor (Server Action / RLS). Ocultar um botão aqui não
 * impede alguém de chamar a Server Action diretamente; a ação em si precisa
 * se proteger com `requireRole`/`requirePermission` (ver `protected-action.ts`).
 */
export function RoleGate({
  ctx,
  role,
  anyOf,
  children,
  fallback = null,
}: {
  ctx: AuthContext | null;
  role?: string;
  anyOf?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  if (!ctx) return <>{fallback}</>;

  const allowed = anyOf ? hasAnyRole(ctx, anyOf) : role ? hasRole(ctx, role) : false;

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
