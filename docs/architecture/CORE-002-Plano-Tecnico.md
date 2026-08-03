# CORE-002 — Plano Técnico (Análise Inicial)

**Status:** Rascunho para revisão da Direção — nenhuma migration aplicada ainda
**Versão:** 0.1.0
**Documentos relacionados:** `IDENT-001-Modelo-de-Identidade.md §7/§8` (Matriz Oficial de RLS, Modelo Oficial da Conta Fidelidade — ambos congelados), `DATA-001-Modelo-Conceitual-de-Dados.md §2.1/§2.2` (Conta Fidelidade, Lançamento), `APP-001`/`HOM-001` (dados mockados a substituir)

---

## 1. Objetivo

Transformar o Aplicativo do Consumidor de protótipo com dados mockados em aplicação integrada ao Core real: autenticação real do consumidor, Conta Fidelidade real, saldo/cashback real, histórico de movimentações real — exatamente o escopo definido pela Direção ao liberar o gate de `HOM-001`. Este documento é a **análise inicial**: modelagem física proposta, estratégia de autenticação e plano de execução, para revisão **antes** de qualquer migration ser aplicada ao projeto Supabase real.

## 2. Escopo desta fase

**Dentro do escopo:**
- Autenticação real do consumidor (login, logout, sessão persistente, recuperação de senha, proteção de rotas) — via Supabase Auth, mesma base técnica já usada pela Retaguarda (`AUTH-001`), mas com fluxo e tabelas próprias (identidade única, sem reuso de `tenant_memberships`, conforme `IDENT-001 §9`).
- Conta Fidelidade real (`IDENT-001 §8`): tabela física, RLS conforme a Matriz Oficial (§7), vínculo consumidor × empresa parceira.
- Lançamento real (`DATA-001 §2.2`): livro-razão append-only, fonte de verdade do saldo.
- Carteira, saldo de pontos e saldo de cashback lendo dados reais em vez de mock.
- Remoção gradual dos mocks equivalentes (`src/services/mock/conta-fidelidade.ts`, `lancamentos.ts`, `src/contexts/consumer-session-context.tsx`).

**Fora do escopo (conforme a Direção):** roleta, raspadinha, baús, missões, ranking, XP, campanhas automáticas, notificações, Marketplace de Benefícios operacional, comprovantes/OCR, indicações. Essas entidades de `DATA-001` permanecem conceituais — sem tabela física — até uma fase futura dedicada.

## 3. Modelagem física proposta

Duas tabelas novas, aditivas — nenhuma alteração em tabelas existentes do Core (`tenants`, `profiles`, `tenant_memberships`, etc.).

### 3.1 `contas_fidelidade`

| Coluna | Tipo | Observações |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `profile_id` | `uuid` FK → `auth.users(id)` | o consumidor (mesma tabela de identidade única da Retaguarda — `IDENT-001 §2`: identidade única, não duplicada) |
| `tenant_id` | `uuid` FK → `tenants(id)` | a empresa parceira |
| `status` | `text` | `active` \| `suspended` \| `removed` (`IDENT-001 §8.5`) |
| `saldo_cashback` | `numeric(12,2)` | cache — recalculável a partir de `lancamentos` (`DATA-001 §2.2`) |
| `saldo_pontos` | `integer` | cache, mesmo princípio |
| `nivel` | `text` | `bronze` \| `prata` \| `ouro` (`DS-001`) |
| `xp_atual` | `integer` | |
| `created_at` / `updated_at` | `timestamptz` | |

Constraint `unique (profile_id, tenant_id)` — uma Conta Fidelidade por par consumidor×empresa (`IDENT-001 §8.3`).

### 3.2 `lancamentos`

| Coluna | Tipo | Observações |
|---|---|---|
| `id` | `uuid` PK | |
| `conta_fidelidade_id` | `uuid` FK → `contas_fidelidade(id)` | |
| `tipo` | `text` | `cashback` \| `ponto` |
| `valor` | `numeric(12,2)` | |
| `estado` | `text` | `pendente` \| `confirmado` \| `disponivel` \| `resgatado` \| `expirado` \| `estornado` (`DATA-001 §2.2`) |
| `origem` | `text` | `compra` \| `campanha` \| `missao` \| `estorno` \| `ajuste_manual` |
| `estorno_de` | `uuid` FK → `lancamentos(id)`, nullable | auto-referência — um estorno nunca edita o original |
| `data_expiracao` | `timestamptz`, nullable | |
| `created_at` | `timestamptz` | **nunca `updated_at`** — a tabela é append-only por design, sem coluna de atualização |

**Trigger/constraint de imutabilidade:** política de `UPDATE`/`DELETE` bloqueada para todos os papéis exceto `service_role` (mesmo princípio já usado para `audit_logs`), reforçando append-only a nível de banco, não só de convenção de código.

## 4. RLS — mapeamento 1:1 da Matriz Oficial (`IDENT-001 §7`)

| Política | Tabela | Regra |
|---|---|---|
| Consumidor visualiza a própria Conta Fidelidade | `contas_fidelidade` | `profile_id = auth.uid()` |
| Consumidor visualiza os próprios Lançamentos | `lancamentos` | via `exists (... contas_fidelidade.profile_id = auth.uid())` |
| Ninguém edita saldo/nível diretamente | `contas_fidelidade` | sem política de `UPDATE` para `authenticated` — só `service_role` (Motor de Benefícios, fase futura) atualiza |
| Colaborador administrativo visualiza Contas Fidelidade da própria empresa | `contas_fidelidade` | `is_tenant_member(tenant_id)` **+** nova permissão `tenant.consumers.view` (catálogo a estender em `PERM-001`) |
| Lançamentos imutáveis | `lancamentos` | sem política de `UPDATE`/`DELETE` para `authenticated` |
| Isolamento cross-tenant | ambas | mesmo princípio já em produção (`BE-003 §5`) — nenhuma linha de outra empresa visível |

Reaproveita a função `is_tenant_member` já existente (`0007_rls_policies.sql`), sem duplicar lógica.

## 5. Estratégia de autenticação do consumidor

- **Identidade única** (`IDENT-001 §2`, congelado): o consumidor usa a mesma tabela `auth.users` do Supabase já usada pela Retaguarda — não é um sistema de autenticação paralelo. A diferença está inteiramente na camada de aplicação: um usuário de `auth.users` pode ter `tenant_memberships` (colaborador administrativo) e/ou `contas_fidelidade` (consumidor) — nada impede as duas coisas na mesma pessoa.
- **Sem reuso de `tenant_memberships`** para o vínculo consumidor×empresa — isso é exatamente o que `IDENT-001 §9` proíbe. O vínculo é sempre via `contas_fidelidade`.
- **Fluxo:** `src/contexts/consumer-session-context.tsx` deixa de usar `localStorage` mockado e passa a usar `@supabase/ssr` (mesmo padrão de `src/lib/supabase/client.ts`/`server.ts`, já existentes e reutilizáveis sem alteração). Login real via `supabase.auth.signInWithPassword`, cadastro via `supabase.auth.signUp`.
- **Middleware (`src/proxy.ts`):** `/cliente/*` continua sem exigir sessão de colaborador administrativo (correção já feita em `APP-001`) — a proteção de rota do consumidor passa a ser feita no próprio `ConsumerShell`, agora validando sessão real do Supabase em vez de `localStorage`.

## 6. Plano de execução (sub-fases, cada uma com commit isolado)

1. **CORE-002.1 — Schema e RLS:** migrations para `contas_fidelidade` e `lancamentos` (seguindo a numeração sequencial já usada em `supabase/migrations/`), aplicadas primeiro em modo `dry-run`/local, depois no projeto real, com o mesmo protocolo de validação já usado em `SUP-003` (checagem de schema remoto pós-aplicação).
2. **CORE-002.2 — Autenticação real do consumidor:** páginas `/cliente/entrar`/`/cliente/onboarding` passam a chamar Supabase Auth de verdade; `ConsumerSessionProvider` reescrito para sessão real; middleware/`ConsumerShell` ajustados.
3. **CORE-002.3 — Carteira real:** `src/services/mock/conta-fidelidade.ts` e `lancamentos.ts` substituídos por serviços reais (mesmo formato de tipo `ContaFidelidade`/`Lancamento` já usado pela UI — nenhuma mudança de componente visual necessária); telas `/cliente/inicio`, `/cliente/carteira` passam a ler dados reais.
4. **CORE-002.4 — Testes funcionais com dados fictícios:** criação de conta de teste, Conta Fidelidade de teste, Lançamentos de teste, validação de isolamento RLS (consumidor não vê Conta Fidelidade de outro; colaborador não vê de outra empresa) — **limpeza completa ao final**, mesmo protocolo de `AUTH-002`/`CORE-001`.
5. **CORE-002.5 — Documentação e relatório:** atualização de `PROJECT-ROADMAP.md`/`PROJECT-CHECKLIST.md`/`CHANGELOG.md`, relatório final da fase.

## 7. Riscos e mitigação

- **Primeira migration em produção real conectada a um deploy já público (`HOM-001` aprovado):** aplicada primeiro em modo `dry-run`, depois validada em ambiente real antes de qualquer código depender dela — mesmo protocolo já usado em `SUP-003`.
- **Dados fictícios de teste:** nunca inseridos em `contas_fidelidade`/`lancamentos` sem limpeza posterior confirmada por consulta — mesmo protocolo já usado em todas as fases anteriores com dados de teste.
- **Nenhuma alteração em RLS ou tabelas já existentes do Core** — apenas tabelas aditivas.

## 8. Pendências para a Direção decidir antes de aplicar migrations

1. Confirmar a modelagem física proposta (seção 3) ou solicitar ajustes.
2. Autorizar explicitamente a aplicação das migrations ao projeto Supabase real (ação com efeito em banco de produção, tratada com o mesmo cuidado de `SUP-003`).
3. Confirmar que a permissão `tenant.consumers.view` (proposta em `IDENT-001 §7`, ainda não formalizada em `PERM-001`) deve ser criada nesta fase ou adiada — sem ela, colaboradores administrativos não conseguem visualizar Contas Fidelidade de consumidores da própria empresa na Retaguarda (não é bloqueante para o Aplicativo do Consumidor em si, que só depende da política do consumidor sobre a própria conta).
