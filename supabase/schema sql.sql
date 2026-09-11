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
  sexo text,
  cpf text,
  cnh_numero text,
  cnh_emissao date,
  cnh_validade date,
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
  ano_fabricacao text,
  placa text not null,
  renavam text,
  chassi text,
  cor text,
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
-- ------------------------------------------------------------------
-- Tabela: seguradoras
-- ------------------------------------------------------------------
create table if not exists seguradoras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Tabela: planos (tabela de preços/benefícios de cada seguradora)
-- ------------------------------------------------------------------
create table if not exists planos (
  id uuid primary key default gen_random_uuid(),
  seguradora_id uuid not null references seguradoras(id) on delete cascade,
  nome text not null,
  valor_mensal numeric(12,2),
  valor_franquia numeric(12,2),
  beneficios text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Tabela: cotacoes (cotação gerada para um cliente/veículo)
-- ------------------------------------------------------------------
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
create policy "acesso total seguradoras" on seguradoras for all using (true) with check (true);
create policy "acesso total planos" on planos for all using (true) with check (true);
create policy "acesso total cotacoes" on cotacoes for all using (true) with check (true);

alter table veiculos add column if not exists codigo_fipe text;
alter table veiculos add column if not exists valor_fipe numeric(12,2);
alter table clientes add column if not exists cep text;

-- Migração: campos adicionados para CNH, sexo, Renavam, ano de fabricação e cor.
alter table clientes add column if not exists sexo text;
alter table clientes add column if not exists cnh_numero text;
alter table clientes add column if not exists cnh_emissao date;
alter table clientes add column if not exists cnh_validade date;
alter table veiculos add column if not exists ano_fabricacao text;
alter table veiculos add column if not exists renavam text;
alter table veiculos add column if not exists cor text;

-- ------------------------------------------------------------------
-- Migração: campo "Nosso Número" no boleto (controle único usado como
-- chave de conciliação ao importar o relatório de baixa da seguradora/
-- corretora). Índice único parcial: permite vários boletos sem Nosso
-- Número (NULL), mas não permite dois boletos com o mesmo Nosso Número.
-- ------------------------------------------------------------------
alter table boletos add column if not exists nosso_numero text;
create unique index if not exists idx_boletos_nosso_numero on boletos (nosso_numero) where nosso_numero is not null;

-- ------------------------------------------------------------------
-- Tabela: links_uteis (atalhos para os sistemas das seguradoras/
-- corretoras e outros portais usados no dia a dia, com CRUD no Nexo)
-- ------------------------------------------------------------------
create table if not exists links_uteis (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  url text not null,
  observacao text,
  created_at timestamptz not null default now()
);
create unique index if not exists idx_links_uteis_url on links_uteis (url);
alter table links_uteis enable row level security;
create policy "acesso total links_uteis" on links_uteis for all using (true) with check (true);

-- Seed com os links já em uso (não duplica se já existir a mesma URL)
insert into links_uteis (nome, url, observacao) values
  ('SGA Hinova (Invicta Mais)', 'https://sga.hinova.com.br/sga/sgav4_invicta/v5/login.php', 'Sistema do consórcio/associação'),
  ('Power CRM', 'https://app.powercrm.com.br/login', null),
  ('Porto Seguro — Corretor Online', 'https://corretor.portoseguro.com.br/corretoronline', null),
  ('Suhai Seguradora — Cotação', 'https://suhaiseguradoracotacao.com.br/login', null),
  ('Ituran — Vendas', 'https://vendas.ituran.com.br/sale', null),
  ('Tokio Marine — Portal Parceiros', 'https://ssoportais3.tokiomarine.com.br/openam/XUI/?realm=TOKIOLFR&goto=http://portalparceiros.tokiomarine.com.br/#login/', null)
on conflict (url) do nothing;
