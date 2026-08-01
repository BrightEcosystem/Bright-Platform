# Bright Multi Plataforma — Checklist de Execução

Checklist de alto nível das fases já concluídas do plano oficial de execução (`docs/BE-001-Fundacao-Bright-Ecosystem.md`). Cada linha aponta para o relatório correspondente em `docs/reports/`. Não substitui os relatórios — é apenas um índice rápido do progresso. Para a **sequência e dependência entre fases**, ver `PROJECT-ROADMAP.md`.

## Fundação

- [x] **GIT-001/GIT-002** — Repositório + scaffold Next.js 16 + TypeScript + Tailwind (`7f0cb81`)
- [x] **SEC-001** — Auditoria de dependências (`reports/security/SEC-001-Relatorio.md`)
- [x] **DB-001** — Schema multiempresa inicial + 7 migrations locais (`c439a07`)

## Supabase

- [x] **SUP-001** — Fundação de conexão Supabase (clients, validação de ambiente) (`5ab0aaf`)
- [x] **SUP-002** — Ajustes de validação/diagnóstico (`0400470`)
- [x] **SUP-003** — Migrations aplicadas ao projeto real + RLS validada (`3182c78`, `docs/reports/SUP-003-Relatorio-de-Migrations.md`)
- [x] **SEC-003** — Rotação de credenciais (`89814cc`, `docs/reports/SEC-003-Rotacao-de-Credenciais.md`)

## Autenticação e Autorização

- [x] **AUTH-001** — Sistema de autenticação multiempresa (`a6decaf`, `docs/reports/AUTH-001-Relatorio.md`)
- [x] **AUTH-002** — Validação funcional e de isolamento (2 bugs encontrados e corrigidos) (`226730e`, `docs/reports/AUTH-002-Validacao-Funcional.md`)
- [x] **PERM-001** — Catálogo de permissões (15) + helpers de autorização granular (`22a6f6f`, `docs/reports/PERM-001-Relatorio.md`)

## Área autenticada

- [x] **CORE-001** — Estrutura inicial da área autenticada: layout, sidebar filtrada por permissão, dashboard institucional, Minha Conta, Empresa, Usuários, Produtos, Configurações, `/sem-permissao` (`docs/reports/CORE-001-Relatorio.md`) — hoje reconhecida como a fundação da **Retaguarda da Empresa** (`ARCH-001 §5`)

## Infraestrutura

- [x] **DEV-001** — CI mínimo (GitHub Actions: install/lint/build), arquitetura de deploy documentada (`36b043c`, `docs/reports/BE-008-Arquitetura-de-Deploy.md`, `docs/runbooks/RUN-005-Deploy-e-Rollback.md`) — conexão real com a Vercel pendente de ação manual da Direção

## Produto

- [x] **PRODUCT-001** — Constituição do produto (`docs/product/`): Manifesto, Visão, Jornadas, Economia da Plataforma, Gamificação, IA, Integrações, Segurança, Roadmap estratégico (`9e3d73e`)
- [x] **PRODUCT-002** — Auditoria técnica cruzando a Constituição com a arquitetura existente; identificou a ambiguidade que originou `ADR-002` (`docs/reports/PRODUCT-002-Relatorio-de-Auditoria-Tecnica.md`, commitada junto com `e9cbd67`)

## Arquitetura

- [x] **ADR-002** — Padronização arquitetural: projeto único (Bright Multi Plataforma), três camadas (Core da Plataforma, Retaguarda da Empresa, Aplicativo do Consumidor), identidade única, Marketplace de Benefícios como único marketplace (`e9cbd67`, `docs/decisions/ADR-002-Arquitetura-do-Ecossistema-Bright.md`)
- [x] **ARCH-001** — Mapa completo da arquitetura: camadas técnicas, comunicação entre módulos, modularização por contratação, escalabilidade (`9fbae05`, `docs/architecture/ARCH-001-Arquitetura-Geral.md`)
- [x] **IDENT-001** — Modelo de identidade do consumidor: Conta Fidelidade (entidade central), relacionamento N:N, Fluxo Oficial do Consumidor v1, Matriz Oficial de RLS — todos congelados, mudança futura exige ADR (`docs/architecture/IDENT-001-Modelo-de-Identidade.md`)

## Estado atual do banco (confirmado em CORE-001, sem alteração desde então)

- 10 migrations aplicadas, `local == remote`
- RLS habilitada em 10 tabelas do schema `public`
- Catálogo de 15 permissões, 4 papéis de sistema
- Nenhum dado real inserido — apenas dados fictícios temporários, sempre removidos ao final de cada fase
- Mecanismo de contratação modular (`products`/`tenant_products`) já em produção, reaproveitável para os módulos de gamificação (`ARCH-001 §8`)

## Pendências abertas (ver relatórios individuais para detalhes)

- RLS de `profiles` entre colaboradores administrativos da mesma empresa (`CORE-001 §10`) segue sem solução — não é escopo de Conta Fidelidade/consumidor, continua em aberto
- Nenhuma automação de auditoria grava em `audit_logs` ainda
- Nenhuma interface de administração de papéis/permissões (gestão via SQL/migration, `RUN-004`)
- `project.manager`/`project.viewer` seguem sem uso funcional (fora de escopo do programa de fidelidade)
- Esquema físico da Conta Fidelidade e do livro-razão de lançamentos ainda não desenhado (modelo conceitual e regras já congelados em `IDENT-001`; esquema é `DATA-001`)
- Permissões `tenant.consumers.view`/`tenant.consumers.manage` são nomes propostos em `IDENT-001 §7` — catálogo formal fica para `DATA-001`
- Métodos de autenticação do consumidor além de e-mail/senha — não decidido
- Rotas placeholder órfãs (`empresas`, `agentes-ia`, `workflows`, `integracoes`, `licitacoes`, `financeiro`, `analytics`) não correspondem a nenhum módulo da arquitetura atual (`ARCH-001 §5`) — candidatas a remoção em fase futura de código
- Conexão real com a Vercel pendente de ação manual da Direção (`RUN-005 §1`)

## Próxima fase

Sequência definida pela Direção (ver `PROJECT-ROADMAP.md`): `DATA-001` (em execução — Modelo Conceitual de Dados) → `UX-001` (Arquitetura da Experiência) → `DS-001` (Design System) → `APP-001` (Aplicativo do Consumidor) → `CORE-002` (Evolução do Core).
