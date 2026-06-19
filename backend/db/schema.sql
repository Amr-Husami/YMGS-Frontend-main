-- ============================================================================
-- YMGS backend schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Safe to re-run.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- DESTRUCTIVE: drops the tables this backend manages so they can be recreated
-- with the structure below. Only the tables listed here are dropped. Remove
-- this block if you want to keep existing tables/data.
-- ----------------------------------------------------------------------------
drop table if exists public.contact_messages cascade;
drop table if exists public.contacts        cascade;  -- stray legacy table
drop table if exists public.carts           cascade;  -- stray legacy table
drop table if exists public.addresses       cascade;
drop table if exists public.orders          cascade;
drop table if exists public.crypto_wallets  cascade;
drop table if exists public.coupons         cascade;
drop table if exists public.blogs           cascade;
drop table if exists public.settings        cascade;
drop table if exists public.products        cascade;
drop table if exists public.users           cascade;

-- --- Users (with embedded cart) ---------------------------------------------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  email         text        not null unique,
  password_hash text        not null,
  role          text        not null default 'user' check (role in ('user', 'admin')),
  cart          jsonb       not null default '{}'::jsonb,  -- { itemId: cartData }
  created_at    timestamptz not null default now()
);

-- --- Products ---------------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  description   text        default '',
  price         numeric     not null default 0,
  image         jsonb       not null default '[]'::jsonb,   -- array of image URLs
  category      text        default '',
  sub_category  text        default '',
  bestseller    boolean     not null default false,
  min_order_quantity integer not null default 1,
  stock         integer     not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category);
create index if not exists products_bestseller_idx on public.products(bestseller);

-- --- Orders -----------------------------------------------------------------
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id) on delete set null,  -- null for guests
  email           text,                                                 -- for guest lookup
  items           jsonb       not null default '[]'::jsonb,  -- [{ productId, name, price, image, quantity }]
  amount          numeric     not null default 0,
  original_amount numeric,
  address         jsonb       not null default '{}'::jsonb,
  billing_address jsonb       default '{}'::jsonb,
  status          text        not null default 'Order Placed',
  payment         boolean     not null default false,
  payment_method  text        default 'COD',
  manual_payment_details jsonb,
  coupon          jsonb,                                     -- { code, discount }
  notes           text        default '',
  is_guest        boolean     not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_email_idx   on public.orders(email);

-- --- Saved addresses --------------------------------------------------------
create table if not exists public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.users(id) on delete cascade,
  data       jsonb       not null,                 -- { firstName, lastName, email, street, ... }
  created_at timestamptz not null default now()
);
create index if not exists addresses_user_id_idx on public.addresses(user_id);

-- --- Coupons ----------------------------------------------------------------
create table if not exists public.coupons (
  id            uuid primary key default gen_random_uuid(),
  code          text        not null unique,
  discount      numeric     not null default 0,
  discount_type text        not null default 'fixed' check (discount_type in ('fixed', 'percent')),
  active        boolean     not null default true,
  created_at    timestamptz not null default now()
);

-- --- Crypto wallets (for manual crypto payments) ----------------------------
create table if not exists public.crypto_wallets (
  id             uuid primary key default gen_random_uuid(),
  crypto_type    text not null,           -- e.g. 'BTC', 'USDT'
  network        text not null,           -- e.g. 'ERC20', 'TRC20'
  wallet_address text not null,
  created_at     timestamptz not null default now()
);

-- --- Store settings (single row) --------------------------------------------
create table if not exists public.settings (
  id              integer primary key default 1 check (id = 1),
  footer_email    text default '',
  footer_phone    text default '',
  contact_email   text default '',
  contact_phone   text default '',
  contact_address text default '',
  business_hours  text default '',
  updated_at      timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- --- Blog posts -------------------------------------------------------------
create table if not exists public.blogs (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  content    text default '',     -- may contain HTML (rendered with dangerouslySetInnerHTML)
  image      text default '',
  author     text default '',
  created_at timestamptz not null default now()
);

-- --- Contact form submissions -----------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  phone      text,
  subject    text,
  message    text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Row Level Security: the backend uses the service_role key, which bypasses
-- RLS. RLS is left disabled so everything works out of the box. Enable it and
-- add policies before production.
-- ----------------------------------------------------------------------------
