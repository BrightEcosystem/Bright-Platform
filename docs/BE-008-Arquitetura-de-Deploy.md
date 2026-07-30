# BE-008 — Arquitetura de Deploy

**Status:** Aprovado para execução
**Versão:** 1.0.0
**Responsável pela arquitetura:** ChatGPT — Direção de Engenharia Bright Ecosystem
**Responsável pela implementação:** Claude Code
**Documentos relacionados:** `BE-000-Plano-de-Execucao.md` (Etapa 3), `BE-004-Configuracao-do-Projeto-Supabase.md`

---

## 1. Objetivo

Documentar a infraestrutura de deploy da Bright Platform (`DEV-001`): integração com a Vercel, estratégia de ambientes (homologação/produção), pipeline mínimo de integração contínua e o procedimento de rollback.

## 2. Plataforma de deploy

**Vercel**, conectada ao repositório `BrightEcosystem/Bright-Platform` via integração nativa com o GitHub. O projeto é um Next.js 16 (App Router) padrão, sem servidor customizado, sem `output` especial em `next.config.ts` e sem uso de runtime Edge — compatível com o deploy zero-config da Vercel.

`package.json` declara `"engines": { "node": ">=20.9.0" }`, alinhado ao mínimo exigido pelo Next.js 16, para que a Vercel (e qualquer outro ambiente) use uma versão de Node compatível de forma determinística.

## 3. Estratégia de ambientes (fase atual)

Nesta fase, um único projeto Vercel e um único projeto Supabase são usados — a mesma instância já utilizada desde `SUP-003`, sempre com dados fictícios criados e removidos a cada fase de teste, nunca dados reais.

- **Vercel Preview Deployments** (gerados automaticamente para cada Pull Request/branch): usados como **ambiente de homologação**.
- **Vercel Production Deployment** (branch `main`): usado como publicação corrente da Bright Platform — ainda não é "produção" no sentido de atender clientes reais, é o estado mais atual e aprovado do projeto.

**Antes do primeiro cliente real**, esta arquitetura **deve** evoluir para:

```
Supabase DEV → Supabase HML → Supabase PROD
Vercel Preview → Vercel Production (isolado por ambiente)
```

com projetos Supabase e variáveis de ambiente Vercel distintos por ambiente. Essa separação não foi implementada agora deliberadamente, para não introduzir complexidade operacional antes de haver necessidade real — é uma decisão já registrada e aprovada pela Direção (ver `docs/reports/DEV-001-Relatorio.md` §2).

## 4. Variáveis de ambiente

Na Vercel, as mesmas variáveis de `.env.local` devem ser configuradas no painel do projeto (Settings → Environment Variables): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF`, `DATABASE_URL`, `DIRECT_URL`. Passo a passo em `docs/runbooks/RUN-005-Deploy-e-Rollback.md`.

`SUPABASE_SERVICE_ROLE_KEY` nunca deve ser marcada como exposta ao navegador — só variáveis com prefixo `NEXT_PUBLIC_` são seguras para o client. O código já respeita essa separação (`src/lib/supabase/server.ts` nunca usa `service_role`; só scripts administrativos avulsos o fazem, fora do bundle da aplicação).

## 5. Integração contínua (CI)

`.github/workflows/ci.yml` — workflow mínimo, disparado em `push`/`pull_request` para `main`:

1. `actions/checkout`
2. `actions/setup-node` (Node 20.9.0, cache de `npm`)
3. `npm ci`
4. `npm run lint`
5. `npm run build`

O passo de build usa **valores de exemplo, não secretos**, para `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` — suficiente porque nenhuma rota desta fase busca dados do Supabase em tempo de build (todas as rotas da área autenticada são renderizadas por requisição, confirmado pela saída de `next build`: nenhuma delas aparece como estática/`○`). Testado localmente com valores inválidos como controle negativo, confirmando que a validação Zod (`src/config/env.ts`) realmente barra o build se as variáveis estiverem ausentes/malformadas. Se uma página futura passar a depender de dados reais em tempo de build (SSG/ISR), os placeholders devem ser substituídos por Secrets do repositório apontando para um projeto Supabase real.

Nenhum teste automatizado é executado ainda — não existe suíte de testes no projeto; será adicionada conforme o projeto crescer (mesma pendência já registrada em `PERM-001`/`CORE-001`).

## 6. Rollback

Procedimento documentado em `docs/runbooks/RUN-005-Deploy-e-Rollback.md`: a Vercel mantém o histórico de deployments e permite promover instantaneamente qualquer deployment anterior a produção, sem precisar reverter commits no Git.

## 7. Limitações desta fase

- A conexão inicial do repositório à Vercel (importar o projeto, autorizar o GitHub App, configurar as variáveis de ambiente) **precisa ser feita pela Direção diretamente no painel da Vercel** — é uma ação de conta de terceiros que não pode ser automatizada por este agente (não há CLI da Vercel autenticada neste ambiente, e autenticar exigiria um fluxo OAuth interativo). Passo a passo completo em `RUN-005`.
- Nenhuma separação DEV/HML/PROD foi implementada ainda (seção 3) — deliberado, fica como pré-requisito antes do primeiro cliente real.
- Nenhum domínio próprio configurado — usa-se o domínio padrão `*.vercel.app` fornecido pela Vercel.
