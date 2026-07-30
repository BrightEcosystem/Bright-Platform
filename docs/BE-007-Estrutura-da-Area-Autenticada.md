# BE-007 — Estrutura Inicial da Área Autenticada

**Status:** Aprovado para execução
**Versão:** 1.0.0
**Responsável pela arquitetura:** ChatGPT — Direção de Engenharia Bright Ecosystem
**Responsável pela implementação:** Claude Code
**Documentos relacionados:** `BE-005-Autenticacao-e-Acesso-Multiempresa.md`, `BE-006-Papeis-e-Permissoes.md`

---

## 1. Objetivo

Documentar a estrutura de layout, navegação e páginas-base da área autenticada da Bright Platform (`CORE-001`): rotas, permissões aplicadas a cada uma, componentes reutilizáveis criados e o padrão de autorização de página usado a partir desta fase.

## 2. Rotas criadas/reescritas

| Rota | Tipo | Permissão exigida |
|---|---|---|
| `/dashboard` | Funcional (dados reais) | Nenhuma além de sessão + tenant ativo |
| `/minha-conta` | Funcional (visualização + edição) | `user.profile.view` (visualização); `user.profile.update` (formulário de edição, condicional) |
| `/empresa` | Somente leitura | `tenant.view` |
| `/usuarios` | Somente leitura | `tenant.members.view` |
| `/produtos` | Somente leitura | `product.view` OU `tenant_product.view` |
| `/configuracoes` | Funcional (seções condicionais) | Nenhuma para a página em si; seções institucionais condicionadas a `tenant.update`/`tenant.members.manage`/`tenant.roles.manage` |
| `/sem-permissao` | Estático | Nenhuma (exibida após negação) |

As demais rotas placeholder pré-existentes (`empresas`, `clientes`, `agentes-ia`, `workflows`, `integracoes`, `licitacoes`, `financeiro`, `analytics`) foram **mantidas no disco sem alteração** e apenas removidas da lista de navegação — não fazem parte do escopo desta fase e sua remoção completa não foi solicitada.

## 3. Layout e navegação

`src/app/(platform)/layout.tsx` calcula, no servidor, quais itens de navegação (`src/components/navigation/nav-items.ts`) o usuário pode ver — usando `hasPermission`/`hasAnyPermission` contra a permissão (ou lista de permissões) declarada em cada item — e passa a lista já filtrada para `Sidebar` (desktop, `md:flex`) e para dentro de `Header`, que a repassa a `MobileNavigation` (menu hambúrguer + gaveta, abaixo de `md`).

Mapeamento de navegação (`CORE-001 §4`):

| Item | Permissão |
|---|---|
| Visão Geral | Nenhuma (página inicial) |
| Minha Conta | `user.profile.view` |
| Empresa | `tenant.view` |
| Usuários | `tenant.members.view` |
| Produtos | `product.view` OU `tenant_product.view` |
| Configurações | Nenhuma (sempre tem ao menos a seção pessoal de Segurança) |

**Observação documentada:** como nenhum papel "padrão" é atribuído a uma membership recém-criada (`BE-006 §4`), um usuário sem nenhum papel na empresa ativa não tem `user.profile.view` e portanto não vê "Minha Conta" no menu nem consegue acessá-la diretamente (recebe `/sem-permissao`). Isso foi implementado literalmente conforme a matriz de permissões aprovada em `PERM-001`, mas fica registrado aqui como uma tensão de design a ser revisitada: pode fazer sentido, em uma fase futura, que "ver o próprio perfil" seja um direito implícito de qualquer membership ativa, independente de papel — o catálogo de permissões atual não distingue "ver o próprio perfil" de "ver perfil de outros".

O cabeçalho (`Header.tsx`, Client Component) nunca exibe UUID — apenas nome da empresa ativa (`TenantSwitcher`) e nome/e-mail do usuário (`UserMenu`). O título da página exibido no cabeçalho é derivado comparando o pathname atual com a lista de itens de navegação já filtrada.

## 4. Padrão de autorização de página

A partir desta fase, toda página que exige uma permissão específica usa `src/lib/auth/page-guard.ts` (`requirePagePermission`/`requirePageAnyPermission`/`requirePageRole`), que:

1. Resolve o `AuthContext` e o client Supabase do servidor.
2. Chama o helper `require*` correspondente de `src/lib/auth/permissions.ts`.
3. Em caso de `AuthorizationError`, redireciona para `/sem-permissao` (mensagem sempre genérica — nunca revela qual verificação falhou).
4. Em caso de sucesso, retorna `{ ctx, supabase }` prontos para a página usar.

Isso é distinto de `withPermission` (`protected-action.ts`), que protege **Server Actions** e lança em vez de redirecionar — uma página não tem como devolver um `ActionState`.

`/sem-permissao` vive no grupo de rotas `(auth)` (mesmo padrão visual simples de `/sem-acesso`/`/selecionar-empresa`) e, por defesa em profundidade, também verifica `getAuthContext()` e redireciona para `/login` se não houver sessão — mesmo que isso normalmente já tenha sido barrado pelo `proxy.ts`.

## 5. Dashboard institucional

`/dashboard` mostra exclusivamente dados reais, obtidos do `AuthContext` e de consultas ao banco: nome da empresa ativa, nome do usuário, papéis da membership ativa, contagem de permissões concedidas (`getGrantedPermissions`, novo helper em `permissions.ts`), status da conta (`profiles.status`), status do vínculo com a empresa (`tenant_memberships.status`), data do último acesso (`auth.users.last_sign_in_at`, exposta via `AuthContext.lastSignInAt` — só exibida se existir) e os produtos habilitados para a empresa ativa (`tenant_products` + `products`, com estado vazio honesto quando não há nenhum). Nenhum dado fictício ou placeholder ("Não conectado") permanece.

## 6. Achado técnico: RLS de `profiles` limita a listagem de Usuários

Ao testar `/usuarios` com um usuário `tenant.admin` observando outra membership da mesma empresa, o nome e o e-mail dessa outra pessoa aparecem como "Não informado"/"—", mesmo com a permissão `tenant.members.view` concedida. Causa raiz: a política RLS `profiles_select_self` (`database/migrations/0007_rls_policies.sql`), que restringe a leitura de `profiles` estritamente a `id = auth.uid()` — uma decisão já documentada naquela migration como deliberadamente adiada ("visibilidade entre membros da mesma empresa será definida em um BE-XXX futuro"). Isso não é um bug desta fase: é o efeito, agora visível pela primeira vez, de uma limitação de RLS já conhecida e intencional. Nenhuma alteração de RLS foi feita aqui — mudar essa política é uma decisão de segurança que excede o escopo de `CORE-001` (que proíbe alterações estruturais não solicitadas) e fica registrada como pendência para uma fase futura dedicada a isso.

## 7. Componentes reutilizáveis criados

`PageHeader`, `EmptyState`, `StatusBadge` (+ `labelForStatus`/`toneForStatus`), `InfoCard`, `AccessDenied`, `UserMenu`, `TenantSwitcher`, `MobileNavigation`. `Sidebar` e `Header` foram reescritos para aceitar a lista de itens de navegação já filtrada por permissão. `StatCard` (usado apenas pelo dashboard fictício anterior) foi removido por não ter mais uso.

## 8. Correção incidental: tipos do Supabase

O primeiro `.update(...)` real do projeto (usado em `updateMyProfile`) revelou que `src/lib/supabase/types.ts` não satisfazia integralmente o `GenericSchema` exigido pelo `postgrest-js` (faltavam `Relationships` por tabela e `Views`/`Functions`/`Enums`/`CompositeTypes` no nível do schema `public`), fazendo o parâmetro de `.update()` ser inferido como `never`. Corrigido adicionando os campos faltantes — nenhuma mudança de schema real, apenas tipos TypeScript.

## 9. Limitação observada nesta fase (ferramenta de teste)

A verificação ao vivo das interações puramente client-side (abrir/fechar o menu do usuário, abrir/fechar a gaveta de navegação mobile) não pôde ser confirmada via automação de navegador nesta fase: o painel do navegador usado para teste permaneceu com `document.visibilityState === "hidden"`, o que impede a hidratação de React de content client-only dentro de um limite de Suspense de completar nesse ambiente específico. Formulários nativos, Server Components, redirecionamentos de permissão e navegação direta por URL — que não dependem de hidratação — foram todos verificados normalmente e funcionaram corretamente. A lógica desses dois componentes (`useState` + `aria-expanded` + fechamento por clique fora) segue o mesmo padrão já usado com sucesso em outras partes do projeto.
