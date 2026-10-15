-- Up Migration
create table votes (
  id serial primary key,
  name text not null,
  s_tier text[] not null default '{}',
  a_tier text[] not null default '{}',
  b_tier text[] not null default '{}',
  c_tier text[] not null default '{}',
  d_tier text[] not null default '{}',
  f_tier text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Down Migration
drop table votes;
