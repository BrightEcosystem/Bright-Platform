# Bright Multi Plataforma — Roadmap

Sequência oficial de fases, passadas e futuras. Complementa `PROJECT-CHECKLIST.md` (que lista o que já foi entregue, com detalhe por relatório) com a visão de **ordem e dependência entre fases**. Atualizado a cada nova decisão de sequenciamento da Direção.

## Status do projeto

| Status | Data início | Data final | Código | Fase | Commit | Situação |
|---|---|---|---|---|---|---|
| ✅ | 28/07/2026 | 28/07/2026 | BE-001 | Fundação da Plataforma | `7f0cb81` | Concluída |
| ✅ | 29/07/2026 | 29/07/2026 | SUP-003 | Fundação do Banco | `3182c78` | Concluída |
| ✅ | 30/07/2026 | 30/07/2026 | AUTH-001 | Autenticação | `a6decaf` | Concluída |
| ✅ | 30/07/2026 | 30/07/2026 | AUTH-002 | Validação da Autenticação | `226730e` | Concluída |
| ✅ | 30/07/2026 | 30/07/2026 | PERM-001 | Permissões | `22a6f6f` | Concluída |
| ✅ | 30/07/2026 | 30/07/2026 | CORE-001 | Área Autenticada | `8d39c71` | Concluída |
| ✅ | 31/07/2026 | 31/07/2026 | DEV-001 | Infraestrutura de Deploy | `36b043c` | Concluída |
| ✅ | 31/07/2026 | 31/07/2026 | PRODUCT-001 | Constituição do Produto | `9e3d73e` | Concluída |
| ✅ | 31/07/2026 | 31/07/2026 | PRODUCT-002 | Auditoria Técnica | — (não commitada isoladamente; ver `docs/reports/`) | Concluída |
| ✅ | 01/08/2026 | 01/08/2026 | ADR-002 | Padronização Arquitetural | `e9cbd67` | Concluída |
| ✅ | 01/08/2026 | 01/08/2026 | ARCH-001 | Arquitetura Completa | `9fbae05` | Concluída |
| ✅ | 01/08/2026 | 01/08/2026 | IDENT-001 | Modelo de Identidade | `8461039` | Concluída |
| ✅ | 01/08/2026 | 01/08/2026 | DATA-001 | Modelo Conceitual de Dados | `af83667` | Concluída |
| ✅ | 01/08/2026 | 01/08/2026 | UX-001 | Arquitetura da Experiência | `318339c` | Concluída |
| ✅ | 01/08/2026 | 01/08/2026 | DS-001 | Design System | `972fb27` | Concluída |
| 🟡 | 01/08/2026 | — | APP-001 | Fundação Visual do Aplicativo do Consumidor | `680918a` | Implementada, aguardando homologação |
| 🔄 | 01/08/2026 | — | HOM-001 | Homologação do Aplicativo do Consumidor | `ad06b6d` | Em andamento — URL pública ativa |
| ⏳ | — | — | *(gate)* | Decisão da Direção: APROVADO ou REPROVADO | — | Aguardando resultado de HOM-001 |
| ⏳ | — | — | QA-001 | Estabilização Pós-Homologação | — | **Condicional** — só executa se HOM-001 reprovar ou exigir ajustes |
| ⏳ | — | — | CORE-002 | Evolução do Core | — | Aguardando gate (direto se APROVADO; após QA-001 se REPROVADO) |

## Por que esta ordem

Cada fase depende do resultado da anterior — construir fora de ordem gera risco de retrabalho (decisão registrada pela Direção após `PRODUCT-002` revelar dependências estruturais não conhecidas antes):

```mermaid
graph TD
    ADR002[ADR-002<br/>Como o sistema é organizado?] --> ARCH001[ARCH-001<br/>Como os módulos conversam?]
    ARCH001 --> IDENT001[IDENT-001<br/>Quem é o consumidor? Quem é a empresa?]
    IDENT001 --> DATA001[DATA-001<br/>Quais entidades existirão?]
    DATA001 --> UX001[UX-001<br/>Como o consumidor navega?]
    UX001 --> DS001[DS-001<br/>Design system]
    DS001 --> APP001[APP-001<br/>Fundação visual<br/>implementada]
    APP001 --> HOM001[HOM-001<br/>Homologação pública<br/>bloqueada por Vercel]
    HOM001 --> GATE{Decisão da Direção<br/>APROVADO ou REPROVADO?}
    GATE -->|APROVADO, sem ajustes| CORE002[CORE-002<br/>Evolução do Core]
    GATE -->|REPROVADO ou ajustes obrigatórios| QA001[QA-001<br/>Estabilização condicional<br/>sem features novas]
    QA001 --> HOM001B[Nova rodada de HOM-001]
    HOM001B --> GATE
```

## Notas

- `PRODUCT-002` não gerou um commit próprio isolado — foi uma auditoria técnica (`docs/reports/PRODUCT-002-Relatorio-de-Auditoria-Tecnica.md`), commitada junto com a correção de `ADR-002` (`e9cbd67`).
- `SUP-003` está listada aqui como marco de fundação do banco; as fases `SEC-001`, `DB-001`, `SUP-001`, `SUP-002`, `SEC-003` (fundação, dependências, conexão inicial, rotação de credenciais) antecedem `SUP-003` e estão detalhadas em `PROJECT-CHECKLIST.md`.
- Este roadmap reflete apenas a **sequência**; detalhe de escopo/entrega de cada fase concluída está nos relatórios em `docs/reports/`.
- `IDENT-001` produziu `docs/architecture/IDENT-001-Modelo-de-Identidade.md` — identidade única, Conta Fidelidade (entidade central), relacionamento N:N, Fluxo Oficial do Consumidor v1 e Matriz Oficial de RLS, todos **congelados** (§11 do documento) — mudança futura exige ADR.
- `DATA-001` produziu `docs/architecture/DATA-001-Modelo-Conceitual-de-Dados.md` — catálogo de 15 entidades, cada uma com estado (quem cria/altera/consulta/administra/consome), origem da informação, eventos de ciclo de vida e dependências — ancoradas na Conta Fidelidade, sem SQL, sem migrations.
- `UX-001` produziu `docs/architecture/UX-001-Arquitetura-da-Experiencia.md` — mapa de navegação (12 telas), princípio de UX emocional, Central de Notificações/Novidades separadas, selo "Em breve" na tela Jogar.
- `DS-001` produziu `docs/architecture/DS-001-Design-System.md` — paleta oficial, tipografia oficial (Inter), Mobile First confirmado, regra formal de quatro momentos especiais de animação e catálogo conceitual de 16 componentes, todos congelados — sem código React ainda.
- `APP-001` produziu a primeira versão pública em código do Aplicativo do Consumidor (`docs/BE-009-Fundacao-Visual-do-Aplicativo-do-Consumidor.md`) — 12 telas de `UX-001` + 1 rota técnica de redirecionamento (13 rotas Next.js no total, contagem congelada em `docs/reports/APP-001-Relatorio.md §2`), os 16 componentes de `DS-001`, dados 100% mockados, sem autenticação real, sem conexão com banco. Corrigido um bloqueio real: o middleware de autenticação da Retaguarda (`src/proxy.ts`) redirecionava `/cliente/*` para `/login` — agora tratado como caminho público, já que a identidade do consumidor é um domínio separado (`IDENT-001`). **Status: implementação concluída — homologação pública pendente (`HOM-001`), decisão da Direção que a validação local (lint/build/HTTP) não substitui a revisão visual publicada.**
- `HOM-001` (em andamento): repositório `BrightEcosystem/Bright-Platform` tornado público (decisão da Direção, sem segredos no histórico — verificado antes da mudança) e conectado ao projeto Vercel `bright-ecosystem/web`. `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` (valores públicos por design) configurados como único requisito do build. Primeiro deploy de produção com sucesso no commit `ad06b6d` — URL pública: `https://web-bn7zgaumy-bright-ecosystem.vercel.app`. Sanity check inicial (HTTP 200 em `/`, `/cliente/entrar`, `/cliente/inicio`, `/dashboard`, `/login`) confirmado. Termina em um **gate de decisão da Direção: APROVADO ou REPROVADO.**
- **Estrutura obrigatória do relatório de `HOM-001`** (critério fixado pela Direção, a seguir literalmente quando a fase iniciar):
  1. **Resultado geral:** Aprovado / Aprovado com ressalvas / Reprovado.
  2. **Matriz de testes** — por rota: URL, Status (OK/Falha), Observações, Evidências.
  3. **Problemas classificados por severidade:** Crítico / Alto / Médio / Baixo.
  4. **Regressão**, validada explicitamente: Core, Retaguarda, login administrativo, navegação existente, permissões, middleware, layout administrativo.
  5. **Recomendação final — decisão binária, sem estados intermediários:** `APROVADO` ou `REPROVADO`. Ressalvas ficam documentadas na matriz (item 1), mas não criam um terceiro estado para o avanço do roadmap.
- **Gate de decisão** (entre `HOM-001` e a fase seguinte): se **APROVADO** sem ajustes obrigatórios, `CORE-002` inicia diretamente — `QA-001` não é executada. Se **REPROVADO** ou se a homologação identificar ajustes obrigatórios, `QA-001` inicia, seguida de uma nova rodada de `HOM-001` até obter APROVADO.
- `QA-001` (formalizada pela Direção): **fase condicional**, executada **somente se `HOM-001` reprovar ou exigir ajustes obrigatórios** — nunca automática, e só se abre quando existirem itens que realmente impeçam a aceitação da entrega. Escopo exclusivo de estabilização (bugs, ajustes de UX, problemas visuais, performance, acessibilidade, atualização de documentação/rastreabilidade). **Não deve ser usada para:** melhorias futuras, refinamentos de UX não críticos, novas funcionalidades ou mudanças de escopo.
