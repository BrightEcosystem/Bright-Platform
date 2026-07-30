# Bright Platform — Checklist de Execução

Checklist de alto nível das fases já concluídas do plano oficial de execução (`docs/BE-001-Fundacao-Bright-Ecosystem.md`). Cada linha aponta para o relatório correspondente em `docs/reports/`. Não substitui os relatórios — é apenas um índice rápido do progresso.

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

- [x] **CORE-001** — Estrutura inicial da área autenticada: layout, sidebar filtrada por permissão, dashboard institucional, Minha Conta, Empresa, Usuários, Produtos, Configurações, `/sem-permissao` (`docs/reports/CORE-001-Relatorio.md`)

## Estado atual do banco (confirmado em CORE-001)

- 10 migrations aplicadas, `local == remote`
- RLS habilitada em 10 tabelas do schema `public`
- Catálogo de 15 permissões, 4 papéis de sistema
- Nenhum dado real inserido — apenas dados fictícios temporários, sempre removidos ao final de cada fase

## Pendências abertas (ver relatórios individuais para detalhes)

- RLS de `profiles` não permite que membros da mesma empresa vejam nome/e-mail uns dos outros (`CORE-001 §10`)
- Nenhuma automação de auditoria grava em `audit_logs` ainda
- Nenhuma interface de administração de papéis/permissões (gestão via SQL/migration, `RUN-004`)
- `project.manager`/`project.viewer` seguem sem uso funcional (aguardando a Bright Gestão de Projetos, fora de escopo)

## Próxima fase

**CORE-002** — ainda não iniciada. Execução pausada explicitamente antes desta fase, por instrução direta da Direção de Engenharia.
