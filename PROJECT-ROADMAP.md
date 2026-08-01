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
| ✅ | 01/08/2026 | 01/08/2026 | DS-001 | Design System | *(hash preenchido retroativamente no commit de APP-001)* | Concluída |
| ⏳ | — | — | APP-001 | Aplicativo do Consumidor | — | Aguardando |
| ⏳ | — | — | CORE-002 | Evolução do Core | — | Aguardando |

## Por que esta ordem

Cada fase depende do resultado da anterior — construir fora de ordem gera risco de retrabalho (decisão registrada pela Direção após `PRODUCT-002` revelar dependências estruturais não conhecidas antes):

```mermaid
graph TD
    ADR002[ADR-002<br/>Como o sistema é organizado?] --> ARCH001[ARCH-001<br/>Como os módulos conversam?]
    ARCH001 --> IDENT001[IDENT-001<br/>Quem é o consumidor? Quem é a empresa?]
    IDENT001 --> DATA001[DATA-001<br/>Quais entidades existirão?]
    DATA001 --> UX001[UX-001<br/>Como o consumidor navega?]
    UX001 --> DS001[DS-001<br/>Design system]
    DS001 --> APP001[APP-001<br/>Componentes React]
    APP001 --> CORE002[CORE-002<br/>Evolução do Core]
```

## Notas

- `PRODUCT-002` não gerou um commit próprio isolado — foi uma auditoria técnica (`docs/reports/PRODUCT-002-Relatorio-de-Auditoria-Tecnica.md`), commitada junto com a correção de `ADR-002` (`e9cbd67`).
- `SUP-003` está listada aqui como marco de fundação do banco; as fases `SEC-001`, `DB-001`, `SUP-001`, `SUP-002`, `SEC-003` (fundação, dependências, conexão inicial, rotação de credenciais) antecedem `SUP-003` e estão detalhadas em `PROJECT-CHECKLIST.md`.
- Este roadmap reflete apenas a **sequência**; detalhe de escopo/entrega de cada fase concluída está nos relatórios em `docs/reports/`.
- `IDENT-001` produziu `docs/architecture/IDENT-001-Modelo-de-Identidade.md` — identidade única, Conta Fidelidade (entidade central), relacionamento N:N, Fluxo Oficial do Consumidor v1 e Matriz Oficial de RLS, todos **congelados** (§11 do documento) — mudança futura exige ADR.
- `DATA-001` produziu `docs/architecture/DATA-001-Modelo-Conceitual-de-Dados.md` — catálogo de 15 entidades, cada uma com estado (quem cria/altera/consulta/administra/consome), origem da informação, eventos de ciclo de vida e dependências — ancoradas na Conta Fidelidade, sem SQL, sem migrations.
- `UX-001` produziu `docs/architecture/UX-001-Arquitetura-da-Experiencia.md` — mapa de navegação (12 telas), princípio de UX emocional, Central de Notificações/Novidades separadas, selo "Em breve" na tela Jogar.
- `DS-001` produziu `docs/architecture/DS-001-Design-System.md` — paleta oficial, tipografia oficial (Inter), Mobile First confirmado, regra formal de quatro momentos especiais de animação e catálogo conceitual de 16 componentes, todos congelados — sem código React ainda.
