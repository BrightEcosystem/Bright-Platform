-- auth-structural-test.sql
-- Validação estrutural da fundação de autenticação (AUTH-001), transacional
-- (ROLLBACK no final, nada persiste). Complementa rls-isolation-test.sql.
--
-- Não simula login real (isso depende de auth.users / sessão de verdade —
-- ver docs/runbooks/RUN-003-Gerenciar-Usuarios-e-Acessos.md, seção 3, para
-- o checklist manual dos fluxos interativos).

begin;

-- 1. Confirma que profiles tem avatar_url.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_url'
  ) then
    raise exception 'Coluna avatar_url ausente em public.profiles.';
  end if;

  raise notice 'profiles.avatar_url existe.';
end $$;

-- 2. Confirma que o trigger de sincronização auth.users -> profiles existe.
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'on_auth_user_created'
      and not tgisinternal
  ) then
    raise exception 'Trigger on_auth_user_created ausente em auth.users.';
  end if;

  raise notice 'Trigger on_auth_user_created existe em auth.users.';
end $$;

-- 3. Confirma que os 4 papéis de sistema mínimos existem.
do $$
declare
  faltando text;
begin
  select string_agg(esperado, ', ')
  into faltando
  from unnest(array['platform.admin', 'tenant.admin', 'project.manager', 'project.viewer']) as esperado
  where not exists (
    select 1 from public.roles r where r.name = esperado and r.tenant_id is null
  );

  if faltando is not null then
    raise exception 'Papeis de sistema ausentes: %', faltando;
  end if;

  raise notice 'Os 4 papeis de sistema minimos existem.';
end $$;

-- 4. Regressão: RLS continua habilitada nas 10 tabelas (garante que nada
--    em AUTH-001 desabilitou RLS acidentalmente).
do $$
declare
  tabelas_sem_rls text;
begin
  select string_agg(relname, ', ')
  into tabelas_sem_rls
  from pg_class
  where relnamespace = 'public'::regnamespace
    and relkind = 'r'
    and relname in (
      'tenants', 'profiles', 'tenant_memberships', 'roles', 'permissions',
      'role_permissions', 'membership_roles', 'products', 'tenant_products', 'audit_logs'
    )
    and not relrowsecurity;

  if tabelas_sem_rls is not null then
    raise exception 'RLS nao habilitada em: %', tabelas_sem_rls;
  end if;

  raise notice 'RLS continua habilitada nas 10 tabelas.';
end $$;

rollback;
