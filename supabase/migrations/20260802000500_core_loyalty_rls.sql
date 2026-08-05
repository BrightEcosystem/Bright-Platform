-- 20260802000500_core_loyalty_rls.sql
-- CORE-002.1: RLS completa para contas_fidelidade / lancamentos, conforme a
-- Matriz Oficial (IDENT-001 §7) e o plano tecnico CORE-002.1 v0.3.0 §5.
-- Apenas SELECT tem politica -- ausencia de politica de INSERT/UPDATE/DELETE
-- bloqueia essas operacoes por padrao para authenticated/anon (nenhuma linha
-- e criada/alterada/apagada fora das funcoes security definer da migration
-- anterior). Idempotente: seguro reexecutar.

alter table public.contas_fidelidade enable row level security;

drop policy if exists contas_fidelidade_select_self on public.contas_fidelidade;
create policy contas_fidelidade_select_self
  on public.contas_fidelidade
  for select
  using (consumer_id = auth.uid());

drop policy if exists contas_fidelidade_select_tenant_staff on public.contas_fidelidade;
create policy contas_fidelidade_select_tenant_staff
  on public.contas_fidelidade
  for select
  using (
    public.is_tenant_member(tenant_id)
    and public.has_permission(tenant_id, 'tenant.consumers.view')
  );

alter table public.lancamentos enable row level security;

drop policy if exists lancamentos_select_self on public.lancamentos;
create policy lancamentos_select_self
  on public.lancamentos
  for select
  using (
    exists (
      select 1 from public.contas_fidelidade cf
      where cf.id = lancamentos.conta_fidelidade_id
        and cf.consumer_id = auth.uid()
    )
  );

drop policy if exists lancamentos_select_tenant_staff on public.lancamentos;
create policy lancamentos_select_tenant_staff
  on public.lancamentos
  for select
  using (
    public.is_tenant_member(tenant_id)
    and public.has_permission(tenant_id, 'tenant.consumers.view')
  );
