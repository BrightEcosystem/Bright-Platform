# 030 — Jornadas

**Status:** Rascunho para revisão da Direção
**Versão:** 0.2.0 — terminologia padronizada por `ADR-002-Arquitetura-do-Ecossistema-Bright.md` (ver `CHANGELOG.md`)
**Parte:** II

---

As três jornadas abaixo descrevem o fluxo esperado de cada perfil (ver `020-Visao.md §4`). São descritas em nível de produto — passos concretos, sem prescrever telas ou componentes técnicos (isso é trabalho de uma fase de UX/arquitetura futura).

## 1. Jornada do consumidor

1. **Descoberta** — o consumidor final é convidado a entrar no Aplicativo do Consumidor por uma empresa parceira específica (ex.: ao comprar, ao se cadastrar no estabelecimento, por um cupom/QR code).
2. **Cadastro** — cria conta no Aplicativo do Consumidor, vinculada à empresa parceira que o convidou (podendo, no futuro, se vincular a mais de uma empresa parceira — decisão de arquitetura pendente).
3. **Primeira recompensa** — recebe uma primeira ação de boas-vindas (proposta: um cashback ou cupom de entrada, valor a definir pela Direção) para tornar tangível o valor do programa desde o primeiro contato.
4. **Uso recorrente** — a cada compra/interação elegível, acumula cashback e/ou pontos, conforme a Economia da Plataforma (`040-Economia.md`).
5. **Engajamento por mecânica** — participa de missões, sobe no ranking, sobe de nível, ganha XP, resgata tickets, joga raspadinhas/roletas, abre baús, usa cupons (`050-Gamificacao.md`) — sempre com regra visível antes de participar.
6. **Transparência contínua** — a qualquer momento, consegue ver saldo, extrato (de onde veio cada valor), validade e o que precisa fazer para o próximo nível/missão.
7. **Resgate** — usa o saldo acumulado (cashback, pontos, cupom) na próxima compra na empresa parceira, fechando o ciclo.
8. **Comunidade** — (mecânica listada em `020-Visao.md`) interage com outros consumidores da mesma empresa parceira, se essa funcionalidade for confirmada como parte do escopo — pendente de detalhamento em fase de arquitetura.

## 2. Jornada da empresa (parceira)

1. **Descoberta/decisão** — empresa decide contratar os módulos de fidelidade e gamificação da Retaguarda da Empresa, habilitando o Aplicativo do Consumidor para seus próprios clientes (seja uma empresa nova na Bright Multi Plataforma, seja uma que já opera outros módulos da Retaguarda).
2. **Configuração inicial** — define os parâmetros permitidos dentro do modelo econômico aprovado (ex.: percentual de cashback dentro de uma faixa definida pela Bright — nunca livre, para preservar sustentabilidade do modelo, ver `040-Economia.md`).
3. **Convite aos clientes** — convida sua base de clientes existente a entrar no Aplicativo do Consumidor.
4. **Acompanhamento** — acessa, pela Retaguarda da Empresa, relatórios de uso do programa: quantos clientes ativos, quanto foi emitido, quanto foi resgatado, ROI percebido.
5. **Campanhas** — cria ou ativa campanhas específicas (ex.: cashback em dobro em um período, missão sazonal) — sujeitas ao Motor de Campanhas (`060-IA.md`) e aos princípios de conformidade (`080-Seguranca.md`).
6. **Suporte** — em caso de dúvida ou disputa (ex.: cliente reclama de cashback não recebido), aciona o suporte Bright, que atua com visibilidade tanto do lado da empresa quanto do consumidor.

## 3. Jornada do administrador

1. **Onboarding de empresa parceira** — acompanha e, se necessário, auxilia a configuração inicial de uma empresa parceira na Retaguarda da Empresa.
2. **Monitoramento cross-tenant** — visão agregada (respeitando isolamento por tenant, mesmo modelo de RLS já usado no Core da Plataforma) de uso, emissão e resgate em todas as empresas parceiras.
3. **Controle de abuso/fraude** — atua sobre alertas do módulo de Antifraude (`080-Seguranca.md`) — ex.: padrão de resgate suspeito, conta duplicada, uso indevido de cupom.
4. **Suporte de segundo nível** — resolve casos escalados pelo suporte de primeira linha da empresa parceira.
5. **Governança de campanhas** — aprova ou revisa campanhas que excedam parâmetros padrão (ex.: cashback acima da faixa normal), conforme regras a definir em `040-Economia.md`.
