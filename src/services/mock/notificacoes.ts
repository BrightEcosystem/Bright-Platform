import type { Notificacao, PreferenciaNotificacao } from "@/types/consumer";

/** Central de Notificações (operacional) e Central de Novidades (promocional) — UX-001 §11. */
export const mockNotificacoes: Notificacao[] = [
  {
    id: "notif-001",
    tipo: "operacional",
    titulo: "Cashback disponível",
    mensagem: "Seu cashback de R$ 12,40 já está disponível para uso.",
    data: "2026-07-28",
    lida: false,
  },
  {
    id: "notif-002",
    tipo: "operacional",
    titulo: "Comprovante em análise",
    mensagem: "Recebemos seu comprovante da Pizzaria Napoli.",
    data: "2026-07-25",
    lida: true,
  },
  {
    id: "notif-003",
    tipo: "novidade",
    titulo: "Nova recompensa no Marketplace",
    mensagem: "O Café Estrela adicionou um novo benefício exclusivo.",
    data: "2026-07-24",
    lida: false,
  },
  {
    id: "notif-004",
    tipo: "novidade",
    titulo: "Campanha de fim de semana",
    mensagem: "Pontos em dobro em compras neste sábado e domingo.",
    data: "2026-07-23",
    lida: true,
  },
];

export const mockPreferenciasNotificacao: PreferenciaNotificacao[] = [
  { chave: "cashback", rotulo: "Cashback disponível", ativo: true },
  { chave: "missoes", rotulo: "Progresso de missões", ativo: true },
  { chave: "comprovantes", rotulo: "Status de comprovantes", ativo: true },
  { chave: "novidades", rotulo: "Novidades e campanhas", ativo: false },
];
