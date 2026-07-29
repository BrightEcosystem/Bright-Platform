# SEC-003 — Rotação de Credenciais do Supabase

**Status:** Concluído
**Data:** 2026-07-29
**Motivo:** capturas de tela anteriores nesta conversa expuseram a `anon key`, a `secret key` e a senha do banco (`DATABASE_URL`/`DIRECT_URL`) do projeto `bright-platform-dev`. Nenhuma delas era mais confiável a partir do momento em que apareceram em texto.

---

## 1. O que foi rotacionado (manualmente, pelo responsável do projeto)

- Nova Secret API Key criada; `SUPABASE_SERVICE_ROLE_KEY` atualizada.
- Senha do banco redefinida.
- `DATABASE_URL` atualizada com a nova URI do Session Pooler.
- `DIRECT_URL` atualizada com a nova URI de conexão direta.
- Credenciais antigas revogadas no painel do Supabase.

Nenhuma dessas ações foi executada pelo Claude Code — rotação de credenciais é ação de conta/segurança que cabe exclusivamente ao responsável pelo projeto.

## 2. Verificação pós-rotação

| Item | Resultado |
|---|---|
| `.env.local` com exatamente 6 variáveis | ✅ confirmado |
| Ausência de placeholder `[YOUR-PASSWORD]` | ✅ confirmado |
| `npm run supabase:check` | ✅ passou — 6 variáveis válidas |
| `npm run supabase:verify` | ✅ conexão confirmada (DNS resolvido, HTTPS acessível, servidor respondeu) |
| `npx supabase migration list` | ✅ 7 migrations, `local == remote` para todas |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ sucesso, 12 rotas |
| `git diff --check` | ✅ sem problemas |

## 3. Integridade dos dados após a rotação (consulta somente leitura)

- **Migrations:** as 7 continuam registradas no histórico remoto.
- **Tabelas:** as 10 tabelas do schema `public` continuam existindo (contagem confirmada via `information_schema.tables`).
- **RLS:** continua habilitada nas 10 tabelas (confirmado via `pg_class.relrowsecurity`).

**Nenhuma informação foi perdida durante a rotação** — rotacionar credenciais de acesso não afeta o schema ou os dados já aplicados, apenas a forma de autenticação.

## 4. Scan de segredos

- Árvore de trabalho: nenhuma ocorrência real de `sb_secret_` (só a checagem de prefixo dentro do código do validador), nenhuma `postgresql://` com usuário/senha embutidos, `.env.local` não está versionado.
- **Histórico completo do Git** (`git log --all -p`): **zero ocorrências** de padrão de chave `sb_secret_` ou connection string com credenciais em qualquer commit já feito neste repositório.

## 5. Conclusão

As credenciais expostas nas capturas de tela anteriores foram revogadas e substituídas. O ambiente de desenvolvimento continua íntegro (schema, migrations e RLS preservados) e nenhuma delas jamais chegou a ser versionada no repositório.

## 6. Pendências

Nenhuma pendência técnica relacionada a esta rotação. Segue válida a pendência já registrada em `SUP-003`: teste de isolamento multiempresa com autenticação real, a ser feito em `AUTH-001`.
