# 090 — Roadmap Estratégico

**Status:** Rascunho para revisão da Direção
**Versão:** 0.1.0
**Parte:** VIII

---

## 1. Princípio de priorização

Mecânicas sem dependência jurídica (cupom, cashback, missão, XP, nível, ranking) vêm antes de mecânicas com componente de sorteio (raspadinha, roleta, baú), que dependem da criação de `docs/legal/` e de confirmação jurídica antes do lançamento (`080-Seguranca.md §4`). Isso não é só prudência regulatória — também reduz a complexidade do MVP.

## 2. MVP

**Objetivo:** validar que uma empresa parceira consegue habilitar a Bright Rewards e que um consumidor final consegue acumular e resgatar cashback, com transparência total.

- Cadastro do consumidor final, vinculado a uma empresa parceira.
- Cashback (`050-Gamificacao.md §1`) como única mecânica de acúmulo.
- Cupons (`050-Gamificacao.md §11`) como única mecânica de resgate além do próprio cashback.
- Extrato transparente (saldo, origem, validade) — princípio inegociável do Manifesto.
- Economia do Ecossistema (`040-Economia.md`) implementada ao menos nos estados essenciais: `Pendente → Confirmado → Disponível → Resgatado/Expirado/Estornado`.
- Limite de emissão por empresa parceira (`040-Economia.md §8`) — mesmo que com um único valor padrão para todas, não precisa ser configurável ainda.
- `docs/legal/` criado com ao menos `001-LGPD.md`, cobrindo o novo titular de dados (consumidor final).

**Fora do MVP, deliberadamente:** missões, ranking, níveis, XP, tickets, raspadinhas, roletas, baús, marketplace, IA (qualquer motor).

## 3. V1

**Objetivo:** engajamento contínuo, não só transação pontual.

- Programa de Fidelidade como orquestração (`050-Gamificacao.md §2`).
- Missões, XP, Níveis, Ranking (`050-Gamificacao.md §3–6`) — versão determinística (regras fixas), sem Motor de Missões de IA ainda.
- Automações simples (`060-IA.md §2`) — ex.: notificação de reativação por inatividade.
- Integrações diretas de ponto de venda para ao menos uma empresa parceira piloto, reduzindo dependência de OCR/upload manual.

## 4. V2

**Objetivo:** camada de inteligência e primeiras mecânicas de sorteio, condicionadas à liberação jurídica.

- `docs/legal/003-Regulatorio.md` e `005-Politica-de-Promocoes.md` concluídos e aprovados.
- Tickets, Raspadinhas (`050-Gamificacao.md §7–8`) — a mecânica de sorteio de menor complexidade primeiro.
- Motor de Benefícios e Motor de Missões (`060-IA.md §5–6`) substituindo as regras determinísticas da V1.
- OCR (`070-Integracoes.md §1`) como alternativa madura à integração direta, para empresas parceiras sem ponto de venda integrável.

## 5. V3

**Objetivo:** mecânicas de sorteio mais complexas e camada comercial estendida.

- Roletas, Baús (`050-Gamificacao.md §9–10`).
- Motor de Campanhas (`060-IA.md §7`), incluindo campanhas subsidiadas pela Bright (`040-Economia.md §2`).
- CRM Inteligente e Recomendações (`060-IA.md §3–4`).
- Marketplace (`070-Integracoes.md §4`), com modelo comercial já decidido pela Direção.

## 6. Longo prazo

- Comunidade (mencionada em `030-Jornadas.md §1.8`) — interação entre consumidores.
- Expansão do modelo econômico para múltiplas moedas/parcerias entre empresas parceiras (ex.: cashback de uma empresa resgatável em outra, dentro do mesmo ecossistema) — mudança de fundo no modelo de `040-Economia.md`, não incremental.
- Novos produtos do Bright Ecosystem além de Rewards/CRM/IA/Licitações (`020-Visao.md §5`).

## 7. KPIs propostos por fase

| Fase | KPI principal | KPI secundário |
|---|---|---|
| MVP | % de consumidores cadastrados que resgatam ao menos uma vez | Tempo médio entre cadastro e primeiro resgate |
| V1 | Frequência de retorno (compras/mês por consumidor ativo) | % de missões concluídas |
| V2 | Taxa de conversão de ticket em participação na mecânica de sorteio | Taxa de fraude detectada vs. confirmada (precisão do Motor de Benefícios) |
| V3 | Receita da Bright por empresa parceira (modelo de monetização, `040-Economia.md §1`) | Volume transacionado no Marketplace |

*(KPIs propostos como estrutura — metas numéricas específicas dependem de dado real após o MVP estar em operação; não há como definir meta antes de linha de base.)*

## 8. Consolidado de decisões pendentes da Direção

Lista única de tudo que ficou marcado como "pendente"/"proposta sujeita à aprovação" ao longo dos documentos, para facilitar acompanhamento:

1. Modelo de monetização da Bright (SaaS fee, percentual, híbrido) — `040-Economia.md §1`.
2. Faixa permitida de percentual de cashback — `040-Economia.md §1`, `050-Gamificacao.md §1`.
3. Prazo de validade padrão de pontos/cashback — `040-Economia.md §5`.
4. Modelo comercial do Marketplace — `070-Integracoes.md §4`.
5. Público/segmento prioritário para o MVP — `020-Visao.md §4`.
6. Confirmação jurídica de raspadinha/roleta/baú antes da V2/V3 — `080-Seguranca.md §4`.
7. Escopo real da funcionalidade "Comunidade" — `030-Jornadas.md §1.8`.
8. Modelagem técnica do novo tipo de usuário (consumidor final) — `020-Visao.md §5` (decisão de arquitetura, não de produto, mas depende do produto confirmar o conceito primeiro).
