-- 0008_profiles_avatar_and_signup_trigger.sql
-- AUTH-001: adiciona avatar_url a profiles e cria a sincronização automática
-- auth.users -> profiles no cadastro de um novo usuário.
-- Idempotente: seguro reexecutar. Não modifica nenhuma migration anterior.

alter table public.profiles
  add column if not exists avatar_url text;

-- Cria (ou atualiza) o profile correspondente sempre que um novo usuário é
-- criado em auth.users. SECURITY DEFINER com search_path fixo porque grava
-- em public.profiles a partir de um trigger no schema auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email,
    'active'
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
