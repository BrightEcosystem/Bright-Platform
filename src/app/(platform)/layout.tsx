import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/providers/AuthProvider";
import { getActiveMembership, getAuthContext } from "@/lib/auth/session";
import { hasAnyPermission, hasPermission } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { navItems, type NavItem } from "@/components/navigation/nav-items";

export default async function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ctx = await getAuthContext();

  // Defesa em profundidade: o middleware já deveria ter barrado um usuário
  // não autenticado antes de chegar aqui.
  if (!ctx) {
    redirect("/login");
  }

  if (ctx.memberships.length === 0) {
    redirect("/sem-acesso");
  }

  if (!ctx.activeTenantId) {
    redirect("/selecionar-empresa");
  }

  const activeMembership = getActiveMembership(ctx);
  const supabase = await createClient();

  const visibleNavItems: NavItem[] = (
    await Promise.all(
      navItems.map(async (item) => {
        if (!item.permission && !item.anyPermission) return item;
        const allowed = item.permission
          ? await hasPermission(supabase, ctx, item.permission)
          : await hasAnyPermission(supabase, ctx, item.anyPermission!);
        return allowed ? item : null;
      }),
    )
  ).filter((item): item is NavItem => item !== null);

  return (
    <AuthProvider value={ctx}>
      <div className="flex h-screen bg-neutral-950 text-neutral-100">
        <Sidebar items={visibleNavItems} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            userEmail={ctx.email}
            userName={ctx.fullName}
            avatarUrl={ctx.avatarUrl}
            tenantName={activeMembership?.tenantName ?? null}
            navItems={visibleNavItems}
          />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
