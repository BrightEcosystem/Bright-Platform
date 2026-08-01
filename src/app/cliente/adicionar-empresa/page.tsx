"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode } from "lucide-react";
import { Botao } from "@/components/consumer/Botao";

/** Tela Adicionar Empresa (UX-001 §5.12) — fluxo orgânico de vínculo a nova Conta Fidelidade, mockado. */
export default function AdicionarEmpresaPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  function handleAdicionar(event: React.FormEvent) {
    event.preventDefault();
    setCarregando(true);
    setTimeout(() => router.push("/cliente/perfil"), 400);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-bold text-consumer-text">Adicionar empresa</h1>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-consumer-border p-8 text-center">
        <QrCode className="size-10 text-consumer-text-muted" aria-hidden="true" />
        <p className="text-sm text-consumer-text-muted">
          Escaneie o QR Code da empresa parceira ou digite o código de convite abaixo.
        </p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={handleAdicionar}>
        <label className="flex flex-col gap-1 text-sm text-consumer-text">
          Código de convite
          <input
            type="text"
            required
            placeholder="Ex.: CAFE-ESTRELA"
            className="min-h-[44px] rounded-xl border border-consumer-border px-4 text-sm text-consumer-text outline-none focus-visible:border-consumer-primary"
          />
        </label>
        <Botao type="submit" carregando={carregando} className="w-full">
          Adicionar empresa
        </Botao>
      </form>
    </div>
  );
}
