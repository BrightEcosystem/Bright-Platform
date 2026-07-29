# SUP-003 — Relatório de Aplicação das Migrations

**Status:** Concluído
**Data:** 2026-07-29
**Projeto Supabase:** `bright-platform-dev` (`nsilqajyvezaaddlhwyu`, região `sa-east-1`)
**Responsável pela execução:** Claude Code

---

## 1. Resumo

As 7 migrations aprovadas em `DB-001`/`BE-003` foram aplicadas com sucesso ao projeto de desenvolvimento real do Supabase. Confirmado por múltiplas fontes independentes (não apenas a saída do CLI): consulta SQL direta ao `information_schema`, `pg_class`, `pg_policies` e `pg_proc`.

## 2. Ferramental

- **Versão do Supabase CLI:** `2.110.0` (via `npx`, sem instalação global)
- **Conexão usada para validação:** `supabase db query --linked` (Management API do projeto linkado) — não a `--db-url` direta, que apresentou falhas de conexão neste ambiente de execução específico (ver observação na seção 7)

## 3. Migrations detectadas e aplicadas

| # | Arquivo | Status remoto |
|---|---|---|
| 1 | `20260729000100_extensions.sql` | aplicada |
| 2 | `20260729000200_core_tenants.sql` | aplicada |
| 3 | `20260729000300_identity_memberships.sql` | aplicada |
| 4 | `20260729000400_roles_permissions.sql` | aplicada |
| 5 | `20260729000500_products_subscriptions.sql` | aplicada |
| 6 | `20260729000600_audit_logs.sql` | aplicada |
| 7 | `20260729000700_rls_policies.sql` | aplicada |

`supabase migration list` confirma `local == remote` para as 7, e `supabase db push --dry-run` retorna `"Remote database is up to date"`.

## 4. Objetos criados (confirmados por consulta SQL direta)

**10 tabelas** no schema `public`: `tenants`, `profiles`, `tenant_memberships`, `roles`, `permissions`, `role_permissions`, `membership_roles`, `products`, `tenant_products`, `audit_logs`.

**Colunas de auditoria/multiempresa** — verificadas por tabela, consistentes com o design de `BE-003`:
- `created_at`: presente nas 10
- `updated_at`: presente nas 7 tabelas com ciclo de vida próprio (ausente, corretamente, em `audit_logs` e nas duas tabelas de relacionamento puro `role_permissions`/`membership_roles`)
- `tenant_id`: presente nas 4 tabelas de negócio por tenant (`tenants` não tem — ela É o tenant; `roles` tem, nulável, para suportar papéis de sistema)

**Chaves estrangeiras:** 12
**Índices:** 30
**Funções:** `set_updated_at` (trigger utilitário), `is_tenant_member` (helper de RLS — confirmado `SECURITY DEFINER` com `search_path` fixo)

## 5. Situação da RLS

RLS **habilitada nas 10 tabelas** (confirmado via `pg_class.relrowsecurity`). **11 políticas** criadas, todas as previstas em `BE-003 §5`:

| Tabela | Política | Comando |
|---|---|---|
| tenants | tenants_select_member | SELECT |
| profiles | profiles_select_self | SELECT |
| profiles | profiles_update_self | UPDATE |
| tenant_memberships | tenant_memberships_select_member | SELECT |
| roles | roles_select_system_or_member | SELECT |
| permissions | permissions_select_authenticated | SELECT |
| role_permissions | role_permissions_select_via_role | SELECT |
| membership_roles | membership_roles_select_via_membership | SELECT |
| products | products_select_authenticated | SELECT |
| tenant_products | tenant_products_select_member | SELECT |
| audit_logs | audit_logs_select_member | SELECT |

## 6. Teste de isolamento multiempresa

`tests/integration/database/rls-isolation-test.sql` — **executado com sucesso** contra o banco real (transacional, com `ROLLBACK` no final; confirmado que nenhum dado ficou persistido: `select count(*) from tenants` = 0 após o teste).

Este teste valida **estruturalmente**: RLS habilitada nas 10 tabelas, existência de ao menos uma política por tabela com `tenant_id`, e configuração correta (`SECURITY DEFINER` + `search_path` fixo) da função `is_tenant_member`.

**Não realizado ainda:** simulação de dois usuários autenticados reais consultando em paralelo para confirmar que um não vê dados do outro. Isso exige autenticação real (`auth.uid()` de um usuário de fato), que está fora do escopo de `SUP-003` — será feito em `AUTH-001`, conforme já registrado no próprio arquivo de teste.

## 7. Observação técnica importante (para não repetir o problema)

Durante a execução, a conexão direta via `--db-url` (Postgres puro, porta 5432/6543) **falhou consistentemente neste ambiente de execução**, mesmo depois de corrigidas duas causas reais que foram encontradas no caminho:
1. Um Project Ref incorreto (2 variáveis, com uma letra a mais) que nunca correspondia a nenhum projeto real.
2. Uma senha de banco desatualizada.

Mesmo com essas duas causas corrigidas, `--db-url` continuou falhando com erro genérico de conexão, enquanto testes de conectividade bruta (TCP, handshake SSL do protocolo Postgres) sempre confirmaram o servidor alcançável. A aplicação efetiva das migrations e toda a validação deste relatório só foi possível usando `supabase db query --linked` / `supabase migration list` (sem `--db-url`), que passam pela Management API do projeto autenticado via `supabase login`/`supabase link` em vez de uma conexão Postgres direta. Recomendação registrada em `RUN-002`: preferir `--linked` a `--db-url` neste ambiente.

## 8. Pendências

- Teste de isolamento multiempresa com usuários reais → aguarda `AUTH-001`.
- `verify-connection.mjs` continua testando a raiz `/rest/v1/` com a anon key (retornando 401 esperado) — nenhuma tabela hoje permite leitura anônima (todas as políticas exigem `authenticated` ou `auth.uid()`), então não há endpoint público seguro para testar a chave anon contra dado real ainda. Não abrimos nenhuma política só para viabilizar esse teste.
- Rotação de credenciais (`SEC-003`) — capturas de tela anteriores expuseram a `anon key`, a `secret key` e a senha do banco; devem ser rotacionadas antes de qualquer dado real entrar no ambiente.
