-- Execute este script inteiro no SQL Editor do seu projeto Supabase
-- (Supabase → seu projeto → SQL Editor → New query → colar e clicar em Run)

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------
-- Tabela: clientes
-- ------------------------------------------------------------------
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nascimento date,
  cpf text,
  telefone text,
  whatsapp text,
  email text,
  cep text,
  endereco text,
  status text not null default 'Ativo' check (status in ('Ativo', 'Inativo')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Tabela: veiculos (um cliente pode ter vários veículos)
-- ------------------------------------------------------------------
create table if not exists veiculos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  marca text not null,
  modelo text not null,
  ano text,
  placa text not null,
  chassi text,
  valor_veiculo numeric(12,2),
  valor_mensal numeric(12,2),
  data_cadastro date,
  status text not null default 'Ativo' check (status in ('Ativo', 'Inativo')),
  codigo_fipe text,
  valor_fipe numeric(12,2),
  created_at timestamptz not null default now()
);
-- ------------------------------------------------------------------
-- Tabela: boletos (ligados a um cliente e a um veículo)
-- ------------------------------------------------------------------
create table if not exists boletos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  veiculo_id uuid not null references veiculos(id) on delete cascade,
  numero text not null,
  data_emissao date,
  data_vencimento date not null,
  valor numeric(12,2) not null,
  data_pagamento date,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Índices para acelerar buscas por nome, CPF e placa
-- ------------------------------------------------------------------
create index if not exists idx_clientes_nome on clientes (lower(nome));
create index if not exists idx_clientes_cpf on clientes (cpf);
create index if not exists idx_veiculos_placa on veiculos (placa);
create index if not exists idx_veiculos_cliente on veiculos (cliente_id);
create index if not exists idx_boletos_cliente on boletos (cliente_id);
create index if not exists idx_boletos_veiculo on boletos (veiculo_id);
create index if not exists idx_boletos_vencimento on boletos (data_vencimento);

-- ------------------------------------------------------------------
-- Row Level Security
--
-- ATENÇÃO: as políticas abaixo liberam leitura e escrita para a chave
-- "anon" (a chave pública usada pelo site). Isso é adequado para uma
-- ferramenta interna cujo link não é divulgado publicamente. Se este
-- site for ficar acessível publicamente, adicione autenticação de
-- usuários no Supabase (Authentication) antes de usar em produção,
-- e troque estas políticas para exigir um usuário autenticado.
-- ------------------------------------------------------------------
alter table clientes enable row level security;
alter table veiculos enable row level security;
alter table boletos enable row level security;

create policy "acesso total clientes" on clientes for all using (true) with check (true);
create policy "acesso total veiculos" on veiculos for all using (true) with check (true);
create policy "acesso total boletos" on boletos for all using (true) with check (true);

-- ------------------------------------------------------------------
-- Migração: se você já rodou este script antes (sem as colunas de
-- Fipe), rode só o bloco abaixo para adicionar as colunas novas sem
-- perder os dados que já existem. Se está criando o banco pela
-- primeira vez, pode ignorar — as colunas já vêm na tabela acima.
-- ------------------------------------------------------------------
alter table veiculos add column if not exists codigo_fipe text;
alter table veiculos add column if not exists valor_fipe numeric(12,2);
alter table clientes add column if not exists cep text;
