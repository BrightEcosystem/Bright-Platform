# BE-009 — Fundação Visual do Aplicativo do Consumidor (APP-001)

**Status:** Concluído
**Data:** 2026-08-01
**Documentos relacionados:** `UX-001-Arquitetura-da-Experiencia.md`, `DS-001-Design-System.md`, `DATA-001-Modelo-Conceitual-de-Dados.md`, `IDENT-001-Modelo-de-Identidade.md`

---

## 1. Objetivo

Implementar em código real a primeira versão pública do Aplicativo do Consumidor — estrutura definitiva de rotas, navegação, layout e os 16 componentes de `DS-001`, com dados 100% mockados (nenhuma conexão com banco, autenticação real, OCR ou cashback). Todo componente foi construído para ser reutilizável quando as fases futuras conectarem dados reais — nenhuma tela ou componente é descartável.

## 2. Isolamento em relação à Retaguarda

`src/app/layout.tsx` (raiz, Retaguarda) **não foi alterado**. O Aplicativo do Consumidor vive inteiramente sob `src/app/cliente/`, com seu próprio `layout.tsx` que:

- Importa `src/styles/consumer-theme.css` (tokens `@theme` prefixados `consumer-*` — não colide com `neutral-*` já usado na Retaguarda).
- Carrega a fonte Inter via `next/font/google`, aplicada apenas ao próprio subtree.
- Renderiza sobre um `<div className="min-h-screen bg-consumer-bg">`, cobrindo visualmente o fundo escuro do `<body>` só dentro de `/cliente/*`.

Nenhum arquivo da Retaguarda (`src/app/(platform)`, `src/app/(auth)`, `src/components/ui`) foi modificado.

## 3. Paleta e tipografia implementadas (DS-001 §4/§5)

Valores hex escolhidos dentro das famílias semânticas congeladas em `DS-001`:

| Token | Hex | Família DS-001 |
|---|---|---|
| `consumer-primary` | `#4F46E5` | Azul-violeta moderno |
| `consumer-secondary` | `#F59E0B` | Amarelo-ouro |
| `consumer-support` | `#059669` | Verde |
| `consumer-warning` | `#F97316` | Laranja |
| `consumer-danger` | `#DC2626` | Vermelho |
| `consumer-bg` / `consumer-bg-subtle` | `#FFFFFF` / `#F5F5F7` | Fundo claro |

Fonte: **Inter** (`next/font/google`), conforme congelado em `DS-001 §5`.

## 4. Componentes (`src/components/consumer/`)

Os 16 componentes do catálogo de `DS-001 §11`, implementados como componentes React puros, tipados, sem dependência de dados reais:

Botao, Avatar, BadgeSelo, BarraDeProgresso, BarraDeXP, IndicadorDeNivel, CartaoDeSaldo, CardDeRecompensa, CardDeMissao, BannerInteligente, ItemDeExtrato, EstadoVazio, ContadorDeTicket, ToggleDePreferencia, SeletorDeContexto, BarraDeNavegacaoInferior.

**Storybook:** não instalado nesta fase (opção explicitamente deixada em aberto pela Direção). Em vez disso, cada componente nasce desacoplado — recebe dados via props tipadas, não importa mock diretamente (exceto os pontos de composição em `ConsumerShell`/páginas), e tem um comentário de cabeçalho descrevendo seu propósito e a seção de `DS-001` que o define. Isso reduz o esforço de uma futura extração para Storybook sem pagar o custo de configurá-lo agora.

## 5. Regra de animação (DS-001 §10)

Os quatro momentos especiais têm classes CSS dedicadas em `consumer-theme.css` (`animate-consumer-level-up`, `animate-consumer-mission-complete`, `animate-consumer-reward-earned`, `animate-consumer-prize-reveal`), todas neutralizadas sob `prefers-reduced-motion: reduce`. Nenhuma outra transição da interface usa animação diferenciada.

## 6. Dados mockados (`src/services/mock/`, `src/types/consumer.ts`)

Um arquivo por entidade de `DATA-001` (Conta Fidelidade, Lançamento, Missão, Ticket, Item de Marketplace de Benefícios, Comprovante, Indicação, Notificação/Preferência), exportados via `src/services/mock/index.ts`. Nenhuma chamada de rede, nenhum acesso ao Supabase.

## 7. Sessão do consumidor (mock)

`src/contexts/consumer-session-context.tsx` mantém um estado local (`localStorage`) apenas para permitir navegar entre `/cliente/entrar` e as telas autenticadas nesta fase de demonstração. **Não é autenticação real** — não usa Supabase Auth, não representa a identidade do consumidor definida em `IDENT-001`, que fica para uma fase futura de integração.

## 8. Rotas implementadas

`src/app/cliente/{entrar,onboarding,inicio,carteira,missoes,jogar,beneficios,comprovantes,indicacoes,perfil,configuracoes,adicionar-empresa}/page.tsx` — as 12 telas congeladas em `UX-001 §3`. `src/app/cliente/page.tsx` redireciona para `/cliente/inicio`. `ConsumerShell` (`src/components/consumer/ConsumerShell.tsx`) redireciona para `/cliente/entrar` quando não autenticado, exibe cabeçalho fixo (Seletor de Contexto + Avatar) e a Barra de Navegação Inferior nas telas autenticadas.

## 9. Fronteira desta fase

Não conectado nesta fase (fica para fases futuras, conforme restrição explícita da Direção): autenticação real de consumidor, saldo/cashback real, OCR de comprovantes, gamificação real (missões/XP persistidos), qualquer tabela ou migration nova, Storybook instalado, deploy real na Vercel (bloqueio já registrado em `DEV-001`/`BE-008`, ver `docs/reports/APP-001-Relatorio.md §6`).
