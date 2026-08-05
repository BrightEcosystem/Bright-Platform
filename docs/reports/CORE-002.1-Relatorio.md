# CORE-002.1 — Relatório de Execução (Schema, Funções e RLS)

**Status:** Concluído
**Data:** 2026-08-05
**Projeto Supabase:** `bright-platform-org` (`nsilqajyvezaaddlhwyu`)
**Responsável pela execução:** Claude Code
**Documentos relacionados:** `docs/architecture/CORE-002-Plano-Tecnico.md` (v0.3.0, autorizado pela Direção)

---

## 1. Resumo

As migrations autorizadas pela Direção foram aplicadas ao projeto Supabase real: duas tabelas novas (`contas_fidelidade`, `lancamentos`), cinco funções `security definer`, RLS completa e a extensão do catálogo de permissões (`tenant.consumers.view`/`tenant.consumers.manage`). A matriz de testes obrigatórios (§11 do plano) foi executada de ponta a ponta com dados fictícios reais (usuários criados via Admin API, sessão simulada por `request.jwt.claim.sub`), **24 de 24 verificações aprovadas** após duas correções aplicadas durante a própria execução (ver seção 4). Nenhuma alteração em tabela existente do Core. Nenhuma autenticação real, remoção de mock ou início de CORE-002.2.

## 2. Migrations aplicadas

| # | Arquivo | Conteúdo |
|---|---|---|
| 1 | `20260802000100_core_loyalty_permissions_catalog.sql` | `tenant.consumers.view`/`tenant.consumers.manage`, mapeadas a `tenant.admin` e `platform.admin` |
| 2 | `20260802000200_core_loyalty_accounts.sql` | Tabela `contas_fidelidade` |
| 3 | `20260802000300_core_loyalty_ledger.sql` | Tabela `lancamentos` (ledger unificado) |
| 4 | `20260802000400_core_loyalty_functions.sql` | `has_permission`, `recalcular_saldo_conta_fidelidade`, `join_tenant_loyalty`, `alterar_status_conta_fidelidade`, `criar_lancamento` |
| 5 | `20260802000500_core_loyalty_rls.sql` | RLS habilitada + 4 políticas de `SELECT` |
| 6 | `20260802000600_core_loyalty_grants_fix.sql` | Correção: `REVOKE EXECUTE` de `anon`/`authenticated` nas funções (achado durante validação, ver §4.1) |
| 7 | `20260802000700_core_loyalty_criar_lancamento_fix.sql` | Correção: estorno não deve ser bloqueado pela checagem de saldo suficiente (achado durante os testes, ver §4.2) |
| 8 | `20260802000800_core_loyalty_table_privileges_fix.sql` | Correção: `REVOKE` de privilégios de tabela (INSERT/UPDATE/DELETE/TRUNCATE) de `anon`/`authenticated` (achado durante os testes, ver §4.3) |

`supabase migration list --linked` confirma `local == remote` para as 8 novas + as 10 já existentes (18 no total). `supabase db push --linked --dry-run` foi executado antes de cada aplicação real.

## 3. Objetos criados (confirmados por consulta SQL direta, não só saída do CLI)

**2 tabelas:** `contas_fidelidade` (13 colunas), `lancamentos` (15 colunas) — todas as colunas, tipos e defaults conferidos via `information_schema.columns`.

**Constraints:** 8 em `contas_fidelidade` (unicidade, status, `closed_at`, `nivel`, saldos não-negativos, PK, 2 FKs), 13 em `lancamentos` (asset_type, natureza, valor positivo, valor inteiro para não-cashback, moeda condicional, estado, source_type, estorno com referência obrigatória, unicidade de idempotência por tenant, PK, 3 FKs) — todas confirmadas via `pg_constraint`.

**Índices:** os 6 previstos no plano (§3.4), confirmados via `pg_indexes`.

**Funções:** as 5 previstas, todas `security definer` confirmado via `pg_proc.prosecdef`. Grants finais (após as correções da seção 4): `public` sem acesso, `anon` sem acesso a nenhuma, `authenticated` com `EXECUTE` em `has_permission`/`join_tenant_loyalty`/`alterar_status_conta_fidelidade`/`criar_lancamento` (não em `recalcular_saldo_conta_fidelidade`, restrita a `service_role`).

**RLS:** habilitada em ambas as tabelas (`pg_class.relrowsecurity`), 4 políticas de `SELECT` (nenhuma de INSERT/UPDATE/DELETE, conforme o design). Catálogo de permissões: `tenant.consumers.view`/`tenant.consumers.manage` mapeadas a `tenant.admin` e `platform.admin` — confirmado por consulta a `role_permissions`.

## 4. Achados durante a validação (corrigidos nesta mesma execução)

### 4.1 `REVOKE EXECUTE ... FROM PUBLIC` não bloqueava `anon`/`authenticated`

Ao validar os grants das funções logo após a primeira aplicação, `has_function_privilege` mostrou que **`anon` conseguia executar as 5 funções**, e **`authenticated` conseguia executar `recalcular_saldo_conta_fidelidade`** (que deveria ser de uso exclusivamente interno) — apesar do `revoke all ... from public` explícito na migration 4.

**Causa raiz:** este projeto Supabase tem `alter default privileges` configurado para conceder `EXECUTE` automaticamente a `anon`/`authenticated`/`service_role` em toda função nova do schema `public`, no momento da criação — um grant direto a cada papel, independente do pseudo-papel `PUBLIC`. Revogar de `PUBLIC` não revoga de um papel que já tem grant próprio.

**Correção:** migration 6, com `revoke execute ... from anon` (as 5 funções) e `revoke execute ... from authenticated` (apenas `recalcular_saldo_conta_fidelidade`). Confirmado por reconsulta: `anon` sem acesso a nenhuma; `authenticated` sem acesso apenas à função interna.

### 4.2 Estorno bloqueado incorretamente pela checagem de saldo suficiente

Durante a matriz de testes (item "estorno cria linha compensatória"), a tentativa de reverter o crédito original de 50.00 falhou com `saldo insuficiente para debito de 50.00 em cashback` — porque o consumidor de teste já havia gasto parte do valor (débito de 20.00 antes do estorno), deixando saldo de 30.00.

**Causa raiz:** a checagem de saldo suficiente em `criar_lancamento` (destinada a impedir gasto discricionário além do saldo) foi aplicada também a débitos de estorno — mas um estorno corrige um lançamento específico anterior, não é um novo gasto, e bloqueá-lo deixaria o ledger permanentemente incorreto (a fraude/erro original nunca poderia ser corrigido).

**Correção:** migration 7 — a checagem de saldo suficiente agora é ignorada quando `p_estorno_de` é informado. Reconfirmado pela matriz de testes após a correção.

### 4.3 `UPDATE`/`DELETE` diretos não eram bloqueados em `lancamentos`

A matriz de testes confirmou que `INSERT` direto por `authenticated` era corretamente bloqueado por RLS (nenhuma política de INSERT), mas **`UPDATE` e `DELETE` diretos não eram bloqueados**, apesar de também não existir nenhuma política para esses comandos.

**Causa raiz:** investigação por `information_schema.role_table_grants` confirmou que `anon` e `authenticated` tinham **todos os privilégios de tabela** (SELECT/INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES) concedidos automaticamente pelo mesmo mecanismo de `alter default privileges` da seção 4.1, agora ao nível de tabela em vez de função. A ausência de política de RLS não é suficiente, sozinha, como camada de bloqueio quando o privilégio de tabela também está concedido — os dois precisam ser tratados juntos.

**Correção:** migration 8 — `revoke insert, update, delete, truncate` de `authenticated` em ambas as tabelas, e `revoke all` de `anon` (sem nenhum caso de uso legítimo de leitura ou escrita direta). Reconfirmado pela matriz de testes: `INSERT`/`UPDATE`/`DELETE` diretos agora falham com `permission denied for table`.

**Lição registrada para fases futuras:** neste projeto Supabase, nunca confiar apenas na ausência de política de RLS para bloquear escrita — revogar explicitamente o privilégio de tabela (`GRANT`/`REVOKE`) para `anon`/`authenticated` é uma camada independente e obrigatória, não apenas reforço opcional. Toda tabela nova cuja escrita deva ser exclusiva de funções `security definer` precisa desta revogação explícita desde a primeira migration.

## 5. Matriz de testes executados (dados fictícios, 100% removidos ao final)

Dados de teste: 2 tenants fictícios (`tenant-teste-core002-a/b`), 4 usuários `auth.users` criados via Admin API (`consumidor.a/b.core002-1@example.com`, `staff.admin.a/staff.member.a.core002-1@example.com`), 1 `tenant_membership` com papel `tenant.admin` e 1 sem nenhum papel (representa "colaborador sem permissão especial" — não existe fisicamente um papel `tenant.member` no catálogo atual, apenas `platform.admin`/`tenant.admin`/`project.manager`/`project.viewer`, pendência já registrada em `PROJECT-CHECKLIST.md`).

Execução transacional (`BEGIN ... ROLLBACK`), simulando `auth.uid()` real via `set local role authenticated; set local "request.jwt.claim.sub" = '<uuid>'` — mesma técnica já validada em `AUTH-002`.

| # | Teste | Resultado |
|---|---|---|
| 0 | Setup de tenants/memberships fictícios | ✅ |
| 1–3 | `join_tenant_loyalty` cria conta, é idempotente para o mesmo par | ✅ |
| 4 | `criar_lancamento` credita cashback e recalcula saldo (50.00) | ✅ |
| 5 | Repetir a mesma `idempotency_key` não duplica lançamento nem saldo | ✅ |
| 6 | Débito válido reduz saldo corretamente (30.00) | ✅ |
| 7 | Débito maior que o saldo falha | ✅ |
| 8 | Valor fracionado em `points` falha | ✅ |
| 9 | Estorno cria lançamento compensatório; original permanece intacto | ✅ (após correção §4.2) |
| 10 | `INSERT` direto em `lancamentos` falha | ✅ |
| 11 | `UPDATE` direto em `lancamentos` falha | ✅ (após correção §4.3) |
| 12 | `DELETE` direto em `lancamentos` falha | ✅ (após correção §4.3) |
| 13–14 | Consumidor A só vê a própria conta e os próprios lançamentos | ✅ |
| 15 | Consumidor B vê as 2 próprias contas (tenants A e B), não a de A | ✅ |
| 16 | Colaborador com `tenant.admin` vê as 2 contas do tenant A, não a do tenant B | ✅ |
| 17–18 | Colaborador sem permissão não vê nenhuma conta nem altera status | ✅ |
| 19 | Colaborador com permissão fecha conta (`closed_at`/`closed_reason` preenchidos) | ✅ |
| 20 | Fechamento preserva histórico de lançamentos | ✅ |
| 21 | `join_tenant_loyalty` em conta fechada falha (sem reabertura automática) | ✅ |
| 22 | `alterar_status_conta_fidelidade` a partir de `closed` falha (estado terminal) | ✅ |
| 23 | Nenhuma alteração inesperada em `tenant_memberships` existentes | ✅ |

**24 de 24 aprovados** (2 exigiram correção nesta mesma execução antes da aprovação final — seções 4.2 e 4.3).

## 6. Limpeza

Toda a transação de teste terminou em `ROLLBACK` — confirmado por consulta pós-execução: `contas_fidelidade` = 0 linhas, `lancamentos` = 0 linhas, tenants/memberships fictícios = 0 linhas. Os 4 usuários `auth.users` fictícios (criados via Admin API, fora da transação) foram removidos individualmente via `auth.admin.deleteUser`, confirmado pela saída de cada chamada. Nenhum script de fixture foi commitado ao repositório (arquivos temporários `.tmp-core002-*` removidos antes do commit).

## 7. Regressão

Esta fase **não alterou nenhum arquivo de código-fonte da aplicação** — apenas migrations SQL aplicadas ao Supabase. Não há, portanto, risco de regressão visual ou funcional no Aplicativo do Consumidor ou na Retaguarda (nenhum componente, rota, middleware ou mock foi tocado). `supabase migration list --linked` confirma que as 10 migrations anteriores (fundação multiempresa) permanecem `local == remote`, sem nenhuma alteração.

Observação sem relação com esta fase: a URL pública (`web-git-main-bright-ecosystem.vercel.app`) está atualmente atrás de um gate de SSO da Vercel (Deployment Protection) — não investigado, pois é uma configuração de plataforma Vercel, não uma consequência de nenhuma migration desta fase.

## 8. Segurança

- Nenhuma credencial exposta: a chave `service_role` foi usada apenas localmente (scripts Node temporários, nunca commitados) para criar/remover usuários de teste via Admin API — nunca em código de cliente.
- `service_role` nunca é usada no navegador — toda escrita em `contas_fidelidade`/`lancamentos` passa exclusivamente pelas funções `security definer`, chamadas com a sessão do próprio usuário autenticado.
- Nenhuma alteração destrutiva em tabela existente do Core.
- Os dois achados de segurança (§4.1 e §4.3) foram corrigidos antes do encerramento desta fase — nenhum permanece pendente.

## 9. Pendências

- Reabertura de Conta Fidelidade fechada (`closed`) é um processo administrativo excepcional e auditado, deliberadamente **não implementado** nesta fase (rejeitado tanto por `join_tenant_loyalty` quanto por `alterar_status_conta_fidelidade`) — fica para uma fase futura, se necessário.
- O ciclo completo de `estado` do lançamento (`pendente → confirmado → disponível`) não tem, ainda, um mecanismo de transição (a tabela é append-only, sem `UPDATE`) — nesta fase, todo lançamento nasce diretamente em `disponivel`; a automação de confirmação (Motor de Benefícios) fica para uma fase futura de gamificação/campanhas, fora do escopo de CORE-002.
- O papel `tenant.member` citado nas decisões da Direção não existe fisicamente no catálogo atual (`PROJECT-CHECKLIST.md`, pendência já registrada) — o teste representou "colaborador sem permissão" como uma `tenant_membership` sem nenhum papel atribuído.
- `xp`/`tickets` seguem reservados no `asset_type` do ledger, sem nenhum lançamento real criado (fora do escopo funcional de CORE-002).

## 10. Próximos passos

Conforme o plano de execução (`CORE-002-Plano-Tecnico.md §6`), a Direção deve confirmar este relatório antes de autorizar **CORE-002.2 — Autenticação Real do Consumidor**. Nenhuma ação de CORE-002.2 foi iniciada.
