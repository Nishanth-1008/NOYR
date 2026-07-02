-- ═══════════════════════════════════════════════════════════════════
-- NOYR — Supabase Schema  (Phase 4)
-- Run this in your Supabase SQL editor to set up the database.
-- If upgrading from Phase 2/3, run the ALTER TABLE statements at the bottom.
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── collections ─────────────────────────────────────────────────────
create table if not exists public.collections (
  id            text primary key,
  title         text not null,
  slug          text not null unique,
  hero_text     text not null default '',
  banner_image  text,
  description   text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ── products ────────────────────────────────────────────────────────
create table if not exists public.products (
  id             text primary key,
  title          text not null,
  slug           text not null unique,
  description    text,
  story          text,
  price          numeric(10,2) not null,
  images         text[] not null default '{}',
  category       text not null,
  collection_id  text references public.collections(id) on delete set null,
  active         boolean not null default true,
  limited        boolean not null default false,
  drop_date      timestamptz,
  details        text[] not null default '{}',
  created_at     timestamptz not null default now()
);

create index if not exists products_collection_idx on public.products(collection_id);
create index if not exists products_slug_idx on public.products(slug);

-- ── variants ────────────────────────────────────────────────────────
create table if not exists public.variants (
  id          text primary key,
  product_id  text not null references public.products(id) on delete cascade,
  size        text not null,
  color       text not null default 'Black',
  sku         text not null unique,
  price       numeric(10,2) not null,
  stock       integer not null default 0
);

create index if not exists variants_product_idx on public.variants(product_id);

-- ── orders ──────────────────────────────────────────────────────────
create table if not exists public.orders (
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

create index if not exists orders_email_idx   on public.orders(email);
create index if not exists orders_status_idx  on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
before update on public.orders
for each row execute function update_updated_at();

-- ── order_items ─────────────────────────────────────────────────────
create table if not exists public.order_items (
  id             text primary key,
  order_id       text not null references public.orders(id) on delete cascade,
  product_id     text not null,
  product_title  text not null,
  variant_id     text not null,
  size           text not null,
  quantity       integer not null check (quantity > 0),
  unit_price     numeric(10,2) not null
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- ── payments ────────────────────────────────────────────────────────
create table if not exists public.payments (
  id               text primary key,
  order_id         text not null references public.orders(id) on delete cascade,
  payment_method   text not null default 'UPI',
  transaction_id   text not null,
  screenshot_url   text,
  verified         boolean not null default false,
  verified_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists payments_order_idx on public.payments(order_id);

-- ── journal_posts ────────────────────────────────────────────────────
create table if not exists public.journal_posts (
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

drop trigger if exists journal_updated_at on public.journal_posts;
create trigger journal_updated_at
before update on public.journal_posts
for each row execute function update_updated_at();

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

-- ── referrals ───────────────────────────────────────────────────────
create table if not exists public.referrals (
  email          text primary key,
  name           text not null,
  code           text not null unique,
  uses           integer not null default 0,
  reward_pending boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ── coupons ─────────────────────────────────────────────────────────
create table if not exists public.coupons (
  code        text primary key,
  type        text not null check (type in ('percent', 'flat')),
  value       numeric(10,2) not null,
  max_uses    integer not null default 100,
  used_count  integer not null default 0,
  active      boolean not null default true,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

-- ── newsletter_subscribers ──────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  email       text primary key,
  interests   text[] not null default '{}',
  subscribed  boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────────────
alter table if exists public.collections            enable row level security;
alter table if exists public.products              enable row level security;
alter table if exists public.variants              enable row level security;
alter table if exists public.orders               enable row level security;
alter table if exists public.order_items          enable row level security;
alter table if exists public.payments             enable row level security;
alter table if exists public.journal_posts        enable row level security;
alter table if exists public.reviews              enable row level security;
alter table if exists public.restock_notifications enable row level security;
alter table if exists public.referrals            enable row level security;
alter table if exists public.coupons              enable row level security;
alter table if exists public.newsletter_subscribers enable row level security;

-- Drop and recreate policies (idempotent)
drop policy if exists "Public read collections"   on public.collections;
drop policy if exists "Public read products"      on public.products;
drop policy if exists "Public read variants"      on public.variants;
drop policy if exists "Public read journal"       on public.journal_posts;
drop policy if exists "Anyone can create orders"      on public.orders;
drop policy if exists "Anyone can create order items" on public.order_items;
drop policy if exists "Anyone can create payments"    on public.payments;
drop policy if exists "Public read approved reviews"  on public.reviews;
drop policy if exists "Anyone can submit review"      on public.reviews;
drop policy if exists "Anyone can subscribe"          on public.restock_notifications;
drop policy if exists "Anyone can create referral"    on public.referrals;
drop policy if exists "Anyone can subscribe newsletter" on public.newsletter_subscribers;

create policy "Public read collections"   on public.collections   for select using (active = true);
create policy "Public read products"      on public.products      for select using (active = true);
create policy "Public read variants"      on public.variants      for select using (true);
create policy "Public read journal"       on public.journal_posts for select using (published = true);
create policy "Anyone can create orders"      on public.orders      for insert with check (true);
create policy "Anyone can create order items" on public.order_items for insert with check (true);
create policy "Anyone can create payments"    on public.payments    for insert with check (true);
create policy "Public read approved reviews"  on public.reviews for select using (approved = true);
create policy "Anyone can submit review"      on public.reviews for insert with check (true);
create policy "Anyone can subscribe"          on public.restock_notifications for insert with check (true);
create policy "Anyone can create referral"    on public.referrals for insert with check (true);
create policy "Anyone can subscribe newsletter" on public.newsletter_subscribers for insert with check (true);

-- ── Storage bucket ──────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('noyr-uploads', 'noyr-uploads', true)
on conflict do nothing;
create policy "Public read uploads"   on storage.objects for select using (bucket_id = 'noyr-uploads');
create policy "Authenticated upload"  on storage.objects for insert with check (bucket_id = 'noyr-uploads');

-- ══════════════════════════════════════════════════════════════════
-- UPGRADE MIGRATIONS (run if upgrading from Phase 2/3)
-- ══════════════════════════════════════════════════════════════════
alter table if exists public.products
  add column if not exists limited   boolean not null default false,
  add column if not exists drop_date timestamptz,
  add column if not exists story     text;

alter table if exists public.products
  alter column collection_id drop not null;

alter table if exists public.orders
  add column if not exists tracking_id text;

-- ── Seed collections ────────────────────────────────────────────────
insert into public.collections (id, title, slug, hero_text, description) values
('col-001', 'VOID SEASON 01', 'void-season-01', 'DRESSED FOR THE VOID',
 'The inaugural collection. Built for those who move through darkness with intention.'),
('col-002', 'GHOST PROTOCOL', 'ghost-protocol', 'INVISIBLE. INEVITABLE.',
 'Disappear into the noise. Emerge when it matters.')
on conflict (id) do nothing;

-- ── Seed products ───────────────────────────────────────────────────
insert into public.products (id, title, slug, description, story, price, category, collection_id, active, limited, details, images) values
('prod-001','VOID OVERSIZED HOODIE','void-oversized-hoodie',
 'The centrepiece. 450gsm heavyweight fleece. Dropped shoulders. Oversized silhouette. Built to last decades.',
 'The VOID HOODIE started as a sketch on a black wall at 3AM. It became the piece that defines the brand. No logos. No excess. Just the weight of intention.',
 4999, 'hoodies', 'col-001', true, false,
 ARRAY['450gsm heavyweight cotton fleece','Oversized dropped-shoulder fit','Reinforced kangaroo pocket',
       'Enzyme washed for softness','Double-stitched stress points','Unisex sizing'],
 ARRAY['/images/hoodie-1.jpg','/images/hoodie-2.jpg','/images/hoodie-3.jpg']),
('prod-002','GHOST CARGO PANTS','ghost-cargo-pants',
 'Technical cargo silhouette. Ripstop nylon shell. Twelve utility pockets.',
 'Designed for the city. Built for somewhere beyond it. The GHOST CARGO is utility dressed as art.',
 5999, 'bottoms', 'col-002', true, false,
 ARRAY['240gsm ripstop nylon shell','Twelve utility pockets','Adjustable cinch ankles',
       'Hidden zip waistband','Reinforced knee panels','Waterproof coating'],
 ARRAY['/images/cargo-1.jpg','/images/cargo-2.jpg']),
('prod-003','SIGNAL TEE','signal-tee',
 '280gsm heavyweight jersey. Boxy fit. Single ink print on chest.',
 'A tee should feel like armour. The SIGNAL TEE weighs more than most. It feels like it means something.',
 2499, 'tops', 'col-001', true, false,
 ARRAY['280gsm heavyweight cotton jersey','Boxy oversized fit','Single ink chest graphic',
       'Garment dyed','Pre-shrunk','Unisex sizing'],
 ARRAY['/images/tee-1.jpg','/images/tee-2.jpg']),
('prod-004','VOID COACH JACKET','void-coach-jacket',
 'Shell jacket. Windbreaker weight. Clean minimal.',
 'Designed for transitions. The VOID COACH JACKET is the layer you reach for when everything else is too much.',
 7499, 'outerwear', 'col-001', true, false,
 ARRAY['180gsm polyester shell','Full zip front closure','Elastic cuffs and hem',
       'Two side zip pockets','Packable into chest pocket','Water resistant coating'],
 ARRAY['/images/jacket-1.jpg'])
on conflict (id) do nothing;

insert into public.variants (id, product_id, size, color, sku, price, stock) values
('v-001-xs','prod-001','XS','Black','VOID-HOD-BLK-XS',4999,10),
('v-001-s','prod-001','S','Black','VOID-HOD-BLK-S',4999,15),
('v-001-m','prod-001','M','Black','VOID-HOD-BLK-M',4999,20),
('v-001-l','prod-001','L','Black','VOID-HOD-BLK-L',4999,18),
('v-001-xl','prod-001','XL','Black','VOID-HOD-BLK-XL',4999,12),
('v-001-xxl','prod-001','XXL','Black','VOID-HOD-BLK-XXL',4999,8),
('v-002-xs','prod-002','XS','Black','GHOST-CRG-BLK-XS',5999,8),
('v-002-s','prod-002','S','Black','GHOST-CRG-BLK-S',5999,12),
('v-002-m','prod-002','M','Black','GHOST-CRG-BLK-M',5999,15),
('v-002-l','prod-002','L','Black','GHOST-CRG-BLK-L',5999,10),
('v-002-xl','prod-002','XL','Black','GHOST-CRG-BLK-XL',5999,6),
('v-003-xs','prod-003','XS','Black','SIG-TEE-BLK-XS',2499,20),
('v-003-s','prod-003','S','Black','SIG-TEE-BLK-S',2499,25),
('v-003-m','prod-003','M','Black','SIG-TEE-BLK-M',2499,30),
('v-003-l','prod-003','L','Black','SIG-TEE-BLK-L',2499,22),
('v-003-xl','prod-003','XL','Black','SIG-TEE-BLK-XL',2499,15),
('v-004-s','prod-004','S','Black','VOID-JKT-BLK-S',7499,8),
('v-004-m','prod-004','M','Black','VOID-JKT-BLK-M',7499,10),
('v-004-l','prod-004','L','Black','VOID-JKT-BLK-L',7499,8)
on conflict (id) do nothing;

-- ── profiles table + auth trigger ──────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  avatar_url    text,
  referral_code text unique,
  created_at    timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- orders.user_id 
alter table public.orders add column if not exists user_id uuid references auth.users(id);

-- RLS Select policies for users to fetch their own order history
create policy "Users read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users read own order items" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Users read own payments" on public.payments for select using (exists (select 1 from public.orders where orders.id = payments.order_id and orders.user_id = auth.uid()));

