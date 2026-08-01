import type { ContaFidelidade } from "@/types/consumer";

/** Conta Fidelidade mockada (IDENT-001) — nenhuma conexão real com banco ou autenticação. */
export const mockContaFidelidade: ContaFidelidade = {
  id: "conta-mock-001",
  nomeConsumidor: "Renan Lagares",
  avatarUrl: null,
  empresaAtual: { id: "empresa-mock-001", nomeFantasia: "Café Estrela" },
  empresasVinculadas: [
    { id: "empresa-mock-001", nomeFantasia: "Café Estrela" },
    { id: "empresa-mock-002", nomeFantasia: "Pizzaria Napoli" },
  ],
  nivel: "prata",
  xpAtual: 640,
  xpProximoNivel: 1000,
  saldoCashback: 87.5,
  saldoPontos: 1240,
  primeiroAcesso: false,
};
