"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Botao } from "@/components/consumer/Botao";
import { useConsumerSession } from "@/contexts/consumer-session-context";

/** Tela Entrar (UX-001 §5.1) — login mockado, sem chamada real ao Supabase nesta fase. */
export default function EntrarPage() {
  const router = useRouter();
  const { entrar } = useConsumerSession();
  const [carregando, setCarregando] = useState(false);

  function handleEntrar(destino: string) {
    setCarregando(true);
    entrar();
    router.push(destino);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-consumer-primary text-white">
          <Sparkles className="size-7" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-bold text-consumer-text">Bright</h1>
        <p className="text-sm text-consumer-text-muted">
          Acompanhe seu cashback, missões e recompensas em um só lugar.
        </p>
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          handleEntrar("/cliente/inicio");
        }}
      >
        <label className="flex flex-col gap-1 text-sm text-consumer-text">
          E-mail
          <input
            type="email"
            required
            placeholder="voce@email.com"
            className="min-h-[44px] rounded-xl border border-consumer-border px-4 text-sm text-consumer-text outline-none focus-visible:border-consumer-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-consumer-text">
          Senha
          <input
            type="password"
            required
            placeholder="••••••••"
            className="min-h-[44px] rounded-xl border border-consumer-border px-4 text-sm text-consumer-text outline-none focus-visible:border-consumer-primary"
          />
        </label>
        <Botao type="submit" carregando={carregando} className="mt-2 w-full">
          Entrar
        </Botao>
      </form>

      <Botao variante="texto" onClick={() => handleEntrar("/cliente/onboarding")} className="w-full">
        Primeiro acesso? Criar conta
      </Botao>
    </div>
  );
}
