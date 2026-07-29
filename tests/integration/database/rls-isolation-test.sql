-- rls-isolation-test.sql
-- Teste transacional de isolamento multiempresa (RLS) — BE-003 §5.
--
-- STATUS ATUAL: validação estrutural apenas. Este arquivo testa que as
-- políticas de RLS existem e estão habilitadas nas tabelas esperadas.
-- Ele NÃO simula ainda dois usuários autenticados reais fazendo SELECT
-- em contextos distintos (auth.uid() diferente cada um), porque a
-- autenticação real do Supabase ainda não foi implementada (fora do
-- escopo de SUP-003 — ver AUTH-001).
--
-- Quando AUTH-001 existir, este arquivo deve ser expandido para:
--   1. criar dois usuários de teste via auth.admin (ou fixtures de teste);
--   2. usar `set local role authenticated; set local request.jwt.claims = ...`
--      (ou o helper de teste do Supabase) para simular cada usuário;
--   3. confirmar que o SELECT de um tenant não retorna linhas do outro.
--
-- Este teste roda inteiro dentro de uma transação com ROLLBACK no final —
-- nenhum dado fica persistido, mesmo os fictícios criados aqui.

begin;

-- 1. Dados fictícios temporários de duas empresas (não é dado do Enéias).
insert into public.tenants (id, name, slug, status)
values
  ('11111111-1111-1111-1111-111111111111', 'Tenant Teste A', 'tenant-teste-a-rls', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Tenant Teste B', 'tenant-teste-b-rls', 'active');

-- 2. Confirma que RLS está habilitada em todas as tabelas esperadas.
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

  raise notice 'RLS habilitada em todas as 10 tabelas esperadas.';
end $$;

-- 3. Confirma que existe ao menos uma política de isolamento por tenant_id
--    nas tabelas que possuem tenant_id.
do $$
declare
  tabelas_sem_policy text;
begin
  select string_agg(t.relname, ', ')
  into tabelas_sem_policy
  from pg_class t
  where t.relnamespace = 'public'::regnamespace
    and t.relkind = 'r'
    and t.relname in ('tenants', 'tenant_memberships', 'tenant_products', 'audit_logs')
    and not exists (
      select 1 from pg_policies p
      where p.schemaname = 'public' and p.tablename = t.relname
    );

  if tabelas_sem_policy is not null then
    raise exception 'Sem nenhuma politica RLS em: %', tabelas_sem_policy;
  end if;

  raise notice 'Todas as tabelas com tenant_id possuem ao menos uma politica RLS.';
end $$;

-- 4. Confirma que a função helper de isolamento existe e é SECURITY DEFINER
--    com search_path fixo (evita RLS bypass via search_path hijacking).
do $$
declare
  is_secdef boolean;
  tem_search_path boolean;
begin
  select p.prosecdef,
         exists (
           select 1 from unnest(p.proconfig) cfg where cfg like 'search_path=%'
         )
  into is_secdef, tem_search_path
  from pg_proc p
  where p.pronamespace = 'public'::regnamespace
    and p.proname = 'is_tenant_member';

  if is_secdef is null then
    raise exception 'Funcao is_tenant_member nao encontrada.';
  end if;

  if not is_secdef or not tem_search_path then
    raise exception 'is_tenant_member nao esta configurada com security definer + search_path fixo.';
  end if;

  raise notice 'is_tenant_member configurada corretamente (security definer + search_path fixo).';
end $$;

-- Nada é persistido — desfaz os dois tenants fictícios e qualquer outra alteração.
rollback;
