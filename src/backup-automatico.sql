-- Backup automático diário do Nexo (roda dentro do Supabase, todo dia às 03:00 de Brasília)
-- Guarda uma cópia de TODAS as tabelas e mantém os últimos 14 dias. Não altera nenhum dado existente.

create table if not exists backups_diarios (
  id bigserial primary key,
  dia date not null default current_date,
  criado_em timestamptz not null default now(),
  tabela text not null,
  qtd integer not null default 0,
  dados jsonb not null default '[]'::jsonb
);
create index if not exists idx_backups_diarios_dia on backups_diarios (dia);
alter table backups_diarios enable row level security;
drop policy if exists "ver backups (logado)" on backups_diarios;
create policy "ver backups (logado)" on backups_diarios for select to authenticated using (true);

create or replace function public.fazer_backup_diario() returns void
language plpgsql security definer set search_path = public as $$
declare t record;
begin
  delete from backups_diarios where dia = current_date;
  for t in
    select tablename from pg_tables
    where schemaname = 'public' and tablename <> 'backups_diarios' and tablename not like 'backup\_%'
  loop
    execute format(
      'insert into backups_diarios (tabela, qtd, dados) select %L, count(*), coalesce(jsonb_agg(to_jsonb(x)), ''[]''::jsonb) from public.%I x',
      t.tablename, t.tablename);
  end loop;
  delete from backups_diarios where dia < current_date - 14;
end $$;
revoke execute on function public.fazer_backup_diario() from public, anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule('backup-diario-nexo', '0 6 * * *', 'select public.fazer_backup_diario()');

-- primeira cópia agora mesmo
select public.fazer_backup_diario();
