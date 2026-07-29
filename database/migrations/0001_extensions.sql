-- 0001_extensions.sql
-- Extensões necessárias para a fundação de dados da Bright Platform.
-- Idempotente: seguro reexecutar.

create extension if not exists "pgcrypto";
