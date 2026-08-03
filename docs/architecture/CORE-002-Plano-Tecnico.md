# CORE-002 — Plano Técnico

**Status:** Rascunho revisado para nova aprovação da Direção — nenhuma migration aplicada ainda
**Versão:** 0.2.0 (revisão CORE-002.1 — Revisão Final do Schema e da RLS)
**Versão anterior:** 0.1.0 — modelagem inicial, devolvida pela Direção com 14 ajustes obrigatórios antes de qualquer migration
**Documentos relacionados:** `IDENT-001-Modelo-de-Identidade.md §7/§8` (Matriz Oficial de RLS, Modelo Oficial da Conta Fidelidade — ambos congelados), `DATA-001-Modelo-Conceitual-de-Dados.md §2.1/§2.2` (Conta Fidelidade, Lançamento), `APP-001`/`HOM-001` (dados mockados a substituir)

---

## 0. O que mudou nesta revisão (v0.1.0 → v0.2.0)

A Direção revisou a modelagem física da v0.1.0 e **não autorizou migrations**, exigindo 14 ajustes obrigatórios antes de qualquer alteração no Supabase real. Todos os 14 estão incorporados abaixo:

| # | Ajuste exigido pela Direção | Onde foi incorporado |
|---|---|---|
| 1 | `contas_fidelidade`: unicidade explícita por consumidor×empresa, sem exclusão física | §3.1 |
| 2 | Ledger append-only formalizado explicitamente (não só em comentário) | §3.2, §3.3 |
| 3 | Ledger **unificado** com `asset_type` (não uma tabela por tipo de ativo) | §3.2 |
| 4 | Natureza crédito/débito, `valor` sempre positivo | §3.2 |
| 5 | Chave de idempotência obrigatória | §3.2, §5 |
| 6 | Referência estruturada ao evento de origem (`source_type`/`source_reference`) | §3.2 |
| 7 | Reversão sempre por lançamento compensatório | §3.2 (já existia, mantido) |
| 8 | Declaração formal: saldo oficial é derivado do ledger; saldo materializado é cache | §3.1, §6 |
| 9 | Consumidor sem permissão de INSERT/UPDATE/DELETE direto em lançamentos | §4, §5 |
| 10 | RLS completa por operação, por ator (consumidor / colaborador / platform.admin / servidor) | §4 |
| 11 | Lista de índices obrigatórios | §3.4 |
| 12 | Nenhum uso de `service_role` no navegador | §5, §7 |
| 13 | Nenhuma alteração destrutiva em tabelas existentes | §3 (intro), §8 |
| 14 | Não aplicar migration / não alterar banco / não iniciar auth real / não remover mocks / não iniciar CORE-002.2 até nova autorização | §9, §10 |

## 1. Objetivo

Transformar o Aplicativo do Consumidor de protótipo com dados mockados em aplicação integrada ao Core real: autenticação real do consumidor, Conta Fidelidade real, saldo/cashback real, histórico de movimentações real. Este documento é a **revisão final da modelagem** (sub-fase **CORE-002.1 — Revisão Final do Schema e da RLS**), para nova aprovação da Direção **antes** de qualquer migration ser aplicada ao projeto Supabase real.

## 2. Escopo desta fase

**Dentro do escopo:**
- Autenticação real do consumidor (login, logout, sessão persistente, recuperação de senha, proteção de rotas) via Supabase Auth, identidade única (`IDENT-001 §9`), sem reuso de `tenant_memberships`.
- Conta Fidelidade real (`IDENT-001 §8`): tabela física, RLS conforme a Matriz Oficial (§7), vínculo consumidor × empresa parceira.
- Lançamento real (`DATA-001 §2.2`): livro-razão append-only, unificado por `asset_type`, fonte de verdade do saldo.
- Carteira, saldo de pontos e saldo de cashback lendo dados reais em vez de mock.
- Remoção gradual dos mocks equivalentes (`src/services/mock/conta-fidelidade.ts`, `lancamentos.ts`, `src/contexts/consumer-session-context.tsx`).

**Fora do escopo (conforme a Direção):** roleta, raspadinha, baús, missões, ranking, XP como mecânica, campanhas automáticas, notificações, Marketplace de Benefícios operacional, comprovantes/OCR, indicações. Essas entidades de `DATA-001` permanecem conceituais — sem tabela física — até uma fase futura dedicada. O `asset_type` do ledger reserva os valores `xp` e `tickets` por unificação arquitetural (ajuste #3), mas **nenhum lançamento desses tipos será criado nesta fase** — apenas `cashback` e `points` são efetivamente escritos em CORE-002.

**Nenhuma alteração destrutiva** em tabelas existentes do Core (ajuste #13): `tenants`, `profiles`, `tenant_memberships`, `roles`, `permissions`, `role_permissions`, `membership_roles`, `products`, `tenant_products`, `audit_logs` — todas permanecem exatamente como estão. As únicas mudanças ao schema atual são puramente aditivas (novas tabelas, uma nova função de apoio a RLS, um novo grupo de permissões no catálogo já existente do `PERM-001`).

## 3. Modelagem física revisada

Duas tabelas novas, aditivas — nenhuma alteração em tabelas existentes.

### 3.1 `contas_fidelidade`

| Coluna | Tipo | Observações |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `consumer_id` | `uuid` FK → `auth.users(id)` | o consumidor — identidade única (`IDENT-001 §2`), mesma tabela usada pela Retaguarda |
| `tenant_id` | `uuid` FK → `tenants(id)` | a empresa parceira |
| `status` | `text` | `active` \| `suspended` \| `closed` — mapeamento explícito para os estados congelados em `IDENT-001 §8.5`: `active` = Ativa, `suspended` = Suspensa, `closed` = Removida (estado terminal lógico, **nunca exclusão física de linha**) |
| `balance_cashback` | `numeric(12,2) not null default 0` | **cache/projeção** — nunca fonte de verdade; recalculado a partir da soma de `lancamentos.valor` (ajuste #8) |
| `balance_points` | `integer not null default 0` | cache/projeção, mesmo princípio |
| `nivel` | `text not null default 'bronze'` | `bronze` \| `prata` \| `ouro` (`DS-001`) |
| `xp_atual` | `integer not null default 0` | cache/projeção — mesmo princípio de `balance_*`; a fonte de verdade, quando o `asset_type = xp` do ledger for ativado em fase futura, será a soma dos lançamentos, exatamente como cashback/pontos |
| `created_at` / `updated_at` | `timestamptz not null default now()` | |

**Constraints:**
- `unique (consumer_id, tenant_id)` — uma Conta Fidelidade por par consumidor×empresa (`IDENT-001 §8.3`), ajuste #1.
- `check (status in ('active', 'suspended', 'closed'))`.
- `check (balance_cashback >= 0)`, `check (balance_points >= 0)`, `check (xp_atual >= 0)` — o cache nunca reflete saldo negativo; qualquer tentativa de recomputar para negativo é um bug de aplicação a ser barrado antes da escrita, não uma condição de banco válida.

**Sem exclusão física (ajuste #1):** nenhuma política de `DELETE` é criada para nenhum papel além de `service_role` (que, por padrão do Supabase, ignora RLS — mas convenciona-se, pelo mesmo princípio já aplicado a `lancamentos`, que a aplicação nunca emite `DELETE` nesta tabela). A remoção lógica é sempre `status = 'closed'`.

### 3.2 `lancamentos` — ledger unificado

Uma única tabela para todos os tipos de ativo (ajuste #3), não uma tabela por `asset_type`.

| Coluna | Tipo | Observações |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `conta_fidelidade_id` | `uuid` FK → `contas_fidelidade(id)` | não nulo |
| `tenant_id` | `uuid` FK → `tenants(id)` | **denormalizado** de `contas_fidelidade.tenant_id` no momento da criação — evita join obrigatório em toda checagem de RLS/índice; nunca diverge do valor em `contas_fidelidade` porque a linha é imutável (ajuste #10, #11) |
| `asset_type` | `text not null` | `cashback` \| `points` \| `xp` \| `tickets` — unificação exigida (ajuste #3). Nesta fase, apenas `cashback` e `points` são efetivamente usados |
| `natureza` | `text not null` | `credito` \| `debito` (ajuste #4) — substitui a antiga inferência de sinal pelo campo `tipo` |
| `valor` | `numeric(12,2) not null` | **sempre positivo** (`check (valor > 0)`, ajuste #4); o sinal do impacto no saldo vem de `natureza`, nunca do valor |
| `estado` | `text not null` | `pendente` \| `confirmado` \| `disponivel` \| `resgatado` \| `expirado` \| `estornado` (`DATA-001 §2.2`) |
| `source_type` | `text not null` | `compra` \| `campanha` \| `missao` \| `estorno` \| `ajuste_manual` — o que originou o lançamento (ajuste #6) |
| `source_reference` | `text` | identificador do evento de origem no sistema que o gerou (ex.: id da compra, id da campanha); nulo apenas quando `source_type = 'ajuste_manual'` sem referência externa |
| `idempotency_key` | `text not null` | **obrigatória** (ajuste #5) — construída como `tenant_id + ':' + source_type + ':' + source_reference + ':' + asset_type` pela função de criação (§5), garantindo que o mesmo evento de origem nunca gere dois lançamentos duplicados mesmo sob reprocessamento/retry |
| `estorno_de` | `uuid` FK → `lancamentos(id)`, nullable | auto-referência — um estorno **nunca edita o original**, sempre cria uma nova linha compensatória (`natureza` invertida, mesmo `asset_type`) referenciando o lançamento estornado (ajuste #7) |
| `data_expiracao` | `timestamptz`, nullable | |
| `created_at` | `timestamptz not null default now()` | **nunca `updated_at`** — a tabela é append-only por design (ajuste #2), sem coluna de atualização |

**Constraints:**
- `check (asset_type in ('cashback', 'points', 'xp', 'tickets'))`.
- `check (natureza in ('credito', 'debito'))`.
- `check (valor > 0)`.
- `check (estado in ('pendente', 'confirmado', 'disponivel', 'resgatado', 'expirado', 'estornado'))`.
- `check (source_type in ('compra', 'campanha', 'missao', 'estorno', 'ajuste_manual'))`.
- `unique (idempotency_key)` — reforça a garantia de não duplicação a nível de banco, não só de convenção de aplicação (ajuste #5).
- `check (source_type <> 'estorno' or estorno_de is not null)` — todo lançamento de estorno referencia obrigatoriamente o original.

**Imutabilidade a nível de banco (ajuste #2):** nenhuma política de `UPDATE` ou `DELETE` para `authenticated` — nenhum papel de cliente pode alterar ou remover uma linha depois de criada. Mesmo princípio já em uso para `audit_logs`.

### 3.3 Saldo oficial é derivado do ledger (ajuste #8 — declaração formal)

`contas_fidelidade.balance_cashback`, `balance_points` e `xp_atual` são **exclusivamente cache/projeção**. A fonte de verdade é sempre a soma de `lancamentos` (`natureza = 'credito'` soma, `natureza = 'debito'` subtrai) filtrados por `estado` relevante ao contexto (ex.: saldo "disponível" considera apenas `estado = 'disponivel'`; histórico completo considera todos os estados).

Consequências de design:
- O cache é recalculado por uma função `public.recalcular_saldo_conta_fidelidade(p_conta_fidelidade_id uuid)` (SECURITY DEFINER, chamada pela mesma função segura que cria o lançamento — §5), nunca escrito diretamente pelo cliente.
- Se o cache e o ledger divergirem por qualquer motivo, o **ledger vence** — o cache pode ser reconstruído a qualquer momento a partir de `lancamentos` sem perda de informação. Este é o motivo pelo qual `lancamentos` nunca pode ser alterado ou apagado por um cliente: é o único registro que não pode ser reconstituído.

### 3.4 Índices obrigatórios (ajuste #11)

| Índice | Tabela | Finalidade |
|---|---|---|
| `unique (consumer_id, tenant_id)` | `contas_fidelidade` | já criado pela constraint de unicidade — também serve como índice de busca da conta de um consumidor numa empresa |
| `contas_fidelidade (tenant_id, status)` | `contas_fidelidade` | listagem de contas ativas de uma empresa (uso da Retaguarda, `tenant.consumers.view`) |
| `lancamentos (conta_fidelidade_id, created_at)` | `lancamentos` | extrato do consumidor (ordem cronológica por conta) |
| `lancamentos (tenant_id, created_at)` | `lancamentos` | consultas/relatórios por empresa sem join em `contas_fidelidade` |
| `unique (idempotency_key)` | `lancamentos` | garantia de não duplicação (também funciona como índice de busca por evento) |
| `lancamentos (source_type, source_reference)` | `lancamentos` | rastreabilidade — encontrar todos os lançamentos originados por um evento específico |

## 4. RLS — matriz completa por operação (ajustes #9, #10)

Reaproveita `is_tenant_member` já existente (`20260729000700_rls_policies.sql`), e **adiciona uma nova função** `public.has_permission(check_tenant_id uuid, permission_code text)` — necessária porque, até aqui, nenhuma tabela do Core precisava de checagem de permissão granular dentro de uma política de RLS (a checagem de `hasPermission`/`requirePermission` de `PERM-001` vive só na camada de aplicação). Conta Fidelidade é a primeira tabela em que um colaborador administrativo precisa de uma permissão específica (`tenant.consumers.view`/`tenant.consumers.manage`) para ver dados de consumidores da própria empresa — não basta ser membro do tenant.

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

Segue o mesmo padrão de `is_tenant_member` (SQL, `stable`, `security definer`, sem duplicar lógica de autorização — apenas estende para granularidade de permissão).

### 4.1 `contas_fidelidade`

| Ator | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| Consumidor (dono da conta) | própria conta: `consumer_id = auth.uid()` | **nenhuma política direta** — criação apenas via função seletiva `join_tenant_loyalty(tenant_id)` (§5), que insere com saldos zerados e `status = 'active'` | **nenhuma política** — nenhum campo (nem `status`, nem saldos) é editável diretamente pelo cliente | **nenhuma política, nunca** |
| Colaborador administrativo (própria empresa) | `is_tenant_member(tenant_id) and has_permission(tenant_id, 'tenant.consumers.view')` | nenhuma | **nenhuma política direta** — alterações de `status` (suspender/reativar) via função `alterar_status_conta_fidelidade(...)` exigindo `has_permission(tenant_id, 'tenant.consumers.manage')` | nenhuma, nunca |
| Colaborador de outra empresa | nenhuma linha visível | nenhuma | nenhuma | nenhuma |
| `platform.admin` | todas as linhas (via `has_permission` reconhecendo o papel global) | nenhuma (mesmo princípio — nem admin insere fora da função) | nenhuma direta — auditado via função dedicada se necessário no futuro | nenhuma, nunca |
| Servidor (função `security definer`) | N/A (ignora RLS dentro da função) | única via `join_tenant_loyalty` | única via `recalcular_saldo_conta_fidelidade`/`alterar_status_conta_fidelidade` | nunca — nem o servidor apaga linhas |

### 4.2 `lancamentos`

| Ator | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| Consumidor (dono da conta) | próprios lançamentos: `exists (... contas_fidelidade.consumer_id = auth.uid())` | **nenhuma política** — todo lançamento nasce dentro de `criar_lancamento(...)` (§5) | nenhuma, nunca | nenhuma, nunca |
| Colaborador administrativo (própria empresa) | `is_tenant_member(tenant_id) and has_permission(tenant_id, 'tenant.consumers.view')` | nenhuma | nenhuma, nunca | nenhuma, nunca |
| Colaborador de outra empresa | nenhuma linha visível | nenhuma | nenhuma | nenhuma |
| `platform.admin` | todas as linhas | nenhuma (mesmo princípio — nem admin insere fora da função) | nenhuma, nunca | nenhuma, nunca |
| Servidor (função `security definer`) | N/A | única via `criar_lancamento` | nunca — nenhuma função de update existe, mesmo no servidor (correção é sempre um novo lançamento) | nunca |

**Isolamento cross-tenant:** mesmo princípio já em produção (`BE-003 §5`) — nenhuma linha de outra empresa visível, em nenhuma das duas tabelas, para nenhum ator que não seja `platform.admin`.

## 5. Fluxo seguro de criação de lançamento (ajustes #5, #9, #10, #12)

**Nenhum lançamento é criado por `INSERT` direto de cliente — nem consumidor, nem colaborador, nem `platform.admin`.** A única via é uma função Postgres `security definer`, análoga a `is_tenant_member`, chamada via RPC do Supabase (`supabase.rpc(...)`) a partir de código de servidor (Server Action / Route Handler do Next.js) — **nunca com `service_role` no navegador** (ajuste #12): o cliente browser nunca detém a chave `service_role`; a chamada RPC usa a sessão do próprio usuário autenticado (chave `anon` + JWT), e a função `security definer` decide, internamente, se a operação é permitida.

```sql
create or replace function public.criar_lancamento(
  p_conta_fidelidade_id uuid,
  p_asset_type text,
  p_natureza text,
  p_valor numeric,
  p_estado text,
  p_source_type text,
  p_source_reference text,
  p_idempotency_key text,
  p_estorno_de uuid default null,
  p_data_expiracao timestamptz default null
)
returns public.lancamentos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_owner uuid;
  v_result public.lancamentos;
begin
  select tenant_id, consumer_id into v_tenant_id, v_owner
  from public.contas_fidelidade
  where id = p_conta_fidelidade_id;

  if v_tenant_id is null then
    raise exception 'conta_fidelidade % nao encontrada', p_conta_fidelidade_id;
  end if;

  -- autorização: o próprio consumidor (ações de auto-serviço, ex. resgate)
  -- ou um colaborador com permissão de gestão da própria empresa.
  if not (
    v_owner = auth.uid()
    or public.has_permission(v_tenant_id, 'tenant.consumers.manage')
  ) then
    raise exception 'não autorizado a criar lançamento nesta conta';
  end if;

  insert into public.lancamentos (
    conta_fidelidade_id, tenant_id, asset_type, natureza, valor, estado,
    source_type, source_reference, idempotency_key, estorno_de, data_expiracao
  ) values (
    p_conta_fidelidade_id, v_tenant_id, p_asset_type, p_natureza, p_valor, p_estado,
    p_source_type, p_source_reference, p_idempotency_key, p_estorno_de, p_data_expiracao
  )
  on conflict (idempotency_key) do nothing
  returning * into v_result;

  if v_result.id is not null then
    perform public.recalcular_saldo_conta_fidelidade(p_conta_fidelidade_id);
  end if;

  return v_result;
end;
$$;
```

Notas de design:
- `on conflict (idempotency_key) do nothing` torna a chamada **idempotente de verdade** a nível de banco — um retry de rede que reenvia a mesma chamada não duplica o lançamento (ajuste #5).
- A autorização de quem pode chamar a função fica **dentro da função**, não em uma política de RLS de `INSERT` (que não existe para esta tabela) — é o próprio "servidor seguro" exigido pela Direção.
- Processos automatizados futuros (ex.: OCR de comprovantes, campanhas automáticas — fora de escopo de CORE-002) chamarão a mesma função a partir de um Route Handler autenticado ou de um job de backend com `service_role`, nunca a partir do navegador.
- Todo o fluxo de criação está fora do navegador: a Server Action do Next.js roda no servidor Vercel, usa o cliente Supabase de servidor já existente (`src/lib/supabase/server.ts`), e a chave `anon`/JWT do usuário — em nenhum momento a chave `service_role` trafega para o browser (ajuste #12, reforça o padrão já seguido por todo o projeto).

## 6. Estratégia de autenticação do consumidor

- **Identidade única** (`IDENT-001 §2`, congelado): mesma tabela `auth.users`, sem sistema de autenticação paralelo.
- **Sem reuso de `tenant_memberships`** para o vínculo consumidor×empresa (`IDENT-001 §9`) — o vínculo é sempre via `contas_fidelidade`.
- **Fluxo:** `src/contexts/consumer-session-context.tsx` deixa de usar `localStorage` mockado e passa a usar `@supabase/ssr` (mesmo padrão de `src/lib/supabase/client.ts`/`server.ts`, já existentes, sem alteração). Login via `supabase.auth.signInWithPassword`, cadastro via `supabase.auth.signUp`.
- **Middleware (`src/proxy.ts`):** `/cliente/*` continua sem exigir sessão de colaborador administrativo — a proteção de rota do consumidor passa a ser feita no próprio `ConsumerShell`, validando sessão real do Supabase em vez de `localStorage`.
- Esta parte da modelagem **não muda** em relação à v0.1.0 — não fazia parte dos 14 ajustes pedidos pela Direção.

## 7. Rollback

Como as duas tabelas são **inteiramente novas e aditivas**, sem nenhuma outra tabela do Core referenciando-as, o rollback é simples enquanto nenhum dado real existir:

1. **Antes de qualquer dado real ser inserido** (janela entre a aplicação da migration e o início de CORE-002.3): rollback = uma migration reversa (`drop function if exists public.criar_lancamento; drop function if exists public.recalcular_saldo_conta_fidelidade; drop function if exists public.has_permission; drop table if exists public.lancamentos; drop table if exists public.contas_fidelidade;`), aplicada com o mesmo protocolo de validação de `SUP-003`.
2. **Após dados reais existirem** (fora do escopo desta sub-fase, mas registrado para referência futura): rollback deixa de ser "apagar tabela" e passa a ser um problema de produto (não se descarta saldo real de consumidor) — qualquer reversão nesse estágio exigiria uma decisão explícita da Direção, análoga ao runbook `RUN-005-Deploy-e-Rollback.md`, não coberta por este plano.
3. Migrations aplicadas primeiro em modo local/dry-run, depois no projeto real, mesmo protocolo já usado em `SUP-003` (checagem de schema remoto pós-aplicação).

## 8. Ordem das migrations propostas

Seguindo a numeração sequencial já usada em `supabase/migrations/` (prefixo de data/hora):

1. `..._core_loyalty_accounts.sql` — cria `contas_fidelidade` (tabela, constraints, índices, trigger `set_updated_at` reaproveitando `public.set_updated_at()` já existente).
2. `..._core_loyalty_ledger.sql` — cria `lancamentos` (tabela, constraints, índices).
3. `..._core_loyalty_functions.sql` — cria `public.has_permission`, `public.recalcular_saldo_conta_fidelidade`, `public.criar_lancamento`, `public.join_tenant_loyalty`, `public.alterar_status_conta_fidelidade`.
4. `..._core_loyalty_rls.sql` — habilita RLS e cria todas as políticas da matriz da §4.
5. `..._core_loyalty_permissions_catalog.sql` — estende o catálogo já existente de `PERM-001` com `tenant.consumers.view`/`tenant.consumers.manage` (aditivo em `permissions`, sem alterar linhas existentes; mapeamento a `tenant.admin` a critério da Direção — ver pendência §9.3 da versão anterior, mantida em aberto).

Cada migration é independente e aditiva; a ordem importa apenas porque 3 depende de 1/2 (referencia as tabelas) e 4 depende de 3 (referencia as funções).

## 9. Riscos e mitigação

- **Primeira migration em produção real conectada a um deploy já público (`HOM-001` aprovado):** aplicada primeiro em modo `dry-run`, depois validada em ambiente real antes de qualquer código depender dela — mesmo protocolo já usado em `SUP-003`.
- **Dados fictícios de teste:** nunca inseridos em `contas_fidelidade`/`lancamentos` sem limpeza posterior confirmada por consulta — mesmo protocolo já usado em todas as fases anteriores.
- **Nenhuma alteração em RLS ou tabelas já existentes do Core** — apenas tabelas e funções aditivas (ajuste #13).
- **Divergência entre cache e ledger:** mitigada por design — `recalcular_saldo_conta_fidelidade` é chamada dentro da mesma transação de `criar_lancamento`; se a função de recálculo falhar, a transação inteira reverte (nenhum lançamento "órfão" sem cache atualizado).
- **Chave de idempotência mal construída pelo chamador (colisão indevida):** mitigada por `source_type`/`source_reference` serem obrigatórios e específicos por evento de origem; testado explicitamente em CORE-002.4 (reenvio da mesma chamada deve retornar o lançamento já existente, não erro nem duplicata).

## 10. Testes previstos (CORE-002.4, apenas planejamento nesta revisão)

- Isolamento RLS: consumidor A não vê Conta Fidelidade nem lançamentos de consumidor B; colaborador da empresa X não vê nada da empresa Y; `platform.admin` vê tudo.
- Nenhum papel além da função `security definer` consegue inserir, atualizar ou apagar um lançamento (testado tentando `insert`/`update`/`delete` diretos autenticado como consumidor e como colaborador — devem falhar por RLS).
- Idempotência: duas chamadas de `criar_lancamento` com o mesmo `idempotency_key` retornam o mesmo lançamento, sem duplicar.
- Saldo derivado: após uma sequência de lançamentos de crédito/débito/estorno, `recalcular_saldo_conta_fidelidade` produz o mesmo valor que a soma manual do ledger.
- Estorno: um lançamento estornado gera uma nova linha compensatória; o original nunca é alterado.
- Limpeza completa de todos os dados fictícios ao final, mesmo protocolo de `AUTH-002`/`CORE-001`.

## 11. Pendências para a Direção decidir antes de aplicar migrations

1. Confirmar a modelagem revisada (§3–§5) ou solicitar novos ajustes.
2. Autorizar explicitamente a aplicação das migrations ao projeto Supabase real.
3. Confirmar se `tenant.consumers.view`/`tenant.consumers.manage` devem ser mapeadas ao papel `tenant.admin` nesta mesma sub-fase (extensão aditiva do catálogo de `PERM-001`) ou adiadas — sem esse mapeamento, nenhum colaborador administrativo consegue visualizar Contas Fidelidade de consumidores na Retaguarda (não bloqueia o Aplicativo do Consumidor em si).
4. Confirmar a nomenclatura de estado `closed` (usada nesta revisão para alinhar com a terminologia da Direção) como o valor físico correspondente ao estado "Removida" de `IDENT-001 §8.5`, ou indicar se prefere manter `removed` como valor de coluna.

**Nada além desta revisão de plano foi feito.** Nenhuma migration foi aplicada, nenhuma tabela criada, nenhuma autenticação real iniciada, nenhum mock removido, CORE-002.2 não foi iniciada — conforme instrução explícita da Direção. Aguardando autorização.
