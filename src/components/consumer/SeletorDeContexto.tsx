"use client";

import { useState } from "react";
import { Check, ChevronDown, Store } from "lucide-react";

type EmpresaResumo = { id: string; nomeFantasia: string };

type SeletorDeContextoProps = {
  empresaAtual: EmpresaResumo;
  empresas: EmpresaResumo[];
  onSelecionar: (empresaId: string) => void;
};

/** Seletor de Contexto — trocar empresa vinculada, não bloqueante (IDENT-001 §6, DS-001 §11). */
export function SeletorDeContexto({ empresaAtual, empresas, onSelecionar }: SeletorDeContextoProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex min-h-[44px] items-center gap-2 rounded-full border border-consumer-border bg-consumer-bg px-3 text-sm font-medium text-consumer-text"
        aria-expanded={aberto}
      >
        <Store className="size-4 text-consumer-primary" aria-hidden="true" />
        {empresaAtual.nomeFantasia}
        <ChevronDown className="size-4 text-consumer-text-muted" aria-hidden="true" />
      </button>

      {aberto && (
        <div className="absolute left-0 z-10 mt-2 w-56 rounded-xl border border-consumer-border bg-consumer-bg p-1 shadow-lg">
          {empresas.map((empresa) => (
            <button
              key={empresa.id}
              type="button"
              onClick={() => {
                onSelecionar(empresa.id);
                setAberto(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-consumer-text hover:bg-consumer-bg-subtle"
            >
              {empresa.nomeFantasia}
              {empresa.id === empresaAtual.id && <Check className="size-4 text-consumer-primary" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
