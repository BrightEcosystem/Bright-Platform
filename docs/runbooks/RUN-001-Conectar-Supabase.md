# RUN-001 — Conectar Supabase

**Tipo:** Runbook operacional
**Pré-requisito:** `BE-004-Configuracao-do-Projeto-Supabase.md` (fundação de código já criada por `SUP-001`)
**Quem executa:** o usuário responsável pelo projeto (esta etapa envolve o painel web do Supabase e credenciais reais — não é executada pelo Claude Code)

---

## 1. Criar projeto no painel do Supabase

Acesse [supabase.com/dashboard](https://supabase.com/dashboard), crie uma nova organização (se necessário) e um novo projeto. Escolha uma região próxima aos usuários finais e uma senha forte para o banco (gerada automaticamente pelo painel é recomendado — guarde-a em um gerenciador de senhas, não em texto simples).

## 2. Localizar URL, chave pública e identificador do projeto

Em **Project Settings → API**, você encontra:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (nunca compartilhe, nunca cole em chat, nunca versione)
- **Reference ID** (na URL do projeto ou em Project Settings → General) → `SUPABASE_PROJECT_REF`

Em **Project Settings → Database → Connection string**, copie:

- **Connection pooling** (modo transaction, via Supavisor/PgBouncer) → `DATABASE_URL`
- **Direct connection** → `DIRECT_URL`

## 3. Criar o arquivo `.env.local`

Na raiz do repositório:

```bash
cp .env.example .env.local
```

Esse arquivo já está no `.gitignore` — nunca será commitado.

## 4. Inserir as variáveis localmente

Edite `.env.local` e preencha as seis variáveis com os valores copiados no passo 2. Não deixe espaços, aspas desnecessárias ou comentários na mesma linha do valor.

## 5. Executar `npm run supabase:check`

```bash
npm run supabase:check
```

Confirma que as seis variáveis existem e têm formato plausível — nunca imprime os valores. Se algo aparecer como `ausente` ou `inválido`, corrija `.env.local` e rode novamente antes de prosseguir.

## 6. Executar `npm run supabase:verify`

```bash
npm run supabase:verify
```

Faz uma consulta pública e somente-leitura para confirmar que a URL e a chave pública realmente conectam a um projeto Supabase acessível. Resultados possíveis:

- **Sucesso** — conexão confirmada.
- **"tabela products ainda não existe"** — conexão OK, mas as migrations ainda não foram aplicadas (esperado até o passo 7).
- **Falha de autenticação** — revise a `anon key`.
- **Não foi possível confirmar a conexão** — revise a URL/rede.

## 7. Preparar a aplicação das migrations

As migrations vivem em `database/migrations/` (`0001` a `0007`) e o seed em `database/seeds/0001_development_seed.sql`. Elas **não são aplicadas automaticamente**. Para aplicar (fora do escopo automatizado por este runbook, requer decisão e execução manual/deliberada):

```bash
# opção A — Supabase CLI (recomendado)
npx supabase link --project-ref $SUPABASE_PROJECT_REF
npx supabase db push

# opção B — psql direto, na ordem numérica
psql "$DIRECT_URL" -f database/migrations/0001_extensions.sql
psql "$DIRECT_URL" -f database/migrations/0002_core_tenants.sql
# ... até 0007, sempre em ordem
```

Aplique o seed (`database/seeds/0001_development_seed.sql`) apenas em ambiente de desenvolvimento — nunca em produção, pois contém dados fictícios.

## 8. Procedimento de rollback

As migrations deste projeto **não têm script de "down" automático** (prática comum: preferir corrigir com uma nova migration a desfazer uma antiga — ver `BE-002 §11`, "migrations imutáveis após aplicação"). Se uma migration aplicada precisar ser revertida:

1. Escreva uma nova migration (`0008_...sql`) que desfaça especificamente o que for necessário (`drop table`, `alter table ... drop column`, etc.).
2. Nunca edite um arquivo de migration já aplicado — isso quebra a reprodutibilidade do histórico.
3. Em caso de erro grave em produção, use o recurso de **Point-in-Time Recovery** do próprio Supabase (painel → Database → Backups) para restaurar um snapshot anterior, em vez de tentar reverter via SQL manual.

## 9. Cuidados com credenciais

- `service_role key` e `DIRECT_URL`/`DATABASE_URL` (que contêm a senha do banco) nunca devem ser coladas em chat, issue, PR, log público ou qualquer documento versionado.
- Se uma credencial for exposta acidentalmente, **rotacione imediatamente** pelo painel do Supabase (Project Settings → API → gerar nova `service_role key`; Database → Reset database password) — não é suficiente apenas removê-la do histórico do Git.
- Use `.env.local` apenas localmente. Em produção (Vercel ou outro host), configure as variáveis diretamente no painel do provedor, nunca em arquivo versionado.

## 10. Como confirmar que nada sensível foi versionado

Antes de qualquer commit:

```bash
git status                     # .env.local não deve aparecer
git diff --cached --check      # confirma que não há arquivos binários/problemas óbvios de whitespace
git grep -n -I -E "service_role|SUPABASE_SERVICE_ROLE_KEY|postgresql://|eyJ" -- . ":!package-lock.json" ":!.env.example"
```

Revise manualmente qualquer resultado do último comando — ele encontra o *nome* de variáveis sensíveis e padrões de URL/JWT, não necessariamente um segredo real, mas qualquer ocorrência fora de `.env.example` (que só tem os nomes, sem valor) merece investigação antes do commit.
