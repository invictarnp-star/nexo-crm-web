-- Sistema de perfis de acesso (Administrador / Operador).
-- Execute este script inteiro no SQL Editor do seu projeto Supabase
-- (Supabase → seu projeto → SQL Editor → New query → colar e clicar em Run).
-- Não apaga nenhum dado — só cria a tabela nova e ajusta permissões.

create table if not exists perfis (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  role text not null default 'operador' check (role in ('admin', 'operador')),
  created_at timestamptz not null default now()
);

-- Função auxiliar: verifica se o usuário logado é administrador.
-- "security definer" evita problema de recursão nas políticas de segurança
-- (sem isso, a política de "perfis" precisaria consultar "perfis" para
-- decidir se pode consultar "perfis").
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from perfis where user_id = auth.uid() and role = 'admin');
$$;

alter table perfis enable row level security;

drop policy if exists "ver proprio perfil ou todos se admin" on perfis;
create policy "ver proprio perfil ou todos se admin" on perfis
  for select to authenticated
  using (user_id = auth.uid() or is_admin());

drop policy if exists "somente admin gerencia perfis" on perfis;
create policy "somente admin gerencia perfis" on perfis
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ------------------------------------------------------------------
-- Restringe Consultoras e Adesões a administradores.
-- (Clientes, Veículos, Boletos, Comissões e Cotação de seguros
-- continuam liberados para qualquer usuário logado — operador incluso —
-- o mesmo controle é aplicado no menu do sistema.)
-- ------------------------------------------------------------------
drop policy if exists "acesso total consultoras" on consultoras;
drop policy if exists "acesso logado consultoras" on consultoras;
drop policy if exists "somente admin consultoras" on consultoras;
create policy "somente admin consultoras" on consultoras for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "acesso total adesoes" on adesoes;
drop policy if exists "acesso logado adesoes" on adesoes;
drop policy if exists "somente admin adesoes" on adesoes;
create policy "somente admin adesoes" on adesoes for all to authenticated using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------------
-- IMPORTANTE — passo manual único (só da primeira vez):
-- Depois de rodar este script, transforme sua própria conta em
-- administrador rodando o comando abaixo, trocando o e-mail pelo que
-- você usa para logar no sistema:
--
--   insert into perfis (user_id, nome, email, role)
--   select id, 'Seu nome', email, 'admin'
--   from auth.users
--   where email = 'seu-email-de-login@aqui.com'
--   on conflict (user_id) do update set role = 'admin';
--
-- Sem esse passo, ninguém tem perfil "admin" ainda e o sistema todo
-- fica visível só com o menu reduzido de operador (a tela "Usuários"
-- some do menu, pois só administradores a veem).
-- ------------------------------------------------------------------
