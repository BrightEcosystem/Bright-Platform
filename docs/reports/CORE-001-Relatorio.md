# CORE-001 — Relatório de Implementação

**Status:** Concluído
**Data:** 2026-07-30
**Responsável pela execução:** Claude Code

---

## 1. Rotas criadas

`/minha-conta`, `/empresa`, `/usuarios`, `/sem-permissao` (novas). `/dashboard`, `/produtos`, `/configuracoes` foram **reescritas** (antes fictícias/placeholder). As demais rotas do menu antigo (`empresas`, `clientes`, `agentes-ia`, `workflows`, `integracoes`, `licitacoes`, `financeiro`, `analytics`) permanecem no disco, sem alteração, apenas removidas da navegação.

## 2. Layout

`src/app/(platform)/layout.tsx` calcula, no servidor, a lista de itens de navegação visíveis (por permissão) e a repassa para `Sidebar` e `Header`. `Header` foi reescrito como Client Component (precisa de `usePathname()` para derivar o título da página) e agora compõe `TenantSwitcher`, `UserMenu` e `MobileNavigation` em vez de código inline. Nenhum UUID é exibido em nenhum ponto da interface.

## 3. Sidebar

Reduzida de 11 itens hardcoded para 6, cada um com sua permissão (ou lista de permissões, "qualquer uma") declarada em `src/components/navigation/nav-items.ts`. A filtragem acontece uma vez no layout (não duplicada em cada página) e é usada tanto pela sidebar desktop quanto pela gaveta mobile.

## 4. Permissões aplicadas

| Rota/item | Permissão |
|---|---|
| Visão Geral | Nenhuma |
| Minha Conta | `user.profile.view` (leitura) / `user.profile.update` (edição, condicional) |
| Empresa | `tenant.view` (leitura) / `tenant.update` (estrutura visual reservada) |
| Usuários | `tenant.members.view` |
| Produtos | `product.view` OU `tenant_product.view` |
| Configurações | Nenhuma na página; seções institucionais condicionadas a `tenant.update`/`tenant.members.manage`/`tenant.roles.manage` |

Toda checagem é feita no servidor via `requirePagePermission`/`requirePageAnyPermission` (novo helper, `src/lib/auth/page-guard.ts`) ou diretamente com `hasPermission`/`hasAnyPermission` quando a página precisa renderizar seções condicionais em vez de bloquear tudo. Nenhuma página depende só de a sidebar esconder o link.

## 5. Páginas funcionais

- **Dashboard:** dados 100% reais (empresa ativa, usuário, papéis, contagem de permissões concedidas, status da conta, status do vínculo, último acesso quando existente, produtos da empresa ou estado vazio honesto).
- **Minha Conta:** visualização (nome, e-mail, status) + formulário de edição (nome, avatar) via Server Action validada com Zod, protegida por `withPermission("user.profile.update", ...)`, sempre self-only (o alvo do `update` é `ctx.userId`, nunca um valor vindo do formulário).
- **Configurações:** seções institucionais (Empresa, Acessos) só aparecem se o usuário tiver a permissão correspondente; Segurança e Preferências são sempre visíveis.

## 6. Páginas somente leitura

- **Empresa:** nome, identificador, status; se `tenant.update` existir, mostra apenas uma estrutura visual reservada para uma futura edição — nenhuma ação implementada.
- **Usuários:** listagem de memberships da empresa ativa (nome, e-mail, papéis, status, data), isolada por `tenant_id` e reforçada pela RLS. Ver achado na seção 10.
- **Produtos:** `tenant_products` + `products` da empresa ativa, com estado vazio honesto quando não há nenhum vinculado (era o caso real do banco até a criação dos dados de teste).

## 7. Componentes criados

`PageHeader`, `EmptyState`, `StatusBadge` (+ helpers `labelForStatus`/`toneForStatus`), `InfoCard`, `AccessDenied`, `UserMenu`, `TenantSwitcher`, `MobileNavigation`. `Sidebar` e `Header` foram reescritos. `StatCard` (usado só pelo dashboard fictício anterior) foi removido.

## 8. Testes realizados (dados fictícios, totalmente removidos depois)

Criados via Supabase Admin API: 2 empresas (`CORE-001 Teste A`/`B`), 1 produto, 1 `tenant_products` (A → produto, ativo), 1 usuário `tenant.admin` com membership ativa em **ambas** as empresas, 1 usuário com membership ativa **sem nenhum papel** apenas na empresa A.

Cenários verificados ao vivo, via navegador:

- Sem sessão → `/dashboard` redireciona para `/login`. ✓
- Login → seleção de empresa (múltiplas memberships) → dashboard com dados reais da empresa A (13 permissões, papel `tenant.admin`, produto real listado). ✓
- `/minha-conta`: visualização correta + edição do nome via Server Action, persistida e revalidada. ✓
- `/empresa`: nome/slug/status reais, sem UUID; bloco de edição futura visível (usuário tem `tenant.update`). ✓
- `/usuarios`: isolamento por tenant confirmado nas duas direções (A mostra só seus 2 membros; B mostra só seu 1 membro, sem vazamento do membro exclusivo de A). ✓
- `/produtos`: produto real da empresa A listado; estado vazio honesto na empresa B (sem produtos). ✓
- `/configuracoes`: todas as seções institucionais visíveis para `tenant.admin`. ✓
- Troca de empresa (A → B): dashboard, produtos e usuários atualizam corretamente para o novo tenant ativo, sem resíduo da empresa anterior. ✓
- Sidebar filtrada: usuário sem papel algum vê só "Visão Geral" e "Configurações". ✓
- Bloqueio de URL direta: usuário sem papel algum, ao acessar diretamente `/minha-conta`, `/empresa`, `/usuarios` e `/produtos`, é redirecionado para `/sem-permissao` nas 4 rotas, com mensagem genérica e link de volta ao dashboard, sem loop de redirecionamento. ✓
- `/configuracoes` para o mesmo usuário: só a seção Segurança/Preferências aparece, com aviso explícito de que não há acesso institucional. ✓
- Responsividade: em 375px, a sidebar desktop fica `display:none` (confirmado via `getComputedStyle`) e o botão de menu mobile aparece. ✓
- Zero erros no console em todos os cenários acima. ✓

**Não verificado ao vivo (limitação da ferramenta de teste, não da implementação):** a abertura/fechamento por clique do menu do usuário (`UserMenu`) e da gaveta de navegação mobile (`MobileNavigation`). O painel de navegador usado nesta sessão manteve `document.visibilityState === "hidden"` de forma persistente (mesmo após trazer a aba para frente), o que impede a hidratação do React de completar para conteúdo dentro de um limite de Suspense nesse ambiente específico — confirmado via inspeção dos internals do React (fiber preso em `DehydratedFragment`). Formulários nativos, Server Components e navegação direta por URL (que não dependem de hidratação) funcionaram normalmente em todos os testes acima. A lógica desses dois componentes segue o mesmo padrão (`useState`, `aria-expanded`, fechamento por clique fora) já validado em outras partes do código.

**Tentativa de edição entre usuários (não testada ao vivo, verificada por revisão de código):** ao contrário dos testes de adulteração de `tenantId` feitos em fases anteriores (onde um campo oculto existia e podia ser manipulado), o formulário de "Minha Conta" **não envia nenhum identificador de usuário** — `updateMyProfile` sempre usa `ctx.userId`, resolvido no servidor a partir da sessão validada, nunca um valor do `FormData`. Não há, portanto, nenhum campo para um cliente malicioso adulterar; a propriedade "self-only" é estrutural, não depende de uma checagem em tempo de execução que possa falhar.

## 9. Dados temporários removidos

Sim. Ordem: `membership_roles` → `tenant_memberships` → `tenant_products` → `products` → `tenants` → usuários (Admin API). Confirmado por consulta: 0 tenants com slug `core001-teste-*` e 0 produtos com código `core001-teste-produto` residuais. Scripts descartáveis (`scratch-core001-*.cjs/.json`) deletados, nunca commitados.

## 10. Achados técnicos registrados

- **RLS de `profiles` limita `/usuarios`:** a política `profiles_select_self` (`0007_rls_policies.sql`) restringe a leitura de perfil a `id = auth.uid()`, então um `tenant.admin` vê corretamente as linhas de membership de outros membros mas não seus nomes/e-mails (aparecem como "Não informado"/"—"). Já era uma limitação documentada e deliberada de `DB-001`/`SUP-003`, apenas agora visível pela primeira vez porque `/usuarios` é a primeira interface a tentar listar perfis de terceiros. Nenhuma alteração de RLS foi feita — está fora do escopo desta fase (que veda mudanças estruturais não solicitadas) e fica como pendência.
- **Tensão "Minha Conta" × papel algum:** confirmada na prática — o usuário fictício sem papel não via "Minha Conta" na sidebar nem conseguia acessá-la diretamente (recebeu `/sem-permissao` corretamente). Implementado literalmente conforme a matriz de permissões aprovada; ver `BE-007 §3` para a observação completa.
- **Tipos do Supabase incompletos:** o primeiro `.update()` real do projeto expôs que `src/lib/supabase/types.ts` não satisfazia `GenericSchema` do `postgrest-js` (faltava `Relationships`/`Views`/`Functions`/`Enums`/`CompositeTypes`), causando inferência `never`. Corrigido — apenas tipos, nenhuma mudança de schema real.

## 11. Migrations e RLS preservadas

Nenhuma migration nova foi criada nesta fase (não foi necessária nenhuma tabela nova). As 10 migrations existentes (`0001` a `0010`) permanecem intactas; RLS continua habilitada nas 10 tabelas do schema `public`, sem nenhuma alteração de política.

## 12. Arquivos alterados/criados

**Novos:**
`src/lib/auth/page-guard.ts`, `src/modules/profile/schemas.ts`, `src/services/profile/actions.ts`, `src/app/(platform)/minha-conta/page.tsx`, `src/app/(platform)/minha-conta/MinhaContaForm.tsx`, `src/app/(platform)/empresa/page.tsx`, `src/app/(platform)/usuarios/page.tsx`, `src/app/(auth)/sem-permissao/page.tsx`, `src/components/ui/PageHeader.tsx`, `src/components/ui/EmptyState.tsx`, `src/components/ui/StatusBadge.tsx`, `src/components/ui/InfoCard.tsx`, `src/components/ui/AccessDenied.tsx`, `src/components/layout/UserMenu.tsx`, `src/components/layout/TenantSwitcher.tsx`, `src/components/layout/MobileNavigation.tsx`, `docs/BE-007-Estrutura-da-Area-Autenticada.md`, `docs/reports/CORE-001-Relatorio.md`, `PROJECT-CHECKLIST.md`.

**Reescritos:** `src/app/(platform)/dashboard/page.tsx`, `src/app/(platform)/produtos/page.tsx`, `src/app/(platform)/configuracoes/page.tsx`, `src/app/(platform)/layout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`, `src/components/navigation/nav-items.ts`.

**Modificados:** `src/types/auth.ts` (+ `accountStatus`, `lastSignInAt`), `src/lib/auth/session.ts` (popula os novos campos), `src/lib/auth/permissions.ts` (+ `getGrantedPermissions`), `src/lib/supabase/types.ts` (correção de tipos, seção 10).

**Removidos:** `src/components/ui/StatCard.tsx` (sem uso após a reescrita do dashboard).

## 13. Commit

`feat: cria estrutura inicial da area autenticada`

## 14. Pendências

- RLS de `profiles` não permite que um `tenant.admin` veja nome/e-mail de outros membros em `/usuarios` (seção 10) — decisão já adiada em `DB-001`, precisa de uma fase futura dedicada (provavelmente uma função `SECURITY DEFINER` similar a `is_tenant_member`, condicionada a `tenant.members.view`).
- Membership sem papel não vê nem acessa "Minha Conta" — tensão documentada, decisão de design pendente de revisão pela Direção de Engenharia.
- Interação por clique de `UserMenu`/`MobileNavigation` não pôde ser verificada ao vivo nesta sessão (limitação do ambiente de teste, seção 8) — recomendável reverificar em uma sessão de navegador com o painel efetivamente visível antes de considerar 100% confirmado.
- Nenhuma implementação real de edição em `/empresa` (`tenant.update`) nem em `/configuracoes` (Empresa/Acessos) — apenas estrutura visual reservada, conforme escopo desta fase.
- Nenhuma automação de auditoria (`audit_logs`) registra os eventos desta fase (edição de perfil, negações de acesso) — mesma pendência já registrada em `PERM-001`.
