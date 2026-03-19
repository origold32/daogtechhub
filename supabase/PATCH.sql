-- =============================================================================
-- DAOG Tech Hub — DATABASE PATCH
-- Safe to run on a fresh OR existing Supabase project.
-- Uses CREATE IF NOT EXISTS and ALTER TABLE ADD COLUMN IF NOT EXISTS throughout.
-- Paste into: Supabase Dashboard → SQL Editor → Run
-- =============================================================================

-- ── Extensions ───────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────────
do $$ begin create type user_role        as enum ('customer','admin','vendor');        exception when duplicate_object then null; end $$;
do $$ begin create type gadget_type      as enum ('phone','laptop','game','tablet','accessory'); exception when duplicate_object then null; end $$;
do $$ begin create type jersey_type      as enum ('club','country','nfl','basketball','retro'); exception when duplicate_object then null; end $$;
do $$ begin create type jersey_category  as enum ('current','retro','special');        exception when duplicate_object then null; end $$;
do $$ begin create type estate_type      as enum ('house','land','apartment','commercial'); exception when duplicate_object then null; end $$;
do $$ begin create type order_status     as enum ('pending','confirmed','processing','shipped','delivered','cancelled','refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type swap_status      as enum ('pending','under_review','approved','rejected','completed'); exception when duplicate_object then null; end $$;
do $$ begin create type product_category as enum ('gadget','jersey','car','realestate'); exception when duplicate_object then null; end $$;

-- ── updated_at helper ────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- =============================================================================
-- PROFILES — create or patch existing table
-- =============================================================================
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add columns if they don't exist (handles old partial migrations)
alter table profiles add column if not exists first_name  text        not null default '';
alter table profiles add column if not exists last_name   text        not null default '';
alter table profiles add column if not exists email       text;
alter table profiles add column if not exists phone       text;
alter table profiles add column if not exists avatar_url  text;
alter table profiles add column if not exists role        user_role   not null default 'customer';

-- Address & extended profile fields (safe to run multiple times)
alter table profiles add column if not exists address_line1 text;
alter table profiles add column if not exists address_line2 text;
alter table profiles add column if not exists city          text;
alter table profiles add column if not exists state         text;
alter table profiles add column if not exists country       text default 'Nigeria';
alter table profiles add column if not exists postal_code   text;
alter table profiles add column if not exists bio           text;
alter table profiles add column if not exists is_verified   boolean not null default false;

alter table profiles enable row level security;

-- Drop all old policies and recreate cleanly
drop policy if exists "profiles: own read"                    on profiles;
drop policy if exists "profiles: own update"                  on profiles;
drop policy if exists "profiles: own update (no role change)" on profiles;
drop policy if exists "profiles: admin read all"              on profiles;
drop policy if exists "profiles: admin update role"           on profiles;

create policy "profiles: own read"
  on profiles for select using (auth.uid() = id);

-- Own update (no role change enforcement — role changes are server-side via service key)
create policy "profiles: own update"
  on profiles for update
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin read: use auth.users metadata to avoid recursive subquery into profiles
create policy "profiles: admin read all"
  on profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
      and (u.raw_app_meta_data ->> 'role') = 'admin'
    )
  );

-- Admin updates go through service role client (bypasses RLS) — no extra policy needed

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles for each row execute procedure set_updated_at();

-- =============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP (fixes "Database error saving new user")
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta      jsonb  := new.raw_user_meta_data;
  full_name text   := coalesce(meta->>'full_name', meta->>'name', split_part(new.email,'@',1), 'User');
  parts     text[] := string_to_array(full_name,' ');
begin
  insert into public.profiles(id, first_name, last_name, email, phone, avatar_url, role)
  values(
    new.id,
    coalesce(parts[1],'User'),
    coalesce(array_to_string(parts[2:],' '),''),
    new.email,
    new.phone,
    coalesce(meta->>'avatar_url', meta->>'picture'),
    'customer'
  )
  -- BUG FIX: "do nothing" meant OAuth users' name/avatar were never written
  -- on the very first insert (trigger fires before our server upsert).
  -- Now we always write the auth data on new user creation.
  on conflict (id) do update set
    first_name = excluded.first_name,
    last_name  = excluded.last_name,
    email      = coalesce(excluded.email, profiles.email),
    phone      = coalesce(excluded.phone, profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url);
  return new;
exception when others then
  -- Never block signup even if profile insert fails
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- GADGETS
-- =============================================================================
create table if not exists gadgets (
  id          uuid primary key default uuid_generate_v4(),
  name        text        not null,
  brand       text        not null,
  type        gadget_type not null,
  price       numeric     not null check (price >= 0),
  image_url   text        not null default '',
  description text        not null default '',
  condition   text        not null default 'Brand New',
  specs       jsonb       not null default '{}',
  stock       integer     not null default 0 check (stock >= 0),
  is_active   boolean     not null default true,
  meta_title  text, meta_description text, slug text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table gadgets enable row level security;
drop policy if exists "gadgets: public read active" on gadgets;
drop policy if exists "gadgets: admin all"          on gadgets;
create policy "gadgets: public read active" on gadgets for select using (is_active = true);
create policy "gadgets: admin all"          on gadgets for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
drop trigger if exists gadgets_updated_at on gadgets;
create trigger gadgets_updated_at before update on gadgets for each row execute procedure set_updated_at();
create index if not exists idx_gadgets_active on gadgets(is_active);
create index if not exists idx_gadgets_price  on gadgets(price);
create unique index if not exists gadgets_slug_idx on gadgets(slug) where slug is not null;

-- =============================================================================
-- JERSEYS
-- =============================================================================
create table if not exists jerseys (
  id          uuid primary key default uuid_generate_v4(),
  name        text            not null,
  team        text            not null,
  type        jersey_type     not null,
  category    jersey_category not null,
  price       numeric         not null check (price >= 0),
  image_url   text            not null default '',
  description text            not null default '',
  sizes       text[]          not null default '{}',
  season      text            not null default '',
  stock       integer         not null default 0 check (stock >= 0),
  is_active   boolean         not null default true,
  created_at  timestamptz     not null default now(),
  updated_at  timestamptz     not null default now()
);
alter table jerseys enable row level security;
drop policy if exists "jerseys: public read active" on jerseys;
drop policy if exists "jerseys: admin all"          on jerseys;
create policy "jerseys: public read active" on jerseys for select using (is_active = true);
create policy "jerseys: admin all"          on jerseys for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
drop trigger if exists jerseys_updated_at on jerseys;
create trigger jerseys_updated_at before update on jerseys for each row execute procedure set_updated_at();
create index if not exists idx_jerseys_active on jerseys(is_active);

-- =============================================================================
-- CARS
-- =============================================================================
create table if not exists cars (
  id           uuid primary key default uuid_generate_v4(),
  name         text    not null, brand text not null, model text not null,
  year         integer not null,
  price        numeric not null check (price >= 0),
  image_url    text    not null default '',
  description  text    not null default '',
  mileage      text    not null default '0 km',
  condition    text    not null default 'Brand New',
  fuel_type    text    not null default 'Petrol',
  transmission text    not null default 'Automatic',
  is_available boolean not null default true,
  seller_id    uuid    references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table cars enable row level security;
drop policy if exists "cars: public read available" on cars;
drop policy if exists "cars: admin/vendor insert"   on cars;
drop policy if exists "cars: admin/seller update"   on cars;
create policy "cars: public read available" on cars for select using (is_available = true);
create policy "cars: admin/vendor insert"   on cars for insert
  with check (exists (select 1 from profiles where id = auth.uid() and role in ('admin','vendor')));
create policy "cars: admin/seller update"   on cars for update
  using (auth.uid() = seller_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
drop trigger if exists cars_updated_at on cars;
create trigger cars_updated_at before update on cars for each row execute procedure set_updated_at();
create index if not exists idx_cars_available on cars(is_available);

-- =============================================================================
-- REAL ESTATES
-- =============================================================================
create table if not exists real_estates (
  id           uuid primary key default uuid_generate_v4(),
  name         text        not null, type estate_type not null, location text not null,
  price        numeric     not null check (price >= 0),
  image_url    text        not null default '',
  description  text        not null default '',
  size         text        not null default '',
  bedrooms     integer, bathrooms integer,
  features     text[]      not null default '{}',
  is_available boolean     not null default true,
  seller_id    uuid        references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table real_estates enable row level security;
drop policy if exists "real_estates: public read available" on real_estates;
drop policy if exists "real_estates: admin/vendor insert"  on real_estates;
drop policy if exists "real_estates: admin/seller update"  on real_estates;
create policy "real_estates: public read available" on real_estates for select using (is_available = true);
create policy "real_estates: admin/vendor insert"   on real_estates for insert
  with check (exists (select 1 from profiles where id = auth.uid() and role in ('admin','vendor')));
create policy "real_estates: admin/seller update"   on real_estates for update
  using (auth.uid() = seller_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
drop trigger if exists real_estates_updated_at on real_estates;
create trigger real_estates_updated_at before update on real_estates for each row execute procedure set_updated_at();
create index if not exists idx_re_available on real_estates(is_available);

-- =============================================================================
-- ORDERS
-- =============================================================================
create table if not exists orders (
  id                uuid         primary key default uuid_generate_v4(),
  user_id           uuid         not null references profiles(id) on delete restrict,
  status            order_status not null default 'pending',
  total_amount      numeric      not null check (total_amount >= 0),
  payment_reference text, payment_method text, notes text,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);
alter table orders enable row level security;
drop policy if exists "orders: own read"   on orders;
drop policy if exists "orders: own insert" on orders;
drop policy if exists "orders: admin all"  on orders;
create policy "orders: own read"   on orders for select using (auth.uid() = user_id);
create policy "orders: own insert" on orders for insert with check (auth.uid() = user_id);
create policy "orders: admin all"  on orders for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at before update on orders for each row execute procedure set_updated_at();
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_status  on orders(status);

-- =============================================================================
-- ORDER ITEMS
-- =============================================================================
create table if not exists order_items (
  id               uuid             primary key default uuid_generate_v4(),
  order_id         uuid             not null references orders(id) on delete cascade,
  product_id       text             not null,
  product_category product_category not null,
  product_name     text             not null,
  product_image    text             not null default '',
  unit_price       numeric          not null check (unit_price >= 0),
  quantity         integer          not null check (quantity > 0),
  subtotal         numeric          not null generated always as (unit_price * quantity) stored
);
alter table order_items enable row level security;
drop policy if exists "order_items: own read via order" on order_items;
drop policy if exists "order_items: own insert"         on order_items;
drop policy if exists "order_items: admin all"          on order_items;
create policy "order_items: own read via order" on order_items for select
  using (exists (select 1 from orders where id = order_id and user_id = auth.uid()));
create policy "order_items: own insert" on order_items for insert
  with check (exists (select 1 from orders where id = order_id and user_id = auth.uid()));
create policy "order_items: admin all"  on order_items for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create index if not exists idx_order_items_order_id on order_items(order_id);

-- =============================================================================
-- CART ITEMS
-- =============================================================================
create table if not exists cart_items (
  id               uuid             primary key default uuid_generate_v4(),
  user_id          uuid             not null references profiles(id) on delete cascade,
  product_id       text             not null,
  product_category product_category not null,
  product_name     text             not null,
  product_image    text             not null default '',
  unit_price       numeric          not null check (unit_price >= 0),
  quantity         integer          not null default 1 check (quantity > 0),
  created_at       timestamptz      not null default now(),
  unique (user_id, product_id)
);
alter table cart_items enable row level security;
drop policy if exists "cart_items: own crud" on cart_items;
create policy "cart_items: own crud" on cart_items for all using (auth.uid() = user_id);
create index if not exists idx_cart_items_user_id on cart_items(user_id);

-- =============================================================================
-- WISHLISTS
-- =============================================================================
create table if not exists wishlists (
  id               uuid             primary key default uuid_generate_v4(),
  user_id          uuid             not null references profiles(id) on delete cascade,
  product_id       text             not null,
  product_category product_category not null,
  created_at       timestamptz      not null default now(),
  unique (user_id, product_id)
);
alter table wishlists enable row level security;
drop policy if exists "wishlists: own crud" on wishlists;
create policy "wishlists: own crud" on wishlists for all using (auth.uid() = user_id);
create index if not exists idx_wishlists_user_id on wishlists(user_id);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
create table if not exists notifications (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references profiles(id) on delete cascade,
  type       text not null check (type in ('order','offer','system','abandoned_cart')),
  title      text not null, message text not null,
  read       boolean default false, data jsonb,
  created_at timestamptz default now()
);
alter table notifications enable row level security;
drop policy if exists "Users see own notifications" on notifications;
create policy "Users see own notifications" on notifications for all using (auth.uid() = user_id);

-- =============================================================================
-- CONTACT ENQUIRIES
-- =============================================================================
create table if not exists contact_enquiries (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null, email text not null,
  product     text not null default '', message text not null,
  is_resolved boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table contact_enquiries enable row level security;
drop policy if exists "contact_enquiries: public insert" on contact_enquiries;
drop policy if exists "contact_enquiries: admin all"     on contact_enquiries;
create policy "contact_enquiries: public insert" on contact_enquiries for insert with check (true);
create policy "contact_enquiries: admin all"     on contact_enquiries for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- =============================================================================
-- ANALYTICS EVENTS
-- =============================================================================
create table if not exists analytics_events (
  id               uuid primary key default uuid_generate_v4(),
  event_type       text not null, product_id text, product_category product_category,
  user_id          uuid references profiles(id) on delete set null,
  metadata         jsonb, created_at timestamptz not null default now()
);
alter table analytics_events enable row level security;
drop policy if exists "analytics_events: authenticated insert" on analytics_events;
drop policy if exists "analytics_events: admin read"           on analytics_events;
create policy "analytics_events: authenticated insert" on analytics_events for insert with check (auth.uid() is not null);
create policy "analytics_events: admin read"           on analytics_events for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create index if not exists idx_analytics_event_type on analytics_events(event_type);
create index if not exists idx_analytics_created    on analytics_events(created_at desc);

-- =============================================================================
-- BACKFILL: profiles for any users who signed up before this ran
-- =============================================================================
insert into public.profiles (id, first_name, last_name, email, phone, role, created_at, updated_at)
select u.id, coalesce(split_part(u.email,'@',1),'User'), '', u.email, u.phone, 'customer', u.created_at, now()
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- =============================================================================
-- ★ MAKE YOURSELF ADMIN — uncomment and replace with your email:
-- =============================================================================
-- update profiles set role = 'admin' where email = 'your@email.com';

-- =============================================================================
-- AUTH LOGS — tracks sign-in, sign-out, failed login, registration events
-- =============================================================================
create table if not exists auth_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete set null,
  event_type  text not null,   -- 'register' | 'sign_in' | 'sign_out' | 'reset_password' | 'failed_login'
  provider    text,            -- 'email' | 'google' | 'facebook' | 'phone'
  ip_address  text,
  user_agent  text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
alter table auth_logs enable row level security;
drop policy if exists "auth_logs: admin read" on auth_logs;
create policy "auth_logs: admin read" on auth_logs for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create index if not exists idx_auth_logs_user    on auth_logs(user_id);
create index if not exists idx_auth_logs_event   on auth_logs(event_type);
create index if not exists idx_auth_logs_created on auth_logs(created_at desc);

-- Trigger: auto-log every new registration from auth.users
create or replace function log_new_registration()
returns trigger language plpgsql security definer as $$
begin
  insert into public.auth_logs (user_id, event_type, provider, metadata)
  values (
    new.id,
    'register',
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    jsonb_build_object('email', new.email, 'confirmed', new.confirmed_at is not null)
  );
  return new;
exception when others then return new; -- never block signup
end; $$;

drop trigger if exists on_auth_user_registered on auth.users;
create trigger on_auth_user_registered
  after insert on auth.users
  for each row execute procedure log_new_registration();

-- =============================================================================
-- PROFILES — address fields (added for full profile management)
-- =============================================================================
alter table profiles add column if not exists address_line1 text;
alter table profiles add column if not exists address_line2 text;
alter table profiles add column if not exists city          text;
alter table profiles add column if not exists state         text;
alter table profiles add column if not exists country       text default 'Nigeria';
alter table profiles add column if not exists postal_code   text;

-- =============================================================================
-- WISHLISTS — add product detail columns so we can render without a join
-- =============================================================================
alter table wishlists add column if not exists product_name  text;
alter table wishlists add column if not exists product_image text;
alter table wishlists add column if not exists product_price numeric(12,2);

-- =============================================================================
-- DISCOUNT CODES
-- =============================================================================
create table if not exists discount_codes (
  id            uuid        primary key default uuid_generate_v4(),
  code          text        not null unique,
  description   text,
  type          text        not null default 'percentage' check (type in ('percentage','fixed')),
  value         numeric     not null check (value > 0),
  minimum_order numeric     default 0,
  max_discount  numeric,
  max_uses      int,
  times_used    int         not null default 0,
  is_active     boolean     not null default true,
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);

alter table discount_codes enable row level security;
create policy "discount_codes: admin only" on discount_codes
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Admin can manage, everyone can read active codes (for validation)
create policy "discount_codes: public read active" on discount_codes
  for select using (is_active = true);

-- Sample codes
insert into discount_codes (code, description, type, value, minimum_order, max_uses, expires_at)
values
  ('WELCOME10',  'Welcome discount — 10% off first order',       'percentage', 10,  0,      1000, now() + interval '1 year'),
  ('DAOG20',     '20% off orders above ₦50,000',                 'percentage', 20,  50000,  500,  now() + interval '6 months'),
  ('FLAT5000',   '₦5,000 off any order above ₦25,000',          'fixed',      5000, 25000, 200,  now() + interval '3 months'),
  ('GADGETS15',  '15% off all gadget purchases',                 'percentage', 15,  10000,  null, now() + interval '1 year')
on conflict (code) do nothing;

-- =============================================================================
-- PRODUCT REVIEWS
-- =============================================================================
create table if not exists product_reviews (
  id               uuid        primary key default uuid_generate_v4(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  product_id       text        not null,
  product_category text        not null,
  rating           int         not null check (rating between 1 and 5),
  title            text,
  comment          text        not null,
  is_verified      boolean     not null default false,
  is_published     boolean     not null default true,
  helpful_count    int         not null default 0,
  created_at       timestamptz not null default now()
);

alter table product_reviews enable row level security;

create policy "reviews: public read" on product_reviews
  for select using (is_published = true);

create policy "reviews: own write" on product_reviews
  for insert with check (auth.uid() = user_id);

create policy "reviews: own update" on product_reviews
  for update using (auth.uid() = user_id);

-- =============================================================================
-- RECEIPTS TABLE
-- Stores payment receipts for every confirmed order.
-- Created by /api/payment/verify and /api/payment/webhook.
-- =============================================================================
create table if not exists receipts (
  id                uuid        primary key default uuid_generate_v4(),
  order_id          uuid        references orders(id) on delete set null,
  user_id           uuid        not null references profiles(id) on delete cascade,
  receipt_number    text        not null unique,
  payment_reference text        not null,
  customer_name     text        not null default '',
  customer_email    text,
  amount_paid       numeric     not null check (amount_paid >= 0),
  currency          text        not null default 'NGN',
  payment_channel   text        not null default 'paystack',
  payment_date      timestamptz not null default now(),
  items_snapshot    jsonb       not null default '[]',
  status            text        not null default 'paid' check (status in ('paid', 'refunded', 'failed')),
  created_at        timestamptz not null default now()
);

alter table receipts enable row level security;
drop policy if exists "receipts: own read"  on receipts;
drop policy if exists "receipts: admin all" on receipts;
create policy "receipts: own read"  on receipts for select using (auth.uid() = user_id);
create policy "receipts: admin all" on receipts for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create index if not exists idx_receipts_user      on receipts(user_id);
create index if not exists idx_receipts_reference on receipts(payment_reference);
create index if not exists idx_receipts_order     on receipts(order_id);
