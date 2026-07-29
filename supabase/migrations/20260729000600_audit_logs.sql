-- 0006_audit_logs.sql
-- Registro de auditoria (rastreabilidade obrigatória — BE-001 §4).
-- Idempotente: seguro reexecutar.

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants (id) on delete set null,
  profile_id uuid references public.profiles (id) on delete set null,
  action text not null,
  resource text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_tenant_id_idx on public.audit_logs (tenant_id);
create index if not exists audit_logs_profile_id_idx on public.audit_logs (profile_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at);
create index if not exists audit_logs_resource_idx on public.audit_logs (resource);
