"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Home, User, Wallet, Dices } from "lucide-react";

const ITENS = [
  { href: "/cliente/inicio", label: "Início", icone: Home },
  { href: "/cliente/carteira", label: "Carteira", icone: Wallet },
  { href: "/cliente/jogar", label: "Jogar", icone: Dices },
  { href: "/cliente/beneficios", label: "Benefícios", icone: Gift },
  { href: "/cliente/perfil", label: "Perfil", icone: User },
] as const;

/** Barra de Navegação Inferior — fixa, 5 itens (UX-001 §3, DS-001 §7/§11). */
export function BarraDeNavegacaoInferior() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-consumer-border bg-consumer-bg">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {ITENS.map((item) => {
          const ativo = pathname?.startsWith(item.href);
          const Icone = item.icone;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                ativo ? "text-consumer-primary" : "text-consumer-text-muted"
              }`}
            >
              <Icone className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
