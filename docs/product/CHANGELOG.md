# Changelog — Constituição da Bright Multi Plataforma

Registro de versões de cada documento em `docs/product/`. Segue a estratégia descrita em `000-Constituicao.md §5`.

## 2026-07-30 — v0.1.0 (todos os documentos)

Primeira redação completa do conjunto, após aprovação da estrutura pela Direção (com os ajustes: Manifesto como Parte 0, Arquitetura do Ecossistema Bright, Economia do Ecossistema como parte dedicada, IA como parte própria, Roadmap por versão, KPIs, e questões regulatórias movidas para fora da Constituição).

Documentos criados:

- `000-Constituicao.md` — v0.1.0
- `010-Manifesto.md` — v0.1.0
- `020-Visao.md` — v0.1.0
- `030-Jornadas.md` — v0.1.0
- `040-Economia.md` — v0.1.0
- `050-Gamificacao.md` — v0.1.0
- `060-IA.md` — v0.1.0
- `070-Integracoes.md` — v0.1.0
- `080-Seguranca.md` — v0.1.0
- `090-Roadmap.md` — v0.1.0

Decisão registrada: Bright Rewards não será um produto separado nem terá repositório independente nesta fase — consome a infraestrutura (CORE) da Bright Platform.

Pendências consolidadas: ver `090-Roadmap.md §8`.

Commitado em `9e3d73e` — "docs: aprova constituicao do produto Bright Rewards (PRODUCT-001 v0.1.0)".

## 2026-07-31 — v0.2.0 (`020-Visao.md`, `070-Integracoes.md`, `090-Roadmap.md`) — corrigida por v0.3.0, nunca commitada

Após `PRODUCT-002` (auditoria técnica) identificar uma ambiguidade real entre o modelo de ecossistema de `BE-002 §3` e o de `020-Visao.md §5`, uma primeira tentativa de `ADR-002` definiu três camadas, mas misturou escopo ao introduzir "Bright Core"/"Bright Platform"/"Bright Rewards" como produtos irmãos e citar produtos fora deste projeto (Bright IA, Bright CRM, Bright Licitações). A Direção corrigiu isso antes de qualquer commit — ver entrada v0.3.0 abaixo. Esta entrada permanece apenas como registro histórico da tentativa incorreta.

## 2026-07-31 — v0.3.0 (`020-Visao.md`, `070-Integracoes.md`, `090-Roadmap.md`)

Correção de escopo: este projeto é um só, a **Bright Multi Plataforma**, sem produtos irmãos. `ADR-002-Arquitetura-do-Ecossistema-Bright.md` (corrigida) define três camadas de uma única plataforma: **Core da Plataforma** (infraestrutura compartilhada), **Retaguarda da Empresa** (experiência administrativa) e **Aplicativo do Consumidor** (experiência do cliente final, com entrada gamificada e sem aposta financeira entre usuários).

Documentos revisados:

- `020-Visao.md` — v0.2.0 → v0.3.0. Título, §1, §2, §4, §5 e §6 corrigidos: sem "Bright Platform"/"Bright Rewards" como produtos separados, sem CRM/IA/Licitações como produtos irmãos. Identidade única confirmada; consumidor não usa `tenant_memberships` como vínculo final.
- `070-Integracoes.md` — v0.2.0 → v0.3.0. Removida a menção a "Marketplace Corporativo" (não existe neste escopo); Marketplace de Benefícios é o único marketplace do projeto. "Aplicativo Bright Rewards" → "Aplicativo do Consumidor" em todo o documento.
- `090-Roadmap.md` — v0.2.0 → v0.3.0. Removida menção a "novos produtos do Bright Ecosystem além de Rewards/CRM/IA/Licitações" (fora de escopo); demais menções a "Bright Rewards" corrigidas para "Aplicativo do Consumidor"/módulos de fidelidade.

Nenhuma migration, tabela ou código alterados — decisão de arquitetura conceitual apenas. Nada commitado ainda.

## 2026-07-31 — v0.2.0/v0.4.0 (`000-Constituicao.md`, `010-Manifesto.md`, `030-Jornadas.md`, `040-Economia.md`, `060-IA.md`, `080-Seguranca.md`)

Padronização terminológica final, autorizada pela Direção como parte da própria `ADR-002` (não uma fase nova) — a ADR só é considerada concluída com toda a documentação usando a mesma nomenclatura. Somente normalização de linguagem: nenhuma regra de negócio, fluxo, mecânica, economia ou roadmap foi alterado.

- `000-Constituicao.md` — v0.1.0 → v0.2.0. Título, §1, §3 (renomeado), §4, Glossário (§7) corrigidos.
- `010-Manifesto.md` — v0.1.0 → v0.2.0. Três ocorrências de "Bright Rewards"/"Bright Platform" corrigidas.
- `030-Jornadas.md` — v0.1.0 → v0.2.0. Todas as jornadas (consumidor, empresa, administrador) corrigidas; jornada da empresa reescrita para não depender do conceito de "produto adicional".
- `040-Economia.md` — v0.1.0 → v0.2.0. Título ("Economia da Plataforma"), quatro ocorrências no corpo corrigidas.
- `050-Gamificacao.md` — nenhuma ocorrência encontrada; sem alteração, permanece v0.1.0.
- `060-IA.md` — v0.1.0 → v0.2.0. §3 renomeada de "CRM Inteligente" para "Segmentação Inteligente de Clientes" (mesma regra/comportamento, apenas o nome do módulo-base mudou de "CRM"/CORE para "Clientes"/Retaguarda da Empresa, refletindo a lista aprovada em `ADR-002`).
- `080-Seguranca.md` — v0.1.0 → v0.2.0. Três ocorrências corrigidas.
- `090-Roadmap.md` — v0.3.0 → v0.4.0. Uma ocorrência residual de "Economia do Ecossistema" corrigida para "Economia da Plataforma".
- `ADR-002-Arquitetura-do-Ecossistema-Bright.md` — nota de "divergência restante" removida (estava desatualizada assim que esta padronização foi concluída).

**Confirmação de nomenclatura única:** varredura por `grep` em todos os 11 arquivos de `docs/product/` não encontrou nenhuma ocorrência restante de "Bright Rewards", "Bright Ecosystem", "Bright CORE" ou "(CORE)" como nome de produto — os únicos resultados são notas explicativas descrevendo o que foi removido (histórico correto) e o rótulo padrão "ChatGPT — Direção de Engenharia Bright Ecosystem" (papel institucional usado em todos os documentos `BE-XXX`/ADR do repositório, não um nome de produto).
