-- 0001_development_seed.sql
-- Dados de desenvolvimento, fictícios, apenas para uso local.
-- Não representa nenhuma empresa real (nenhum dado do Enéias ou de qualquer
-- cliente real da Bright Telecom entra no CORE — ver BE-002 §3).
--
-- ATENÇÃO: a linha de "profiles" abaixo depende de um usuário existente em
-- auth.users com o mesmo UUID. Este seed não cria esse usuário — crie-o antes
-- via Supabase Auth (dashboard ou API de admin) usando o UUID indicado, ou
-- ajuste o UUID para um usuário real do seu ambiente local antes de rodar.

-- Catálogo de produtos Bright (BE-002 §3).
insert into public.products (code, name, description, status)
values
  ('crm', 'CRM', 'Gestão de relacionamento com clientes', 'active'),
  ('licitacoes', 'Licitações', 'Gestão de licitações e propostas', 'active'),
  ('atendimento-ia', 'Atendimento IA', 'Atendimento automatizado com agentes de IA', 'active'),
  ('automacoes', 'Automações', 'Workflows e automações de processo', 'active'),
  ('financeiro', 'Financeiro', 'Gestão financeira', 'active'),
  ('analytics', 'Analytics', 'Relatórios e indicadores', 'active'),
  ('delivery', 'Delivery', 'Gestão de entregas', 'active')
on conflict (code) do nothing;

-- Papel de sistema (global, não pertence a nenhuma empresa).
insert into public.roles (tenant_id, name, is_system)
values
  (null, 'super_admin', true)
on conflict (name) where tenant_id is null do nothing;

-- Empresa de demonstração (fictícia).
insert into public.tenants (id, name, slug, status)
values
  ('00000000-0000-0000-0000-000000000001', 'Empresa Demo', 'empresa-demo', 'active')
on conflict (slug) do nothing;

-- Perfil de demonstração — requer auth.users com este UUID (ver aviso acima).
insert into public.profiles (id, full_name, email, status)
values
  ('00000000-0000-0000-0000-000000000002', 'Usuário Demo', 'demo@bright-platform.local', 'active')
on conflict (id) do nothing;

-- Vínculo do perfil de demonstração com a empresa de demonstração.
insert into public.tenant_memberships (tenant_id, profile_id, job_title, status)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Administrador',
    'active'
  )
on conflict (tenant_id, profile_id) do nothing;

-- Papel de empresa para o produto CRM habilitado em modo trial.
insert into public.tenant_products (tenant_id, product_id, status, plan, activated_at)
select
  '00000000-0000-0000-0000-000000000001',
  p.id,
  'active',
  'trial',
  now()
from public.products p
where p.code = 'crm'
on conflict (tenant_id, product_id) do nothing;
