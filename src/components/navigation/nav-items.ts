import type { PermissionCode } from "@/modules/auth/permission-catalog";

export type NavItem = {
  label: string;
  href: string;
  /** Exige exatamente esta permissão. Omitir junto com `anyPermission` = sempre visível. */
  permission?: PermissionCode;
  /** Exige ao menos uma destas permissões. */
  anyPermission?: PermissionCode[];
};

/**
 * Mapeamento de navegação da área autenticada (CORE-001 §4). "Visão Geral" e
 * "Configurações" ficam sempre visíveis para qualquer membership ativa: a
 * primeira é a página inicial, a segunda sempre tem ao menos a seção pessoal
 * de segurança, independente de permissões institucionais.
 */
export const navItems: NavItem[] = [
  { label: "Visão Geral", href: "/dashboard" },
  { label: "Minha Conta", href: "/minha-conta", permission: "user.profile.view" },
  { label: "Empresa", href: "/empresa", permission: "tenant.view" },
  { label: "Usuários", href: "/usuarios", permission: "tenant.members.view" },
  {
    label: "Produtos",
    href: "/produtos",
    anyPermission: ["product.view", "tenant_product.view"],
  },
  { label: "Configurações", href: "/configuracoes" },
];
