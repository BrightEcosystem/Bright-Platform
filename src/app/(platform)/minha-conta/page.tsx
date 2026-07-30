import { requirePagePermission } from "@/lib/auth/page-guard";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, labelForStatus, toneForStatus } from "@/components/ui/StatusBadge";
import { MinhaContaForm } from "./MinhaContaForm";

export default async function MinhaContaPage() {
  const { ctx, supabase } = await requirePagePermission("user.profile.view");
  const canEdit = await hasPermission(supabase, ctx, "user.profile.update");

  return (
    <div>
      <PageHeader title="Minha conta" description="Suas informações pessoais na Bright Platform." />
      <div className="max-w-lg space-y-6">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-neutral-500">Nome</dt>
              <dd className="text-neutral-200">{ctx.fullName ?? "Não informado"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">E-mail</dt>
              <dd className="text-neutral-200">{ctx.email}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Status da conta</dt>
              <dd>
                <StatusBadge label={labelForStatus(ctx.accountStatus)} tone={toneForStatus(ctx.accountStatus)} />
              </dd>
            </div>
          </dl>
        </div>

        {canEdit ? <MinhaContaForm fullName={ctx.fullName} avatarUrl={ctx.avatarUrl} /> : null}
      </div>
    </div>
  );
}
