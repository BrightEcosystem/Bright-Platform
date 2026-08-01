import type { Indicacao } from "@/types/consumer";

/** Indicações mockadas (DATA-001 §2.10). */
export const mockIndicacoes: Indicacao[] = [
  {
    id: "indicacao-001",
    nomeIndicado: "Marina Souza",
    data: "2026-07-15",
    status: "recompensada",
    recompensaPontos: 200,
  },
  {
    id: "indicacao-002",
    nomeIndicado: "Felipe Torres",
    data: "2026-07-24",
    status: "cadastrada",
    recompensaPontos: 200,
  },
  {
    id: "indicacao-003",
    nomeIndicado: "Ana Paula",
    data: "2026-07-28",
    status: "enviada",
    recompensaPontos: 200,
  },
];
