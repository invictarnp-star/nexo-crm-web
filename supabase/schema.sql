-- Versão à prova de erro "already exists". Pode rodar quantas vezes
-- quiser, mesmo que uma tentativa anterior tenha parado no meio.

create table if not exists seguradoras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

create table if not exists planos (
  id uuid primary key default gen_random_uuid(),
  seguradora_id uuid not null references seguradoras(id) on delete cascade,
  nome text not null,
  valor_mensal numeric(12,2),
  valor_franquia numeric(12,2),
  beneficios text,
  created_at timestamptz not null default now()
);

create table if not exists cotacoes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  veiculo_id uuid references veiculos(id) on delete set null,
  seguradora_id uuid references seguradoras(id) on delete set null,
  plano_id uuid references planos(id) on delete set null,
  valor numeric(12,2),
  observacoes text,
  data_cotacao date,
  created_at timestamptz not null default now()
);

alter table seguradoras enable row level security;
alter table planos enable row level security;
alter table cotacoes enable row level security;

drop policy if exists "acesso total seguradoras" on seguradoras;
create policy "acesso total seguradoras" on seguradoras for all using (true) with check (true);

drop policy if exists "acesso total planos" on planos;
create policy "acesso total planos" on planos for all using (true) with check (true);

drop policy if exists "acesso total cotacoes" on cotacoes;
create policy "acesso total cotacoes" on cotacoes for all using (true) with check (true);

alter table clientes add column if not exists sexo text;
alter table clientes add column if not exists cnh_numero text;
alter table clientes add column if not exists cnh_emissao date;
alter table clientes add column if not exists cnh_validade date;
alter table veiculos add column if not exists ano_fabricacao text;
alter table veiculos add column if not exists renavam text;
alter table veiculos add column if not exists cor text;
