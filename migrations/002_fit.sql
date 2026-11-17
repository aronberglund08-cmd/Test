create table fit_reviews (
  owner text not null,
  garment_id text not null,
  shoulder text not null,
  ease text not null,
  waist text not null,
  length text not null,
  fabric text not null,
  style text not null,
  verdict text not null,
  summary text not null,
  photo_mime text,
  photo_data text,
  updated_at timestamptz not null default now(),
  primary key (owner, garment_id)
);
