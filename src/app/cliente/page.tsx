import { redirect } from "next/navigation";

/** Raiz de /cliente — redireciona para Início (ConsumerShell cuida do redirecionamento para Entrar quando necessário). */
export default function ClienteRootPage() {
  redirect("/cliente/inicio");
}
