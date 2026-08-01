import type { ItemMarketplaceBeneficio } from "@/types/consumer";

/** Itens do Marketplace de Benefícios mockados (DATA-001 §2.11/§2.12). */
export const mockBeneficios: ItemMarketplaceBeneficio[] = [
  {
    id: "beneficio-001",
    titulo: "Sobremesa grátis",
    descricao: "Troque seus pontos por uma sobremesa no Café Estrela.",
    custoPontos: 300,
    categoria: "Alimentação",
    disponivel: true,
  },
  {
    id: "beneficio-002",
    titulo: "10% de desconto",
    descricao: "Cupom de 10% de desconto na próxima compra.",
    custoPontos: 500,
    categoria: "Desconto",
    disponivel: true,
  },
  {
    id: "beneficio-003",
    titulo: "Combo especial",
    descricao: "Combo exclusivo para clientes nível ouro.",
    custoPontos: 1500,
    categoria: "Exclusivo",
    disponivel: false,
  },
];
