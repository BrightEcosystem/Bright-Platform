# PRODUCT-002 — Relatório de Auditoria Técnica

**Status:** Concluído (análise apenas — nenhum código, migration ou commit)
**Data:** 2026-07-31
**Responsável pela execução:** Claude Code
**Escopo:** cruzamento entre `docs/product/` (Constituição da Bright Rewards, v0.1.0) e a arquitetura já aprovada (`BE-001` a `BE-008`, `ADR-001`, `PROJECT-CHECKLIST.md`, `RUN-001` a `RUN-005`).

---

## 1. Existe alguma regra da Constituição que não pode ser implementada na arquitetura atual?

Duas regras da Constituição **colidem diretamente** com decisões já tomadas e vigentes:

**1.1 — RLS de `profiles` é self-only; a Constituição pressupõe visibilidade agregada.**
`BE-003 §5` fixa: *"`profiles`: cada usuário só enxerga/edita o próprio registro nesta fase. Visibilidade entre membros da mesma empresa... será definida em um `BE-XXX` futuro."* Essa mesma limitação já havia sido reencontrada em `CORE-001 §10` (um `tenant.admin` não consegue ver nome/e-mail de outro membro em `/usuarios`). A Constituição da Bright Rewards **depende** de visibilidade agregada em pelo menos dois pontos:
- `030-Jornadas.md §2.4` — a empresa parceira precisa acompanhar "quantos clientes ativos, quanto foi emitido, quanto foi resgatado" — isso exige consultar dados de múltiplos consumidores, não só o próprio registro.
- `030-Jornadas.md §3.2` — o administrador precisa de "visão agregada... de uso, emissão e resgate em todas as empresas parceiras" — cross-tenant, ainda mais amplo que o RLS atual permite mesmo dentro de um único tenant.

Isso não é implementável sem uma mudança de RLS — não é um ajuste incremental, é uma decisão de segurança que a própria `BE-003` já havia adiado deliberadamente. Ver seção 9, item 1.

**1.2 — O modelo de identidade atual (`profiles`/`tenant_memberships`/`membership_roles`) foi desenhado para usuários administrativos B2B, não para consumidores finais em escala.**
`BE-001 §4` (princípio 1) exige multiempresa desde a origem; `BE-003 §2.3` define `tenant_memberships` como vínculo *"único por `(tenant_id, profile_id)`"*, pensado para um número pequeno de colaboradores por empresa, com papéis (`roles`/`membership_roles`) de RBAC administrativo. A Constituição, em `020-Visao.md §5`, já reconhece isso: *"O consumidor final é um novo tipo de usuário... distinto do usuário administrativo/empresa que já existe."* Ou seja, a própria Constituição já sinaliza que o encaixe não é direto — mas isso precisa virar uma decisão explícita de arquitetura (estender o modelo existente vs. criar um modelo de identidade paralelo para consumidor final), não uma nota lateral. Hoje, **nenhuma das duas opções está implementada** — não há como a Constituição "funcionar" tecnicamente sem essa decisão.

## 2. Existe alguma arquitetura que precisará ser modificada?

- **RLS de `profiles`** (seção 1.1) — precisa de nova política, condicionada a uma permissão explícita (ex.: `tenant.members.view`, já existente no catálogo — ver `BE-006`), não mais self-only puro.
- **Modelo de identidade** (seção 1.2) — precisa de uma decisão de arquitetura formal (provavelmente um ADR) definindo como o consumidor final se autentica e se relaciona com `tenant_id`.
- **Convenção de banco "soft delete apenas quando houver justificativa"** (`BE-002 §11`) — as tabelas de `040-Economia.md` (lançamentos de pontos/cashback) são um livro-razão: a convenção correta para esse tipo de dado é **append-only, sem delete nem soft-delete** (estorno é um novo lançamento que compensa o anterior, nunca uma edição/exclusão do original). Isso não contradiz `BE-002 §11`, mas exige uma extensão explícita da convenção — hoje o documento não cobre esse caso.
- **Camada de API** (`BE-002 §9`) — já prevista em teoria (formato de sucesso/erro definido), mas **nenhuma rota existe hoje** (`src/app/api` não existe no repositório, confirmado nesta auditoria). A Bright Rewards é o primeiro caso de uso que de fato vai exigir API real (provavelmente para um cliente mobile/web separado do Next.js atual) — a arquitetura prevista em `BE-002 §9` precisa ser testada pela primeira vez, não é garantido que o formato definido em teoria sirva sem ajuste.
- **Diagrama macro do ecossistema** (`BE-002 §3`) — ver seção 8, é o ponto de maior atenção desta auditoria.

## 3. Quais módulos novos surgiram?

Comparando com `src/modules/` hoje (`ai-agents`, `auth`, `clients`, `companies`, `core`, `integrations`, `products`, `profile`, `tenders`, `workflows`):

- **Módulo de economia/ledger** (motor financeiro de `040-Economia.md`) — não existe equivalente algum hoje.
- **Módulo de gamificação** (`050-Gamificacao.md` — missões, ranking, níveis, XP, tickets, mecânicas de sorteio, cupons) — não existe.
- **Módulo de identidade do consumidor final** — se a decisão da seção 1.2 for por um modelo separado, é um módulo novo distinto de `profile`/`auth` atuais.
- **Módulos de IA nomeados em `060-IA.md`** (Motor de Benefícios, Motor de Missões, Motor de Campanhas, CRM Inteligente) — nenhum agente/motor de IA está implementado hoje; `ai/agents/` (estrutura prevista em `BE-002 §13`) está vazia.
- **Nota de nomenclatura:** `020-Visao.md §5` usa "Bright CRM", "Bright IA", "Bright Licitações" como **produtos** do ecossistema, enquanto `src/modules/` usa nomes de **módulos internos** de código (`ai-agents`, não "IA"; não existe módulo `crm` hoje, só está listado como produto futuro em `BE-002 §3`). Produto (nome de negócio) e módulo (nome de pasta de código) não precisam ser idênticos, mas vale registrar que ainda não há uma convenção explícita de tradução de um para o outro.

## 4. Quais tabelas novas serão necessárias? (somente listar — nenhuma criada nesta auditoria)

A partir de `040-Economia.md` e `050-Gamificacao.md`, confirmando por grep que nenhuma delas existe hoje em `database/migrations/` nem em `src/lib/supabase/types.ts`:

| Tabela (nome ilustrativo) | Origem na Constituição |
|---|---|
| `reward_accounts` (saldo por consumidor/empresa parceira) | `040-Economia.md §3` |
| `reward_ledger_entries` (lançamentos — nasce/morre um ponto) | `040-Economia.md §3–4` |
| `reward_issuance_limits` (teto de emissão por empresa parceira) | `040-Economia.md §8` |
| `campaigns` | `030-Jornadas.md §2.5`, `060-IA.md §7` |
| `missions` / `mission_progress` | `050-Gamificacao.md §3` |
| `consumer_levels` | `050-Gamificacao.md §5` |
| `xp_events` | `050-Gamificacao.md §6` |
| `tickets` | `050-Gamificacao.md §7` |
| `prize_tables` (raspadinha/roleta/baú) | `050-Gamificacao.md §8–10` |
| `coupons` / `coupon_redemptions` | `050-Gamificacao.md §11` |
| `receipts` (upload + resultado do OCR) | `070-Integracoes.md §1–2` |
| `consumer_profiles` (ou extensão de `profiles`) | seção 1.2 desta auditoria |
| `partner_integrations` (config de POS por empresa) | `070-Integracoes.md §3` — sobreposição parcial com a entidade `integrations` já adiada em `ADR-001`/`BE-002 §4` |
| `marketplace_items` / `marketplace_redemptions` (consumer-facing) | `070-Integracoes.md §4` — cuidado com colisão de nome, ver seção 8 |

## 5. Quais APIs novas serão necessárias?

Hoje **nenhuma API existe** (`src/app/api` não foi criado em nenhuma fase). A Bright Rewards é o primeiro caso a exigir isso de fato, presumivelmente para um cliente separado (app do consumidor final). Endpoints implícitos na Constituição: autenticação do consumidor final, consulta de saldo/extrato, catálogo/participação em missões, resgate de cupom, participação em raspadinha/roleta/baú, upload de comprovante (OCR), webhook de confirmação de transação vindo do POS da empresa parceira. Nenhum contrato foi desenhado — a Constituição não entra (corretamente) nesse nível de detalhe técnico.

## 6. Quais serviços novos apareceram?

- Motor de Benefícios, Motor de Missões, Motor de Campanhas, CRM Inteligente/Recomendações (`060-IA.md`) — nenhum implementado; `ai/agents/` está vazio hoje.
- Serviço de OCR (provedor externo não escolhido).
- Serviço de Antifraude (`080-Seguranca.md §3`) — não existe hoje, nem como conceito em nenhum `BE-XXX` anterior.
- Serviço de contabilização/relatório de passivo financeiro (`040-Economia.md §6`).

## 7. Quais documentos da arquitetura ficaram desatualizados?

- **`BE-002 §3`** — o diagrama macro do ecossistema não reflete a estrutura de produtos decidida agora (Bright Rewards não existe nele; a relação CORE/Platform/Produtos mudou — ver seção 8).
- **`BE-003 §5`** — a nota "visibilidade entre membros... será definida em um `BE-XXX` futuro" segue sem solução; a Constituição agora torna essa decisão urgente, não mais hipotética.
- **`PROJECT-CHECKLIST.md`** — não lista `DEV-001` nem `PRODUCT-001`/`PRODUCT-002` (ficou parado no `CORE-001`); desatualizado por falta de manutenção, não por conflito de conteúdo.
- **`src/modules/`** já contém `auth` e `profile`, que não estavam na lista original de `BE-002 §5` (`core, companies, clients, products, ai-agents, workflows, integrations, tenders`) — drift menor, nunca formalmente registrado (ao contrário do que `ADR-001` fez para as tabelas).

## 8. Existe alguma decisão conflitante?

**Sim — o ponto mais importante desta auditoria.** `BE-002 §3` descreve o ecossistema em **três ramos**:

```text
Bright Ecosystem
├── Bright CORE        (serviços compartilhados: auth, empresas, usuários, permissões...)
├── Bright Platform     (o app em si: Dashboard, Administração, Marketplace, Central de integrações)
└── Produtos            (CRM, Licitações, Atendimento IA, Automações, Financeiro, Analytics, Delivery...)
```

Já `020-Visao.md §5` (escrito nesta mesma sequência de fases, refletindo a decisão da Direção durante o `PRODUCT-001`) descreve em **dois ramos**, com "Bright Platform" **igualado ao CORE**:

```text
Bright Ecosystem
├── Bright Platform (CORE)   (auth, permissões, usuários, integrações, billing, auditoria)
├── Bright Rewards
├── Bright CRM
├── Bright IA
├── Bright Licitações
└── futuros produtos
```

Isso não é só uma diferença de desenho — muda o que "Bright Platform" *significa*: em `BE-002`, Platform é um produto com interface própria (Dashboard/Administração/Marketplace), distinto do CORE (que é infraestrutura pura) e distinto de "Produtos" (plugins). Na versão usada em `020-Visao.md`, Platform *é* o CORE, e não existe mais a camada intermediária "Produtos" — cada produto (Rewards, CRM, IA, Licitações) é irmão direto.

Consequência prática: **"Marketplace" aparece nos dois modelos com significados diferentes** — em `BE-002 §3`, é uma funcionalidade de "Bright Platform" (voltada à empresa parceira/admin); em `070-Integracoes.md §4`, é uma funcionalidade da Bright Rewards (voltada ao consumidor final, troca de pontos por benefícios de terceiros). São dois conceitos distintos com o mesmo nome — risco real de confusão em qualquer conversa futura sobre "o Marketplace".

**Recomendação:** um `ADR-002` reconciliando os dois modelos, no mesmo espírito do `ADR-001` (que já resolveu um drift parecido entre `BE-002` e a implementação real). Sem isso, qualquer arquitetura técnica de Bright Rewards herda uma ambiguidade de base sobre o que é "Platform" e onde ela termina.

## 9. Existe alguma decisão que precisa ser tomada pela Direção antes de continuar?

As 8 já consolidadas em `090-Roadmap.md §8` continuam válidas. Esta auditoria adiciona 4 novas, todas de arquitetura (não de produto):

9. **RLS de `profiles`** precisa deixar de ser self-only para viabilizar `030-Jornadas.md §2.4`/`§3.2` — decisão de segurança, não incremental (seção 1.1).
10. **Modelo de identidade do consumidor final**: estender `tenant_memberships`/`membership_roles` ou criar um modelo de identidade paralelo (seção 1.2). Determina o desenho de praticamente todas as tabelas novas da seção 4.
11. **Reconciliar o diagrama de ecossistema** (`BE-002 §3` vs. `020-Visao.md §5`) via `ADR-002` antes de qualquer arquitetura técnica de Bright Rewards (seção 8).
12. **Resolver a colisão de nome "Marketplace"** — renomear um dos dois conceitos (seção 8).

## 10. Matriz de rastreabilidade

| Documento (`docs/product/`) | Impacta |
|---|---|
| `000-Constituicao.md` | `PROJECT-CHECKLIST.md` (falta listar PRODUCT-001/002) |
| `010-Manifesto.md` | Nenhum impacto técnico direto — apenas princípios de produto |
| `020-Visao.md` (Arquitetura do Ecossistema, §5) | `BE-002 §3` (diagrama divergente) · `ADR-001` (mesmo padrão de decisão a seguir num `ADR-002`) · `BE-006` (catálogo de permissões, se novos papéis para consumidor final forem necessários) |
| `030-Jornadas.md` | `BE-003 §5` (RLS de `profiles`, seção 1.1) · `BE-005 §7` (modelo de tenant ativo — consumidor final não tem um "tenant ativo" selecionável como um admin) |
| `040-Economia.md` | Banco (10+ tabelas novas, seção 4) · `BE-002 §11` (convenção de soft delete precisa de exceção para ledger) · API (seção 5) · Serviços (contabilização, seção 6) |
| `050-Gamificacao.md` | Banco (seção 4) · `080-Seguranca.md`/`docs/legal/` (mecânicas de sorteio) · API (seção 5) |
| `060-IA.md` | `ai/agents/` (`BE-002 §13`, hoje vazio) · Serviços novos (seção 6) · `BE-002 §7` princípio de auditabilidade já exige rastreabilidade, alinhado com `060-IA.md §8` |
| `070-Integracoes.md` | Banco (`partner_integrations`, sobreposição com a entidade `integrations` adiada em `ADR-001`) · `BE-002 §3` (colisão de nome "Marketplace", seção 8) |
| `080-Seguranca.md` | `BE-003 §5` (RLS) · `BE-001 §11` (segurança geral) · nova árvore `docs/legal/` (ainda não criada) |
| `090-Roadmap.md` | `PROJECT-CHECKLIST.md` (próxima fase) · consolida todas as pendências desta auditoria |

## 11. Conclusão

A Constituição é **consistente em intenção** com os princípios fundacionais (`BE-001 §4`: multiempresa, segurança por padrão, modularidade, rastreabilidade) — nenhuma regra de produto contraria esses princípios. Mas ela **não é implementável como está** sem antes resolver duas decisões de arquitetura pendentes desde `BE-003` (RLS de `profiles`) e uma nova (modelo de identidade do consumidor final), além de reconciliar o diagrama de ecossistema via `ADR-002`. Recomendo que a autorização de commit da `PRODUCT-001 v0.1.0` (que já considero tecnicamente correta como documento de produto) seja **independente** da resolução desses pontos de arquitetura — são camadas diferentes de decisão, e travar a Constituição à espera da arquitetura técnica atrasaria um documento que já está pronto para servir de referência de produto.
