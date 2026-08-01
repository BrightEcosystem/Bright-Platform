import type { Lancamento } from "@/types/consumer";

/** Extrato mockado (Lançamento, DATA-001 §2.2) — ordem decrescente por data. */
export const mockLancamentos: Lancamento[] = [
  {
    id: "lanc-001",
    tipo: "credito",
    origem: "Cashback",
    descricao: "Compra no Café Estrela",
    valor: 12.4,
    data: "2026-07-28",
    status: "disponivel",
  },
  {
    id: "lanc-002",
    tipo: "credito",
    origem: "Missão concluída",
    descricao: "Missão \"Visite 3 vezes na semana\"",
    valor: 0,
    data: "2026-07-26",
    status: "confirmado",
  },
  {
    id: "lanc-003",
    tipo: "debito",
    origem: "Resgate",
    descricao: "Resgate no Marketplace de Benefícios",
    valor: 30,
    data: "2026-07-22",
    status: "resgatado",
  },
  {
    id: "lanc-004",
    tipo: "credito",
    origem: "Cashback",
    descricao: "Compra na Pizzaria Napoli",
    valor: 8.9,
    data: "2026-07-20",
    status: "pendente",
  },
  {
    id: "lanc-005",
    tipo: "credito",
    origem: "Indicação",
    descricao: "Indicação recompensada",
    valor: 0,
    data: "2026-07-15",
    status: "confirmado",
  },
];
