# Bright Platform

Bright Ecosystem — Intelligent Customer Relationship Platform.

Ambiente central de acesso ao ecossistema Bright: gestão de empresas, usuários, clientes, produtos, agentes de IA, workflows e integrações.

## Documentação oficial

A documentação de arquitetura e decisões de engenharia vive em `docs/`:

- [`docs/BE-000-Plano-de-Execucao.md`](docs/BE-000-Plano-de-Execucao.md)
- [`docs/BE-001-Fundacao-Bright-Ecosystem.md`](docs/BE-001-Fundacao-Bright-Ecosystem.md)
- [`docs/BE-002-Arquitetura-Bright-Platform.md`](docs/BE-002-Arquitetura-Bright-Platform.md)
- [`docs/BE-003-Arquitetura-de-Dados-e-Supabase.md`](docs/BE-003-Arquitetura-de-Dados-e-Supabase.md)

## Rodando localmente

Pré-requisitos: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — a rota raiz redireciona para `/dashboard`.

Outros comandos:

```bash
npm run lint   # checagem de lint
npm run build  # build de produção
npm run start  # servidor de produção (após build)
```

## Banco de dados

O modelo de dados multiempresa está definido em `database/migrations/` (ver `docs/BE-003-Arquitetura-de-Dados-e-Supabase.md`). São arquivos SQL versionados, **ainda não aplicados a nenhum projeto Supabase real**. Um relatório de auditoria de dependências (`npm audit`) fica em [`reports/security/SEC-001-Relatorio.md`](reports/security/SEC-001-Relatorio.md).

## Estado atual

Fundação técnica inicial: Next.js + TypeScript + Tailwind, layout, dashboard e rotas principais como placeholder, e modelo de dados multiempresa preparado (migrations locais). **Nenhuma integração real (Supabase, n8n, OpenAI, Vercel) foi conectada nesta fase** — ver `docs/BE-001-Fundacao-Bright-Ecosystem.md` §5.

## Segurança

Nenhum segredo, senha, chave de API ou dado pessoal deve ser versionado. Use `.env.local` (git-ignorado) a partir do modelo em `.env.example`.
