import type { Comprovante } from "@/types/consumer";

/** Comprovantes mockados (DATA-001 §2.13). */
export const mockComprovantes: Comprovante[] = [
  {
    id: "comprovante-001",
    estabelecimento: "Café Estrela",
    valor: 42.9,
    data: "2026-07-27",
    status: "aprovado",
  },
  {
    id: "comprovante-002",
    estabelecimento: "Pizzaria Napoli",
    valor: 65.0,
    data: "2026-07-25",
    status: "em_analise",
  },
  {
    id: "comprovante-003",
    estabelecimento: "Café Estrela",
    valor: 18.5,
    data: "2026-07-18",
    status: "rejeitado",
  },
];
