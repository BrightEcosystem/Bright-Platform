# RUN-003 — Gerenciar Usuários e Acessos

**Tipo:** Runbook operacional
**Pré-requisito:** `AUTH-001` concluída (migrations `0008`/`0009` aplicadas)

---

## 1. Criar um usuário fictício de desenvolvimento (manual, pelo painel)

O Claude Code **não cria usuários reais automaticamente** — isso é sempre uma ação manual, feita por você:

1. No painel do Supabase, vá em **Authentication → Users → Add user** (ou "Invite").
2. Crie um usuário com e-mail claramente fictício, por exemplo `teste.dev@bright-platform.local`, e uma senha temporária.
3. Ao ser criado em `auth.users`, o trigger `on_auth_user_created` cria automaticamente o `profiles` correspondente — confirme em **Table Editor → profiles**.

## 2. Vincular o usuário fictício a uma empresa

Como ainda não existe UI para isso, faça via **SQL Editor** do painel (nunca via `service_role` no frontend):

```sql
-- 1. Descubra o id do usuário de teste (Table Editor → profiles, ou auth.users)
-- 2. Descubra o id de um tenant existente (Table Editor → tenants)

insert into public.tenant_memberships (tenant_id, profile_id, job_title, status)
values ('<id-do-tenant>', '<id-do-profile-de-teste>', 'Teste', 'active');

-- 3. (opcional) atribuir um papel de sistema
insert into public.membership_roles (membership_id, role_id)
select tm.id, r.id
from public.tenant_memberships tm, public.roles r
where tm.profile_id = '<id-do-profile-de-teste>'
  and r.name = 'tenant.admin';
```

Todo dado criado aqui é fictício e removível — nunca dado real do Enéias ou de cliente.

## 3. Teste controlado (checklist manual)

Com o usuário fictício criado e vinculado, valide manualmente no navegador (`npm run dev`):

- [ ] **Login válido** — e-mail/senha corretos → redireciona para `/dashboard` (ou `/selecionar-empresa` se houver mais de uma empresa).
- [ ] **Login inválido** — senha errada → mensagem "E-mail ou senha incorretos", sem detalhe técnico.
- [ ] **Logout** — botão "Sair" no Header → volta para `/login`, sessão encerrada.
- [ ] **Rota protegida sem sessão** — acessar `/dashboard` sem estar logado (aba anônima) → redireciona para `/login?next=/dashboard`.
- [ ] **Usuário sem membership** — usuário autenticado sem nenhum vínculo ativo → `/sem-acesso`.
- [ ] **Usuário com uma membership** — entra direto no dashboard, sem precisar escolher empresa.
- [ ] **Usuário com múltiplas memberships** — crie um segundo vínculo para o mesmo usuário de teste em outro tenant e confirme que `/selecionar-empresa` lista as duas, e que trocar de empresa (Header → "trocar empresa") funciona.
- [ ] **Tenant inválido** — tente adulterar o cookie `active_tenant_id` no navegador para um UUID aleatório e recarregue uma página da plataforma → deve cair de novo em `/selecionar-empresa` (o valor é revalidado no servidor a cada carregamento, nunca aceito sem checagem).
- [ ] **Membership inativa** — marque a membership de teste como `status = 'suspended'` via SQL Editor e recarregue → o usuário deixa de ver essa empresa (some da lista / vai para `/sem-acesso` se era a única).
- [ ] **Isolamento entre dois tenants** — crie um segundo usuário fictício vinculado só ao outro tenant e confirme (com RLS, consultando via `anon`/sessão real) que um não vê dados do outro.

## 4. Como agir quando um teste falhar

Registre exatamente qual item falhou e o comportamento observado. Não corrija ajustando dados de produção — se for um bug de código, trata-se como qualquer outra tarefa (nova branch/tarefa aprovada); se for dado de teste mal configurado, corrija o dado de teste (ele é descartável).

## 5. Limpando os dados de teste

Quando terminar de validar, remova os dados fictícios (via SQL Editor):

```sql
delete from public.membership_roles where membership_id in (
  select id from public.tenant_memberships where profile_id = '<id-do-profile-de-teste>'
);
delete from public.tenant_memberships where profile_id = '<id-do-profile-de-teste>';
```

Para remover o próprio usuário de autenticação, use **Authentication → Users → (usuário) → Delete** no painel — isso também apaga o `profiles` correspondente via `on delete cascade`.
