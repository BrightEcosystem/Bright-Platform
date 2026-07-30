# RUN-005 — Deploy e Rollback

**Tipo:** Runbook operacional
**Pré-requisito:** `DEV-001` (workflow de CI e arquitetura de deploy, ver `BE-008`)

---

## 1. Conectar o repositório à Vercel (ação manual, feita uma única vez)

Esta etapa **precisa ser feita pela Direção diretamente**, pois exige autenticação na conta Vercel e autorização de acesso ao GitHub da organização — não pode ser automatizada por este agente.

1. Acesse [vercel.com](https://vercel.com) e entre com a conta que administrará o deploy (ou crie uma, se ainda não existir).
2. **Add New → Project**.
3. Autorize o GitHub App da Vercel a acessar a organização `BrightEcosystem` (ou pelo menos o repositório `Bright-Platform`), caso ainda não tenha sido autorizado.
4. Selecione o repositório `BrightEcosystem/Bright-Platform`.
5. A Vercel detecta automaticamente o framework (Next.js) — não é necessário alterar o comando de build (`next build`) nem o diretório de saída.
6. **Antes de clicar em Deploy**, configure as variáveis de ambiente (seção 2).

## 2. Configurar variáveis de ambiente na Vercel

Em **Settings → Environment Variables** do projeto, adicionar as mesmas seis variáveis de `.env.local`:

| Variável | Exposta ao navegador? |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim (por design) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim (por design) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Não** — nunca marcar como pública |
| `SUPABASE_PROJECT_REF` | Não |
| `DATABASE_URL` | Não |
| `DIRECT_URL` | Não |

Aplicar a todos os ambientes (Production, Preview e Development) enquanto a Bright Platform usa um único projeto Supabase (ver `BE-008 §3`). Quando houver separação DEV/HML/PROD, cada ambiente Vercel deve apontar para o projeto Supabase correspondente.

## 3. Primeiro deploy

Após configurar as variáveis, clicar em **Deploy**. A Vercel:

- builda o projeto (mesmo `next build` validado localmente e no CI);
- publica em uma URL `*.vercel.app` (Production, para a branch `main`).

Validar após o deploy:

- `/login` carrega corretamente;
- o fluxo de autenticação funciona (login redireciona para `/dashboard` ou `/selecionar-empresa` conforme o caso);
- nenhum erro 500 nas rotas principais.

## 4. Preview Deployments (homologação)

A partir da conexão inicial, **todo Pull Request** para `main` gera automaticamente um Preview Deployment com URL própria — nenhuma configuração adicional é necessária. Use essa URL para homologar mudanças antes do merge.

## 5. Rollback

A Vercel mantém o histórico completo de deployments. Para reverter:

1. No painel do projeto, aba **Deployments**.
2. Localizar o deployment anterior (estável).
3. Menu de contexto (`⋯`) → **Promote to Production**.

Isso restaura instantaneamente a versão anterior servida em produção, **sem precisar reverter nenhum commit no Git** — o histórico do repositório permanece intacto.

## 6. Pipeline de CI (GitHub Actions)

`.github/workflows/ci.yml` roda automaticamente em todo `push`/`pull_request` para `main`: instala dependências (`npm ci`), roda `npm run lint` e `npm run build`. Se qualquer etapa falhar, o PR fica marcado como falho no GitHub — a Vercel ainda gera seu próprio Preview Deployment independentemente (são pipelines distintos), então um PR com CI falho pode mesmo assim ter um preview publicado; a promoção a produção deve esperar o CI passar.

## 7. Diagnosticando um deploy com problema

Nesta ordem:

1. O build falhou na Vercel ou no GitHub Actions? Ver o log de build em cada painel — geralmente é erro de TypeScript/lint ou variável de ambiente ausente.
2. As variáveis de ambiente estão configuradas para o ambiente certo (Production vs Preview)?
3. O erro acontece só em produção (não localmente)? Comparar `.env.local` com as variáveis configuradas na Vercel.
4. Se nada resolver rapidamente, usar o rollback (seção 5) para restaurar o último deployment estável enquanto o problema é investigado.

## 8. Não fazer

- Não commitar a pasta `.vercel/` (já está em `.gitignore`).
- Não marcar `SUPABASE_SERVICE_ROLE_KEY`/`DATABASE_URL`/`DIRECT_URL` como variáveis públicas na Vercel.
- Não reverter um deploy problemático via `git revert` como primeira resposta — use o rollback da Vercel (seção 5), que é instantâneo; ajustar o Git depois, com calma.
- Não promover um Preview Deployment a produção sem que o CI (`ci.yml`) tenha passado.
