# RUN-004 — Gerenciar Papéis e Permissões

**Tipo:** Runbook operacional
**Pré-requisito:** `PERM-001` concluída (migration `0010` aplicada)

---

## 1. Consultar o catálogo atual

```bash
npx supabase db query --linked "select code, name, module, action, status from public.permissions order by module, action;"
```

## 2. Consultar o mapeamento de um papel

```bash
npx supabase db query --linked "select p.code from public.role_permissions rp join public.roles r on r.id = rp.role_id join public.permissions p on p.id = rp.permission_id where r.name = 'tenant.admin' order by p.code;"
```

## 3. Criar uma nova permissão

1. Adicione o código em `src/modules/auth/permission-catalog.ts` (`PERMISSION_CODES`).
2. Crie uma **nova migration** (nunca edite `0010_permissions_catalog.sql`):

```sql
-- 00XX_nova_permissao.sql
insert into public.permissions (code, name, description, module, action, status)
values ('modulo.acao', 'Nome legível', 'Descrição.', 'modulo', 'acao', 'active')
on conflict (code) do update set
  name = excluded.name, description = excluded.description,
  module = excluded.module, action = excluded.action;
```

3. Copie para `supabase/migrations/` com o timestamp seguinte, rode `db push --dry-run`, confirme que é a única pendente, aplique.

## 4. Associar uma permissão a um papel

```sql
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'tenant.admin' and p.code = 'modulo.acao'
on conflict (role_id, permission_id) do nothing;
```

Mesma regra: nova migration, nunca editar as existentes.

## 5. Atribuir um papel a uma membership (usuário real de uma empresa)

```sql
insert into public.membership_roles (membership_id, role_id)
select tm.id, r.id
from public.tenant_memberships tm, public.roles r
where tm.profile_id = '<id-do-usuario>'
  and tm.tenant_id = '<id-da-empresa>'
  and r.name = 'tenant.admin';
```

## 6. Revogar um papel

```sql
delete from public.membership_roles
where membership_id = (
  select id from public.tenant_memberships
  where profile_id = '<id-do-usuario>' and tenant_id = '<id-da-empresa>'
)
and role_id = (select id from public.roles where name = 'tenant.admin');
```

## 7. Proteger uma nova Server Action (padrão)

```ts
"use server";
import { withPermission } from "@/lib/auth/protected-action";

export async function minhaAcao(formData: FormData) {
  // valide o formData com Zod ANTES ou DEPOIS — withPermission só cuida de auth/autorização
  return withPermission("tenant.members.manage", tenantIdRecebido, async (ctx, supabase) => {
    // ctx já é o AuthContext validado; supabase já respeita RLS como o usuário atual
    // implementação real aqui
  });
}
```

## 8. Ocultar/mostrar interface por papel ou permissão

```tsx
<RoleGate ctx={ctx} role="tenant.admin" fallback={null}>
  <button>Ação restrita a admins</button>
</RoleGate>

<PermissionGate supabase={supabase} ctx={ctx} permission="tenant.members.manage">
  <button>Gerenciar membros</button>
</PermissionGate>
```

**Lembre-se:** isso é só interface. A Server Action por trás precisa se proteger sozinha (seção 7) — nunca confiar que o botão estar escondido é suficiente.

## 9. Diagnosticando "usuário não tem acesso"

Nesta ordem, verifique:

1. `getAuthContext()` retorna o usuário? (sessão válida)
2. `ctx.activeTenantId` está preenchido? (tenant selecionado)
3. A membership do usuário nesse tenant está `active`?
4. A membership tem algum papel em `membership_roles`?
5. Esse papel tem a permissão necessária em `role_permissions`?
6. A permissão existe e está `status = 'active'` em `permissions`?

Qualquer "não" nessa cadeia resulta em acesso negado — é o comportamento esperado (negação por padrão).

## 10. Não fazer

- Não editar migrations já aplicadas (`0001` a `0010`) — sempre criar uma nova.
- Não conceder permissão diretamente a um usuário/membership — sempre via papel.
- Não usar `service_role` para checagens de autorização no fluxo comum da aplicação (isso pula a RLS e o modelo de papéis).
- Não remover `platform.admin`/`tenant.admin` sem substituto — ficaria sem administrador possível.
