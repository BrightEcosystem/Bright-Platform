import { BadgeSelo } from "./BadgeSelo";
import type { Lancamento, StatusLancamento } from "@/types/consumer";

const STATUS_LABEL: Record<StatusLancamento, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  disponivel: "Disponível",
  resgatado: "Resgatado",
  expirado: "Expirado",
  estornado: "Estornado",
};

const STATUS_TOM: Record<StatusLancamento, "sucesso" | "atencao" | "erro" | "neutro"> = {
  pendente: "atencao",
  confirmado: "neutro",
  disponivel: "sucesso",
  resgatado: "neutro",
  expirado: "erro",
  estornado: "erro",
};

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

/** Item de Extrato — uma linha de Lançamento na Carteira (DS-001 §11). */
export function ItemDeExtrato({ lancamento }: { lancamento: Lancamento }) {
  const sinal = lancamento.tipo === "credito" ? "+" : "-";
  const corValor = lancamento.tipo === "credito" ? "text-consumer-support" : "text-consumer-text-muted";

  return (
    <div className="flex items-center justify-between border-b border-consumer-border py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-consumer-text">{lancamento.descricao}</p>
        <p className="text-xs text-consumer-text-muted">
          {lancamento.origem} · {formatoData.format(new Date(lancamento.data))}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        {lancamento.valor > 0 && (
          <span className={`text-sm font-semibold ${corValor}`}>
            {sinal} {formatoMoeda.format(lancamento.valor)}
          </span>
        )}
        <BadgeSelo label={STATUS_LABEL[lancamento.status]} tom={STATUS_TOM[lancamento.status]} />
      </div>
    </div>
  );
}
