import Link from "next/link";

type TenantSwitcherProps = {
  tenantName: string | null;
};

/** Nunca exibe o ID da empresa — só o nome, nunca o UUID (ver CORE-001 §5). */
export function TenantSwitcher({ tenantName }: TenantSwitcherProps) {
  if (!tenantName) return null;

  return (
    <Link
      href="/selecionar-empresa"
      className="hidden truncate rounded-md px-2 py-1.5 text-sm text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 sm:inline-block"
    >
      <span className="max-w-[10rem]">{tenantName}</span> · trocar empresa
    </Link>
  );
}
