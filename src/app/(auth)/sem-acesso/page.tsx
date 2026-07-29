import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { signOut } from "@/services/auth/actions";

export default async function SemAcessoPage() {
  const ctx = await getAuthContext();

  if (!ctx) {
    redirect("/login");
  }

  if (ctx.memberships.length > 0) {
    redirect("/selecionar-empresa");
  }

  return (
    <div className="text-center">
      <h1 className="mb-2 text-xl font-semibold">Sem acesso a nenhuma empresa</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Sua conta ainda não está vinculada a nenhuma empresa na Bright Platform. Entre em contato
        com o administrador da sua empresa para solicitar acesso.
      </p>
      <form action={signOut}>
        <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-300">
          Sair
        </button>
      </form>
    </div>
  );
}
