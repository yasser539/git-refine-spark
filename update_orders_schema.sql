-- Update Orders and Order Items schema to the new standard
-- Safe, idempotent migration for Postgres/Supabase

-- 0) Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- 1) Approval status enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'approval_status') then
    create type public.approval_status as enum ('pending','approved','rejected');
  end if;
end$$;

-- 2) Ensure orders table exists (create minimal if missing), then align columns and constraints
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null,
  merchant_id uuid null,
  deliverer_id uuid null,
  status text not null default 'pending',
  total_amount numeric(12,2) not null check (total_amount >= 0),
  items jsonb null,
  delivery_address text not null default '',
  delivery_phone   text not null default '',
  delivery_notes   text null,
  notes            text null,
  estimated_delivery_time timestamptz null,
  actual_delivery_time    timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add/align monetary columns (safe with defaults)
alter table public.orders
  add column if not exists total        numeric(12,2) not null default 0 check (total >= 0),
  add column if not exists subtotal     numeric(12,2) not null default 0 check (subtotal >= 0),
  add column if not exists final_amount numeric(12,2) not null default 0 check (final_amount >= 0),
  add column if not exists tax_amount   numeric(12,2) not null default 0 check (tax_amount >= 0),
  add column if not exists shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  add column if not exists discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  add column if not exists voucher_discount numeric(12,2) not null default 0 check (voucher_discount >= 0);

-- Approval columns
alter table public.orders
  add column if not exists approval_status public.approval_status not null default 'pending',
  add column if not exists approved_by uuid null,
  add column if not exists approved_at timestamptz null,
  add column if not exists approval_notes text null;

-- 3) Replace/align status constraint and migrate legacy values
-- Convert any legacy 'delivering' to 'out_for_delivery'
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'status') then
    update public.orders set status = 'out_for_delivery' where status = 'delivering';
    -- If legacy 'ready' existed and is used, map to 'preparing'
    update public.orders set status = 'preparing' where status = 'ready';
  end if;
exception when undefined_table then
  -- ignore if table not present
end$$;

-- Drop existing status check constraints for orders.status
do $$
declare
  r record;
begin
  for r in
    select con.constraint_name
    from information_schema.constraint_column_usage ccu
    join information_schema.table_constraints con
      on con.constraint_name = ccu.constraint_name
     and con.table_schema = ccu.table_schema
    where ccu.table_schema = 'public'
      and ccu.table_name = 'orders'
      and ccu.column_name = 'status'
      and con.constraint_type = 'CHECK'
  loop
    execute format('alter table public.orders drop constraint %I', r.constraint_name);
  end loop;
end$$;

-- Add the new status constraint
alter table public.orders
  add constraint orders_status_chk check (status in (
    'pending','confirmed','preparing','out_for_delivery','delivered','cancelled'
  ));

-- 4) Recreate/align foreign keys
-- Drop existing FK on customer_id if any, then add with RESTRICT delete
do $$
declare
  r record;
begin
  for r in
    select con.constraint_name
    from information_schema.key_column_usage kcu
    join information_schema.table_constraints con
      on con.constraint_name = kcu.constraint_name
     and con.table_schema = kcu.table_schema
    where kcu.table_schema = 'public'
      and kcu.table_name = 'orders'
      and kcu.column_name = 'customer_id'
      and con.constraint_type = 'FOREIGN KEY'
  loop
    execute format('alter table public.orders drop constraint %I', r.constraint_name);
  end loop;
end$$;

alter table public.orders
  add constraint orders_customer_fk
  foreign key (customer_id) references public.customers(id)
  on update cascade on delete restrict;

-- Optional FKs (commented for flexibility)
-- alter table public.orders
--   add constraint orders_merchant_fk
--   foreign key (merchant_id) references public.merchants(id)
--   on update cascade on delete set null;
-- alter table public.orders
--   add constraint orders_deliverer_fk
--   foreign key (deliverer_id) references public.employees(id)
--   on update cascade on delete set null;

-- 5) updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_orders_set_updated_at on public.orders;
create trigger trg_orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- 6) Helpful indexes
create index if not exists idx_orders_customer_created
  on public.orders (customer_id, created_at desc);
create index if not exists idx_orders_status_created
  on public.orders (status, created_at desc);
create index if not exists idx_orders_approval_status_created
  on public.orders (approval_status, created_at desc);

-- 7) Ensure order_items table + FKs + indexes
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id  uuid not null,
  product_id uuid not null,
  quantity int not null check (quantity > 0),
  unit_price  numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

-- Ensure FK to orders
do $$
declare
  r record;
begin
  for r in
    select con.constraint_name
    from information_schema.key_column_usage kcu
    join information_schema.table_constraints con
      on con.constraint_name = kcu.constraint_name
     and con.table_schema = kcu.table_schema
    where kcu.table_schema = 'public'
      and kcu.table_name = 'order_items'
      and kcu.column_name = 'order_id'
      and con.constraint_type = 'FOREIGN KEY'
  loop
    execute format('alter table public.order_items drop constraint %I', r.constraint_name);
  end loop;
end$$;

alter table public.order_items
  add constraint order_items_order_fk
  foreign key (order_id) references public.orders(id)
  on update cascade on delete cascade;

create index if not exists idx_order_items_order_id
  on public.order_items (order_id);
