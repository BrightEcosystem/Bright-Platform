# Changelog — Bright Multi Plataforma

Histórico de fases do projeto, uma entrada por commit relevante. Segue Conventional Commits (`BE-001 §9`). Para a Constituição de produto especificamente, ver `docs/product/CHANGELOG.md`. Para a sequência/dependência entre fases, ver `PROJECT-ROADMAP.md`.

## `e9cbd67` — docs: corrige ADR-002 e padroniza nomenclatura da Bright Multi Plataforma

Corrige uma versão anterior (nunca commitada) de `ADR-002` que misturava escopo com produtos fora do projeto. Arquitetura oficial: projeto único, três camadas (Core da Plataforma, Retaguarda da Empresa, Aplicativo do Consumidor). Padroniza terminologia em todos os documentos de `docs/product/` e em `BE-002 §3`. Inclui `docs/reports/PRODUCT-002-Relatorio-de-Auditoria-Tecnica.md`.

## `9e3d73e` — docs: aprova constituicao do produto Bright Rewards (PRODUCT-001 v0.1.0)

Primeira versão da Constituição do produto em `docs/product/` (posteriormente corrigida em nomenclatura pelo commit acima).

## `36b043c` — feat: prepara infraestrutura de deploy (CI minimo e documentacao Vercel)

Workflow de CI (install/lint/build), versão mínima do Node fixada, arquitetura de deploy e runbook de rollback documentados. Conexão real com a Vercel pendente de ação manual.

## `8d39c71` — feat: cria estrutura inicial da area autenticada

Layout com sidebar/header filtrados por permissão, dashboard institucional, Minha Conta, Empresa, Usuários, Produtos, Configurações, `/sem-permissao`. Hoje reconhecida como a fundação da Retaguarda da Empresa (`ARCH-001`).

## `22a6f6f` — feat: implementa catalogo inicial de permissoes

Catálogo de 15 permissões, 4 papéis de sistema, helpers de autorização granular (`hasPermission`/`requirePermission` etc.).

## `226730e` — fix: corrige validacao da autenticacao multiempresa

Dois bugs corrigidos na validação funcional do `AUTH-001`: cookie de tenant ativo não limpo no logout; redirecionamento indevido em `/selecionar-empresa`.

## `a6decaf` — feat: implementa autenticacao multiempresa

Login, logout, recuperação de senha, seleção de empresa ativa, proteção de rotas via Proxy + layout.

## `3182c78` — feat: aplica fundacao multiempresa no Supabase

7 migrations aplicadas ao projeto Supabase real, RLS validada em todas as tabelas.

## `c439a07` — feat: prepara arquitetura multiempresa e fundacao Supabase

Schema multiempresa inicial (10 tabelas), ainda como migrations locais não aplicadas.

## `7f0cb81` — feat: cria fundação técnica inicial da Bright Platform

Scaffold Next.js 16 + TypeScript + Tailwind, estrutura oficial de pastas, layout base.
