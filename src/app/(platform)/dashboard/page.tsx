import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { InfoCard } from "@/components/ui/InfoCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge, labelForStatus, toneForStatus } from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { getActiveMembership, getAuthContext } from "@/lib/auth/session";
import { getGrantedPermissions } from "@/lib/auth/permissions";

type TenantProductRow = {
  id: string;
  status: string;
  plan: string | null;
  product: { name: string } | null;
};

export default async function DashboardPage() {
  const ctx = await getAuthContext();

  // Defesa em profundidade: o layout já redireciona sem sessão/tenant ativo.
  if (!ctx || !ctx.activeTenantId) {
    redirect("/login");
  }

  const membership = getActiveMembership(ctx);
  const supabase = await createClient();

  const [permissions, { data: tenantProducts }] = await Promise.all([
    getGrantedPermissions(supabase, ctx),
    supabase
      .from("tenant_products")
      .select("id, status, plan, product:products(name)")
      .eq("tenant_id", ctx.activeTenantId)
      .returns<TenantProductRow[]>(),
  ]);

  const lastAccess = ctx.lastSignInAt
    ? new Date(ctx.lastSignInAt).toLocaleString("pt-BR")
    : null;
  const products = tenantProducts ?? [];

  return (
    <div>
      <PageHeader
        title="Visão geral"
        description="Resumo institucional da sua conta e da empresa ativa."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard title="Empresa ativa">{membership?.tenantName ?? "—"}</InfoCard>
        <InfoCard title="Usuário">{ctx.fullName ?? ctx.email}</InfoCard>
        <InfoCard title="Papéis na empresa">
          {membership && membership.roles.length > 0 ? membership.roles.join(", ") : "Nenhum papel atribuído"}
        </InfoCard>
        <InfoCard title="Permissões concedidas">{permissions.length}</InfoCard>
        <InfoCard title="Status da conta">
          <StatusBadge label={labelForStatus(ctx.accountStatus)} tone={toneForStatus(ctx.accountStatus)} />
        </InfoCard>
        <InfoCard title="Status do vínculo com a empresa">
          <StatusBadge label={labelForStatus(membership?.status)} tone={toneForStatus(membership?.status)} />
        </InfoCard>
        {lastAccess ? <InfoCard title="Último acesso">{lastAccess}</InfoCard> : null}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-300">Produtos da empresa</h2>
        {products.length > 0 ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((tp) => (
              <li key={tp.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <p className="text-sm font-medium text-neutral-200">{tp.product?.name ?? "Produto"}</p>
                <div className="mt-2">
                  <StatusBadge label={labelForStatus(tp.status)} tone={toneForStatus(tp.status)} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Nenhum produto vinculado"
            description="Esta empresa ainda não possui produtos habilitados."
          />
        )}
      </div>
    </div>
  );
}
