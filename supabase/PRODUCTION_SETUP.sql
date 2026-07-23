-- =============================================================================
-- DAOG Tech Hub — PRODUCTION SUPABASE DATABASE & STORAGE SETUP
-- Run via Supabase Management API or Dashboard SQL Editor
-- =============================================================================

-- ── 1. Extensions ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 2. Enums ─────────────────────────────────────────────────────────────────
do $$ begin create type user_role        as enum ('customer','admin','vendor');        exception when duplicate_object then null; end $$;
do $$ begin create type gadget_type      as enum ('phone','laptop','game','tablet','accessory'); exception when duplicate_object then null; end $$;
do $$ begin create type jersey_type      as enum ('club','country','nfl','basketball','retro'); exception when duplicate_object then null; end $$;
do $$ begin create type jersey_category  as enum ('current','retro','special');        exception when duplicate_object then null; end $$;
do $$ begin create type car_condition    as enum ('Brand New','Used - Like New','Used - Excellent','Used - Good'); exception when duplicate_object then null; end $$;
do $$ begin create type estate_type      as enum ('house','land','apartment','commercial'); exception when duplicate_object then null; end $$;
do $$ begin create type order_status     as enum ('pending','awaiting_payment','payment_submitted','confirmed','processing','shipped','delivered','cancelled','refunded'); exception when duplicate_object then null; end $$;
do $$ begin alter type order_status add value 'awaiting_payment'; exception when duplicate_object then null; end $$;
do $$ begin alter type order_status add value 'payment_submitted'; exception when duplicate_object then null; end $$;
do $$ begin create type swap_status      as enum ('pending','under_review','approved','rejected','completed'); exception when duplicate_object then null; end $$;
do $$ begin create type product_category as enum ('gadget','jersey','car','realestate'); exception when duplicate_object then null; end $$;

-- ── 3. Helper Functions ──────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- Security definer function to safely check admin role without RLS infinite recursion
create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = user_id and role = 'admin'
  );
$$;

-- ── 4. Profiles Table ────────────────────────────────────────────────────────
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  first_name    text        not null default '',
  last_name     text        not null default '',
  email         text,
  phone         text,
  avatar_url    text,
  role          user_role   not null default 'customer',
  address_line1 text,
  address_line2 text,
  city          text,
  state         text,
  country       text        default 'Nigeria',
  is_active     boolean     not null default true,
  postal_code   text,
  bio           text,
  is_verified   boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Ensure all columns exist if table was partially created previously
alter table profiles add column if not exists first_name     text        not null default '';
alter table profiles add column if not exists last_name      text        not null default '';
alter table profiles add column if not exists email          text;
alter table profiles add column if not exists phone          text;
alter table profiles add column if not exists avatar_url     text;
alter table profiles add column if not exists role           user_role   not null default 'customer';
alter table profiles add column if not exists address_line1  text;
alter table profiles add column if not exists address_line2  text;
alter table profiles add column if not exists city             text;
alter table profiles add column if not exists state            text;
alter table profiles add column if not exists country          text        default 'Nigeria';
alter table profiles add column if not exists is_active        boolean     not null default true;
alter table profiles add column if not exists postal_code      text;
alter table profiles add column if not exists bio              text;
alter table profiles add column if not exists is_verified      boolean     not null default false;

alter table profiles enable row level security;

drop policy if exists "profiles: own read"                    on profiles;
drop policy if exists "profiles: own update"                  on profiles;
drop policy if exists "profiles: own update (no role change)" on profiles;
drop policy if exists "profiles: admin read all"              on profiles;
drop policy if exists "profiles: admin update role"           on profiles;

create policy "profiles: own read"
  on profiles for select using (auth.uid() = id);

create policy "profiles: own update"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: admin read all"
  on profiles for select
  using (
    auth.uid() = id
    or public.is_admin(auth.uid())
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
      and (u.raw_app_meta_data ->> 'role') = 'admin'
    )
  );

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles for each row execute procedure set_updated_at();

-- ── 5. Auto-Create Profile Trigger ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  raw_meta  jsonb  := new.raw_user_meta_data;
  full_name text   := coalesce(raw_meta->>'full_name', raw_meta->>'name', split_part(new.email,'@',1), 'User');
  parts     text[] := string_to_array(full_name, ' ');
  fname     text   := coalesce(parts[1], 'User');
  lname     text   := coalesce(array_to_string(parts[2:], ' '), '');
begin
  insert into public.profiles (
    id, first_name, last_name, email, phone, avatar_url, role, created_at, updated_at
  )
  values (
    new.id, fname, lname, new.email, new.phone,
    coalesce(raw_meta->>'avatar_url', raw_meta->>'picture'),
    'customer', now(), now()
  )
  on conflict (id) do update set
    email = excluded.email,
    avatar_url = coalesce(profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill missing profiles
insert into public.profiles (id, first_name, last_name, email, phone, role, created_at, updated_at)
select
  u.id, coalesce(split_part(u.email, '@', 1), 'User'), '', u.email, u.phone, 'customer', u.created_at, now()
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- ── 6. Categories Table ──────────────────────────────────────────────────────
create table if not exists categories (
  id          text primary key,
  name        text not null,
  description text,
  icon        text,
  item_count  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table categories enable row level security;
drop policy if exists "categories: public read" on categories;
drop policy if exists "categories: admin insert" on categories;
drop policy if exists "categories: admin update" on categories;
drop policy if exists "categories: admin delete" on categories;

create policy "categories: public read"  on categories for select using (true);
create policy "categories: admin insert" on categories for insert with check (public.is_admin(auth.uid()));
create policy "categories: admin update" on categories for update using (public.is_admin(auth.uid()));
create policy "categories: admin delete" on categories for delete using (public.is_admin(auth.uid()));

-- ── 7. Products Table ────────────────────────────────────────────────────────
create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        product_category not null,
  brand           text,
  price           numeric(12,2) not null check (price >= 0),
  original_price  numeric(12,2),
  condition       text default 'Brand New',
  stock           integer not null default 1 check (stock >= 0),
  rating          numeric(3,2) default 5.0 check (rating >= 0 and rating <= 5),
  reviews_count   integer default 0,
  is_featured     boolean default false,
  is_active       boolean default true,
  image           text,
  images          text[] default '{}',
  specs           jsonb default '{}'::jsonb,
  gadget_type     gadget_type,
  jersey_type     jersey_type,
  jersey_category jersey_category,
  car_condition   car_condition,
  estate_type     estate_type,
  seller_name     text,
  location        text,
  description     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table products add column if not exists seller_name text;
alter table products add column if not exists location text;
alter table products add column if not exists description text;

alter table products enable row level security;
drop policy if exists "products: public read" on products;
drop policy if exists "products: admin insert" on products;
drop policy if exists "products: admin update" on products;
drop policy if exists "products: admin delete" on products;

create policy "products: public read"  on products for select using (is_active = true or public.is_admin(auth.uid()));
create policy "products: admin insert" on products for insert with check (public.is_admin(auth.uid()));
create policy "products: admin update" on products for update using (public.is_admin(auth.uid()));
create policy "products: admin delete" on products for delete using (public.is_admin(auth.uid()));

drop trigger if exists products_updated_at on products;
create trigger products_updated_at
  before update on products for each row execute procedure set_updated_at();

-- ── 8. Orders & Order Items ──────────────────────────────────────────────────
create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  guest_email     text,
  status          order_status not null default 'pending',
  payment_method  text not null default 'paystack',
  payment_reference text,
  payment_id      text,
  total_amount    numeric(12,2) not null check (total_amount >= 0),
  subtotal        numeric(12,2),
  shipping_fee    numeric(12,2) default 0,
  tax             numeric(12,2) default 0,
  discount        numeric(12,2) default 0,
  shipping_address jsonb,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table orders enable row level security;
drop policy if exists "orders: user read own" on orders;
drop policy if exists "orders: user insert own" on orders;
drop policy if exists "orders: admin all" on orders;

create policy "orders: user read own"   on orders for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "orders: user insert own" on orders for insert with check (auth.uid() = user_id or user_id is null);
create policy "orders: admin all"       on orders for all using (public.is_admin(auth.uid()));

create table if not exists order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  uuid references products(id) on delete set null,
  product_name text not null,
  quantity    integer not null check (quantity > 0),
  price       numeric(12,2) not null check (price >= 0),
  item_option text,
  image       text,
  created_at  timestamptz not null default now()
);
alter table order_items enable row level security;
drop policy if exists "order_items: user read own" on order_items;
drop policy if exists "order_items: user insert own" on order_items;
drop policy if exists "order_items: admin all" on order_items;

create policy "order_items: user read own"   on order_items for select using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin(auth.uid()))));
create policy "order_items: user insert own" on order_items for insert with check (exists (select 1 from orders o where o.id = order_id));
create policy "order_items: admin all"       on order_items for all using (public.is_admin(auth.uid()));

-- ── 9. Manual Payments ───────────────────────────────────────────────────────
create table if not exists manual_payments (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid references orders(id) on delete set null,
  user_id         uuid references auth.users(id) on delete cascade,
  amount          numeric(12,2) not null,
  bank_name       text not null,
  account_name    text not null,
  proof_url       text,
  status          text not null default 'pending',
  rejection_reason text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table manual_payments enable row level security;
drop policy if exists "manual_payments: user read own" on manual_payments;
drop policy if exists "manual_payments: user insert own" on manual_payments;
drop policy if exists "manual_payments: admin all" on manual_payments;

create policy "manual_payments: user read own"   on manual_payments for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "manual_payments: user insert own" on manual_payments for insert with check (auth.uid() = user_id);
create policy "manual_payments: admin all"       on manual_payments for all using (public.is_admin(auth.uid()));

-- ── 10. Swaps ────────────────────────────────────────────────────────────────
create table if not exists swaps (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete cascade,
  item_offered          text not null,
  item_requested        text not null,
  category              product_category not null default 'gadget',
  condition             text,
  description           text,
  cash_adjustment       numeric(12,2) default 0,
  images                text[] default '{}',
  status                swap_status not null default 'pending',
  estimated_value       numeric(12,2),
  counter_offer_details text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
alter table swaps enable row level security;
drop policy if exists "swaps: user read own" on swaps;
drop policy if exists "swaps: user insert own" on swaps;
drop policy if exists "swaps: admin all" on swaps;

create policy "swaps: user read own"   on swaps for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "swaps: user insert own" on swaps for insert with check (auth.uid() = user_id);
create policy "swaps: admin all"       on swaps for all using (public.is_admin(auth.uid()));

-- ── 11. Wishlist & Cart ──────────────────────────────────────────────────────
create table if not exists wishlist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
alter table wishlist enable row level security;
drop policy if exists "wishlist: own access" on wishlist;
create policy "wishlist: own access" on wishlist for all using (auth.uid() = user_id);

create table if not exists cart (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity   integer not null default 1 check (quantity > 0),
  option     text,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
alter table cart enable row level security;
drop policy if exists "cart: own access" on cart;
create policy "cart: own access" on cart for all using (auth.uid() = user_id);

-- ── 12. Reviews & Analytics ──────────────────────────────────────────────────
create table if not exists reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  rating     integer not null check (rating >= 1 and rating <= 5),
  comment    text,
  created_at timestamptz not null default now()
);
alter table reviews enable row level security;
drop policy if exists "reviews: public read" on reviews;
drop policy if exists "reviews: user insert" on reviews;
create policy "reviews: public read" on reviews for select using (true);
create policy "reviews: user insert" on reviews for insert with check (auth.uid() = user_id);

create table if not exists analytics_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  event_type text not null,
  metadata   jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table analytics_events enable row level security;
drop policy if exists "analytics_events: user insert" on analytics_events;
drop policy if exists "analytics_events: admin read" on analytics_events;
create policy "analytics_events: user insert" on analytics_events for insert with check (true);
create policy "analytics_events: admin read"   on analytics_events for select using (public.is_admin(auth.uid()));

-- ── 13. Storage Buckets & Policies Setup ─────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('products', 'products', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true;

drop policy if exists "Public Read Avatars" on storage.objects;
drop policy if exists "Authenticated Users Upload Avatars" on storage.objects;
drop policy if exists "Users Update Own Avatars" on storage.objects;
drop policy if exists "Users Delete Own Avatars" on storage.objects;
drop policy if exists "Public Read Products" on storage.objects;
drop policy if exists "Admins Insert Products" on storage.objects;
drop policy if exists "Admins Update Products" on storage.objects;
drop policy if exists "Admins Delete Products" on storage.objects;

create policy "Public Read Avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Authenticated Users Upload Avatars" on storage.objects for insert to authenticated with check (bucket_id = 'avatars');
create policy "Users Update Own Avatars" on storage.objects for update to authenticated using (bucket_id = 'avatars');
create policy "Users Delete Own Avatars" on storage.objects for delete to authenticated using (bucket_id = 'avatars');

create policy "Public Read Products" on storage.objects for select using (bucket_id = 'products');
create policy "Admins Insert Products" on storage.objects for insert to authenticated with check (bucket_id = 'products');
create policy "Admins Update Products" on storage.objects for update to authenticated using (bucket_id = 'products');
create policy "Admins Delete Products" on storage.objects for delete to authenticated using (bucket_id = 'products');

-- ── 14. Admin Account Role Setup ─────────────────────────────────────────────
update profiles
set role = 'admin', is_active = true, updated_at = now()
where email in ('adegbesanadebola1@gmail.com', 'daogstore@gmail.com');

update profiles p
set role = 'admin', is_active = true, updated_at = now()
from auth.users u
where p.id = u.id and u.email in ('adegbesanadebola1@gmail.com', 'daogstore@gmail.com');

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where email in ('adegbesanadebola1@gmail.com', 'daogstore@gmail.com');

-- =============================================================================
-- END OF PRODUCTION SETUP
-- =============================================================================
