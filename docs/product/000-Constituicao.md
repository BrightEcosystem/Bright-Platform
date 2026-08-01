# 000 — Constituição da Bright Multi Plataforma

**Status:** Rascunho para revisão da Direção
**Versão:** 0.2.0 — terminologia padronizada por `ADR-002-Arquitetura-do-Ecossistema-Bright.md` (ver `CHANGELOG.md`)
**Responsável pela arquitetura:** ChatGPT — Direção de Engenharia Bright Ecosystem / Direção do produto
**Responsável pela redação:** Claude Code
**Tipo:** Documento mestre e índice — não substitui os documentos especializados; aponta para eles.

---

## 1. O que é este documento

A Constituição é a referência oficial de produto da **Bright Multi Plataforma** — um programa multiempresa de fidelidade, cashback, pontuação e gamificação, com duas experiências (Retaguarda da Empresa e Aplicativo do Consumidor) sobre o mesmo Core. Ela responde a uma pergunta central: **como o produto deve funcionar**. Não é um documento jurídico, nem um documento de arquitetura de software; é a ponte entre a visão de negócio e tudo que será construído depois (arquitetura técnica, UX, regras de negócio, roadmap).

Questões regulatórias e jurídicas **não** são tratadas em profundidade aqui — ver seção 6 e `080-Seguranca.md`.

## 2. Como este conjunto de documentos está organizado

A Constituição não é um arquivo único. É um conjunto de documentos especializados, cada um aprofundando uma parte específica, todos sob `docs/product/`:

| Arquivo | Conteúdo | Parte |
|---|---|---|
| `010-Manifesto.md` | Por que a Bright existe, o que acreditamos, o que nunca faremos | Parte 0 |
| `020-Visao.md` | Visão, Missão, Problemas, Público, Arquitetura da Bright Multi Plataforma | Parte I |
| `030-Jornadas.md` | Jornada do consumidor, da empresa, do administrador | Parte II |
| `040-Economia.md` | Economia da Plataforma — o motor financeiro por trás de tudo | Parte III |
| `050-Gamificacao.md` | Cashback, Fidelidade, Missões, Ranking, Níveis, XP, Tickets, Raspadinhas, Roletas, Baús, Cupons | Parte IV |
| `060-IA.md` | Inteligência Artificial como camada transversal do produto | Parte V |
| `070-Integracoes.md` | OCR, comprovantes, integrações, marketplace, empresas parceiras | Parte VI |
| `080-Seguranca.md` | Segurança, LGPD, Antifraude (princípios; detalhe jurídico fica em `docs/legal/`) | Parte VII |
| `090-Roadmap.md` | Roadmap estratégico por versão (MVP → V1 → V2 → V3 → longo prazo) + KPIs | Parte VIII |
| `CHANGELOG.md` | Histórico de versões de todo o conjunto | — |

## 3. Como as duas experiências se relacionam com o Core

Não existem "Retaguarda da Empresa" e "Aplicativo do Consumidor" como produtos ou repositórios separados — são duas experiências de um projeto único, a Bright Multi Plataforma, que **consomem a infraestrutura compartilhada do Core da Plataforma**: autenticação, multiempresa, permissões, usuários, integrações-base e auditoria continuam pertencendo ao Core. Nenhuma das duas experiências duplica esses serviços. Detalhe completo em `020-Visao.md §5` (Arquitetura da Bright Multi Plataforma).

## 4. Como usar este conjunto de documentos

- Antes de qualquer fase de arquitetura técnica ou implementação relacionada ao Aplicativo do Consumidor, o documento relevante desta Constituição deve estar na versão aprovada (`v1.0.0` ou posterior) para o tema em questão.
- Trechos marcados como **"proposta, sujeita à aprovação"** dentro de qualquer documento especializado são sugestões de Claude para preencher lacunas de parâmetro de negócio (percentuais, curvas, limites) — não são regra vigente até a Direção confirmar.
- Mudanças de fundo (não apenas redação) exigem nova versão menor (`v0.x.0`) e uma entrada no `CHANGELOG.md`.

## 5. Estratégia de versionamento

Mesmo padrão dos documentos `BE-XXX` do repositório: cabeçalho com `Status`/`Versão`, versionamento via Git.

- `v0.1.0` — primeiro rascunho completo de cada documento, com lacunas de negócio marcadas como proposta.
- `v0.x.0` — iterações durante a negociação de conteúdo.
- `v1.0.0` — primeira edição aprovada de cada documento — vira referência oficial citada por fases de arquitetura/implementação futuras (ex.: `IDENT-001`, `DATA-001`, `UX-001`, `APP-001`).
- Cada documento evolui de forma independente — um pode estar em `v1.0.0` enquanto outro ainda está em `v0.2.0`. O `CHANGELOG.md` rastreia isso por arquivo.

## 6. Fronteira com documentação jurídica

Princípios institucionais (ex.: "toda campanha promocional deve obedecer à legislação aplicável") aparecem em `080-Seguranca.md`. A análise jurídica detalhada — incluindo o enquadramento regulatório de mecânicas com sorteio (raspadinhas, roletas, baús) — pertence a uma futura árvore `docs/legal/` (ainda não criada; ver `090-Roadmap.md` para quando essa criação deve acontecer), nunca a este conjunto de documentos.

## 7. Glossário

| Termo | Definição |
|---|---|
| **Bright Multi Plataforma** | O nome deste projeto — uma plataforma multiempresa de fidelidade, cashback, pontuação e gamificação. Não há produtos irmãos fora deste escopo. |
| **Core da Plataforma** | Infraestrutura compartilhada: autenticação, multiempresa, usuários, permissões, produtos contratados, auditoria, integrações-base. Consumida pelas duas experiências abaixo, nunca duplicada. |
| **Retaguarda da Empresa** | A experiência voltada à empresa parceira e ao administrador (clientes, campanhas, pontuação, cashback, gamificação, benefícios, comprovantes, relatórios, configurações). |
| **Aplicativo do Consumidor** | A experiência voltada ao cliente final (carteira de pontos, cashback, missões, níveis, XP, tickets, roletas, raspadinhas, baús, cupons, indicação, ranking, envio de comprovantes). |
| **Empresa parceira** | Empresa cliente da Bright Multi Plataforma que contrata os módulos de fidelidade da Retaguarda da Empresa para seus próprios clientes finais. |
| **Consumidor final** | Usuário do Aplicativo do Consumidor — cliente da empresa parceira. |
| **Ponto** | Unidade interna de valor movimentada pela Economia da Plataforma (ver `040-Economia.md`) — não é moeda com curso legal. |
| **Mecânica** | Qualquer funcionalidade de engajamento/recompensa (cashback, missão, raspadinha, roleta, baú, cupom). |
| **Motor** | Componente de IA que automatiza uma decisão recorrente do produto (ex.: Motor de Benefícios, Motor de Missões, Motor de Campanhas — ver `060-IA.md`). |
| **Passivo financeiro** | Obrigação contábil da Bright/empresa parceira decorrente de pontos emitidos e ainda não resgatados (ver `040-Economia.md`). |
