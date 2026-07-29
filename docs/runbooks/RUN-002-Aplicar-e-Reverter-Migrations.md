# RUN-002 — Aplicar e Reverter Migrations

**Tipo:** Runbook operacional
**Pré-requisito:** projeto Supabase conectado (`RUN-001`), CLI autenticado (`supabase login` + `supabase link` — feito uma vez por máquina/usuário)

---

## 1. Como aplicar migrations novas

1. Crie o arquivo em `database/migrations/NNNN_nome-descritivo.sql`, seguindo a numeração sequencial existente.
2. Copie para `supabase/migrations/` com o padrão de nome exigido pelo Supabase CLI (`YYYYMMDDHHmmss_nome.sql`).
3. Revise o conteúdo contra o checklist de `BE-002 §11` e `BE-003` (idempotência, índices, RLS, sem segredo, sem comando destrutivo).
4. Rode o dry-run **preferindo `--linked`** a `--db-url` (ver seção 4 sobre por quê):
   ```bash
   npx supabase db push --dry-run
   ```
5. Se aprovado, aplique de verdade:
   ```bash
   npx supabase db push
   ```
6. Confirme com:
   ```bash
   npx supabase migration list
   ```

## 2. Como executar dry-run

```bash
npx supabase db push --dry-run
```

Isso **nunca** altera o banco — apenas mostra o que seria aplicado. Sempre rode antes de um `db push` real.

## 3. Como consultar o histórico

```bash
npx supabase migration list
```

Mostra cada migration local ao lado do status remoto (`local == remote` significa aplicada). Para inspecionar o schema real diretamente (mais confiável que confiar só no histórico):

```bash
npx supabase db query --linked "select table_name from information_schema.tables where table_schema = 'public' order by table_name;"
```

## 4. Preferir `--linked` a `--db-url`

Neste ambiente de desenvolvimento, `--db-url` (conexão Postgres direta) apresentou falhas de conexão consistentes mesmo com credenciais corretas, enquanto `--linked` (Management API, via `supabase login`/`supabase link`) sempre funcionou. Prefira:

```bash
npx supabase db push --dry-run          # ao invés de --db-url "..."
npx supabase migration list             # ao invés de migration list --db-url "..."
npx supabase db query --linked "SQL"    # para qualquer consulta ad-hoc
```

Se `--linked` também falhar, verifique `npx supabase projects list` para confirmar qual projeto está de fato linkado antes de investigar mais fundo.

## 5. Como agir quando uma migration falhar

1. **Não** tente "consertar" a migration que já foi parcialmente aplicada editando o mesmo arquivo.
2. Rode `npx supabase migration list` para ver exatamente até onde chegou.
3. Se a migration falhou a meio caminho (schema em estado inconsistente), avalie no painel (Table Editor / SQL Editor) o que realmente foi criado.
4. Escreva uma migration corretiva nova (`NNNN_fix-*.sql`) que ajusta o estado — nunca reescreva o histórico.

## 6. Como criar uma migration corretiva

Mesmo processo da seção 1, mas o conteúdo é especificamente para corrigir/ajustar algo já aplicado: `alter table`, `drop column` seguido de recriação correta, novo índice, nova política substituindo uma anterior (`drop policy if exists` + `create policy`). Sempre idempotente quando tecnicamente possível.

## 7. Por que não editar uma migration já aplicada

O Supabase (como qualquer sistema de migrations sério) registra o histórico em `supabase_migrations.schema_migrations` no momento da aplicação. Editar um arquivo já aplicado:
- não tem efeito nenhum no banco que já rodou aquele SQL;
- quebra a reprodutibilidade em outros ambientes (staging, produção, ou o ambiente de outro desenvolvedor), que aplicariam um SQL diferente do que já está no banco atual;
- torna o histórico de commits uma mentira sobre o que realmente aconteceu no banco.

A regra é sempre: **estado errado se corrige com uma migration nova, nunca editando uma antiga.**

## 8. Procedimento de rollback

Não existe um "down" automático neste projeto (ver `BE-002 §11`). Para reverter algo aplicado:

1. Escreva uma migration corretiva específica (seção 6) que desfaça exatamente o necessário.
2. Para um incidente grave em produção, prefira o **Point-in-Time Recovery** do próprio Supabase (painel → Database → Backups) a tentar reverter manualmente via SQL.
3. Teste a migration corretiva com `--dry-run` antes de aplicar, como qualquer outra.

## 9. Proibição de `db reset` em banco remoto com dados

`supabase db reset` **apaga e recria o banco do zero a partir das migrations locais**. Isso é apropriado apenas para o banco local de desenvolvimento (Docker). **Nunca execute `db reset` contra um projeto remoto que tenha qualquer dado real** — não existe undo. Se for genuinamente necessário recriar o schema remoto do zero (ex.: ambiente de teste descartável), confirme três vezes o projeto (`supabase projects list` + qual está linkado) antes de rodar qualquer coisa.
