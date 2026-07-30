import { requirePagePermission } from "@/lib/auth/page-guard";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge, labelForStatus, toneForStatus } from "@/components/ui/StatusBadge";

type MembershipRow = {
  id: string;
  status: string;
  created_at: string;
  profile: { full_name: string | null; email: string } | null;
  membership_roles: { roles: { name: string } | null }[] | null;
};

export default async function UsuariosPage() {
  const { ctx, supabase } = await requirePagePermission("tenant.members.view");

  // Isolamento por tenant reforçado aqui e, como barreira final, pela RLS.
  const { data: memberships } = await supabase
    .from("tenant_memberships")
    .select("id, status, created_at, profile:profiles(full_name, email), membership_roles(roles(name))")
    .eq("tenant_id", ctx.activeTenantId!)
    .returns<MembershipRow[]>();

  const rows = memberships ?? [];

  return (
    <div>
      <PageHeader title="Usuários" description="Membros vinculados à empresa ativa." />

      {rows.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description="Esta empresa ainda não possui membros cadastrados."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Nome</th>
                <th scope="col" className="px-4 py-3 font-medium">E-mail</th>
                <th scope="col" className="px-4 py-3 font-medium">Papéis</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Desde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {rows.map((row) => {
                const roles = (row.membership_roles ?? [])
                  .map((mr) => mr.roles?.name)
                  .filter((name): name is string => Boolean(name));
                return (
                  <tr key={row.id}>
                    <td className="px-4 py-3 text-neutral-200">{row.profile?.full_name ?? "Não informado"}</td>
                    <td className="px-4 py-3 text-neutral-300">{row.profile?.email ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-300">
                      {roles.length > 0 ? roles.join(", ") : "Nenhum papel"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={labelForStatus(row.status)} tone={toneForStatus(row.status)} />
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {new Date(row.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
