-- 20260802000600_core_loyalty_grants_fix.sql
-- CORE-002.1: correcao de privilegios das funcoes de CORE-002.
--
-- Achado durante a validacao pos-aplicacao: "revoke ... from public" (migration
-- 20260802000400) NAO bloqueia anon/authenticated neste projeto, porque o
-- Supabase configura "alter default privileges" para conceder EXECUTE em toda
-- funcao nova do schema public a anon/authenticated/service_role no momento da
-- criacao -- um grant direto a cada papel, independente do pseudo-papel PUBLIC.
-- Revogar de PUBLIC nao revoga de um papel que ja tem grant proprio.
--
-- Corrige os dois desvios encontrados por consulta direta (has_function_privilege):
--   1. anon podia executar as 5 funcoes (nenhuma delas deve ser chamavel por
--      usuario nao autenticado -- todas dependem de auth.uid()).
--   2. authenticated podia executar recalcular_saldo_conta_fidelidade, que por
--      design e de uso exclusivamente interno (chamada apenas por
--      criar_lancamento), sem via de RPC direta para clientes.
--
-- Idempotente: seguro reexecutar.

revoke execute on function public.has_permission(uuid, text) from anon;
revoke execute on function public.join_tenant_loyalty(uuid) from anon;
revoke execute on function public.alterar_status_conta_fidelidade(uuid, text, text) from anon;
revoke execute on function public.recalcular_saldo_conta_fidelidade(uuid) from anon, authenticated;
revoke execute on function public.criar_lancamento(
  uuid, text, text, numeric, text, text, text, text, uuid, text, timestamptz, timestamptz
) from anon;
