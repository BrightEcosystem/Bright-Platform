import { Gift, Ticket, Wallet } from "lucide-react";

type RecompensaVariante = "cashback" | "cupom" | "brinde";

type CardDeRecompensaProps = {
  titulo: string;
  descricao: string;
  variante: RecompensaVariante;
  recemRecebido?: boolean;
};

const VARIANTE_ICONE: Record<RecompensaVariante, typeof Gift> = {
  cashback: Wallet,
  cupom: Ticket,
  brinde: Gift,
};

/** Card de Recompensa — cashback, cupons ou brindes disponíveis/recebidos (componente adicional, DS-001 §11). */
export function CardDeRecompensa({ titulo, descricao, variante, recemRecebido = false }: CardDeRecompensaProps) {
  const Icone = VARIANTE_ICONE[variante];

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-consumer-border bg-consumer-bg p-4 ${
        recemRecebido ? "animate-consumer-reward-earned" : ""
      }`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-consumer-support/10 text-consumer-support">
        <Icone className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-consumer-text">{titulo}</p>
        <p className="text-xs text-consumer-text-muted">{descricao}</p>
      </div>
    </div>
  );
}
