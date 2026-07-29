import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { ActiveMembership, AuthContext } from "@/types/auth";

export const ACTIVE_TENANT_COOKIE = "active_tenant_id";

type MembershipQueryRow = {
  id: string;
  job_title: string | null;
  status: string;
  tenant: { id: string; name: string; slug: string } | null;
  membership_roles: { roles: { name: string } | null }[] | null;
};

/**
 * Lê o usuário autenticado e seus vínculos ativos direto do servidor.
 *
 * Usa `auth.getUser()` (não `auth.getSession()`) porque `getUser()` revalida
 * o token contra o servidor de autenticação do Supabase — `getSession()`
 * apenas lê o cookie local, sem garantir que ele ainda é válido.
 *
 * O tenant ativo é lido de um cookie, mas NUNCA é confiado sem revalidação:
 * só é considerado ativo se realmente existir entre os memberships ativos
 * do usuário, consultados agora no banco.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const [{ data: membershipRows }, { data: profile }] = await Promise.all([
    supabase
      .from("tenant_memberships")
      .select(
        "id, job_title, status, tenant:tenants(id, name, slug), membership_roles(roles(name))",
      )
      .eq("profile_id", user.id)
      .eq("status", "active")
      .returns<MembershipQueryRow[]>(),
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .returns<{ full_name: string | null; avatar_url: string | null }[]>()
      .single(),
  ]);

  const memberships: ActiveMembership[] = (membershipRows ?? [])
    .filter((row) => row.tenant !== null)
    .map((row) => ({
      membershipId: row.id,
      tenantId: row.tenant!.id,
      tenantName: row.tenant!.name,
      tenantSlug: row.tenant!.slug,
      jobTitle: row.job_title,
      status: row.status as ActiveMembership["status"],
      roles: (row.membership_roles ?? [])
        .map((mr) => mr.roles?.name)
        .filter((name): name is string => Boolean(name)),
    }));

  const cookieStore = await cookies();
  const requestedTenantId = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value ?? null;
  const activeTenantId = memberships.some((m) => m.tenantId === requestedTenantId)
    ? requestedTenantId
    : null;

  return {
    userId: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    memberships,
    activeTenantId,
  };
}

export function getActiveMembership(ctx: AuthContext): ActiveMembership | null {
  if (!ctx.activeTenantId) return null;
  return ctx.memberships.find((m) => m.tenantId === ctx.activeTenantId) ?? null;
}
