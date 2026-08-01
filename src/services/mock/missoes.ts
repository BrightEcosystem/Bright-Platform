import type { Missao } from "@/types/consumer";

/** Missões mockadas (DATA-001 §2.6/§2.7) — progresso e recompensa de XP. */
export const mockMissoes: Missao[] = [
  {
    id: "missao-001",
    titulo: "Visite 3 vezes na semana",
    descricao: "Faça check-in em 3 visitas ao Café Estrela nesta semana.",
    progresso: { atual: 2, meta: 3 },
    recompensaXp: 50,
    recompensaDescricao: "+50 XP",
    concluida: false,
  },
  {
    id: "missao-002",
    titulo: "Primeira indicação",
    descricao: "Indique um amigo e ganhe pontos quando ele se cadastrar.",
    progresso: { atual: 1, meta: 1 },
    recompensaXp: 100,
    recompensaDescricao: "+100 XP e 200 pontos",
    concluida: true,
  },
  {
    id: "missao-003",
    titulo: "Envie um comprovante",
    descricao: "Envie o comprovante de uma compra para validar cashback.",
    progresso: { atual: 0, meta: 1 },
    recompensaXp: 30,
    recompensaDescricao: "+30 XP",
    concluida: false,
  },
];
