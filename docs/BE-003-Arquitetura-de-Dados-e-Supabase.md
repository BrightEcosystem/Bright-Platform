# BE-003 — Arquitetura de Dados e Supabase

**Status:** Aprovado para execução
**Versão:** 1.0.0
**Responsável pela arquitetura:** ChatGPT — Direção de Engenharia Bright Ecosystem
**Responsável pela implementação:** Claude Code
**Documentos relacionados:** `BE-001-Fundacao-Bright-Ecosystem.md`, `BE-002-Arquitetura-Bright-Platform.md`

---

## 1. Objetivo

Este documento define o modelo de dados multiempresa da Bright Platform: as entidades mínimas, suas relações, as regras de isolamento por `tenant_id` e a estratégia de Row Level Security (RLS) planejada desde a origem, conforme BE-002 §4 e §11.

Esta é uma tarefa de **preparação**. Nenhum projeto Supabase real foi conectado, nenhuma migration foi executada remotamente. Os arquivos aqui descritos existem apenas como código versionado, prontos para aplicação futura mediante aprovação.

---

## 2. Modelo mínimo

### 2.1 `tenants`

Representa cada empresa cliente da Bright Platform.

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `name` | `text` | Nome da empresa |
| `slug` | `text` | Único, usado em URLs/identificação |
| `status` | `text` | `active` / `suspended` / `archived` |
| `created_at`, `updated_at` | `timestamptz` | Auditoria |
| `deleted_at` | `timestamptz` | Soft delete |

### 2.2 `profiles`

Vinculado a `auth.users` do Supabase Auth (`id` é o mesmo UUID do usuário autenticado).

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `uuid` | PK, FK para `auth.users(id)` |
| `full_name` | `text` | |
| `email` | `text` | Único |
| `status` | `text` | `active` / `suspended` / `archived` |
| `created_at`, `updated_at` | `timestamptz` | Auditoria |
| `deleted_at` | `timestamptz` | Soft delete |

### 2.3 `tenant_memberships`

Relacionamento entre um perfil (usuário) e uma empresa.

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `uuid` | PK |
| `tenant_id` | `uuid` | FK, obrigatório |
| `profile_id` | `uuid` | FK, obrigatório |
| `job_title` | `text` | Cargo descritivo (livre) |
| `status` | `text` | `active` / `suspended` / `removed` |
| `created_at`, `updated_at` | `timestamptz` | Auditoria |

Único por `(tenant_id, profile_id)` — um perfil tem no máximo um vínculo por empresa.

### 2.4 `roles`

Papéis de RBAC. Podem ser de empresa (`tenant_id` preenchido) ou de sistema (`tenant_id` nulo, ex.: `super_admin`).

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `uuid` | PK |
| `tenant_id` | `uuid` | FK, nulo = papel de sistema |
| `name` | `text` | |
| `is_system` | `boolean` | |
| `created_at`, `updated_at` | `timestamptz` | Auditoria |

### 2.5 `permissions`

Catálogo global de permissões (ex.: `companies.read`).

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `uuid` | PK |
| `code` | `text` | Único |
| `description` | `text` | |
| `created_at`, `updated_at` | `timestamptz` | Auditoria |

### 2.6 `role_permissions`

Relacionamento N:N entre `roles` e `permissions`.

### 2.7 `membership_roles`

Relacionamento N:N entre `tenant_memberships` e `roles` — define quais papéis um membro possui dentro de uma empresa.

### 2.8 `products`

Catálogo dos produtos Bright (CRM, Licitações, Atendimento IA, Automações, Financeiro, Analytics, Delivery — ver BE-002 §3).

### 2.9 `tenant_products`

Produtos habilitados por empresa, com `status`, `plan` e datas de ativação/desativação.

### 2.10 `audit_logs`

Rastreabilidade obrigatória (BE-001 §4 princípio 4): empresa, usuário, ação, recurso, metadados (`jsonb`) e data.

---

## 3. Migrations

Aplicadas nesta ordem (`database/migrations/`):

1. `0001_extensions.sql` — extensão `pgcrypto` (necessária para `gen_random_uuid()`).
2. `0002_core_tenants.sql` — `tenants` e função utilitária `set_updated_at()`.
3. `0003_identity_memberships.sql` — `profiles` e `tenant_memberships`.
4. `0004_roles_permissions.sql` — `roles`, `permissions`, `role_permissions`, `membership_roles`.
5. `0005_products_subscriptions.sql` — `products`, `tenant_products`.
6. `0006_audit_logs.sql` — `audit_logs`.
7. `0007_rls_policies.sql` — RLS habilitada e políticas de isolamento por tenant em todas as tabelas relevantes.

Todas as migrations usam `if not exists` / `drop ... if exists` + `create` para serem idempotentes sempre que tecnicamente possível. Nenhuma foi executada contra um banco real — são apenas arquivos SQL versionados.

## 4. Seed de desenvolvimento

`database/seeds/0001_development_seed.sql` insere dados **fictícios**: uma empresa "Empresa Demo", um usuário "Usuário Demo", o catálogo de produtos, um papel de sistema (`super_admin`) e uma habilitação de produto em modo trial. Nenhum dado do Enéias ou de qualquer cliente real está presente — conforme exigido em BE-002 §3 (nada específico de um produto/cliente entra no CORE).

O seed depende de um usuário existente em `auth.users` com o UUID indicado no próprio arquivo — isso só é possível depois que o Supabase Auth estiver de fato conectado (fora do escopo desta tarefa).

---

## 5. Estratégia de Row Level Security

Planejada desde a origem (BE-002 §4), mas **ainda não testável**, pois não há Supabase real conectado.

- Uma função `public.is_tenant_member(tenant_id)` centraliza a checagem "o usuário autenticado pertence ativamente a esta empresa?" — evita repetir a mesma subquery em cada política.
- `tenants`, `tenant_memberships`, `tenant_products` e `audit_logs`: visíveis apenas a membros ativos da empresa correspondente.
- `profiles`: cada usuário só enxerga/edita o próprio registro nesta fase. Visibilidade entre membros da mesma empresa (necessária para telas de "Clientes"/"Empresas") será definida em um `BE-XXX` futuro, junto com a funcionalidade — evita antecipar regra de negócio não aprovada.
- `roles` e `permissions`: papéis/permissões de sistema são globais e legíveis por qualquer usuário autenticado; papéis de empresa só são visíveis a membros daquela empresa.
- `role_permissions` e `membership_roles`: herdam a visibilidade do papel/vínculo relacionado.
- `products`: catálogo global, leitura liberada a qualquer usuário autenticado.
- Nenhuma política de escrita (`insert`/`update`/`delete`) foi criada nesta fase, exceto onde explicitado — escrita ficará a cargo do `service_role` (backend) até que os fluxos de UI que a exigem sejam aprovados. O `service_role` do Supabase ignora RLS por padrão e **nunca deve ser exposto ao frontend** (ver `.env.example` e BE-002 §10).

Este conjunto de políticas deve ser revisado e testado contra um projeto Supabase real antes de qualquer uso em produção — nenhuma política aqui foi validada em ambiente real.

---

## 6. Convenções seguidas (BE-002 §11)

- PostgreSQL, `snake_case`, `uuid` como chave primária em todas as entidades principais.
- `created_at`/`updated_at` em todas as tabelas com ciclo de vida próprio, mantidos via trigger `set_updated_at()`.
- Soft delete (`deleted_at`) em `tenants` e `profiles` — entidades centrais com ciclo de vida longo. Tabelas de relacionamento puro (`role_permissions`, `membership_roles`) não têm soft delete — refletem um vínculo binário, não um registro com histórico próprio.
- Índices em toda chave estrangeira e em colunas usadas para filtro frequente (`status`, `created_at`, `resource`).
- Isolamento multiempresa por `tenant_id` em toda entidade de negócio aplicável.

## 7. Segurança

- Nenhuma credencial real foi criada ou versionada nesta tarefa.
- `SUPABASE_SERVICE_ROLE_KEY` continua vazio em `.env.example` — nunca deve receber o prefixo `NEXT_PUBLIC_` nem ser lido em código de cliente.
- Nenhuma migration foi executada contra um projeto Supabase real.
- Dados de seed são fictícios — nenhum dado real de cliente, CPF, e-mail real ou credencial.

## 8. Restrições respeitadas nesta etapa

Não foram feitos: conexão com projeto Supabase real, execução de migration remota, criação de módulos além dos dez definidos no modelo mínimo, dados específicos do Enéias no CORE, exposição de `service_role` no frontend.

## 9. Próxima tarefa autorizada

Conectar um projeto Supabase real requer nova aprovação explícita da Direção de Engenharia — não incluída no escopo deste documento.
