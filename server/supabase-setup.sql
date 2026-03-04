-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Products table
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,
  price       text not null,
  image_url   text not null default '',
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

-- Allow anyone to read products
create policy "Public read products"
  on public.products for select
  using (true);

-- Allow service role to manage products (used by the Express backend)
create policy "Service role insert products"
  on public.products for insert
  with check (true);

create policy "Service role update products"
  on public.products for update
  using (true);

create policy "Service role delete products"
  on public.products for delete
  using (true);


-- Orders table
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  customer_name   text not null,
  phone           text not null,
  address         text not null,
  notes           text not null default '',
  cart            jsonb not null default '[]',
  total           integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Only service role can insert orders
create policy "Service role insert orders"
  on public.orders for insert
  with check (true);

create policy "Service role read orders"
  on public.orders for select
  using (true);


-- Storage bucket: lalen-images (public read)
-- NOTE: Create this bucket in Supabase Dashboard → Storage → New Bucket
-- Name: lalen-images
-- Public: YES (toggle on)
-- Then add this storage policy via Dashboard → Storage → lalen-images → Policies:
--   Allow public read: bucket_id = 'lalen-images'
--   Allow authenticated/service-role upload: bucket_id = 'lalen-images'
