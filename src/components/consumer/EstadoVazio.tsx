import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Botao } from "./Botao";

type EstadoVazioProps = {
  titulo: string;
  descricao: string;
  icone?: LucideIcon;
  variante?: "comum" | "primeiro-acesso";
  acaoLabel?: string;
  onAcao?: () => void;
};

/** Estado Vazio, incluindo a variante "Primeiro acesso" (tom mais convidativo) — UX-001 §2/DS-001 §12. */
export function EstadoVazio({
  titulo,
  descricao,
  icone: Icone = Inbox,
  variante = "comum",
  acaoLabel,
  onAcao,
}: EstadoVazioProps) {
  const primeiroAcesso = variante === "primeiro-acesso";

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-consumer-border px-6 py-10 text-center">
      <span
        className={`flex size-12 items-center justify-center rounded-full ${
          primeiroAcesso ? "bg-consumer-primary/10 text-consumer-primary" : "bg-consumer-bg-subtle text-consumer-text-muted"
        }`}
      >
        <Icone className="size-6" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-consumer-text">{titulo}</p>
      <p className="max-w-xs text-xs text-consumer-text-muted">{descricao}</p>
      {acaoLabel && onAcao && (
        <Botao variante={primeiroAcesso ? "primario" : "secundario"} onClick={onAcao} className="mt-1">
          {acaoLabel}
        </Botao>
      )}
    </div>
  );
}
