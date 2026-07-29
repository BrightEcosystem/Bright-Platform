# BE-004 — Configuração do Projeto Supabase

**Status:** Aprovado para execução
**Versão:** 1.0.0
**Responsável pela arquitetura:** ChatGPT — Direção de Engenharia Bright Ecosystem
**Responsável pela implementação:** Claude Code
**Documentos relacionados:** `BE-003-Arquitetura-de-Dados-e-Supabase.md`, `docs/runbooks/RUN-001-Conectar-Supabase.md`

---

## 1. Objetivo

Descrever a fundação de código criada por `SUP-001` para conectar a Bright Platform a um projeto Supabase real — sem, nesta tarefa, criar esse projeto, aplicar migrations remotas ou implementar autenticação.

## 2. O que foi criado

### 2.1 `src/config/env.ts`

Validação das variáveis de ambiente com Zod, dividida em dois níveis:

- `publicEnv` — apenas variáveis `NEXT_PUBLIC_*`, seguras para o navegador. Validado (`.parse()`) na importação do módulo.
- `getServerEnv()` — inclui `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF`, `DATABASE_URL`, `DIRECT_URL`. Função, não constante — só deve ser chamada em código de servidor.

### 2.2 `src/lib/supabase/client.ts`

Factory de cliente Supabase para Client Components (`"use client"`), usando `@supabase/ssr` (`createBrowserClient`) e apenas `publicEnv`.

### 2.3 `src/lib/supabase/server.ts`

Factory de cliente Supabase para Server Components, Server Actions e Route Handlers, usando `@supabase/ssr` (`createServerClient`) e os cookies da requisição (`next/headers`). Também usa apenas `publicEnv` — este client respeita RLS como o usuário autenticado, por isso não usa a `service_role`.

### 2.4 `src/lib/supabase/types.ts`

Tipos `Database` escritos à mão a partir das migrations em `database/migrations/` (as dez tabelas de `BE-003`). Deve ser regenerado via `supabase gen types typescript` assim que um projeto real existir.

### 2.5 `scripts/supabase/check-environment.mjs`

Executado via `npm run supabase:check`. Lê `.env.local` (parser próprio, sem dependência nova), verifica se as seis variáveis obrigatórias existem e têm formato plausível, e imprime apenas `presente` / `ausente` / `inválido` por variável — nunca o valor. Sai com código 1 se algo estiver incompleto.

### 2.6 `scripts/supabase/verify-connection.mjs`

Executado via `npm run supabase:verify`. Faz uma única consulta somente-leitura (`head: true`, sem retornar dados) contra a tabela `products`, usando apenas a chave pública (`anon key`). Nunca cria, altera ou exclui dados. Distingue três falhas possíveis com mensagem clara: configuração ausente, projeto acessível mas migrations não aplicadas, ou falha de autenticação/rede.

## 3. Variáveis de ambiente

Ver `.env.example` — seis variáveis: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF`, `DATABASE_URL`, `DIRECT_URL`. Nenhum valor real está versionado — todas em branco.

## 4. Regras aplicadas

- `SUPABASE_SERVICE_ROLE_KEY` nunca é lida por `client.ts`, nunca recebe prefixo `NEXT_PUBLIC_`.
- `DATABASE_URL`/`DIRECT_URL` só existem no schema de servidor (`getServerEnv`), nunca no `publicEnv` usado pelo cliente.
- Nenhuma autenticação foi implementada — os clients criados aqui são apenas factories de conexão, sem fluxo de login.
- Nenhuma migration foi executada remotamente.
- Nenhuma tabela além das dez já definidas em `BE-003` foi criada ou referenciada.

## 5. O que ainda falta (fora do escopo desta tarefa)

- Criar o projeto real no painel do Supabase — ver `docs/runbooks/RUN-001-Conectar-Supabase.md`.
- Preencher `.env.local` com as credenciais reais.
- Aplicar as migrations de `database/migrations/` no projeto real.
- Implementar autenticação (login, cadastro, middleware de sessão).
- Conectar Vercel.

Nenhum desses itens deve ser iniciado sem nova aprovação explícita da Direção de Engenharia.
