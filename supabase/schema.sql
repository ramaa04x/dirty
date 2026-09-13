-- Dirty (@dirty.rash) — schema inicial

create extension if not exists pgcrypto;

-- Quiénes pueden administrar (productos, stock, hero, pedidos)
create table admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'ARS',
  category text,
  sleeve_type text check (sleeve_type is null or sleeve_type in ('corta', 'larga')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  storage_path text not null,
  position integer not null default 0,
  alt_text text
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  size text not null,
  sku text unique,
  stock integer not null default 0 check (stock >= 0),
  price_override_cents integer,
  is_active boolean not null default true,
  unique (product_id, size)
);

create table hero_content (
  id uuid primary key default gen_random_uuid(),
  media_type text not null check (media_type in ('video', 'image')),
  storage_path text,
  external_url text,
  title text,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb,
  subtotal_cents integer not null,
  shipping_cents integer not null default 0,
  total_cents integer not null,
  currency text not null default 'ARS',
  mp_preference_id text,
  mp_payment_id text,
  mp_status text,
  mp_status_detail text,
  stock_decremented boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  variant_id uuid references product_variants (id) on delete set null,
  product_name text not null,
  size text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0)
);

create index on product_images (product_id);
create index on product_variants (product_id);
create index on order_items (order_id);
create index on orders (status);

-- Descuento atómico de stock, usado por el webhook de Mercado Pago
create or replace function decrement_variant_stock(p_variant_id uuid, p_qty integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  update product_variants
  set stock = stock - p_qty
  where id = p_variant_id and stock >= p_qty;

  get diagnostics affected = row_count;
  return affected > 0;
end;
$$;

-- Trigger simple para updated_at
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- RLS
alter table admins enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table hero_content enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- Lectura pública de catálogo activo
create policy "public read active products" on products
  for select using (is_active = true or is_admin());

create policy "public read product images" on product_images
  for select using (
    exists (select 1 from products p where p.id = product_images.product_id and (p.is_active or is_admin()))
  );

create policy "public read active variants" on product_variants
  for select using (is_active = true or is_admin());

create policy "public read active hero content" on hero_content
  for select using (is_active = true or is_admin());

-- Escritura solo admins
create policy "admin write products" on products
  for all using (is_admin()) with check (is_admin());

create policy "admin write product images" on product_images
  for all using (is_admin()) with check (is_admin());

create policy "admin write product variants" on product_variants
  for all using (is_admin()) with check (is_admin());

create policy "admin write hero content" on hero_content
  for all using (is_admin()) with check (is_admin());

-- Pedidos: nada de acceso directo para anon; solo admins leen/actualizan.
-- La creación de pedidos ocurre exclusivamente vía Edge Function con service role.
create policy "admin read orders" on orders
  for select using (is_admin());

create policy "admin update orders" on orders
  for update using (is_admin()) with check (is_admin());

create policy "admin read order items" on order_items
  for select using (is_admin());

create policy "admins manage own admin row" on admins
  for select using (is_admin());

-- Migración: academias (aplicada vía apply_migration, ver create_academies_table)
create table academies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table academies enable row level security;

create policy "public read active academies" on academies
  for select using (is_active = true or is_admin());

create policy "admin write academies" on academies
  for all using (is_admin()) with check (is_admin());

-- Migración: galería de fotos por academia (aplicada vía apply_migration, ver academy_photos_gallery)
create table academy_photos (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references academies (id) on delete cascade,
  storage_path text not null,
  position integer not null default 0
);

alter table academy_photos enable row level security;

create policy "public read academy photos" on academy_photos
  for select using (
    exists (select 1 from academies a where a.id = academy_photos.academy_id and (a.is_active or is_admin()))
  );

create policy "admin write academy photos" on academy_photos
  for all using (is_admin()) with check (is_admin());

-- Bucket de logos de academias (aplicado vía apply_migration, ver create_academy_logos_bucket)
insert into storage.buckets (id, name, public) values ('academy-logos', 'academy-logos', true);

create policy "public read academy-logos" on storage.objects
  for select using (bucket_id = 'academy-logos');

create policy "admin write academy-logos" on storage.objects
  for insert with check (bucket_id = 'academy-logos' and is_admin());

create policy "admin update academy-logos" on storage.objects
  for update using (bucket_id = 'academy-logos' and is_admin());

create policy "admin delete academy-logos" on storage.objects
  for delete using (bucket_id = 'academy-logos' and is_admin());
