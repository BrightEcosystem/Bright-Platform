# AUTH-002 — Validação Funcional e Isolamento Multiempresa

**Status:** Concluído
**Data:** 2026-07-29
**Responsável pela execução:** Claude Code

---

## 1. Dados de teste utilizados (fictícios, todos removidos ao final)

- Tenants: "Tenant Teste Alpha", "Tenant Teste Beta" (domínio/slug com sufixo `-auth002`)
- Usuários (domínio `example.com`, sufixo `.auth002`):
  - `usuario.teste.alpha.auth002@example.com` — membro só de Tenant Alpha, papel `tenant.admin`
  - `usuario.teste.multi.auth002@example.com` — membro de Tenant Alpha **e** Tenant Beta
  - `usuario.teste.semacesso.auth002@example.com` — nenhum vínculo

Todos os IDs foram registrados durante a execução e usados para a limpeza (seção 6).

## 2. Cenários executados

| # | Cenário | Resultado |
|---|---|---|
| 1 | Login válido | ✅ Aprovado |
| 2 | Login inválido | ✅ Aprovado — mensagem genérica "E-mail ou senha incorretos.", sem detalhe técnico |
| 3 | Logout | ✅ Aprovado |
| 4 | Recuperação de senha | ✅ Aprovado — mensagem de sucesso idêntica independente do e-mail existir |
| 5 | Criação automática de profile | ✅ Aprovado — confirmado por consulta direta ao banco (trigger funcionando) |
| 6 | Usuário sem membership ativa | ✅ Aprovado — redireciona para `/sem-acesso` |
| 7 | Usuário com uma única membership | ✅ Aprovado — entra direto (auto-submit), sem clique manual |
| 8 | Usuário com duas memberships | ✅ Aprovado — lista as duas em `/selecionar-empresa` |
| 9 | Seleção de empresa | ✅ Aprovado |
| 10 | Troca de empresa | ⚠️ Reprovado na 1ª tentativa (bug encontrado e corrigido — ver seção 4) → ✅ Aprovado após correção |
| 11 | Cookie/tenant inválido | ✅ Aprovado — tenant não pertencente rejeitado pelo servidor |
| 12 | Membership desativada | ✅ Aprovado — usuário com única membership suspensa cai em `/sem-acesso` |
| 13 | Tentativa de acesso a tenant não vinculado | ✅ Aprovado — POST forjado com `tenantId` de outro tenant rejeitado, sem conceder acesso |
| 14 | Redirecionamento de rota protegida | ✅ Aprovado — `/dashboard` sem sessão redireciona para `/login?next=...` |
| 15 | Preservação segura do parâmetro `next` | ✅ Aprovado — `next` interno preservado; `next=https://evil.com` ignorado (open redirect bloqueado) |
| 16 | Usuário autenticado tentando acessar `/login` | ✅ Aprovado — redireciona para `/dashboard` |
| 17 | Sessão expirada ou inválida | ✅ Aprovado — verificado por revisão de código: `proxy.ts` e `getAuthContext()` usam `auth.getUser()`, que trata qualquer falha de validação do token (expirado, malformado ou ausente) de forma idêntica, redirecionando para `/login`. Não foi provocada expiração real (levaria mais de uma hora) — a garantia vem do mesmo caminho de código já exercitado nos cenários 6, 14 e 16 |

**16 de 17 aprovados de primeira. 1 aprovado após correção (cenário 10).**

## 3. Isolamento multiempresa (prova a nível de banco, não só de aplicação)

Simulei o `auth.uid()` real de cada usuário de teste dentro de uma transação (`set local role authenticated; set local "request.jwt.claim.sub" = '<id>'`, com `ROLLBACK` ao final — nenhuma alteração de sessão real, apenas leitura):

| Teste | Resultado |
|---|---|
| Usuário Alpha consulta Tenant Beta | **0 linhas** — RLS bloqueia |
| Usuário Alpha consulta Tenant Alpha (próprio) | 1 linha — acesso concedido corretamente |
| Usuário Multiempresa consulta Tenant Alpha | 1 linha — acesso concedido |
| Usuário Multiempresa consulta Tenant Beta | 1 linha — acesso concedido |

O controle positivo (multiempresa vendo os dois) confirma que a política realmente concede acesso quando deveria — não é um bloqueio geral por erro de configuração. O teste negativo (Alpha não vê Beta) confirma o isolamento real, na camada mais baixa possível (RLS do Postgres), não apenas na lógica da aplicação.

Também confirmado, por teste funcional direto: uma tentativa de forçar `tenantId` de um tenant não vinculado via `POST` direto ao Server Action `selectActiveTenant` foi rejeitada — o usuário permaneceu sem acesso ao tenant indevido e voltou para `/selecionar-empresa`.

## 4. Falhas encontradas e corrigidas

### 4.1 `signOut()` não limpava o cookie de empresa ativa

**Sintoma:** ao logar com um usuário diferente no mesmo navegador após um logout, o sistema pulava a tela de seleção de empresa e entrava direto — porque o cookie `active_tenant_id` do usuário anterior ainda estava presente e, por coincidência, também era válido para o novo usuário.

**Risco real:** nenhum — a revalidação server-side (`getAuthContext`) sempre confere se o tenant do cookie pertence ao usuário atual: se não pertencesse, cairia corretamente em `/selecionar-empresa` de qualquer forma. Era um problema de higiene de estado entre sessões de usuários diferentes no mesmo navegador, não uma brecha de acesso cruzado.

**Correção:** `signOut()` agora também remove o cookie `active_tenant_id` (`src/services/auth/actions.ts`).

### 4.2 `/selecionar-empresa` impedia a troca de empresa

**Sintoma:** a página redirecionava automaticamente para `/dashboard` sempre que já existia uma empresa ativa — o que é exatamente o estado normal de quem clica em "trocar empresa" no Header. Na prática, a funcionalidade de troca de empresa nunca funcionava.

**Correção:** removida a regra que redirecionava para `/dashboard` quando já havia tenant ativo; a página passou a sempre mostrar a lista de empresas disponíveis (exceto no caso de auto-seleção com uma única empresa, que continua automático). `src/app/(auth)/selecionar-empresa/page.tsx`.

## 5. Segurança

- Nenhum segredo no frontend: `service_role` só aparece em comentários explicando que **não** é usada; confirmado por busca no bundle estático de produção (`.next/static/`) — zero ocorrências da chave ou do nome da variável.
- Nenhum valor de cookie sensível foi exibido nesta conversa nem nos logs — `active_tenant_id` é `httpOnly` (confirmado: `document.cookie` do navegador não o lista) e o token de sessão nunca foi lido (a própria ferramenta de automação bloqueia a leitura de `document.cookie` como proteção).
- Mensagens de erro sempre genéricas em português, sem detalhe técnico (cenário 2).
- Open redirect bloqueado no parâmetro `next` (cenário 15).
- Membership sempre revalidada no servidor — nunca a partir do valor recebido do cliente (cenários 11, 13).
- Usuário inativo/sem acesso corretamente bloqueado (cenários 6, 12).

## 6. Limpeza

Removidos, nesta ordem: `membership_roles` de teste → `tenant_memberships` de teste → `tenants` de teste → os 3 usuários fictícios (via Admin API, cascata remove `profiles` automaticamente).

**Confirmado por consulta direta, após a remoção:**
- Tenants residuais com sufixo `auth002`: **0**
- Profiles residuais com e-mail `auth002`: **0**
- Memberships residuais: **0**
- Papéis de sistema estruturais preservados: **4/4** (`platform.admin`, `tenant.admin`, `project.manager`, `project.viewer`)
- Total de tabelas no schema `public`: **10** (nenhuma perdida, nenhuma extra)
- As 9 migrations (incluindo as 7 anteriores) continuam registradas, `local == remote`

Nenhuma migration foi alterada. Nenhum arquivo de fixture de teste (com senha/e-mails fictícios) foi versionado — mantidos apenas em diretório temporário fora do repositório, removidos ao final.

## 7. Limitações restantes

- O cenário 17 (sessão expirada) foi validado por análise de código, não por expiração real forçada (impraticável no tempo desta tarefa).
- Nenhum framework de teste automatizado foi instalado — a validação foi feita por automação de navegador + SQL direto, não por uma suíte de testes versionada e reexecutável.
- Catálogo de permissões (`permissions`/`role_permissions`) continua vazio — `hasPermission()` funcional mas sem nada para conceder ainda.
