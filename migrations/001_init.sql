create table profiles (
  owner text primary key,
  size_system text not null default 'unisex',
  fit text not null default 'normal',
  height_cm integer,
  chest_cm integer,
  waist_cm integer,
  hips_cm integer,
  shoulder_cm integer,
  inseam_cm integer,
  sleeve_cm integer,
  neck_cm integer,
  shoe_eu numeric,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create table style_profiles (
  owner text primary key,
  aesthetics jsonb not null default '[]',
  palette jsonb not null default '[]',
  avoid jsonb not null default '[]',
  month_budget_sek integer,
  item_budget_sek integer,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create table style_images (
  owner text not null,
  id text not null,
  kind text not null,
  caption text not null default '',
  mime text not null,
  data text not null,
  created_at timestamptz not null default now(),
  primary key (owner, id)
);

create table garments (
  owner text not null,
  id text not null,
  name text not null,
  category text not null,
  subcategory text not null,
  color text not null,
  patterned boolean not null default false,
  material text not null default '',
  brand text not null default '',
  seasons jsonb not null default '["alla"]',
  formality text not null default 'vardag',
  silhouette text not null default 'normal',
  condition text not null default 'bra',
  price_sek integer,
  fit_note text not null default '',
  notes text not null default '',
  favorite boolean not null default false,
  in_rotation boolean not null default true,
  source text not null default 'own',
  photo_mime text,
  photo_data text,
  created_at timestamptz not null default now(),
  primary key (owner, id)
);

create index garments_owner_idx on garments (owner);

create table outfits (
  owner text not null,
  id text not null,
  title text not null,
  occasion text not null,
  why text not null default '',
  piece_ids jsonb not null,
  created_at timestamptz not null default now(),
  primary key (owner, id)
);

create table wishes (
  owner text not null,
  id text not null,
  title text not null,
  brand text not null default '',
  reason text not null default '',
  price_hint text not null default '',
  created_at timestamptz not null default now(),
  primary key (owner, id)
);
