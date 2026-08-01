"use client";

import { useRouter } from "next/navigation";
import { Gift, Trophy, Wallet } from "lucide-react";
import { Botao } from "@/components/consumer/Botao";
import { useConsumerSession } from "@/contexts/consumer-session-context";

const PASSOS = [
  { icone: Wallet, titulo: "Acumule cashback", descricao: "Envie seus comprovantes e receba cashback nas suas compras." },
  { icone: Trophy, titulo: "Cumpra missões", descricao: "Ganhe XP e suba de nível completando missões simples." },
  { icone: Gift, titulo: "Troque por benefícios", descricao: "Use seus pontos no Marketplace de Benefícios das empresas parceiras." },
];

/** Tela Onboarding (UX-001 §5.2) — apresentação inicial antes do primeiro acesso à Início. */
export default function OnboardingPage() {
  const router = useRouter();
  const { entrar } = useConsumerSession();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between gap-8 px-6 py-10">
      <div className="flex flex-col gap-6">
        <h1 className="text-center text-2xl font-bold text-consumer-text">Bem-vindo ao Bright</h1>
        {PASSOS.map((passo) => (
          <div key={passo.titulo} className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-consumer-primary/10 text-consumer-primary">
              <passo.icone className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-consumer-text">{passo.titulo}</p>
              <p className="text-xs text-consumer-text-muted">{passo.descricao}</p>
            </div>
          </div>
        ))}
      </div>

      <Botao
        className="w-full"
        onClick={() => {
          entrar();
          router.push("/cliente/inicio");
        }}
      >
        Começar
      </Botao>
    </div>
  );
}
