import Link from "next/link";
import { signOut } from "@/services/auth/actions";

type HeaderProps = {
  userEmail: string;
  userName: string | null;
  tenantName: string | null;
};

export function Header({ userEmail, userName, tenantName }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4">
      <input
        type="search"
        placeholder="Buscar..."
        disabled
        className="w-64 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-400 placeholder:text-neutral-600"
      />
      <div className="flex items-center gap-4 text-sm text-neutral-400">
        {tenantName ? (
          <Link href="/selecionar-empresa" className="hover:text-neutral-200">
            {tenantName} · trocar empresa
          </Link>
        ) : null}
        <span>Notificações</span>
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-neutral-800" aria-label="Perfil" />
          <span className="max-w-[10rem] truncate text-neutral-300">
            {userName || userEmail}
          </span>
        </div>
        <form action={signOut}>
          <button type="submit" className="hover:text-neutral-200">
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
