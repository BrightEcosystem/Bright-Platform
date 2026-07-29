import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { selectActiveTenant } from "@/services/tenants/actions";
import { signOut } from "@/services/auth/actions";
import { AutoSubmitForm } from "./AutoSubmitForm";

export default async function SelecionarEmpresaPage() {
  const ctx = await getAuthContext();

  if (!ctx) {
    redirect("/login");
  }

  if (ctx.memberships.length === 0) {
    redirect("/sem-acesso");
  }

  if (ctx.activeTenantId) {
    redirect("/dashboard");
  }

  if (ctx.memberships.length === 1) {
    const only = ctx.memberships[0];
    return (
      <AutoSubmitForm action={selectActiveTenant}>
        <input type="hidden" name="tenantId" value={only.tenantId} />
        <p className="text-sm text-neutral-400">Entrando em {only.tenantName}...</p>
      </AutoSubmitForm>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">Selecionar empresa</h1>
      <p className="mb-6 text-sm text-neutral-400">Escolha a empresa que deseja acessar.</p>
      <div className="flex flex-col gap-2">
        {ctx.memberships.map((membership) => (
          <form key={membership.tenantId} action={selectActiveTenant}>
            <input type="hidden" name="tenantId" value={membership.tenantId} />
            <button
              type="submit"
              className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-4 py-3 text-left text-sm hover:bg-neutral-800"
            >
              {membership.tenantName}
            </button>
          </form>
        ))}
      </div>
      <form action={signOut} className="mt-6">
        <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-300">
          Sair
        </button>
      </form>
    </div>
  );
}
