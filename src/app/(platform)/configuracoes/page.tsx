import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function ConfiguracoesPage() {
  const ctx = await getAuthContext();

  // Defesa em profundidade: o layout já redireciona sem sessão/tenant ativo.
  if (!ctx || !ctx.activeTenantId) {
    redirect("/login");
  }

  const supabase = await createClient();
  const [canViewTenant, canManageMembers, canManageRoles] = await Promise.all([
    hasPermission(supabase, ctx, "tenant.update"),
    hasPermission(supabase, ctx, "tenant.members.manage"),
    hasPermission(supabase, ctx, "tenant.roles.manage"),
  ]);

  const hasInstitutionalAccess = canViewTenant || canManageMembers || canManageRoles;

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Preferências institucionais e de segurança da sua conta."
      />

      <div className="space-y-6">
        {canViewTenant ? (
          <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-sm font-medium text-neutral-200">Empresa</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Estrutura reservada para configurações institucionais da empresa. Nenhuma ação está
              implementada nesta fase.
            </p>
          </section>
        ) : null}

        {canManageMembers || canManageRoles ? (
          <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-sm font-medium text-neutral-200">Acessos</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Estrutura reservada para gestão de membros e papéis. Nenhuma ação está implementada
              nesta fase.
            </p>
          </section>
        ) : null}

        <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-sm font-medium text-neutral-200">Segurança</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Para alterar sua senha, utilize o fluxo de recuperação disponível na tela de login.
          </p>
        </section>

        <section className="rounded-lg border border-dashed border-neutral-800 p-5">
          <h2 className="text-sm font-medium text-neutral-400">Preferências</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Em construção — nenhuma preferência configurável nesta fase.
          </p>
        </section>

        {!hasInstitutionalAccess ? (
          <EmptyState
            title="Nenhuma configuração institucional disponível"
            description="Você não tem permissão para gerenciar configurações da empresa. Fale com o administrador se precisar de acesso."
          />
        ) : null}
      </div>
    </div>
  );
}
