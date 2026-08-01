import { Gift, Sparkles, Ticket } from "lucide-react";
import { BadgeSelo } from "@/components/consumer/BadgeSelo";
import { ContadorDeTicket } from "@/components/consumer/ContadorDeTicket";
import { mockTicketsDisponiveis } from "@/services/mock";

const MECANICAS = [
  { titulo: "Roleta", icone: Sparkles },
  { titulo: "Raspadinha", icone: Ticket },
  { titulo: "Baú", icone: Gift },
] as const;

/**
 * Tela Jogar (UX-001 §5.6) — selo "Em breve" obrigatório até liberação jurídica (`080-Seguranca.md §4`)
 * e implementação técnica estarem satisfeitas. Mecânicas exibidas desabilitadas, sem interação real.
 */
export default function JogarPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-consumer-text">Jogar</h1>
        <BadgeSelo label="Em breve" tom="em-breve" />
      </div>

      <ContadorDeTicket quantidade={mockTicketsDisponiveis} />

      <div className="grid grid-cols-3 gap-3">
        {MECANICAS.map((mecanica) => (
          <div
            key={mecanica.titulo}
            className="flex flex-col items-center gap-2 rounded-xl border border-consumer-border bg-consumer-bg-subtle px-3 py-6 text-center opacity-60"
          >
            <mecanica.icone className="size-8 text-consumer-text-muted" aria-hidden="true" />
            <p className="text-xs font-medium text-consumer-text-muted">{mecanica.titulo}</p>
            <BadgeSelo label="Em breve" tom="em-breve" />
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-consumer-text-muted">
        As mecânicas de sorteio serão liberadas assim que a validação jurídica e técnica for concluída.
      </p>
    </div>
  );
}
