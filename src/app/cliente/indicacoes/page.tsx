import { Share2 } from "lucide-react";
import { BadgeSelo } from "@/components/consumer/BadgeSelo";
import { Botao } from "@/components/consumer/Botao";
import { EstadoVazio } from "@/components/consumer/EstadoVazio";
import { mockIndicacoes } from "@/services/mock";
import type { StatusIndicacao } from "@/types/consumer";

const STATUS_LABEL: Record<StatusIndicacao, string> = {
  enviada: "Enviada",
  cadastrada: "Cadastrada",
  recompensada: "Recompensada",
};

const STATUS_TOM: Record<StatusIndicacao, "sucesso" | "atencao" | "neutro"> = {
  enviada: "neutro",
  cadastrada: "atencao",
  recompensada: "sucesso",
};

const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

/** Tela Indicações (UX-001 §5.9) — indicações enviadas e status de recompensa. */
export default function IndicacoesPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-consumer-text">Indicações</h1>
        <Botao variante="secundario" className="px-3">
          <Share2 className="size-4" aria-hidden="true" />
          Indicar
        </Botao>
      </div>

      {mockIndicacoes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {mockIndicacoes.map((indicacao) => (
            <div
              key={indicacao.id}
              className="flex items-center justify-between rounded-xl border border-consumer-border bg-consumer-bg p-4"
            >
              <div>
                <p className="text-sm font-semibold text-consumer-text">{indicacao.nomeIndicado}</p>
                <p className="text-xs text-consumer-text-muted">{formatoData.format(new Date(indicacao.data))}</p>
              </div>
              <BadgeSelo label={STATUS_LABEL[indicacao.status]} tom={STATUS_TOM[indicacao.status]} />
            </div>
          ))}
        </div>
      ) : (
        <EstadoVazio
          titulo="Nenhuma indicação ainda"
          descricao="Indique um amigo e ganhe pontos quando ele se cadastrar."
          variante="primeiro-acesso"
        />
      )}
    </div>
  );
}
