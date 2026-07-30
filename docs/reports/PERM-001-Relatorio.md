# PERM-001 — Relatório de Implementação

**Status:** Concluído
**Data:** 2026-07-30
**Responsável pela execução:** Claude Code

---

## 1. Migration criada

`0010_permissions_catalog.sql` (copiada para `supabase/migrations/20260729001000_permissions_catalog.sql`). Nenhuma migration anterior foi alterada. Dry-run aprovado antes da aplicação real.

Conteúdo: adiciona `name`, `module`, `action`, `status` a `public.permissions` (colunas que não existiam), semeia as 15 permissões do catálogo, e mapeia `platform.admin`/`tenant.admin` via `role_permissions`.

## 2. Permissões cadastradas

15, confirmadas por consulta direta ao banco. Lista completa e mapeamento por papel em `docs/BE-006-Papeis-e-Permissoes.md`.

## 3. Mapeamento por papel (confirmado por consulta)

| Papel | Permissões |
|---|---|
| `platform.admin` | 15 (todas) |
| `tenant.admin` | 13 (todas, exceto `platform.access`/`platform.manage`) |
| `project.manager` | 0 (reservado) |
| `project.viewer` | 0 (reservado) |

## 4. Helpers implementados

`src/lib/auth/permissions.ts`: `hasRole`, `hasAnyRole`, `hasAccessToTenant`, `hasPermission`, `hasAnyPermission`, `hasAllPermissions`, `requirePermission`, `requireAnyPermission`, `requireRole`, `requireTenantAccess`, `AuthorizationError`. Todos server-side, negação por padrão, tipados com `PermissionCode`/`RoleName` (`src/modules/auth/permission-catalog.ts`) para reduzir erro de digitação.

`src/lib/auth/protected-action.ts`: `withPermission()` — padrão reutilizável para proteger Server Actions (autenticação → tenant → permissão, nessa ordem), com exemplo documentado (não implementado como módulo comercial real).

## 5. Componentes criados

`src/components/auth/RoleGate.tsx` e `PermissionGate.tsx` — Server Components que só ocultam/mostram interface; nunca substituem a verificação real no servidor (documentado explicitamente no código e em `BE-006 §6`).

## 6. Testes aprovados

**A nível de banco (SQL direto):**
- 15 permissões seedadas ✓
- `platform.admin` tem as 15 ✓
- `tenant.admin` tem exatamente as 13 esperadas, zero `platform.*` ✓
- `project.manager`/`project.viewer` com 0 permissões ✓

**Ao vivo, através da aplicação Next.js real (dados fictícios, revertidos depois):**
Criei temporariamente uma empresa e dois usuários — um com papel `tenant.admin`, outro com membership ativa mas **sem nenhum papel**. Adicionei um bloco de teste temporário em `dashboard/page.tsx` renderizando `RoleGate`/`PermissionGate`, logei como cada usuário via navegador:

- Usuário com `tenant.admin`: `RoleGate` mostrou "tem papel", `PermissionGate` mostrou "tem permissão" ✓
- Usuário sem papel: `RoleGate` mostrou "sem papel", `PermissionGate` mostrou "sem permissão" ✓ (confirma: membership sem papel não recebe permissão)

O bloco de teste foi **revertido** antes do commit (`git diff` confirma `dashboard/page.tsx` idêntico ao commit anterior).

**Cobertos por revisão de código** (lógica trivial, sem necessidade de novo teste ao vivo):
- Permissão/papel inexistente retorna `false` (nenhuma linha corresponde na query/comparação).
- `requirePermission`/`requireRole` lançam `AuthorizationError` quando negado, retornam o contexto quando permitido — testado indiretamente pelos casos acima (o mesmo `hasPermission`/`hasRole` que eles chamam já foi provado nos dois cenários).
- Usuário de outro tenant não recebe permissão: já provado em `AUTH-002` (RLS + revalidação de tenant) — o mesmo mecanismo de tenant ativo é usado aqui.
- RLS preservada: confirmado nesta tarefa (10/10 tabelas, ver seção 8) — regressão dos testes de `AUTH-002`.

## 7. Dados temporários removidos

Sim. Removidos, nesta ordem: `membership_roles` → `tenant_memberships` → `tenants` (1 empresa fictícia) → 2 usuários fictícios (Admin API, cascata remove `profiles`). Confirmado por consulta: 0 tenants/profiles residuais com sufixo `perm001`.

## 8. Migrations e RLS preservadas

- 10 migrations (`0001` a `0010`), todas `local == remote`.
- RLS habilitada nas 10 tabelas do schema `public` (nenhuma alterada por esta tarefa).
- Catálogo de 15 permissões intacto após a limpeza dos dados de teste.

## 9. Arquivos alterados/criados

- `database/migrations/0010_permissions_catalog.sql` (+ cópia em `supabase/migrations/`)
- `src/lib/supabase/types.ts` (colunas novas de `permissions`)
- `src/modules/auth/permission-catalog.ts` (novo)
- `src/lib/auth/permissions.ts` (expandido)
- `src/lib/auth/protected-action.ts` (novo)
- `src/components/auth/RoleGate.tsx`, `PermissionGate.tsx` (novos)
- `docs/BE-006-Papeis-e-Permissoes.md`, `docs/runbooks/RUN-004-Gerenciar-Papeis-e-Permissoes.md`, `docs/reports/PERM-001-Relatorio.md` (novos)

## 10. Commit

`feat: implementa catalogo inicial de permissoes`

## 11. Pendências

- Nenhuma automação de auditoria ainda grava em `audit_logs` (permissão `audit.view` existe, mas nada a exibir).
- `project.manager`/`project.viewer` seguem sem uso funcional (aguardando a Bright Gestão de Projetos, fora de escopo).
- Nenhuma interface de administração de papéis/permissões — gestão via SQL/migration (`RUN-004`).
- Nenhum framework de teste automatizado instalado — validação via SQL direto + automação de navegador, como nas tarefas anteriores.
