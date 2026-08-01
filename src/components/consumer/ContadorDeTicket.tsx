import { Ticket } from "lucide-react";

type ContadorDeTicketProps = {
  quantidade: number;
};

/** Contador de Tickets disponíveis — tela Jogar (DS-001 §11). */
export function ContadorDeTicket({ quantidade }: ContadorDeTicketProps) {
  const zerado = quantidade === 0;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
        zerado
          ? "border-consumer-border text-consumer-text-muted"
          : "border-consumer-secondary/40 bg-consumer-secondary/10 text-amber-700"
      }`}
    >
      <Ticket className="size-4" aria-hidden="true" />
      {zerado ? "Nenhum ticket disponível" : `${quantidade} ${quantidade === 1 ? "ticket" : "tickets"}`}
    </div>
  );
}
