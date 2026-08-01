import { Award } from "lucide-react";
import type { NivelFidelidade } from "@/types/consumer";

type IndicadorDeNivelProps = {
  nivel: NivelFidelidade;
  variante?: "compacto" | "completo";
};

const NIVEL_LABEL: Record<NivelFidelidade, string> = {
  bronze: "Bronze",
  prata: "Prata",
  ouro: "Ouro",
};

const NIVEL_CLASSES: Record<NivelFidelidade, string> = {
  bronze: "bg-consumer-level-bronze/10 text-consumer-level-bronze",
  prata: "bg-consumer-level-silver/15 text-neutral-600",
  ouro: "bg-consumer-level-gold/15 text-amber-700",
};

/** Indicador de Nível — sempre visível quando a Conta Fidelidade existe (DS-001 §11). */
export function IndicadorDeNivel({ nivel, variante = "compacto" }: IndicadorDeNivelProps) {
  const classeBase = variante === "compacto" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${NIVEL_CLASSES[nivel]} ${classeBase}`}
    >
      <Award className={variante === "compacto" ? "size-3.5" : "size-4"} aria-hidden="true" />
      Nível {NIVEL_LABEL[nivel]}
    </span>
  );
}
