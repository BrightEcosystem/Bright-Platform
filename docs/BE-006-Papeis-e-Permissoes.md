# BE-006 — Papéis e Permissões

**Status:** Aprovado para execução
**Versão:** 1.0.0
**Responsável pela arquitetura:** ChatGPT — Direção de Engenharia Bright Ecosystem
**Responsável pela implementação:** Claude Code
**Documentos relacionados:** `BE-003-Arquitetura-de-Dados-e-Supabase.md`, `BE-005-Autenticacao-e-Acesso-Multiempresa.md`

---

## 1. Objetivo

Documentar o catálogo inicial de permissões (`PERM-001`), o mapeamento aos papéis estruturais já existentes e os helpers de autorização granular usados para proteger Server Actions e a interface.

## 2. Diferença entre papel e permissão

- **Papel** (`roles`): um rótulo atribuído a uma membership (`membership_roles`), ex.: `tenant.admin`. Pode ser de sistema (`tenant_id` nulo) ou específico de uma empresa.
- **Permissão** (`permissions`): uma capacidade concreta e granular, ex.: `tenant.members.manage`. Permissões são concedidas a papéis via `role_permissions` — nunca diretamente a um usuário ou membership.

Um usuário nunca é verificado "tem permissão X" diretamente; a cadeia real é: usuário → membership ativa → papéis da membership → permissões dos papéis.

## 3. Catálogo inicial (15 permissões)

| Código | Nome | Módulo | Ação |
|---|---|---|---|
| `platform.access` | Acessar a plataforma | platform | access |
| `platform.manage` | Administrar a plataforma | platform | manage |
| `tenant.view` | Visualizar empresa | tenant | view |
| `tenant.update` | Atualizar empresa | tenant | update |
| `tenant.members.view` | Visualizar membros da empresa | tenant | members.view |
| `tenant.members.manage` | Gerenciar membros da empresa | tenant | members.manage |
| `tenant.roles.view` | Visualizar papéis da empresa | tenant | roles.view |
| `tenant.roles.manage` | Gerenciar papéis da empresa | tenant | roles.manage |
| `user.profile.view` | Visualizar perfil de usuário | user | profile.view |
| `user.profile.update` | Atualizar perfil de usuário | user | profile.update |
| `product.view` | Visualizar catálogo de produtos | product | view |
| `product.manage` | Gerenciar catálogo de produtos | product | manage |
| `tenant_product.view` | Visualizar produtos da empresa | tenant_product | view |
| `tenant_product.manage` | Gerenciar produtos da empresa | tenant_product | manage |
| `audit.view` | Visualizar auditoria | audit | view |

Nenhuma permissão de módulo ainda inexistente (ex.: Bright Gestão de Projetos) foi criada nesta fase.

## 4. Mapeamento por papel

- **`platform.admin`** — todas as 15 permissões do catálogo.
- **`tenant.admin`** — as 13 permissões de nível de empresa (todas, exceto `platform.access`/`platform.manage`, que são de sistema).
- **`project.manager`**, **`project.viewer`** — **reservados, sem nenhuma permissão mapeada nesta etapa.** São papéis de um produto futuro (Bright Gestão de Projetos), fora do escopo deste catálogo. Ficam cadastrados para não exigir uma migration de renomeação quando esse produto existir.
- **Membership sem papel atribuído** — não recebe nenhuma permissão. Não foi criado nenhum "papel padrão" implícito — ausência de papel é ausência de acesso administrativo (negação por padrão).

## 5. Fluxo de autorização

```text
Requisição (Server Action / Server Component)
  ↓
getAuthContext() — usuário autenticado? profile ativo? membership ativa? tenant ativo revalidado?
  ↓
requirePermission(supabase, ctx, "codigo.da.permissao")
  ↓
hasPermission() consulta: roles da membership ativa → role_permissions → permissions.code
  ↓
Concede ou lança AuthorizationError (mensagem genérica, sem detalhe técnico)
  ↓
RLS do Postgres continua sendo a barreira final, independente da checagem em código
```

## 6. Proteção visual vs. proteção real

- `RoleGate`/`PermissionGate` (`src/components/auth/`) **só ocultam ou mostram elementos de interface**. Não impedem nada por si sós — um usuário que descobrir a URL/nome da Server Action ainda pode tentar chamá-la diretamente.
- A proteção real acontece **sempre no servidor**: dentro da própria Server Action, via `requirePermission`/`requireRole`/`requireTenantAccess` (ver `protected-action.ts`), e como última barreira, a RLS do banco.
- Regra prática: se uma ação precisa ser protegida, ela precisa se proteger sozinha no servidor — esconder o botão é conforto de UX, não segurança.

## 7. Como criar uma nova permissão

1. Adicionar o código à lista em `src/modules/auth/permission-catalog.ts` (`PERMISSION_CODES`).
2. Criar uma nova migration (nunca editar `0010_permissions_catalog.sql` ou qualquer migration já aplicada) inserindo a permissão via `insert ... on conflict (code) do update set ...` (mesmo padrão idempotente).
3. Se necessário, mapear a novos papéis via `role_permissions` na mesma migration.
4. Documentar a nova permissão nesta tabela (seção 3).

## 8. Como associar uma permissão a um papel

Nova migration inserindo em `role_permissions (role_id, permission_id)`, resolvendo os IDs por nome/código (nunca hardcoded), com `on conflict (role_id, permission_id) do nothing`. Ver exemplo em `0010_permissions_catalog.sql`.

## 9. Regras de auditoria

Nenhuma automática ainda: a tabela `audit_logs` existe e tem RLS, e a permissão `audit.view` já está no catálogo, mas nenhuma Server Action grava eventos de auditoria automaticamente nesta fase — isso é trabalho futuro (fora do escopo de `PERM-001`).

## 10. Limitações atuais

- Nenhuma permissão granular por recurso individual (ex.: "editar SÓ este produto específico") — o modelo atual é por módulo/ação, não por instância.
- `project.manager`/`project.viewer` não têm uso funcional ainda.
- Nenhuma interface de administração de papéis/permissões existe — tudo é feito via migration ou SQL direto (ver `RUN-004`).
- Nenhum registro automático de auditoria quando uma permissão é usada ou negada.
