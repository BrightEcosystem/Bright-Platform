# CORE-002 — Plano Técnico

**Status:** Aprovado pela Direção — execução autorizada (CORE-002.1: schema, funções e RLS)
**Versão:** 0.3.0 (decisões finais da Direção incorporadas — plano pronto para execução)
**Versões anteriores:** 0.1.0 (modelagem inicial) → 0.2.0 (14 ajustes obrigatórios da Direção) → 0.3.0 (decisões finais de nomenclatura, permissões e função segura; autorização de execução)
**Documentos relacionados:** `IDENT-001-Modelo-de-Identidade.md §7/§8` (Matriz Oficial de RLS, Modelo Oficial da Conta Fidelidade — ambos congelados), `DATA-001-Modelo-Conceitual-de-Dados.md §2.1/§2.2` (Conta Fidelidade, Lançamento), `APP-001`/`HOM-001` (dados mockados a substituir)

---

## 0. Histórico de decisões

### v0.2.0 — 14 ajustes obrigatórios (ver commit `38dc5a1`)

Ledger unificado por `asset_type`, natureza crédito/débito, idempotência obrigatória, saldo derivado do ledger, RLS completa por operação/ator, índices obrigatórios, sem `service_role` no navegador, sem alteração destrutiva.

### v0.3.0 — decisões finais da Direção (esta revisão)

| # | Decisão final da Direção | Onde foi incorporado |
|---|---|---|
| 1 | Criar agora `tenant.consumers.view`/`tenant.consumers.manage`; mapear a `tenant.admin` (ambas) e `platform.admin` (ambas, via catálogo geral); `tenant.member` não recebe por padrão | §4, migration 1 |
| 2 | Estado terminal oficial: `closed` (não `removed`); ciclo `active ⇄ suspended → closed`; incluir `closed_at`/`closed_reason`; reabertura excepcional exige processo administrativo auditado, não `UPDATE` simples | §3.1 |
| 3 | Idempotência com unicidade **por empresa**: `unique (tenant_id, idempotency_key)`, não globalmente única | §3.2 |
| 4 | Precisão por ativo: cashback decimal com moeda (`BRL` inicialmente); pontos/XP/tickets sempre inteiros; `asset_type` imutável após criação; conversões entre ativos são operação de domínio futura, nunca `UPDATE` | §3.2 |
| 5 | Conta Fidelidade fechada não gera nova conta automaticamente para o mesmo par — o relacionamento é permanente | §5 (`join_tenant_loyalty`) |
| 6 | `criar_lancamento` reforçada: validação completa de ator/tenant/permissão, rejeição de valor inválido, regras por `asset_type`, idempotência, saldo não-negativo quando exigido, reversão compensatória, registro de autor/origem/data efetiva, sem `tenant_id` arbitrário; `REVOKE EXECUTE FROM PUBLIC` em todas as funções | §6 |
| 7 | Ledger imutável confirmado: nenhum INSERT/UPDATE/DELETE direto por cliente em nenhuma hipótese | §4.2 (já vigente, reafirmado) |

**Autorização de execução recebida:** a Direção aprovou a execução da CORE-002.1 na ordem descrita em §8, incluindo aplicação real ao Supabase conectado, testes de isolamento com dados fictícios, limpeza, relatório e commit isolado. **Não autoriza:** autenticação real do consumidor, remoção de mocks, CORE-002.2, ou qualquer gamificação — a execução para após o relatório desta sub-fase, aguardando nova auditoria.

## 1. Objetivo

Criar a base física real (schema, funções, RLS) para Conta Fidelidade e Lançamento, sem a qual nenhuma autenticação real ou carteira real pode existir. Esta é a sub-fase **CORE-002.1 — Schema, Funções e RLS**, agora **autorizada para execução**.

## 2. Escopo desta fase

**Dentro do escopo (CORE-002.1):** criação das tabelas `contas_fidelidade`/`lancamentos`, funções de apoio, RLS completa, extensão do catálogo de permissões, testes de isolamento com dados fictícios, limpeza, relatório.

**Fora do escopo (permanece para CORE-002.2 em diante):** autenticação real do consumidor, leitura de dados reais pela UI (o Aplicativo do Consumidor continua 100% mockado até CORE-002.3), remoção de mocks.

**Fora do escopo do programa CORE-002 como um todo (conforme a Direção):** roleta, raspadinha, baús, missões, ranking, XP como mecânica, campanhas automáticas, notificações, Marketplace de Benefícios operacional, comprovantes/OCR, indicações. O `asset_type` do ledger reserva `xp` e `tickets` por unificação arquitetural, mas nenhum lançamento desses tipos é criado nesta fase.

**Nenhuma alteração destrutiva** em tabelas existentes do Core: `tenants`, `profiles`, `tenant_memberships`, `roles`, `permissions`, `role_permissions`, `membership_roles`, `products`, `tenant_products`, `audit_logs` permanecem exatamente como estão. Toda mudança é aditiva (novas tabelas, novas funções, novas linhas no catálogo já existente de `permissions`).

## 3. Modelagem física final

### 3.1 `contas_fidelidade`

| Coluna | Tipo | Observações |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `consumer_id` | `uuid` FK → `auth.users(id)` | o consumidor — identidade única (`IDENT-001 §2`) |
| `tenant_id` | `uuid` FK → `tenants(id)` | a empresa parceira |
| `status` | `text not null default 'active'` | `active` \| `suspended` \| `closed` — ciclo `active ⇄ suspended → closed`; `closed` é **terminal**, nunca revertido por `UPDATE` simples |
| `closed_at` | `timestamptz`, nullable | preenchido apenas quando `status = 'closed'` |
| `closed_reason` | `text`, nullable | motivo do fechamento, quando aplicável |
| `balance_cashback` | `numeric(12,2) not null default 0` | cache/projeção — nunca fonte de verdade |
| `balance_cashback_currency` | `text not null default 'BRL'` | moeda do saldo de cashback (ajuste de precisão #4) |
| `balance_points` | `integer not null default 0` | cache/projeção |
| `nivel` | `text not null default 'bronze'` | `bronze` \| `prata` \| `ouro` (`DS-001`) |
| `xp_atual` | `integer not null default 0` | cache/projeção |
| `created_at` / `updated_at` | `timestamptz not null default now()` | |

**Constraints:** `unique (consumer_id, tenant_id)`; `check (status in ('active','suspended','closed'))`; `check (status <> 'closed' or closed_at is not null)`; `check (nivel in ('bronze','prata','ouro'))`; `check (balance_cashback >= 0)`, `check (balance_points >= 0)`, `check (xp_atual >= 0)`.

**Sem exclusão física:** nenhuma política de `DELETE` para nenhum ator além de `service_role` (que por convenção nunca a emite). Remoção lógica é sempre `status = 'closed'`. **Reabertura de conta fechada não é implementada nesta fase** — é, por decisão da Direção, um processo administrativo excepcional e auditado, fora do escopo de `alterar_status_conta_fidelidade` (§6), a ser desenhado quando houver necessidade real.

### 3.2 `lancamentos` — ledger unificado

| Coluna | Tipo | Observações |
|---|---|---|
| `id` | `uuid` PK | |
| `conta_fidelidade_id` | `uuid` FK → `contas_fidelidade(id)` | não nulo |
| `tenant_id` | `uuid` FK → `tenants(id)` | denormalizado de `contas_fidelidade.tenant_id` na criação |
| `asset_type` | `text not null` | `cashback` \| `points` \| `xp` \| `tickets` — **imutável após criação** (não há função de alteração; correção é sempre um novo lançamento) |
| `natureza` | `text not null` | `credito` \| `debito` |
| `valor` | `numeric(14,4) not null` | sempre positivo (`check (valor > 0)`); para `points`/`xp`/`tickets`, sempre inteiro (`check (asset_type = 'cashback' or valor = floor(valor))`) |
| `currency` | `text`, nullable | obrigatória apenas para `asset_type = 'cashback'` (`check`); nula para os demais |
| `estado` | `text not null` | `pendente` \| `confirmado` \| `disponivel` \| `resgatado` \| `expirado` \| `estornado` (`DATA-001 §2.2`) |
| `source_type` | `text not null` | `compra` \| `campanha` \| `missao` \| `estorno` \| `ajuste_manual` |
| `source_reference` | `text`, nullable | identificador do evento de origem; nulo apenas em `ajuste_manual` sem referência externa |
| `idempotency_key` | `text not null` | única **por empresa** (`unique (tenant_id, idempotency_key)`) — decisão final: duas empresas podem usar a mesma referência externa sem colisão |
| `estorno_de` | `uuid` FK → `lancamentos(id)`, nullable | correção sempre por lançamento compensatório, nunca edição |
| `autor_id` | `uuid` FK → `auth.users(id)`, nullable | quem/o quê originou o lançamento (`auth.uid()` no momento da chamada; nulo para processos de sistema sem ator humano) |
| `data_efetiva` | `timestamptz not null default now()` | data de efeito do lançamento, podendo diferir de `created_at` (ex.: lançamento retroativo de uma compra) |
| `data_expiracao` | `timestamptz`, nullable | |
| `created_at` | `timestamptz not null default now()` | **nunca `updated_at`** — append-only |

**Constraints:** `check (asset_type in ('cashback','points','xp','tickets'))`; `check (natureza in ('credito','debito'))`; `check (valor > 0)`; `check (asset_type = 'cashback' or valor = floor(valor))`; `check ((asset_type = 'cashback' and currency is not null) or (asset_type <> 'cashback' and currency is null))`; `check (estado in (...))`; `check (source_type in (...))`; `check (source_type <> 'estorno' or estorno_de is not null)`; `unique (tenant_id, idempotency_key)`.

**Imutabilidade a nível de banco:** nenhuma política de `UPDATE`/`DELETE`/`INSERT` direto para nenhum papel de cliente — mesmo princípio já usado para `audit_logs`.

**Nota de escopo sobre o ciclo de estados:** `DATA-001 §2.2` descreve o ciclo `pendente → confirmado → disponível → resgatado/expirado/estornado` como uma transição ao longo do tempo. Como a tabela é append-only (nenhum `UPDATE` em nenhuma hipótese, nem por função segura), **cada linha nasce e permanece para sempre no `estado` atribuído em sua criação** — uma transição de estado da mesma intenção econômica é modelada como uma nova linha (o mesmo princípio já usado para estorno, generalizado). Nesta fase, `criar_lancamento` sempre cria linhas já no estado terminal aplicável ao teste (`disponivel`), porque nenhuma automação de confirmação (Motor de Benefícios) existe ainda — isso é consistente com o escopo de CORE-002 (sem campanhas automáticas/OCR) e será resolvido, se necessário, na fase que implementar essas automações. `recalcular_saldo_conta_fidelidade` considera apenas linhas com `estado = 'disponivel'`.

### 3.3 Saldo oficial é derivado do ledger

`contas_fidelidade.balance_cashback`, `balance_points` e `xp_atual` são exclusivamente cache/projeção, recalculados por `public.recalcular_saldo_conta_fidelidade(...)` a partir da soma de `lancamentos` com `estado = 'disponivel'` (crédito soma, débito subtrai). Se cache e ledger divergirem, o ledger vence — o cache é sempre reconstruível.

### 3.4 Índices obrigatórios

`contas_fidelidade`: `unique (consumer_id, tenant_id)`; `(tenant_id, status)`.
`lancamentos`: `(conta_fidelidade_id, created_at)`; `(tenant_id, created_at)`; `unique (tenant_id, idempotency_key)`; `(source_type, source_reference)`.

## 4. Catálogo de permissões — extensão

Novos códigos em `public.permissions` (aditivo ao catálogo de `PERM-001`, nenhuma linha existente alterada):

| Código | Descrição |
|---|---|
| `tenant.consumers.view` | Visualizar Contas Fidelidade de consumidores da própria empresa |
| `tenant.consumers.manage` | Gerenciar Contas Fidelidade e criar lançamentos administrativos da própria empresa |

**Mapeamento:**

| Papel | `tenant.consumers.view` | `tenant.consumers.manage` |
|---|---|---|
| `tenant.admin` | Sim | Sim |
| `tenant.member` | Não (por padrão) | Não |
| `platform.admin` | Sim (via catálogo geral já existente) | Sim (via catálogo geral já existente) |
| Consumidor | N/A — vê apenas os próprios dados via política própria | N/A — nunca administra lançamentos |

`platform.admin` recebe ambas automaticamente pelo mesmo bloco já usado em `20260729001000_permissions_catalog.sql` (`cross join` de todas as permissões do catálogo) — não precisa de um insert dedicado. `tenant.member` fica deliberadamente de fora; papéis futuros podem recebê-las depois sem qualquer mudança de modelo.

## 5. RLS — matriz completa por operação

Reaproveita `is_tenant_member` já existente e adiciona `public.has_permission(check_tenant_id uuid, permission_code text)`:

```sql
create or replace function public.has_permission(check_tenant_id uuid, permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    join public.membership_roles mr on mr.membership_id = tm.id
    join public.role_permissions rp on rp.role_id = mr.role_id
    join public.permissions p on p.id = rp.permission_id
    where tm.profile_id = auth.uid()
      and tm.status = 'active'
      and p.code = permission_code
      and (
        tm.tenant_id = check_tenant_id
        or exists (
          select 1 from public.roles r
          where r.id = mr.role_id and r.tenant_id is null and r.name = 'platform.admin'
        )
      )
  );
$$;
```

### 5.1 `contas_fidelidade`

| Ator | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| Consumidor (dono) | `consumer_id = auth.uid()` | nenhuma — só via `join_tenant_loyalty` | nenhuma | nenhuma, nunca |
| Colaborador (própria empresa, `tenant.consumers.view`) | `is_tenant_member(tenant_id) and has_permission(tenant_id, 'tenant.consumers.view')` | nenhuma | nenhuma direta — via `alterar_status_conta_fidelidade` (exige `tenant.consumers.manage`) | nenhuma, nunca |
| Colaborador de outra empresa | nada | nenhuma | nenhuma | nenhuma |
| `platform.admin` | todas as linhas (via `has_permission`) | nenhuma | nenhuma direta | nenhuma, nunca |
| Servidor (`security definer`) | N/A | única via `join_tenant_loyalty` | única via `recalcular_saldo_conta_fidelidade`/`alterar_status_conta_fidelidade` | nunca |

### 5.2 `lancamentos`

| Ator | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| Consumidor (dono) | próprios, via join em `contas_fidelidade` | nenhuma — só via `criar_lancamento` | nenhuma, nunca | nenhuma, nunca |
| Colaborador (própria empresa, `tenant.consumers.view`) | `is_tenant_member(tenant_id) and has_permission(tenant_id, 'tenant.consumers.view')` | nenhuma | nenhuma, nunca | nenhuma, nunca |
| Colaborador de outra empresa | nada | nenhuma | nenhuma | nenhuma |
| `platform.admin` | todas as linhas | nenhuma | nenhuma, nunca | nenhuma, nunca |
| Servidor (`security definer`) | N/A | única via `criar_lancamento` | nunca existe | nunca |

Ausência de política para INSERT/UPDATE/DELETE em ambas as tabelas **bloqueia essas operações por padrão** para `authenticated`/`anon` — não é necessário criar política de negação explícita.

## 6. Funções de apoio (todas `security definer`, `search_path` fixo, `REVOKE EXECUTE FROM PUBLIC`)

- **`join_tenant_loyalty(p_tenant_id uuid)`** — cria a Conta Fidelidade do consumidor autenticado (`auth.uid()`) na empresa informada, com saldos zerados e `status = 'active'`. **Se já existir uma conta para o par (em qualquer status)**, não cria uma nova: `active`/`suspended` → retorna a existente (join idempotente); `closed` → lança exceção orientando a um processo administrativo (decisão #5 da Direção — o relacionamento é permanente, sem recriação automática). `GRANT EXECUTE` a `authenticated`, `service_role`.
- **`alterar_status_conta_fidelidade(p_conta_fidelidade_id uuid, p_novo_status text, p_motivo text default null)`** — exige `has_permission(tenant_id, 'tenant.consumers.manage')`; permite apenas `active ⇄ suspended` ou `→ closed` (preenchendo `closed_at`/`closed_reason`); **rejeita qualquer transição a partir de `closed`** (reabertura fica fora desta função, por decisão da Direção). `GRANT EXECUTE` a `authenticated`, `service_role`.
- **`recalcular_saldo_conta_fidelidade(p_conta_fidelidade_id uuid)`** — recalcula `balance_cashback`/`balance_points`/`xp_atual` a partir de `lancamentos` com `estado = 'disponivel'`. Chamada apenas internamente (por `criar_lancamento`); `EXECUTE` restrito a `service_role` (nenhum cliente chama via RPC direto).
- **`criar_lancamento(...)`** — implementa todos os itens da decisão #6: valida `auth.uid()`, deriva `tenant_id` da própria conta (nunca aceita `tenant_id` como parâmetro arbitrário), valida que o chamador é o dono da conta ou tem `tenant.consumers.manage`, valida `asset_type`/`natureza`/`valor` (incluindo regra de inteiro para pontos/XP/tickets e moeda obrigatória para cashback) antes do `INSERT`, aplica idempotência via `on conflict (tenant_id, idempotency_key) do nothing` retornando a linha já existente quando aplicável, verifica saldo suficiente antes de qualquer débito de `cashback`/`points` (rejeitando com exceção clara se insuficiente), registra `autor_id = auth.uid()` e `data_efetiva`, e recalcula o saldo na mesma transação. `GRANT EXECUTE` a `authenticated`, `service_role`.

Todas as quatro funções: `REVOKE EXECUTE ... FROM PUBLIC` explícito antes de qualquer `GRANT`.

## 7. Estratégia de autenticação do consumidor (inalterada desde v0.1.0)

Ver §6 da v0.2.0 — identidade única, sem reuso de `tenant_memberships`, fluxo via `@supabase/ssr`. Não faz parte da execução autorizada nesta sub-fase (CORE-002.2).

## 8. Ordem de execução autorizada

1. Estender catálogo de permissões (`tenant.consumers.view`/`tenant.consumers.manage`, mapeadas a `tenant.admin`).
2. Criar `contas_fidelidade` (tabela, constraints, índices, trigger `set_updated_at`).
3. Criar `lancamentos` (tabela, constraints, índices).
4. Criar funções auxiliares (`has_permission`, `join_tenant_loyalty`, `alterar_status_conta_fidelidade`, `recalcular_saldo_conta_fidelidade`, `criar_lancamento`), com `REVOKE`/`GRANT` explícitos.
5. Habilitar RLS e aplicar todas as políticas da §5.
6. Validar localmente (dry-run) e aplicar ao projeto Supabase real conectado (`--linked`, protocolo de `SUP-003`).
7. Validar schema remoto (tabelas, colunas, constraints, índices, funções, políticas — por consulta direta, não só saída do CLI).
8. Criar dados fictícios de teste e executar a matriz completa de testes (isolamento, idempotência, imutabilidade, saldo, regressão).
9. Limpar todos os dados fictícios, confirmar por consulta.
10. Escrever relatório da CORE-002.1, atualizar `PROJECT-ROADMAP.md`/`PROJECT-CHECKLIST.md`/`CHANGELOG.md`, commit isolado.

**Não fazer nesta execução:** iniciar autenticação real do consumidor, remover mocks, iniciar CORE-002.2, ou qualquer gamificação. Parar após o relatório e aguardar nova auditoria da Direção.

## 9. Rollback

Enquanto nenhum dado real existir: rollback = migration reversa (`drop function`/`drop table` na ordem inversa da criação), mesmo protocolo de validação de `SUP-003`. Após dados reais existirem (fora do escopo desta sub-fase), rollback deixa de ser "apagar tabela" e exige decisão explícita da Direção, análoga a `RUN-005`.

## 10. Riscos e mitigação

- Primeira migration em produção real conectada a um deploy já público: dry-run primeiro, validação real depois, mesmo protocolo de `SUP-003`.
- Dados fictícios de teste: nunca sem limpeza posterior confirmada por consulta.
- Nenhuma alteração em tabela/RLS já existente — apenas objetos aditivos.
- Divergência cache/ledger: mitigada por `recalcular_saldo_conta_fidelidade` rodar na mesma transação de `criar_lancamento`.
- Colisão de idempotência: mitigada por `source_type`/`source_reference` obrigatórios e pela unicidade por tenant; testado explicitamente na matriz da §8.9.

## 11. Testes obrigatórios (execução, não apenas planejamento)

- Consumidor A não vê Conta Fidelidade nem lançamentos do consumidor B.
- Empresa A não vê dados da empresa B.
- Consumidor não insere, atualiza nem exclui lançamento diretamente (`INSERT`/`UPDATE`/`DELETE` direto deve falhar por ausência de política).
- Colaborador sem `tenant.consumers.view`/`manage` não acessa dados de consumidores.
- `tenant.admin` acessa apenas o próprio tenant.
- Repetir a mesma `idempotency_key` (mesma empresa) não duplica lançamento.
- Reversão cria lançamento compensatório; o original nunca é alterado.
- Saldo derivado (`recalcular_saldo_conta_fidelidade`) corresponde à soma manual do ledger.
- Tentativa de valor fracionado em `points`/`xp`/`tickets` falha (constraint).
- Tentativa de `UPDATE`/`DELETE` direto no ledger falha (RLS).
- Fechamento (`status = 'closed'`) preserva histórico — nenhuma linha de `lancamentos` é afetada.
- Retaguarda e Aplicativo do Consumidor público continuam sem regressão.
- Limpeza completa de todos os dados fictícios ao final, mesmo protocolo de `AUTH-002`/`CORE-001`.
