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
- [x] **IDENT-001** — Modelo de identidade do consumidor: Conta Fidelidade (entidade central), relacionamento N:N, Fluxo Oficial do Consumidor v1, Matriz Oficial de RLS — todos congelados, mudança futura exige ADR (`8461039`, `docs/architecture/IDENT-001-Modelo-de-Identidade.md`)
- [x] **DATA-001** — Modelo conceitual de dados: 15 entidades do domínio de fidelidade/gamificação, cada uma com estado (cria/altera/consulta/administra/consome), origem, eventos e dependências, ancoradas na Conta Fidelidade (`af83667`, `docs/architecture/DATA-001-Modelo-Conceitual-de-Dados.md`)
- [x] **UX-001** — Arquitetura da experiência do consumidor: mapa de navegação (12 telas), princípio de UX emocional, Central de Notificações/Novidades, selo "Em breve" na tela Jogar (`318339c`, `docs/architecture/UX-001-Arquitetura-da-Experiencia.md`)
- [x] **DS-001** — Design System do Aplicativo do Consumidor: paleta oficial, tipografia oficial (Inter), ícones, grid (Mobile First confirmado), espaçamento, regra formal de animação (quatro momentos especiais), catálogo conceitual de 16 componentes, acessibilidade — todos congelados, mudança futura exige ADR (`docs/architecture/DS-001-Design-System.md`)

## Aplicativo do Consumidor

- [x] **APP-001** — Fundação Visual do Aplicativo do Consumidor: 12 telas de `UX-001` + 1 rota técnica de redirecionamento sob `/cliente/*` (13 rotas no total), os 16 componentes de `DS-001`, navegação inferior fixa, sessão mockada (sem autenticação real), dados mockados para todas as entidades de `DATA-001` (`docs/BE-009-Fundacao-Visual-do-Aplicativo-do-Consumidor.md`, `docs/reports/APP-001-Relatorio.md`) — **concluída**
- [x] **HOM-001** — Homologação do Aplicativo do Consumidor: repositório público, Vercel conectada, deploy de produção, 13 rotas validadas mobile/desktop na URL pública, 1 falha crítica encontrada (tema claro não aplicado) e corrigida nesta mesma execução (`e59097a`), fluxo de login confirmado por clique/digitação reais, regressão da Retaguarda confirmada sem impacto (`docs/reports/HOM-001-Relatorio.md`) — **concluída — Gate: APROVADO pela Direção**
- [ ] ~~**QA-001**~~ — Estabilização Pós-Homologação (**fase condicional**): **não executada** — a Direção confirmou que nenhum defeito impeditivo foi encontrado em `HOM-001`. Permanece condicional para entregas futuras.
- [x] **CORE-002.1** — Schema, Funções e RLS (Conta Fidelidade / Lançamentos): plano técnico `v0.3.0` (`docs/architecture/CORE-002-Plano-Tecnico.md`) autorizado pela Direção com decisões finais de permissões/estado/idempotência/precisão. 8 migrations aplicadas ao Supabase real: tabelas `contas_fidelidade`/`lancamentos`, 5 funções `security definer`, RLS completa (só `SELECT`), catálogo de permissões estendido (`tenant.consumers.view`/`manage`). Matriz de 24 testes obrigatórios aprovada (2 correções aplicadas na própria execução — ver `docs/reports/CORE-002.1-Relatorio.md`). Dados fictícios 100% removidos. **Concluída.**
- [ ] **CORE-002.2** — Autenticação Real do Consumidor: login/logout/sessão persistente/recuperação de senha/proteção de rotas via Supabase Auth — **aguardando confirmação da Direção sobre o relatório de CORE-002.1**.
- [ ] **CORE-002.3** — Conta Fidelidade e carteira reais: `src/services/mock/conta-fidelidade.ts`/`lancamentos.ts` substituídos por serviços reais — aguardando CORE-002.2.
- [ ] **CORE-002.4** — Testes funcionais com dados fictícios, limpeza, validação de regressão — aguardando CORE-002.3.
- [ ] **CORE-002.5** — Documentação e relatório final de encerramento de CORE-002 — aguardando CORE-002.4.

## Estado atual do banco (atualizado em CORE-002.1)

- 18 migrations aplicadas, `local == remote` (10 da fundação multiempresa + 8 de `CORE-002.1`)
- RLS habilitada em 12 tabelas do schema `public` (as 10 originais + `contas_fidelidade`/`lancamentos`)
- Catálogo de 17 permissões (15 originais + `tenant.consumers.view`/`tenant.consumers.manage`), 4 papéis de sistema
- Nenhum dado real inserido — apenas dados fictícios temporários, sempre removidos ao final de cada fase
- Mecanismo de contratação modular (`products`/`tenant_products`) já em produção, reaproveitável para os módulos de gamificação (`ARCH-001 §8`)
- Lição registrada em `CORE-002.1` para toda tabela/função nova: `REVOKE ... FROM PUBLIC` não é suficiente neste projeto Supabase — `alter default privileges` concede automaticamente privilégios a `anon`/`authenticated`/`service_role` na criação; é preciso revogar explicitamente de cada papel específico (ver `docs/reports/CORE-002.1-Relatorio.md §4`)

## Pendências abertas (ver relatórios individuais para detalhes)

- RLS de `profiles` entre colaboradores administrativos da mesma empresa (`CORE-001 §10`) segue sem solução — não é escopo de Conta Fidelidade/consumidor, continua em aberto
- Nenhuma automação de auditoria grava em `audit_logs` ainda
- Nenhuma interface de administração de papéis/permissões (gestão via SQL/migration, `RUN-004`)
- `project.manager`/`project.viewer` seguem sem uso funcional (fora de escopo do programa de fidelidade)
- Esquema físico (tabelas, tipos, índices, migrations) das entidades de `DATA-001` ainda não criado — deliberado, fora de escopo documental
- Indicação foi formalizada pela primeira vez em `DATA-001 §2.10`, sem desenho de produto anterior — aguardando confirmação da Direção
- Decisão de escopo de Ranking (por empresa vs. comunidade cross-empresa) segue pendente (`docs/product/090-Roadmap.md §8` item 7, reafirmada em `DATA-001 §8`)
- Permissões `tenant.consumers.view`/`tenant.consumers.manage` são nomes propostos em `IDENT-001 §7` — catálogo formal fica para implementação técnica futura
- Notificações não têm entidade própria — mapeadas em `UX-001 §11` como Central de Notificações (operacional) e Central de Novidades (promocional); lembretes e avisos institucionais não têm Evento de origem em `DATA-001`, decisão de entidade própria fica para extensão futura, se necessário
- Tela Jogar do Aplicativo do Consumidor mantém selo "Em breve" até liberação jurídica (`080-Seguranca.md §4`) e implementação técnica estarem satisfeitas
- Métodos de autenticação do consumidor além de e-mail/senha — não decidido
- ~~Interação por clique não confirmada por gesto real~~ — **resolvido em `HOM-001`**: reteste com digitação real via teclado + clique real por coordenada na URL pública confirmou o fluxo Entrar → Início e a navegação inferior funcionando corretamente (`docs/reports/HOM-001-Relatorio.md §3`)
- Autenticação real de consumidor, saldo/cashback real, OCR de comprovantes e gamificação real não conectados em `APP-001` — dados 100% mockados, conforme escopo desta fase
- Valores exatos de hex da paleta do Aplicativo do Consumidor foram escolhidos em `APP-001` dentro das famílias congeladas em `DS-001 §4` — sujeitos a ajuste fino quando a Direção revisar visualmente em `HOM-001`
- **`HOM-001` concluída — Gate: APROVADO pela Direção** (1 falha crítica encontrada e corrigida na mesma execução, `e59097a`). `QA-001` não executada. `CORE-002` liberada e em andamento.
- Rotas placeholder órfãs (`empresas`, `agentes-ia`, `workflows`, `integracoes`, `licitacoes`, `financeiro`, `analytics`) não correspondem a nenhum módulo da arquitetura atual (`ARCH-001 §5`) — candidatas a remoção em fase futura de código
- Conexão real com a Vercel pendente de ação manual da Direção (`RUN-005 §1`)
- Reabertura de Conta Fidelidade fechada (`status = 'closed'`) não é implementada — processo administrativo excepcional e auditado, deliberadamente fora do escopo de `CORE-002.1` (`docs/reports/CORE-002.1-Relatorio.md §9`)
- Ciclo completo de `estado` do lançamento (`pendente → confirmado → disponível`) sem mecanismo de transição — o ledger é append-only (nunca `UPDATE`); nesta fase todo lançamento nasce em `disponivel`; automação de confirmação fica para fase futura de gamificação/campanhas
- Papel `tenant.member` citado nas decisões da Direção não existe fisicamente no catálogo (`PERM-001`) — apenas `platform.admin`/`tenant.admin`/`project.manager`/`project.viewer`

## Próxima fase

Sequência definida pela Direção (ver `PROJECT-ROADMAP.md`): `DS-001` → `APP-001` → `HOM-001` (**Gate: APROVADO**) → `QA-001` (não executada) → `CORE-002.1` (**concluída**) → `CORE-002.2` (aguardando autorização da Direção).
