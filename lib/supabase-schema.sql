-- ═══════════════════════════════════════════════════════════════════
-- NOYR — Supabase Schema  (Phase 2)
-- Run this in your Supabase SQL editor to set up the database.
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── collections ─────────────────────────────────────────────────────
create table public.collections (
  id            text primary key,
  title         text not null,
  slug          text not null unique,
  hero_text     text not null,
  banner_image  text,
  description   text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ── products ────────────────────────────────────────────────────────
create table public.products (
  id             text primary key,
  title          text not null,
  slug           text not null unique,
  description    text,
  story          text,
  price          numeric(10,2) not null,
  images         text[] not null default '{}',
  category       text not null,
  collection_id  text not null references public.collections(id) on delete cascade,
  active         boolean not null default true,
  details        text[] not null default '{}',
  created_at     timestamptz not null default now()
);

create index products_collection_idx on public.products(collection_id);
create index products_slug_idx on public.products(slug);

-- ── variants ────────────────────────────────────────────────────────
create table public.variants (
  id          text primary key,
  product_id  text not null references public.products(id) on delete cascade,
  size        text not null,
  color       text not null default 'Black',
  sku         text not null unique,
  price       numeric(10,2) not null,
  stock       integer not null default 0
);

create index variants_product_idx on public.variants(product_id);

-- ── orders ──────────────────────────────────────────────────────────
create table public.orders (
  id              text primary key,
  customer_name   text not null,
  email           text not null,
  phone           text not null,
  address         text not null,
  city            text not null,
  pincode         text not null,
  total           numeric(10,2) not null,
  status          text not null default 'pending'
    check (status in ('pending','payment_received','processing','shipped','delivered','cancelled')),
  payment_status  text not null default 'pending'
    check (payment_status in ('pending','submitted','verified','failed')),
  notes           text,
  tracking_id     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index orders_email_idx   on public.orders(email);
create index orders_status_idx  on public.orders(status);
create index orders_created_idx on public.orders(created_at desc);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger orders_updated_at
before update on public.orders
for each row execute function update_updated_at();

-- ── order_items ─────────────────────────────────────────────────────
create table public.order_items (
  id             text primary key,
  order_id       text not null references public.orders(id) on delete cascade,
  product_id     text not null,
  product_title  text not null,
  variant_id     text not null,
  size           text not null,
  quantity       integer not null check (quantity > 0),
  unit_price     numeric(10,2) not null
);

create index order_items_order_idx on public.order_items(order_id);

-- ── payments ────────────────────────────────────────────────────────
create table public.payments (
  id               text primary key,
  order_id         text not null references public.orders(id) on delete cascade,
  payment_method   text not null default 'UPI',
  transaction_id   text not null,
  screenshot_url   text,
  verified         boolean not null default false,
  verified_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index payments_order_idx on public.payments(order_id);

-- ── journal_posts ────────────────────────────────────────────────────
create table public.journal_posts (
  id            text primary key,
  title         text not null,
  slug          text not null unique,
  excerpt       text,
  body          text not null,
  cover_image   text,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger journal_updated_at
before update on public.journal_posts
for each row execute function update_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────
-- Collections + Products + Variants: public read
alter table public.collections   enable row level security;
alter table public.products      enable row level security;
alter table public.variants      enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.payments      enable row level security;
alter table public.journal_posts enable row level security;

-- Public read policies
create policy "Public read collections"   on public.collections   for select using (active = true);
create policy "Public read products"      on public.products      for select using (active = true);
create policy "Public read variants"      on public.variants      for select using (true);
create policy "Public read journal"       on public.journal_posts for select using (published = true);

-- Orders: anyone can insert, only service role can read/update
create policy "Anyone can create orders"      on public.orders      for insert with check (true);
create policy "Anyone can create order items" on public.order_items for insert with check (true);
create policy "Anyone can create payments"    on public.payments    for insert with check (true);

-- ── Storage bucket ──────────────────────────────────────────────────
-- Run this after creating the schema:
-- insert into storage.buckets (id, name, public) values ('noyr-uploads', 'noyr-uploads', true);

-- ── Seed collections ────────────────────────────────────────────────
insert into public.collections (id, title, slug, hero_text, description) values
('col-001', 'VOID SEASON 01', 'void-season-01', 'DRESSED FOR THE VOID',
 'The inaugural collection. Built for those who move through darkness with intention.'),
('col-002', 'GHOST PROTOCOL', 'ghost-protocol', 'INVISIBLE. INEVITABLE.',
 'Disappear into the noise. Emerge when it matters.');

-- ── Seed products ───────────────────────────────────────────────────
insert into public.products (id, title, slug, description, price, category, collection_id, active, details, images) values
('prod-001','VOID OVERSIZED HOODIE','void-oversized-hoodie',
 'The centrepiece. 450gsm heavyweight fleece. Dropped shoulders. Oversized silhouette. Built to last decades.',
 4999, 'hoodies', 'col-001', true,
 ARRAY['450gsm heavyweight cotton fleece','Oversized dropped-shoulder fit','Reinforced kangaroo pocket',
       'Enzyme washed for softness','Double-stitched stress points','Unisex sizing'],
 ARRAY['/images/hoodie-1.jpg']),
('prod-002','GHOST CARGO PANTS','ghost-cargo-pants',
 'Technical cargo silhouette. Ripstop nylon shell. Twelve utility pockets.',
 5999, 'bottoms', 'col-002', true,
 ARRAY['240gsm ripstop nylon shell','Twelve utility pockets','Adjustable cinch ankles',
       'Hidden zip waistband','Reinforced knee panels','Waterproof coating'],
 ARRAY['/images/cargo-1.jpg']),
('prod-003','SIGNAL TEE','signal-tee',
 '280gsm heavyweight jersey. Boxy fit. Single ink print on chest.',
 2499, 'tops', 'col-001', true,
 ARRAY['280gsm heavyweight cotton jersey','Boxy oversized fit','Single ink chest graphic',
       'Garment dyed','Pre-shrunk','Unisex sizing'],
 ARRAY['/images/tee-1.jpg']),
('prod-004','VOID COACH JACKET','void-coach-jacket',
 'Shell jacket. Windbreaker weight. Clean minimal.',
 7499, 'outerwear', 'col-001', true,
 ARRAY['180gsm polyester shell','Full zip front closure','Elastic cuffs and hem',
       'Two side zip pockets','Packable into chest pocket','Water resistant coating'],
 ARRAY['/images/jacket-1.jpg']);

-- Seed variants
insert into public.variants (id, product_id, size, sku, price, stock) values
('v-001-s','prod-001','S','VOID-HOD-BLK-S',4999,15),
('v-001-m','prod-001','M','VOID-HOD-BLK-M',4999,20),
('v-001-l','prod-001','L','VOID-HOD-BLK-L',4999,18),
('v-001-xl','prod-001','XL','VOID-HOD-BLK-XL',4999,12),
('v-002-s','prod-002','S','GHOST-CRG-BLK-S',5999,12),
('v-002-m','prod-002','M','GHOST-CRG-BLK-M',5999,15),
('v-002-l','prod-002','L','GHOST-CRG-BLK-L',5999,10),
('v-003-s','prod-003','S','SIG-TEE-BLK-S',2499,25),
('v-003-m','prod-003','M','SIG-TEE-BLK-M',2499,30),
('v-003-l','prod-003','L','SIG-TEE-BLK-L',2499,22),
('v-003-xl','prod-003','XL','SIG-TEE-BLK-XL',2499,15),
('v-004-s','prod-004','S','VOID-JKT-BLK-S',7499,8),
('v-004-m','prod-004','M','VOID-JKT-BLK-M',7499,10),
('v-004-l','prod-004','L','VOID-JKT-BLK-L',7499,8);

-- ═══════════════════════════════════════════════════════════════════
-- Phase 3 additions
-- ═══════════════════════════════════════════════════════════════════

-- ── reviews ─────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id               text primary key,
  product_id       text not null,
  customer_name    text not null,
  rating           integer not null check (rating between 1 and 5),
  body             text not null,
  size_purchased   text,
  verified_purchase boolean not null default false,
  approved         boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists reviews_product_idx on public.reviews(product_id);
create index if not exists reviews_approved_idx on public.reviews(approved);

alter table public.reviews enable row level security;
create policy "Public read approved reviews" on public.reviews for select using (approved = true);
create policy "Anyone can submit review" on public.reviews for insert with check (true);

-- ── restock_notifications ───────────────────────────────────────────
create table if not exists public.restock_notifications (
  id          text primary key,
  product_id  text not null,
  variant_id  text not null,
  email       text not null,
  notified    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists restock_product_idx on public.restock_notifications(product_id, variant_id);

alter table public.restock_notifications enable row level security;
create policy "Anyone can subscribe" on public.restock_notifications for insert with check (true);

-- ── referrals ───────────────────────────────────────────────────────
create table if not exists public.referrals (
  email          text primary key,
  name           text not null,
  code           text not null unique,
  uses           integer not null default 0,
  reward_pending boolean not null default false,
  created_at     timestamptz not null default now()
);

alter table public.referrals enable row level security;
create policy "Anyone can create referral" on public.referrals for insert with check (true);

-- tracking_id on orders (if not already present)
alter table public.orders add column if not exists tracking_id text;
