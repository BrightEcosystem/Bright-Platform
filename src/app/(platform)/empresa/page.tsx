import { requirePagePermission } from "@/lib/auth/page-guard";
import { hasPermission } from "@/lib/auth/permissions";
import { getActiveMembership } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, labelForStatus, toneForStatus } from "@/components/ui/StatusBadge";

type TenantRow = { name: string; slug: string; status: string };

export default async function EmpresaPage() {
  const { ctx, supabase } = await requirePagePermission("tenant.view");
  const membership = getActiveMembership(ctx);

  const [{ data: tenant }, canUpdate] = await Promise.all([
    supabase
      .from("tenants")
      .select("name, slug, status")
      .eq("id", ctx.activeTenantId!)
      .returns<TenantRow[]>()
      .single(),
    hasPermission(supabase, ctx, "tenant.update"),
  ]);

  return (
    <div>
      <PageHeader title="Empresa" description="Informações institucionais da empresa ativa." />

      <div className="max-w-lg rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-neutral-500">Nome</dt>
            <dd className="text-neutral-200">{tenant?.name ?? membership?.tenantName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Identificador</dt>
            <dd className="text-neutral-200">{tenant?.slug ?? membership?.tenantSlug ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Status</dt>
            <dd>
              <StatusBadge label={labelForStatus(tenant?.status)} tone={toneForStatus(tenant?.status)} />
            </dd>
          </div>
        </dl>
      </div>

      {canUpdate ? (
        <div className="mt-6 max-w-lg rounded-lg border border-dashed border-neutral-800 p-5">
          <p className="text-sm font-medium text-neutral-300">Edição de dados da empresa</p>
          <p className="mt-1 text-sm text-neutral-500">
            Estrutura visual reservada para uma futura funcionalidade de edição. Nenhuma ação de
            edição está implementada nesta fase.
          </p>
        </div>
      ) : null}
    </div>
  );
}
