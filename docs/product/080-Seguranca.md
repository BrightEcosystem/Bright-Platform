# 080 — Segurança, LGPD e Antifraude

**Status:** Rascunho para revisão da Direção
**Versão:** 0.2.0 — terminologia padronizada por `ADR-002-Arquitetura-do-Ecossistema-Bright.md` (ver `CHANGELOG.md`)
**Parte:** VII

---

> Este documento registra **princípios de produto**, não análise jurídica. Detalhamento regulatório, compliance e políticas específicas pertencem a uma futura árvore `docs/legal/` (ainda não criada — ver `090-Roadmap.md`), redigida com apoio jurídico especializado, não por este documento nem por este agente.

## 1. Segurança

- Nenhuma mecânica de recompensa deve conceder valor econômico sem passar pelo Motor de Benefícios (`060-IA.md`), que centraliza a checagem contra limite de emissão e sinais de risco.
- Toda decisão que afete saldo do consumidor deve ser auditável (mesmo princípio já registrado em `060-IA.md §8`).
- O Aplicativo do Consumidor herda, do Core da Plataforma, o modelo de autorização já existente — autenticação, isolamento por tenant via RLS, permissões granulares. Nenhuma exceção de segurança é criada especificamente para ele sem justificativa registrada.

## 2. LGPD

Princípios que se aplicam ao consumidor final como novo tipo de titular de dados na plataforma:

- Consentimento claro no cadastro sobre quais dados são coletados e para qual finalidade (histórico de compra, localização de uso, comportamento no app).
- Direito de acesso, correção e exclusão de dados do consumidor final, com o mesmo padrão de seriedade já aplicado a dados de empresas/usuários administrativos no Core da Plataforma.
- Dados de comprovante (OCR, `070-Integracoes.md`) podem conter informação sensível (ex.: itens de compra) — tratamento e retenção desses dados é uma análise específica a ser feita em `docs/legal/001-LGPD.md` (a criar), não aqui.

## 3. Antifraude

- Padrões que indicam potencial fraude (mesma conta usada por múltiplos dispositivos de forma anômala, comprovante duplicado/forjado, resgate desproporcional ao histórico) devem gerar sinal para o Motor de Benefícios **antes** da confirmação da emissão, não apenas auditoria posterior (`040-Economia.md §9`).
- Casos confirmados de fraude geram estorno (`040-Economia.md §7`) e, dependendo da gravidade, suspensão da conta do consumidor — critério de gravidade é decisão de operação/produto a refinar em fase futura.
- Conluio entre consumidor e funcionário da empresa parceira é um vetor de risco específico deste modelo (diferente de fraude só do lado do consumidor) — deve ser considerado no desenho técnico do Motor de Benefícios.

## 4. Fronteira com questões regulatórias (mecânicas de sorteio)

Como já registrado em `010-Manifesto.md` e `050-Gamificacao.md` (seções 8–10), mecânicas com componente de sorteio (raspadinhas, roletas, baús) têm risco regulatório que **não é resolvido por este documento**. O princípio institucional é:

> Toda campanha ou mecânica promocional deve obedecer à legislação aplicável; funcionalidades com componente de sorteio dependem de análise jurídica específica antes do lançamento, não apenas desta Constituição de produto.

A análise detalhada — se e como essas mecânicas se enquadram em regulação de jogos/apostas, e quais ajustes de desenho eliminam ou reduzem esse enquadramento — fica em `docs/legal/003-Regulatorio.md` e `docs/legal/005-Politica-de-Promocoes.md` (a criar).
