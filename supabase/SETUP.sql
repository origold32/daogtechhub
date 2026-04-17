-- =============================================================================
-- DAOG Tech Hub — COMPLETE DATABASE SETUP
-- Paste this entire file into Supabase Dashboard → SQL Editor → Run
--
-- Safe to re-run: uses CREATE IF NOT EXISTS and IF NOT EXISTS throughout.
-- =============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums (safe: only creates if they don't exist) ──────────────────────────
do $$ begin
  create type user_role        as enum ('customer', 'admin', 'vendor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gadget_type      as enum ('phone', 'laptop', 'game', 'tablet', 'accessory');
exception when duplicate_object then null; end $$;

do $$ begin
  create type jersey_type      as enum ('club', 'country', 'nfl', 'basketball', 'retro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type jersey_category  as enum ('current', 'retro', 'special');
exception when duplicate_object then null; end $$;

do $$ begin
  create type car_condition    as enum ('Brand New', 'Used - Like New', 'Used - Excellent', 'Used - Good');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estate_type      as enum ('house', 'land', 'apartment', 'commercial');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status     as enum ('pending', 'awaiting_payment', 'payment_submitted', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type swap_status      as enum ('pending', 'under_review', 'approved', 'rejected', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_category as enum ('gadget', 'jersey', 'car', 'realestate');
exception when duplicate_object then null; end $$;

-- =============================================================================
-- SHARED: updated_at trigger function
-- =============================================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- PROFILES
-- =============================================================================
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  first_name    text        not null default '',
  last_name     text        not null default '',
  email         text,
  phone         text,
  avatar_url    text,
  role          user_role   not null default 'customer',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table profiles enable row level security;

-- Drop and recreate policies cleanly
drop policy if exists "profiles: own read"               on profiles;
drop policy if exists "profiles: own update"             on profiles;
drop policy if exists "profiles: own update (no role change)" on profiles;
drop policy if exists "profiles: admin read all"         on profiles;
drop policy if exists "profiles: admin update role"      on profiles;

create policy "profiles: own read"
  on profiles for select using (auth.uid() = id);

-- Users can update their own profile but CANNOT change their own role
create policy "profiles: own update (no role change)"
  on profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from profiles where id = auth.uid())
  );

create policy "profiles: admin read all"
  on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "profiles: admin update role"
  on profiles for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();

-- =============================================================================
-- AUTO-CREATE PROFILE TRIGGER (fires on every new signup)
-- This is the key fix for "Database error saving new user"
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  raw_meta  jsonb;
  full_name text;
  parts     text[];
  fname     text;
  lname     text;
begin
  raw_meta  := new.raw_user_meta_data;
  full_name := coalesce(
    raw_meta->>'full_name',
    raw_meta->>'name',
    split_part(new.email, '@', 1),
    'User'
  );
  parts := string_to_array(full_name, ' ');
  fname := coalesce(parts[1], 'User');
  lname := coalesce(array_to_string(parts[2:], ' '), '');

  insert into public.profiles (id, first_name, last_name, email, phone, avatar_url, role)
  values (
    new.id,
    fname,
    lname,
    new.email,
    new.phone,
    coalesce(raw_meta->>'avatar_url', raw_meta->>'picture'),
    'customer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

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
  meta_title  text,
  meta_description text,
  slug        text,
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

create index if not exists idx_gadgets_type   on gadgets(type);
create index if not exists idx_gadgets_brand  on gadgets(brand);
create index if not exists idx_gadgets_active on gadgets(is_active);
create index if not exists idx_gadgets_price  on gadgets(price);
create unique index if not exists gadgets_slug_idx on gadgets(slug) where slug is not null;

-- =============================================================================
-- JERSEYS
-- =============================================================================
create table if not exists jerseys (
  id          uuid primary key default uuid_generate_v4(),
  name        text             not null,
  team        text             not null,
  type        jersey_type      not null,
  category    jersey_category  not null,
  price       numeric          not null check (price >= 0),
  image_url   text             not null default '',
  description text             not null default '',
  sizes       text[]           not null default '{}',
  season      text             not null default '',
  stock       integer          not null default 0 check (stock >= 0),
  is_active   boolean          not null default true,
  created_at  timestamptz      not null default now(),
  updated_at  timestamptz      not null default now()
);

alter table jerseys enable row level security;
drop policy if exists "jerseys: public read active" on jerseys;
drop policy if exists "jerseys: admin all"          on jerseys;
create policy "jerseys: public read active" on jerseys for select using (is_active = true);
create policy "jerseys: admin all"          on jerseys for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop trigger if exists jerseys_updated_at on jerseys;
create trigger jerseys_updated_at before update on jerseys for each row execute procedure set_updated_at();

create index if not exists idx_jerseys_type     on jerseys(type);
create index if not exists idx_jerseys_category on jerseys(category);
create index if not exists idx_jerseys_active   on jerseys(is_active);

-- =============================================================================
-- CARS
-- =============================================================================
create table if not exists cars (
  id           uuid          primary key default uuid_generate_v4(),
  name         text          not null,
  brand        text          not null,
  model        text          not null,
  year         integer       not null,
  price        numeric       not null check (price >= 0),
  image_url    text          not null default '',
  description  text          not null default '',
  mileage      text          not null default '0 km',
  condition    text          not null default 'Brand New',
  fuel_type    text          not null default 'Petrol',
  transmission text          not null default 'Automatic',
  is_available boolean       not null default true,
  seller_id    uuid          references profiles(id) on delete set null,
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now()
);

alter table cars enable row level security;
drop policy if exists "cars: public read available"  on cars;
drop policy if exists "cars: admin/vendor insert"    on cars;
drop policy if exists "cars: admin/seller update"    on cars;
create policy "cars: public read available" on cars for select using (is_available = true);
create policy "cars: admin/vendor insert"   on cars for insert
  with check (exists (select 1 from profiles where id = auth.uid() and role in ('admin','vendor')));
create policy "cars: admin/seller update"   on cars for update
  using (auth.uid() = seller_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop trigger if exists cars_updated_at on cars;
create trigger cars_updated_at before update on cars for each row execute procedure set_updated_at();

create index if not exists idx_cars_brand     on cars(brand);
create index if not exists idx_cars_model     on cars(model);
create index if not exists idx_cars_year      on cars(year);
create index if not exists idx_cars_available on cars(is_available);

-- =============================================================================
-- REAL ESTATES
-- =============================================================================
create table if not exists real_estates (
  id           uuid         primary key default uuid_generate_v4(),
  name         text         not null,
  type         estate_type  not null,
  location     text         not null,
  price        numeric      not null check (price >= 0),
  image_url    text         not null default '',
  description  text         not null default '',
  size         text         not null default '',
  bedrooms     integer,
  bathrooms    integer,
  features     text[]       not null default '{}',
  is_available boolean      not null default true,
  seller_id    uuid         references profiles(id) on delete set null,
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
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

create index if not exists idx_re_type      on real_estates(type);
create index if not exists idx_re_location  on real_estates(location);
create index if not exists idx_re_available on real_estates(is_available);

-- =============================================================================
-- ORDERS
-- =============================================================================
create table if not exists orders (
  id                        uuid         primary key default uuid_generate_v4(),
  user_id                   uuid         not null references profiles(id) on delete restrict,
  status                    order_status not null default 'pending',
  total_amount              numeric      not null check (total_amount >= 0),
  subtotal_amount           numeric      not null default 0 check (subtotal_amount >= 0),
  discount_amount           numeric      not null default 0 check (discount_amount >= 0),
  delivery_fee              numeric      not null default 0 check (delivery_fee >= 0),
  grand_total               numeric      not null default 0 check (grand_total >= 0),
  currency                  text         not null default 'NGN',
  payment_reference         text,
  payment_method            text,
  notes                     text,
  manual_payment_note       text,
  manual_payment_proof_url  text,
  manual_payment_submitted_at timestamptz,
  created_at                timestamptz  not null default now(),
  updated_at                timestamptz  not null default now()
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
create index if not exists idx_orders_created on orders(created_at desc);
alter table orders add column if not exists subtotal_amount numeric not null default 0 check (subtotal_amount >= 0);
alter table orders add column if not exists discount_amount numeric not null default 0 check (discount_amount >= 0);
alter table orders add column if not exists delivery_fee numeric not null default 0 check (delivery_fee >= 0);
alter table orders add column if not exists grand_total numeric not null default 0 check (grand_total >= 0);
alter table orders add column if not exists currency text not null default 'NGN';
alter table orders add column if not exists manual_payment_note text;
alter table orders add column if not exists manual_payment_proof_url text;
alter table orders add column if not exists manual_payment_submitted_at timestamptz;

-- =============================================================================
-- RECEIPTS
-- =============================================================================
create table if not exists receipts (
  id                uuid         primary key default uuid_generate_v4(),
  order_id          uuid         references orders(id) on delete set null,
  user_id           uuid         not null references profiles(id) on delete restrict,
  receipt_number    text         not null,
  payment_reference text         not null,
  customer_name     text         not null default 'Customer',
  customer_email    text,
  amount_paid       numeric      not null check (amount_paid >= 0),
  currency          text         not null default 'NGN',
  payment_channel   text         not null default 'paystack',
  payment_date      timestamptz  not null default now(),
  items_snapshot    jsonb        not null default '[]',
  status            text         not null default 'paid',
  created_at        timestamptz  not null default now()
);
alter table receipts enable row level security;
drop policy if exists "receipts: own read" on receipts;
drop policy if exists "receipts: admin all" on receipts;
create policy "receipts: own read" on receipts for select using (auth.uid() = user_id);
create policy "receipts: admin all" on receipts for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create index if not exists idx_receipts_order_id on receipts(order_id);
create unique index if not exists idx_receipts_reference on receipts(payment_reference);
create unique index if not exists idx_receipts_number on receipts(receipt_number);

-- =============================================================================
-- ORDER CREATION PLANNER
-- =============================================================================
create or replace function public.create_order_with_items(
  p_user_id uuid,
  p_status order_status,
  p_payment_method text,
  p_payment_reference text,
  p_notes text,
  p_subtotal_amount numeric,
  p_discount_amount numeric,
  p_delivery_fee numeric,
  p_grand_total numeric,
  p_currency text,
  p_items json
)
returns orders as $$
declare
  inserted_order orders%rowtype;
begin
  insert into orders(
    user_id,
    status,
    total_amount,
    subtotal_amount,
    discount_amount,
    delivery_fee,
    grand_total,
    currency,
    payment_reference,
    payment_method,
    notes
  ) values (
    p_user_id,
    p_status,
    p_grand_total,
    p_subtotal_amount,
    p_discount_amount,
    p_delivery_fee,
    p_grand_total,
    p_currency,
    p_payment_reference,
    p_payment_method,
    p_notes
  ) returning * into inserted_order;

  insert into order_items(order_id, product_id, product_category, product_name, product_image, unit_price, quantity)
  select
    inserted_order.id,
    item->>'productId',
    (item->>'productCategory')::product_category,
    item->>'productName',
    coalesce(item->>'productImage', ''),
    (item->>'unitPrice')::numeric,
    (item->>'quantity')::integer
  from json_array_elements(p_items) as arr(item);

  return inserted_order;
end;
$$ language plpgsql;

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
-- SWAP REQUESTS
-- =============================================================================
create table if not exists swap_requests (
  id                  uuid        primary key default uuid_generate_v4(),
  user_id             uuid        not null references profiles(id) on delete cascade,
  target_gadget_id    text        not null,
  target_gadget_name  text        not null,
  memory              text        not null,
  battery_health      text        not null,
  has_face_id         boolean     not null default false,
  repair_history      text        not null default 'None',
  image_urls          text[]      not null default '{}',
  video_url           text,
  status              swap_status not null default 'pending',
  admin_notes         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table swap_requests enable row level security;
drop policy if exists "swap_requests: own crud"  on swap_requests;
drop policy if exists "swap_requests: admin all" on swap_requests;
create policy "swap_requests: own crud"  on swap_requests for all using (auth.uid() = user_id);
create policy "swap_requests: admin all" on swap_requests for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop trigger if exists swap_requests_updated_at on swap_requests;
create trigger swap_requests_updated_at before update on swap_requests for each row execute procedure set_updated_at();

create index if not exists idx_swaps_user_id on swap_requests(user_id);
create index if not exists idx_swaps_status  on swap_requests(status);

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
-- CONTACT ENQUIRIES
-- =============================================================================
create table if not exists contact_enquiries (
  id          uuid        primary key default uuid_generate_v4(),
  name        text        not null,
  email       text        not null,
  product     text        not null default '',
  message     text        not null,
  is_resolved boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table contact_enquiries enable row level security;
drop policy if exists "contact_enquiries: public insert" on contact_enquiries;
drop policy if exists "contact_enquiries: admin all"     on contact_enquiries;
create policy "contact_enquiries: public insert" on contact_enquiries for insert with check (true);
create policy "contact_enquiries: admin all"     on contact_enquiries for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create index if not exists idx_enquiries_resolved on contact_enquiries(is_resolved);

-- =============================================================================
-- ANALYTICS EVENTS
-- =============================================================================
create table if not exists analytics_events (
  id               uuid             primary key default uuid_generate_v4(),
  event_type       text             not null,
  product_id       text,
  product_category product_category,
  user_id          uuid             references profiles(id) on delete set null,
  metadata         jsonb,
  created_at       timestamptz      not null default now()
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
-- NOTIFICATIONS
-- =============================================================================
create table if not exists notifications (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id) on delete cascade,
  type        text not null check (type in ('order','offer','system','abandoned_cart')),
  title       text not null,
  message     text not null,
  read        boolean default false,
  data        jsonb,
  created_at  timestamptz default now()
);

alter table notifications enable row level security;
drop policy if exists "Users see own notifications" on notifications;
create policy "Users see own notifications" on notifications for all using (auth.uid() = user_id);

-- =============================================================================
-- BACKFILL: create profiles for any auth users who signed up before this ran
-- =============================================================================
insert into public.profiles (id, first_name, last_name, email, phone, role, created_at, updated_at)
select
  u.id,
  coalesce(split_part(u.email, '@', 1), 'User'),
  '',
  u.email,
  u.phone,
  'customer',
  u.created_at,
  now()
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- =============================================================================
-- MAKE YOURSELF ADMIN
-- Replace the email below with your own and run this line separately:
-- =============================================================================
-- update profiles set role = 'admin' where email = 'your@email.com';

-- =============================================================================
-- VERIFY everything worked:
-- =============================================================================
-- select tablename from pg_tables where schemaname = 'public' order by tablename;
-- select count(*) from profiles;
-- select trigger_name from information_schema.triggers where event_object_table = 'users';
