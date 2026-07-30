import { requirePageAnyPermission } from "@/lib/auth/page-guard";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge, labelForStatus, toneForStatus } from "@/components/ui/StatusBadge";

type TenantProductRow = {
  id: string;
  status: string;
  plan: string | null;
  product: { name: string; description: string | null } | null;
};

export default async function ProdutosPage() {
  const { ctx, supabase } = await requirePageAnyPermission(["product.view", "tenant_product.view"]);

  const { data: tenantProducts } = await supabase
    .from("tenant_products")
    .select("id, status, plan, product:products(name, description)")
    .eq("tenant_id", ctx.activeTenantId!)
    .returns<TenantProductRow[]>();

  const rows = tenantProducts ?? [];

  return (
    <div>
      <PageHeader title="Produtos" description="Catálogo de produtos habilitados para a empresa ativa." />

      {rows.length === 0 ? (
        <EmptyState
          title="Nenhum produto habilitado"
          description="Esta empresa ainda não possui produtos vinculados."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
              <p className="text-sm font-medium text-neutral-200">{row.product?.name ?? "Produto"}</p>
              {row.product?.description ? (
                <p className="mt-1 text-sm text-neutral-500">{row.product.description}</p>
              ) : null}
              <div className="mt-3 flex items-center gap-2">
                <StatusBadge label={labelForStatus(row.status)} tone={toneForStatus(row.status)} />
                {row.plan ? <span className="text-xs text-neutral-500">{row.plan}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
