export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Empresas", href: "/empresas" },
  { label: "Clientes", href: "/clientes" },
  { label: "Produtos", href: "/produtos" },
  { label: "Agentes IA", href: "/agentes-ia" },
  { label: "Workflows", href: "/workflows" },
  { label: "Integrações", href: "/integracoes" },
  { label: "Licitações", href: "/licitacoes" },
  { label: "Financeiro", href: "/financeiro" },
  { label: "Analytics", href: "/analytics" },
  { label: "Configurações", href: "/configuracoes" },
];
