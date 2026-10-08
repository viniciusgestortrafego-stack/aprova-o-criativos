-- Aprovação de criativos. Aplicar com: node --env-file=.env.local db/aplicar.mjs
create table if not exists rodadas (
  id uuid primary key,
  cliente text not null,
  nome text not null,
  criado_em timestamptz not null default now()
);

create table if not exists itens (
  id uuid primary key,
  rodada_id uuid not null references rodadas(id) on delete cascade,
  ordem int not null,
  tipo text not null check (tipo in ('instagram', 'drive')),
  url text not null,
  codigo text not null,
  observacao text not null default ''
);
create index if not exists itens_rodada on itens (rodada_id, ordem);

-- Cada clique é uma linha nova; a resposta que vale é a mais recente do item.
create table if not exists respostas (
  id bigserial primary key,
  item_id uuid not null references itens(id) on delete cascade,
  nome text not null,
  decisao text not null check (decisao in ('aprovado', 'ajustar', 'reprovado')),
  comentario text not null default '',
  criado_em timestamptz not null default now()
);
create index if not exists respostas_item on respostas (item_id, criado_em desc);
