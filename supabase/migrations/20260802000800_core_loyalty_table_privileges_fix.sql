-- 20260802000800_core_loyalty_table_privileges_fix.sql
-- CORE-002.1: corrige privilegios de tabela em contas_fidelidade/lancamentos.
--
-- Achado durante a execucao da matriz de testes obrigatorios: a matriz
-- confirmou que INSERT direto de "authenticated" em lancamentos e bloqueado
-- (RLS rejeita corretamente, sem nenhuma politica de INSERT), mas UPDATE e
-- DELETE diretos NAO foram bloqueados -- passaram sem erro, apesar de nenhuma
-- politica de UPDATE/DELETE existir para nenhum dos dois. Investigacao
-- confirmou a causa: o Supabase concede automaticamente TODOS os privilegios
-- de tabela (SELECT/INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES) a
-- anon/authenticated/service_role no momento da criacao de qualquer tabela
-- nova no schema public (o mesmo mecanismo de "alter default privileges" ja
-- identificado para funcoes em 20260802000600). Nao se deve confiar apenas na
-- ausencia de politica de RLS para bloquear escrita -- o privilegio de tabela
-- (GRANT/REVOKE) e uma camada independente e deve ser revogado explicitamente
-- tambem, como reforco (defesa em profundidade), conforme a decisao da
-- Direcao de "revogar permissoes genericas... conceder somente aos papeis
-- necessarios".
--
-- Nenhum cliente (anon ou authenticated) deve ter qualquer privilegio de
-- escrita direta nestas duas tabelas -- toda escrita e exclusivamente via as
-- funcoes security definer (join_tenant_loyalty, alterar_status_conta_fidelidade,
-- criar_lancamento, recalcular_saldo_conta_fidelidade). anon nao tem nenhum
-- caso de uso legitimo aqui (nenhum dado de Conta Fidelidade/lancamento e
-- publico) -- todos os privilegios de anon sao revogados.
--
-- Idempotente: seguro reexecutar.

revoke insert, update, delete, truncate on public.contas_fidelidade from authenticated;
revoke all on public.contas_fidelidade from anon;

revoke insert, update, delete, truncate on public.lancamentos from authenticated;
revoke all on public.lancamentos from anon;
