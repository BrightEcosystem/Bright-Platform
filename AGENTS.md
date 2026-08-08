# Agent instructions

This is NOT the Next.js you know.

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in node_modules/next/dist/docs/ before writing any code. Heed deprecation notices.

## Repository navigation

Before searching, editing, indexing, or answering questions about this repository:

1. Read `/manifest.yaml` as the canonical path registry.
2. Use `/ai/catalog.yaml` to locate agents, prompts, skills, rules, evaluations, and schemas.
3. Validate integration retrieval requests against `/ai/schemas/retrieval.schema.json`.
4. Require `repository_id: bright-platform`, `product_id: orbe-flow-cashback`, and `status: active`.
5. If a requested path is missing, consult `manifest.yaml.path_fallbacks`; do not guess a replacement.
6. In every retrieved result, preserve the repository ID, exact file path, and commit SHA.
7. Never use `archive`, `deprecated`, generated reports, logs, local environment files, or secrets as factual sources.

## Database paths

- `database/` describes the database design and supporting definitions.
- `supabase/migrations/` contains the migrations applied to the real Supabase project.
- When the two conflict, `supabase/migrations/` is authoritative for deployed state.
- Do not copy migrations between these paths without an explicit synchronization task.
