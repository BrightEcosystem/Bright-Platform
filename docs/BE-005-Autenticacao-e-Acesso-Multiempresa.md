# BE-005 — Autenticação e Acesso Multiempresa

**Status:** Aprovado para execução
**Versão:** 1.0.0
**Responsável pela arquitetura:** ChatGPT — Direção de Engenharia Bright Ecosystem
**Responsável pela implementação:** Claude Code
**Documentos relacionados:** `BE-003-Arquitetura-de-Dados-e-Supabase.md`, `docs/decisions/ADR-001-Modelo-de-identidade-e-multiempresa.md`

---

## 1. Objetivo

Documentar a fundação de autenticação da Bright Platform (`AUTH-001`): login, logout, recuperação de senha, criação de perfil, vínculo multiempresa, seleção de empresa ativa e proteção de rotas — usando Supabase Auth integrado ao modelo já existente (`auth.users` → `profiles` → `tenant_memberships` → `membership_roles`).

## 2. Fluxo de login

1. Usuário acessa `/login`, informa e-mail e senha.
2. `signIn` (Server Action) valida com Zod e chama `supabase.auth.signInWithPassword`.
3. Em caso de erro, mensagem genérica "E-mail ou senha incorretos" — nunca revela se o e-mail existe ou não.
4. Em caso de sucesso, redireciona para `next` (rota originalmente solicitada, preservada pelo Proxy) ou `/dashboard`.
5. O layout de `(platform)` então decide, a partir dos memberships ativos, se o usuário vai direto para o dashboard, para `/selecionar-empresa` ou para `/sem-acesso`.

## 3. Fluxo de logout

`signOut` (Server Action): chama `supabase.auth.signOut()` e redireciona para `/login`. Disponível no Header e nas páginas `/sem-acesso`/`/selecionar-empresa`.

## 4. Recuperação de senha

1. `/esqueci-minha-senha`: usuário informa e-mail.
2. `requestPasswordReset` chama `supabase.auth.resetPasswordForEmail`, com `redirectTo` apontando para `/auth/callback?next=/redefinir-senha`.
3. Mensagem de confirmação é **sempre a mesma**, exista ou não o e-mail — evita enumeração de contas.
4. O link do e-mail leva a `/auth/callback`, que troca o código por uma sessão e redireciona para `/redefinir-senha`.
5. `/redefinir-senha`: usuário define a nova senha; `updatePassword` chama `supabase.auth.updateUser({ password })` e redireciona para `/dashboard`.

## 5. Criação de perfil

Trigger `on_auth_user_created` em `auth.users` (migration `0008`) cria automaticamente o `profiles` correspondente a cada novo usuário — idempotente (`on conflict (id) do update`), sem dado específico do Enéias. Campos: `id`, `full_name`, `avatar_url`, `email`, `status`, `created_at`, `updated_at`.

## 6. Vínculo com tenant

Lido de `tenant_memberships` (só registros com `status = 'active'`). Um usuário pode ter zero, uma ou várias empresas. Todas as consultas de membership são refeitas a cada requisição server-side — nunca fica em cache de longo prazo no cliente.

## 7. Seleção de empresa ativa

- **Zero memberships ativas** → `/sem-acesso`.
- **Uma membership ativa** → seleção automática (submissão de formulário disparada por um pequeno Client Component ao montar a página — nunca por efeito colateral durante a renderização do Server Component) e redirecionamento direto ao dashboard.
- **Várias memberships ativas** → `/selecionar-empresa`, lista para escolha manual.
- A empresa ativa é guardada em um cookie **httpOnly** (`active_tenant_id`) — nunca em `localStorage`/estado só de cliente.
- **Toda leitura do tenant ativo revalida contra o banco**: o valor do cookie só é aceito se corresponder a uma membership ativa real do usuário, consultada na hora (`getAuthContext`). O cookie é uma referência, nunca uma autorização em si mesmo.

## 8. Proteção de rotas

- `src/proxy.ts` (Proxy — antigo Middleware, renomeado no Next.js 16): garante que rotas fora de `/login`, `/esqueci-minha-senha`, `/redefinir-senha` e `/auth/callback` exigem sessão; redireciona usuário autenticado para fora de `/login`.
- `src/app/(platform)/layout.tsx`: segunda camada de defesa — recarrega o contexto de autenticação no servidor e decide entre renderizar a plataforma, `/selecionar-empresa` ou `/sem-acesso`.
- Nenhum loop de redirecionamento: o Proxy só decide autenticado/não-autenticado; a decisão sobre tenant fica inteiramente no layout, em uma única direção por vez.

## 9. Usuário sem empresa / usuário inativo

- **Sem empresa** (`memberships.length === 0`): `/sem-acesso`, com opção de sair.
- **Membership inativa** (`status != 'active'`): não entra na lista de memberships retornada por `getAuthContext` — tratada como se não existisse, mesma tela `/sem-acesso` se for a única.

## 10. Regras de segurança

- `service_role` nunca é usada em `client.ts`, `middleware`/`proxy`, nem em nenhuma Server Action de autenticação — todas usam a chave pública (`anon`), respeitando RLS como o próprio usuário.
- `auth.getUser()` (não `auth.getSession()`) é usado sempre que a identidade precisa ser confiada no servidor — `getUser()` revalida o token contra o Supabase Auth; `getSession()` só lê o cookie local.
- Cookie de tenant ativo é `httpOnly`, `sameSite=lax`, `secure` em produção.
- Nenhuma mensagem de erro técnica (stack trace, SQL, detalhe interno do Supabase) é exposta ao usuário — sempre mensagens genéricas em português.

## 11. Papéis e permissões iniciais

Catálogo mínimo de papéis de sistema (migration `0009`, `tenant_id = null`, `is_system = true`): `platform.admin`, `tenant.admin`, `project.manager`, `project.viewer`. Nenhuma permissão (`permissions`/`role_permissions`) foi semeada ainda — o catálogo de permissões granulares fica para quando os módulos que as exigem forem definidos. `hasPermission()` já está implementado e funcional, apenas retorna `false` até existirem registros.

## 12. Fora do escopo desta etapa

Login social, páginas completas de gestão de empresas/usuários/projetos, Central de Projetos (`PM-001`), N8N, WhatsApp, módulos comerciais, dados reais de clientes.
