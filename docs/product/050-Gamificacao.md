# 050 — Gamificação

**Status:** Rascunho para revisão da Direção — **contém múltiplos pontos marcados como proposta**
**Versão:** 0.1.0
**Parte:** IV

---

Este documento descreve as mecânicas de engajamento e recompensa oferecidas ao consumidor final. Todas consomem o motor financeiro descrito em `040-Economia.md` — nenhuma delas define, por si, quem paga ou como o passivo é contabilizado. Mecânicas com componente de sorteio (raspadinhas, roletas, baús) têm uma nota de dependência regulatória ao final de cada seção — o detalhe fica em `080-Seguranca.md`, nunca aqui.

## 1. Cashback

Devolução de parte do valor de uma compra elegível, como ponto `Confirmado` (ver ciclo de vida em `040-Economia.md §3`). Percentual dentro de uma faixa definida pela Bright, configurável pela empresa parceira dentro dessa faixa. **Proposta:** percentual padrão sugerido de 1–5% (faixa ilustrativa, não decidida) — ajustável pela Direção com base em margem típica das empresas parceiras-alvo.

## 2. Programa de Fidelidade

Estrutura que une as demais mecânicas em uma jornada contínua — é o "guarda-chuva" que dá sentido a XP, Níveis, Ranking e Missões (seções 4–6). Não é uma mecânica isolada; é a orquestração das outras.

## 3. Missões

Objetivos com critério claro (ex.: "compre 3 vezes este mês", "gaste R$ X em uma categoria") que recompensam com pontos, XP ou um item de sorteio (ticket, raspadinha) ao serem cumpridos. Geridas pelo Motor de Missões (`060-IA.md`), que pode personalizar a missão por consumidor com base em comportamento histórico.

## 4. Ranking

Posição relativa do consumidor frente a outros da mesma empresa parceira (ou de uma comunidade mais ampla, se essa decisão de escopo for confirmada), com base em critério objetivo (ex.: XP acumulado no período). **Ponto de atenção de produto:** ranking pode motivar ou desmotivar dependendo de como é exposto — **proposta:** mostrar posição relativa próxima ("você está a 200 XP do próximo nível") em vez de expor sempre o topo absoluto, para não desengajar quem está longe da liderança.

## 5. Níveis

Camadas progressivas (ex.: Bronze/Prata/Ouro, ou nomenclatura própria da marca) desbloqueadas por XP acumulado, que podem conceder benefícios permanentes enquanto o nível é mantido (ex.: cashback ligeiramente maior). **Proposta:** níveis reavaliados periodicamente (ex.: trimestral), não apenas crescentes para sempre, para refletir engajamento atual, não histórico distante.

## 6. XP

Métrica de progresso que alimenta Níveis e Ranking. **Proposta:** XP é ganho por ação (compra, missão cumprida, indicação), não comprado com dinheiro — mantém XP como reflexo de engajamento real, não de poder de compra.

## 7. Tickets

Item que dá direito a uma participação em uma mecânica de sorteio (raspadinha, roleta, baú) — normalmente conquistado por missão, nível ou campanha, não comprado diretamente (ver nota regulatória abaixo).

## 8. Raspadinhas

Mecânica de revelação instantânea de um prêmio pré-determinado (não é sorteio contínuo — o resultado já existe antes da interação, apenas revelado na hora). **Nota regulatória:** depende de confirmação, em `080-Seguranca.md`/`docs/legal/`, de que a mecânica não envolve contrapartida financeira do consumidor (ticket obtido por engajamento, nunca comprado) — condição necessária para reduzir o risco de enquadramento como jogo de azar.

## 9. Roletas

Mecânica de sorteio com múltiplos prêmios possíveis e probabilidades associadas a cada um. **Proposta:** probabilidades de cada prêmio devem ser uma tabela auditável internamente (não aleatória "por sensação"), com o prêmio de maior valor tendo a menor probabilidade — modelo padrão de qualquer mecânica de prêmio variável. Mesma nota regulatória da seção 8 se aplica, com peso ainda maior (roleta é mais próxima, na percepção do usuário, de uma mecânica de aposta do que uma raspadinha).

## 10. Baús

Mecânica de recompensa surpresa com conteúdo variável (pode incluir pontos, cupom, ticket para outra mecânica, ou item cosmético/simbólico). Mesmo tratamento de probabilidade auditável da seção 9. Mesma nota regulatória.

## 11. Cupons

Benefício com regra fixa e sem componente de sorteio (ex.: "10% de desconto na próxima compra") — resgatável diretamente, sem probabilidade envolvida. É a mecânica de menor risco regulatório do conjunto, e a mais simples de implementar primeiro (ver priorização em `090-Roadmap.md`).

## 12. Nota transversal sobre economia

Toda mecânica desta lista que concede pontos/cashback/prêmio de valor econômico consome o mesmo motor de `040-Economia.md` — nasce como `Pendente`/`Confirmado`, tem validade, pode ser estornada, e conta para o limite de emissão da empresa parceira. Nenhuma mecânica deste documento cria uma exceção contábil própria.
