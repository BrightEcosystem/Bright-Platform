"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { BarraDeNavegacaoInferior } from "./BarraDeNavegacaoInferior";
import { SeletorDeContexto } from "./SeletorDeContexto";
import { Avatar } from "./Avatar";
import { useConsumerSession } from "@/contexts/consumer-session-context";
import { mockContaFidelidade } from "@/services/mock";

const ROTAS_SEM_NAVEGACAO = ["/cliente/entrar", "/cliente/onboarding"];

/** Casca do Aplicativo do Consumidor: redireciona para /cliente/entrar quando não autenticado e controla a navegação inferior. */
export function ConsumerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { autenticado, carregando } = useConsumerSession();
  const [empresaAtualId, setEmpresaAtualId] = useState(mockContaFidelidade.empresaAtual.id);

  const rotaPublica = ROTAS_SEM_NAVEGACAO.some((rota) => pathname?.startsWith(rota));
  const empresaAtual =
    mockContaFidelidade.empresasVinculadas.find((empresa) => empresa.id === empresaAtualId) ??
    mockContaFidelidade.empresaAtual;

  useEffect(() => {
    if (!carregando && !autenticado && !rotaPublica) {
      router.replace("/cliente/entrar");
    }
  }, [autenticado, carregando, rotaPublica, router]);

  if (carregando || (!autenticado && !rotaPublica)) {
    return <div className="min-h-screen bg-consumer-bg" />;
  }

  return (
    <div className="min-h-screen bg-consumer-bg text-consumer-text">
      {!rotaPublica && (
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-consumer-border bg-consumer-bg px-4 py-3">
          <SeletorDeContexto
            empresaAtual={empresaAtual}
            empresas={mockContaFidelidade.empresasVinculadas}
            onSelecionar={setEmpresaAtualId}
          />
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Notificações" className="text-consumer-text-muted">
              <Bell className="size-5" aria-hidden="true" />
            </button>
            <Link href="/cliente/perfil" aria-label="Perfil">
              <Avatar nome={mockContaFidelidade.nomeConsumidor} tamanho="sm" />
            </Link>
          </div>
        </header>
      )}
      <div className={rotaPublica ? "" : "pb-16"}>{children}</div>
      {!rotaPublica && <BarraDeNavegacaoInferior />}
    </div>
  );
}
