# CORE-002.2 — Relatório de Execução (Autenticação Real do Consumidor)

**Status:** Concluído
**Data:** 2026-08-05
**Responsável pela execução:** Claude Code
**Documentos relacionados:** `docs/architecture/CORE-002-Plano-Tecnico.md`, `docs/reports/CORE-002.1-Relatorio.md`

---

## 1. Resumo

A autenticação simulada (`localStorage`) do Aplicativo do Consumidor foi substituída por autenticação real via Supabase Auth, preservando integralmente os dados mockados de carteira, cashback, pontos, missões e benefícios (nenhum deles foi tocado). Login, logout, sessão persistente, recuperação e redefinição de senha, cadastro e proteção de rotas no servidor foram implementados e validados com um usuário fictício real (criado via Admin API), testado em servidor de desenvolvimento local conectado ao Supabase real do projeto (mesma infraestrutura da produção). Todos os 18 critérios de aceite definidos pela Direção foram exercitados e aprovados. Nenhuma migration foi criada; nenhum mock financeiro foi substituído; RLS/funções de `CORE-002.1` não foram alteradas.

## 2. Arquivos alterados/criados

| Arquivo | Natureza |
|---|---|
| `src/modules/auth/schemas.ts` | Editado — `consumerSignUpSchema` adicionado |
| `src/services/consumer-auth/actions.ts` | **Novo** — `signInConsumer`, `signUpConsumer`, `signOutConsumer`, `requestConsumerPasswordReset`, `updateConsumerPassword` |
| `src/proxy.ts` | Editado — `/cliente/*` deixa de ser público por padrão; apenas `entrar`/`onboarding`/`esqueci-senha`/`redefinir-senha` continuam públicas; usuário autenticado em `/cliente/entrar` é redirecionado para `/cliente/inicio` |
| `src/app/auth/callback/route.ts` | Editado — fallback de erro consciente do consumidor (`/cliente/entrar?error=callback` quando `next` aponta para `/cliente/*`) |
| `src/contexts/consumer-session-context.tsx` | Reescrito — sessão real (`auth.getUser`/`onAuthStateChange`), sem `localStorage`, sem redirecionamento (isso é do servidor) |
| `src/components/consumer/ConsumerShell.tsx` | Simplificado — remove o gate de autenticação client-side (o servidor já protege); mantém apenas o toggle de chrome por rota |
| `src/app/cliente/entrar/page.tsx` + `EntrarForm.tsx` (**novo**) | Reescrito — login e cadastro reais, com alternância de modo |
| `src/app/cliente/onboarding/page.tsx` | Editado — remove a chamada de sessão mockada; "Começar" apenas navega |
| `src/app/cliente/perfil/page.tsx` | Editado — botão Sair vira `<form action={signOutConsumer}>`; página deixou de ser Client Component (não precisa mais) |
| `src/app/cliente/esqueci-senha/page.tsx` + `ForgotPasswordForm.tsx` (**novos**) | Recuperação de senha do consumidor |
| `src/app/cliente/redefinir-senha/page.tsx` + `ResetPasswordForm.tsx` (**novos**) | Redefinição de senha do consumidor |

**Rotas do Aplicativo do Consumidor:** 13 → **15** (as 12 telas de `UX-001` + 1 rota técnica de redirecionamento + as 2 novas rotas técnicas de autenticação, fora do mapa de navegação congelado de `UX-001`, assim como `/cliente` em si já era).

## 3. Decisões de fluxo aplicadas

- **Identidade única confirmada em uso real:** o mesmo usuário Supabase pode autenticar tanto na Retaguarda quanto no Aplicativo do Consumidor com a mesma sessão/cookie — comportamento esperado e testado (seção 4, critérios 11–13). Logout em qualquer um dos dois encerra a sessão nos dois (mesma sessão do Supabase Auth) — não é uma falha, é a consequência direta de `IDENT-001` (identidade única).
- **Sem seleção obrigatória de "tipo de conta":** a origem do acesso (`/cliente/*` vs. rotas administrativas) decide o destino; nenhuma tela nova de escolha foi criada.
- **Sem cookie de empresa ativa no consumidor:** o Aplicativo do Consumidor não usa `active_tenant_id` — a seleção de Conta Fidelidade por empresa fica para `CORE-002.3`.
- **Cadastro (signUp) tratado para os dois cenários possíveis de confirmação de e-mail:** se o projeto tiver confirmação desabilitada, `signUp` já retorna sessão e segue direto ao onboarding; caso contrário, mostra "aguardando confirmação" e o link de e-mail usa o mesmo `/auth/callback?next=/cliente/onboarding` já compartilhado com a Retaguarda.

## 4. Critérios de aceite (18/18 aprovados)

Testado localmente (`npm run dev`, porta 3300) contra o projeto Supabase real (mesma infraestrutura da produção — apenas o código roda localmente, os dados são reais), com um usuário fictício criado via Admin API (`consumidor.teste.core002-2@example.com`) e, para os critérios 11–13, um vínculo administrativo fictício adicional na mesma identidade.

| # | Critério | Resultado |
|---|---|---|
| 1 | Visitante em rota protegida é direcionado ao login | ✅ `/cliente/inicio` sem sessão → `/cliente/entrar?next=%2Fcliente%2Finicio` |
| 2 | Login válido cria sessão | ✅ navegação real confirmada para o `next` original |
| 3 | Login inválido mostra mensagem segura | ✅ "E-mail ou senha incorretos.", sem detalhe técnico |
| 4 | Sessão continua válida após recarregar a página | ✅ reload em `/cliente/inicio` não redireciona |
| 5 | Logout elimina a sessão | ✅ `/cliente/perfil` → Sair → `/cliente/entrar` |
| 6 | Usuário deslogado não volta a rota protegida pelo "voltar" | ✅ back-button após logout revalida no servidor e redireciona para `/cliente/entrar?next=...` |
| 7 | Recuperação de senha não revela se o e-mail existe | ✅ mensagem idêntica para e-mail cadastrado e não cadastrado |
| 8 | Link de redefinição funciona | ✅ formulário de redefinição atualiza a senha e redireciona para `/cliente/inicio`; login com a nova senha confirmado |
| 9 | Token inválido ou expirado é tratado com segurança | ✅ código forjado em `/auth/callback` → `/cliente/entrar?error=callback`, sem sessão criada |
| 10 | Parâmetro de retorno não permite redirecionamento externo | ✅ `next=https://evil.com` ignorado — login redireciona para `/cliente/inicio` (fallback seguro) |
| 11 | Usuário administrativo consegue acessar a Retaguarda | ✅ mesma sessão acessa `/dashboard` (via `/selecionar-empresa` com auto-seleção) |
| 12 | Consumidor consegue acessar `/cliente` | ✅ confirmado antes e depois do teste administrativo, sem novo login |
| 13 | Usuário com os dois papéis não entra em loop | ✅ alternância `/dashboard` ↔ `/cliente/inicio` sem redirecionamento cíclico |
| 14 | Sessão inválida é descartada no servidor | ✅ mesma evidência do critério 6 — `auth.getUser()` revalida a cada requisição |
| 15 | Nenhum saldo/ponto/cashback mockado é confundido com real | ✅ `/cliente/inicio` continua mostrando os dados de `mockContaFidelidade` inalterados |
| 16 | Nenhum segredo é enviado ao navegador | ✅ `service_role`/`SUPABASE_SERVICE_ROLE_KEY` ausentes do HTML servido; grep em `src/` confirma uso restrito a `src/config/env.ts` (servidor) |
| 17 | Lint e build são aprovados | ✅ `npm run lint` e `npm run build` sem erros (15 rotas `/cliente/*` geradas) |
| 18 | Nenhuma migration é criada sem autorização adicional | ✅ nenhum arquivo em `supabase/migrations/` criado nesta fase |

Adicionalmente, o fluxo de **cadastro real** (`signUpConsumer`) foi exercitado de ponta a ponta: a chamada ao Supabase Auth ocorre corretamente e é tratada; ao testar repetidamente, o Supabase retornou `over_email_send_rate_limit` (limite padrão de envio de e-mail do projeto, sem SMTP customizado configurado) — a mensagem genérica de erro foi corretamente exibida ao usuário, sem vazar o motivo técnico. Ver pendência na seção 6.

## 5. Regressão

- Retaguarda: `/dashboard`, `/selecionar-empresa` e o próprio middleware administrativo continuam funcionando sem alteração de comportamento para usuários que não usam `/cliente/*`.
- Nenhuma tabela, RLS, função ou migration de `CORE-002.1` foi alterada.
- Nenhum dado mockado de carteira/cashback/missões/benefícios foi alterado ou removido.

## 6. Limitações e pendências

- **Rate limit de e-mail do Supabase:** o envio de e-mails de confirmação de cadastro e recuperação de senha está sujeito ao limite padrão do projeto (baixo, por não haver provedor SMTP customizado configurado). Em uso intensivo ou testes repetidos, novas tentativas podem ser recusadas pelo Supabase com uma mensagem genérica ao usuário. Recomendação: configurar um provedor SMTP customizado no painel do Supabase antes de abrir o cadastro real ao público.
- **Teste na URL pública não realizado nesta fase:** ao contrário de `HOM-001`, esta fase não exigiu validação visual (nenhuma mudança de CSS/layout) — a lógica de autenticação roda de forma idêntica local ou implantada, então a validação foi feita no servidor de desenvolvimento local conectado ao mesmo projeto Supabase real. Adicionalmente, a URL pública (`web-git-main-bright-ecosystem.vercel.app`) está atualmente atrás de um gate de SSO da Vercel (observado em `CORE-002.1`, não relacionado a este código), o que impediria testes automatizados diretos nela.
- **Reabertura de Conta Fidelidade fechada:** continua fora de escopo (decisão de `CORE-002.1`, reafirmada pela Direção nesta fase).
- **Carteira/saldo ainda 100% mockados:** nenhuma tela consome dados reais de `contas_fidelidade`/`lancamentos` ainda — fica para `CORE-002.3`.

## 7. Segurança

- Nenhuma credencial exposta: a chave `service_role` foi usada apenas em scripts Node temporários e locais (nunca commitados) para criar/remover o usuário fictício de teste via Admin API.
- Nenhum uso de `service_role` no navegador — toda autenticação do consumidor usa a chave `anon` e a sessão do próprio usuário, como já era o padrão da Retaguarda.
- Mensagens de erro sempre genéricas (login inválido, recuperação de senha, cadastro), sem detalhe técnico nem confirmação de existência de e-mail.
- Open redirect bloqueado no parâmetro `next`, tanto na entrada (login) quanto no callback de e-mail.
- Proteção de rota feita no servidor (`src/proxy.ts`, `auth.getUser()`), nunca apenas em estado do React — confirmado pelo teste do botão "voltar" pós-logout.

## 8. Limpeza

Usuário fictício (`consumidor.teste.core002-2@example.com`) removido via `auth.admin.deleteUser` (cascata remove `profiles`/`tenant_memberships`/`membership_roles` automaticamente). Tenant fictício (`Empresa Teste Core002-2`) removido por `DELETE` direto. Confirmado por consulta: 0 linhas residuais. Nenhum script de fixture ou diagnóstico foi commitado ao repositório.

## 9. Próximos passos

Aguardar confirmação da Direção sobre este relatório antes de iniciar **CORE-002.3 — Conta Fidelidade, Carteira e Lançamentos Reais** (substituição gradual dos mocks de `src/services/mock/conta-fidelidade.ts` e `lancamentos.ts` por serviços reais consumindo a infraestrutura de `CORE-002.1`).
