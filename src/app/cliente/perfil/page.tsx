import Link from "next/link";
import { ChevronRight, LogOut, Settings, Store } from "lucide-react";
import { Avatar } from "@/components/consumer/Avatar";
import { IndicadorDeNivel } from "@/components/consumer/IndicadorDeNivel";
import { Botao } from "@/components/consumer/Botao";
import { signOutConsumer } from "@/services/consumer-auth/actions";
import { mockContaFidelidade } from "@/services/mock";

const ATALHOS = [
  { href: "/cliente/configuracoes", label: "Configurações", icone: Settings },
  { href: "/cliente/adicionar-empresa", label: "Adicionar empresa", icone: Store },
] as const;

/** Tela Perfil (UX-001 §5.10) — dados do consumidor, atalhos e sair. */
export default function PerfilPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar nome={mockContaFidelidade.nomeConsumidor} tamanho="lg" />
        <div>
          <p className="text-lg font-bold text-consumer-text">{mockContaFidelidade.nomeConsumidor}</p>
          <p className="text-sm text-consumer-text-muted">{mockContaFidelidade.empresaAtual.nomeFantasia}</p>
        </div>
        <IndicadorDeNivel nivel={mockContaFidelidade.nivel} variante="completo" />
      </div>

      <div className="flex flex-col divide-y divide-consumer-border rounded-xl border border-consumer-border bg-consumer-bg">
        {ATALHOS.map((atalho) => (
          <Link
            key={atalho.href}
            href={atalho.href}
            className="flex min-h-[44px] items-center justify-between px-4 py-3 text-sm text-consumer-text"
          >
            <span className="flex items-center gap-3">
              <atalho.icone className="size-4 text-consumer-text-muted" aria-hidden="true" />
              {atalho.label}
            </span>
            <ChevronRight className="size-4 text-consumer-text-muted" aria-hidden="true" />
          </Link>
        ))}
      </div>

      <form action={signOutConsumer}>
        <Botao type="submit" variante="secundario" className="w-full">
          <LogOut className="size-4" aria-hidden="true" />
          Sair
        </Botao>
      </form>
    </div>
  );
}
