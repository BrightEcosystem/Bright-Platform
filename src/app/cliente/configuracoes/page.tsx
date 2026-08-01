"use client";

import { useState } from "react";
import { ToggleDePreferencia } from "@/components/consumer/ToggleDePreferencia";
import { mockPreferenciasNotificacao } from "@/services/mock";

/** Tela Configurações do Consumidor (UX-001 §5.11) — preferências de notificação. */
export default function ConfiguracoesPage() {
  const [preferencias, setPreferencias] = useState(mockPreferenciasNotificacao);

  function alternar(chave: string, valor: boolean) {
    setPreferencias((atual) =>
      atual.map((preferencia) => (preferencia.chave === chave ? { ...preferencia, ativo: valor } : preferencia))
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-bold text-consumer-text">Configurações</h1>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-consumer-text">Notificações</h2>
        <div className="divide-y divide-consumer-border rounded-xl border border-consumer-border bg-consumer-bg px-4">
          {preferencias.map((preferencia) => (
            <ToggleDePreferencia
              key={preferencia.chave}
              rotulo={preferencia.rotulo}
              ativo={preferencia.ativo}
              onChange={(valor) => alternar(preferencia.chave, valor)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
