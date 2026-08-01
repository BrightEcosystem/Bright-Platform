# DS-001 — Design System do Aplicativo do Consumidor

**Status:** Aprovado pela Direção — congelado (mudanças futuras exigem ADR, mesmo princípio de `IDENT-001 §11`)
**Versão:** 0.2.0 — congela a paleta oficial, a tipografia oficial, quatro componentes adicionais, a regra formal de animações (quatro momentos especiais) e confirma Mobile First sem experiência desktop separada
**Documentos relacionados:** `UX-001-Arquitetura-da-Experiencia.md` (wireframes, telas, princípio de UX Emocional), `docs/product/050-Gamificacao.md`, `BE-001-Fundacao-Bright-Ecosystem.md §12` (padrão visual já implementado na Retaguarda)

---

## 1. Objetivo

Definir a linguagem visual do Aplicativo do Consumidor — tokens de design (cor, tipografia, espaçamento, elevação, animação) e o catálogo conceitual de componentes que implementam os wireframes já congelados em `UX-001` — antes de qualquer componente React ser codificado. Esta fase descreve **como as coisas devem parecer e se comportar visualmente**, não gera código, não implementa componentes, não altera banco. `APP-001` (próxima fase) traduz este documento em componentes React reais.

## 2. Relação com o padrão visual já existente

A Retaguarda da Empresa já tem um padrão visual implementado desde `BE-001 §12`/`CORE-001`: tema escuro (`neutral-950`/`neutral-900`/`neutral-800`), minimalista, foco visível padronizado (`focus-visible:outline-2 outline-offset-2 outline-neutral-500`, já em produção em todos os componentes de `src/components/ui/`).

**Este DS-001 não altera nada da Retaguarda.** O Aplicativo do Consumidor **não é uma continuação visual da Retaguarda** — é uma experiência deliberadamente própria:

| | Retaguarda da Empresa | Aplicativo do Consumidor |
|---|---|---|
| Transmite | Gestão, controle, administração | Diversão, conquista, recompensa, progressão |
| Tema | Escuro, neutro | Claro (§4) |
| Densidade | Informacional | Baixa, expressiva |

Os dois compartilham apenas dois elementos de identidade:

- **Tipografia base** (mesma família tipográfica — consistência de marca, §5).
- **Padrão de acessibilidade** (foco visível, contraste mínimo) — o mesmo rigor, adaptado à paleta própria do Aplicativo.

Tudo o mais (cor, tom, densidade, animação) é propositalmente distinto.

## 3. Identidade Visual

O Aplicativo do Consumidor deve comunicar: **descoberta, progressão, recompensa** — nunca burocracia. Densidade visual **baixa** (poucos elementos por tela), com cor e forma expressivas — o oposto deliberado da sobriedade institucional da Retaguarda.

## 4. Paleta Oficial de Cores (congelada)

| Token | Cor | Representa | Uso |
|---|---|---|---|
| `cor-primaria` | **Azul-violeta moderno** | Tecnologia, confiança, inovação | Ações principais, cabeçalho, destaque de marca |
| `cor-secundaria` | **Amarelo-ouro** | Recompensa, conquista, gamificação | Nível, XP, destaques de gamificação, selos de conquista |
| `cor-apoio` | **Verde** | Cashback, sucesso, confirmação | Lançamento positivo, missão concluída, indicação aceita |
| `cor-alerta` | **Laranja** | Atenção | Comprovante em análise, saldo pendente |
| `cor-erro` | **Vermelho** | Erro | Comprovante rejeitado, erro de formulário |
| `cor-fundo` | **Branco e cinza muito claro** | Base do app | Fundo das telas — tema claro, oposto deliberado ao `neutral-950` da Retaguarda |
| `cor-nivel-bronze` / `cor-nivel-prata` / `cor-nivel-ouro` | Bronze/prata/ouro literais | Camadas de nível (`050-Gamificacao.md §5`) | Indicador de Nível (§11) |
| `cor-neutra-texto` | Cinza escuro/preto | Texto padrão | Alto contraste sobre `cor-fundo` |

Esta paleta está **congelada** — os tons exatos (hex) ficam para `APP-001` implementar dentro destas famílias semânticas (azul-violeta, amarelo-ouro, verde, laranja, vermelho, branco/cinza claro), mas a escolha de família de cor por token não muda sem ADR (§16).

## 5. Tipografia Oficial (congelada)

Família tipográfica escolhida: **Inter** — moderna, gratuita, com suporte amplo em qualquer plataforma web/mobile, e excelente legibilidade em qualquer tamanho, inclusive números (adequada ao requisito de números de pontos/cashback com grande destaque). Mesma família usada na Retaguarda, preservando a consistência de marca entre as duas experiências (§2).

| Token | Uso | Peso/Escala |
|---|---|---|
| `texto-display` | Saldo em destaque, nível — números de pontos/cashback sempre com o maior destaque da tela | Inter Bold, maior tamanho (ex.: 32–40px conceitual) |
| `texto-titulo` | Títulos de tela e cartão — devem transmitir energia | Inter SemiBold |
| `texto-corpo` | Conteúdo padrão — deve transmitir clareza | Inter Regular |
| `texto-legenda` | Datas, origem de lançamento, textos auxiliares | Inter Regular, menor, contraste reduzido (nunca abaixo do mínimo de acessibilidade, §13) |

## 6. Ícones

- Estilo: contornado (outline), consistente em espessura de traço — nunca emoji em produção (os emojis usados nos wireframes de `UX-001` são placeholders de conteúdo, não a solução visual final).
- Escala: pequeno (dentro de texto/badge), médio (ações de cartão), grande (atalhos de destaque, ex.: roleta/baú na tela Jogar).
- Cada mecânica de gamificação (`DATA-001`) tem um ícone conceitual próprio e consistente em toda a navegação: Missão, Ticket, Roleta, Raspadinha, Baú, Cupom, Indicação — sempre o mesmo ícone onde a mesma entidade aparece.

## 7. Grid e Responsividade — Mobile First (confirmado, sem experiência desktop separada)

**Decisão definitiva da Direção:** o Aplicativo do Consumidor é **Mobile First** — não haverá uma experiência desktop distinta, nem uma navegação própria para telas grandes. No desktop, a interface **apenas adapta** o mesmo layout e a mesma navegação (reflow responsivo) — nunca uma segunda arquitetura de navegação.

- Grid de conteúdo: coluna única em mobile, margens consistentes, área de toque mínima de 44×44px para qualquer elemento acionável (padrão de acessibilidade mobile, §13).
- Em telas maiores (tablet/desktop), o mesmo conteúdo pode reorganizar-se em mais colunas (ex.: cartões lado a lado), mas os mesmos componentes, a mesma barra de navegação inferior e os mesmos fluxos — nunca uma tela ou menu exclusivos de desktop.
- Barra de navegação inferior (`UX-001 §3`) sempre fixa, nunca rolável para fora da viewport, em qualquer tamanho de tela.

## 8. Espaçamento

Escala de espaçamento consistente (tokens, não valor de implementação): `espaco-xs`, `espaco-sm`, `espaco-md`, `espaco-lg`, `espaco-xl` — progressão geométrica simples (ex.: 4/8/16/24/32px conceituais), aplicada uniformemente entre cartões, seções e dentro de componentes.

## 9. Bordas e Elevação

- **Bordas:** cantos mais arredondados que a Retaguarda (que usa cantos discretos/quase retos) — reforça o tom amigável e gamificado do Aplicativo.
- **Elevação (sombra):** usada com moderação para destacar cartões de ação (ex.: cartão de saldo, atalhos de Jogar) — nunca sombra pesada.

## 10. Animação e Movimento — Regra Formal (congelada)

**Princípio geral:** sem excesso de animação nas transições comuns (trocar de tela, abrir um cartão) — transições rápidas e discretas, mesmo padrão de sobriedade já usado na Retaguarda (`BE-001 §12`), aplicado à navegação comum do Aplicativo.

**Exatamente quatro momentos especiais recebem animação diferenciada — nenhum outro:**

1. **Subir de nível.**
2. **Concluir missão.**
3. **Ganhar recompensa.**
4. **Abrir prêmio** (revelação de roleta/raspadinha/baú, `UX-001 §5.6`/`§9`).

Todo o restante da interface permanece discreto — esta lista é fechada, não um exemplo; adicionar um quinto momento especial exige ADR (§16), não uma decisão de implementação em `APP-001`. Toda animação (comum ou dos quatro momentos especiais) respeita `prefers-reduced-motion`, com uma versão estática equivalente sempre disponível — requisito de acessibilidade, não opcional.

## 11. Biblioteca de Componentes (catálogo conceitual — 16 componentes)

Nenhum destes componentes é implementado nesta fase — é a especificação que `APP-001` vai codificar.

| Componente | Propósito | Variantes | Estados |
|---|---|---|---|
| Botão | Ação primária/secundária | Primário (cor-primária), Secundário (contorno), Texto (sem fundo) | Padrão, pressionado, desabilitado, carregando |
| Cartão de Saldo | Exibir saldo de cashback/pontos/nível (Conta Fidelidade) | Compacto (Início), completo (Carteira) | Padrão, carregando |
| **Card de Recompensa** *(novo)* | Exibir cashback, cupons ou brindes disponíveis/recebidos | Cashback, Cupom, Brinde | Padrão, recém-recebido (animação do momento especial "ganhar recompensa", §10) |
| Card de Missão | Exibir uma Missão + Progresso + XP da recompensa | Em andamento, concluída | Padrão, carregando, concluída (animação do momento especial "concluir missão", §10) |
| **Indicador de Nível** *(novo)* | Exibir o nível atual do consumidor (`cor-nivel-bronze/prata/ouro`) | Compacto (cabeçalho), completo (Carteira) | Sempre visível — nunca omitido quando a Conta Fidelidade existe |
| **Barra de XP** *(novo, distinta de Barra de Progresso)* | Progresso de XP até o próximo nível | — | Padrão, animação discreta ao atualizar (não é um dos quatro momentos especiais — atualização de XP em si é discreta; só o *momento de subir de nível* recebe a animação especial) |
| Barra de Progresso | Progresso de missão | Linear | Padrão, animada ao atualizar |
| Badge/Selo | Status (Lançamento, Comprovante), selo "Em breve" | Sucesso, atenção, erro, neutro, "Em breve" | Padrão |
| **Banner Inteligente** *(novo)* | Destaque de novidades, campanhas, promoções ou avisos (Central de Novidades, `UX-001 §11.2`) | Novidade, Campanha, Promoção, Aviso | Padrão, dispensável (fechar) |
| Seletor de Contexto | Trocar empresa (`UX-001 §4`) | — | Fechado, aberto (lista) |
| Barra de Navegação Inferior | Navegação principal | 5 itens fixos | Item ativo/inativo |
| Item de Extrato | Uma linha de Lançamento na Carteira | Positivo (crédito), negativo (débito) | Padrão |
| Estado Vazio | Telas sem dado ainda (`UX-001`, todos os §5.x) | Vazio comum, **Primeiro acesso** (tom mais convidativo) | — |
| Avatar | Identificação do consumidor no Perfil/Início | — | Com foto, com inicial (sem foto) |
| Contador de Ticket | Quantidade de Tickets disponíveis (tela Jogar) | — | Zero (estado vazio), com quantidade |
| Toggle de Preferência | Ativar/desativar notificação por tipo (Configurações) | — | Ligado, desligado |

## 12. Estados Visuais Padrão

- **Carregando:** indicador discreto (esqueleto de conteúdo ou spinner pequeno) — nunca bloqueia a tela inteira sem necessidade.
- **Vazio comum:** ícone + texto curto, tom neutro.
- **Primeiro acesso:** mesma estrutura do vazio comum, mas com tom mais convidativo (call-to-action em destaque) — visualmente distinto o suficiente para não parecer "erro" ou "nada aqui", e sim "comece agora" (`UX-001 §2`).
- **Erro:** ícone + mensagem clara + ação de tentar novamente, quando aplicável — nunca mensagem técnica.

## 13. Acessibilidade

- Contraste mínimo AA (WCAG) entre texto e fundo, em qualquer combinação de cor definida no §4 — validado antes da implementação em `APP-001`. Atenção especial ao fundo claro (§4): `cor-secundaria` (amarelo-ouro) sobre `cor-fundo` branco exige verificação cuidadosa de contraste para texto, podendo exigir uso só como acento/fundo de ícone, nunca como cor de texto corrido.
- Foco visível em todo elemento interativo — mesmo padrão já em produção na Retaguarda (`focus-visible:outline`), adaptado à paleta clara do Aplicativo.
- Área de toque mínima 44×44px (§7).
- Rótulos acessíveis (screen reader) em todo ícone sem texto visível ao lado.
- Animações respeitam `prefers-reduced-motion` (§10).
- Nenhuma informação transmitida **só** por cor (ex.: Lançamento positivo/negativo também tem sinal `+`/`-` textual, não só cor verde/vermelha).

## 14. Consistência com UX-001, IDENT-001, DATA-001 e ADR-002

- [x] Nenhum componente React implementado, nenhum código, nenhuma alteração de banco.
- [x] Todos os 16 componentes do §11 mapeiam para telas/entidades já definidas em `UX-001`/`DATA-001`.
- [x] Selo "Em breve" (tela Jogar) tratado como uma variante formal de Badge.
- [x] Estado "Primeiro acesso" tratado como padrão visual reutilizável.
- [x] Regra dos quatro momentos especiais de animação é fechada, não um exemplo.

## 15. Fronteira com APP-001

Fica para `APP-001`: implementação real dos componentes em React/Tailwind (ou equivalente), valores exatos de token (hex dentro das famílias congeladas no §4, px, easing de animação), testes de contraste reais, e a estrutura de arquivos/pastas do Aplicativo do Consumidor no código.

## 16. Congelamento de Design

Ao final desta fase, os itens abaixo estão **congelados** (mesmo princípio de `IDENT-001 §11`):

- Paleta oficial de cores por família semântica (§4).
- Tipografia oficial: Inter (§5).
- Mobile First sem experiência desktop separada (§7).
- Regra dos quatro momentos especiais de animação (§10).
- Catálogo de 16 componentes (§11).

**Mudança futura a qualquer um destes itens exige uma ADR** — nunca um ajuste silencioso em `APP-001` ou fases seguintes.

## 17. Pendências

Nenhuma pendência de decisão de marca ou escopo permanece aberta — todas as quatro pendências da versão anterior (cor, tipografia, desktop, catálogo de componentes) foram resolvidas nesta versão. Fica para `APP-001`, como trabalho de implementação (não decisão pendente): valores exatos de hex dentro das famílias de cor congeladas, e a validação real de contraste WCAG.
