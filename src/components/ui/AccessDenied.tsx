import Link from "next/link";

/**
 * Mensagem de negação sempre genérica — nunca revela qual verificação de
 * papel/permissão falhou (ver `page-guard.ts` e `BE-006 §5`).
 */
export function AccessDenied() {
  return (
    <div className="text-center">
      <h1 className="mb-2 text-xl font-semibold text-neutral-100">Acesso negado</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Você não tem permissão para acessar esta página. Se acredita que isso é um engano, entre em
        contato com o administrador da sua empresa.
      </p>
      <Link
        href="/dashboard"
        className="text-sm text-neutral-300 underline hover:text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
