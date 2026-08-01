import { CheckCircle2 } from "lucide-react";
import { BarraDeProgresso } from "./BarraDeProgresso";
import type { Missao } from "@/types/consumer";

type CardDeMissaoProps = {
  missao: Missao;
};

/** Card de Missão — progresso, XP e recompensa (enriquecido a pedido da Direção, DS-001 §11). */
export function CardDeMissao({ missao }: CardDeMissaoProps) {
  return (
    <div
      className={`rounded-xl border border-consumer-border bg-consumer-bg p-4 ${
        missao.concluida ? "animate-consumer-mission-complete" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-consumer-text">{missao.titulo}</p>
          <p className="text-xs text-consumer-text-muted">{missao.descricao}</p>
        </div>
        {missao.concluida && (
          <CheckCircle2 className="size-5 shrink-0 text-consumer-support" aria-hidden="true" />
        )}
      </div>

      {!missao.concluida && (
        <div className="mt-3">
          <BarraDeProgresso atual={missao.progresso.atual} meta={missao.progresso.meta} />
          <p className="mt-1 text-xs text-consumer-text-muted">
            {missao.progresso.atual}/{missao.progresso.meta}
          </p>
        </div>
      )}

      <p className="mt-3 text-xs font-semibold text-consumer-secondary">{missao.recompensaDescricao}</p>
    </div>
  );
}
