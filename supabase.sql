-- =========================================================
-- HangI0 女装展示站 — Supabase 初始化脚本
-- 本脚本可重复执行（幂等）：表用 if not exists，策略先 drop 再 create。
-- =========================================================

-- =========================================================
-- 商品表
-- =========================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('dress', 'outerwear', 'daily', 'bottom', 'set', 'other')),
  price text not null,
  tag text,
  description text,
  image_url text not null,
  model_image_url text,
  model_image_urls jsonb not null default '[]'::jsonb,
  clothing_image_url text,
  inventory jsonb not null default '[]'::jsonb,
  total_stock integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists model_image_url text;
alter table public.products add column if not exists clothing_image_url text;
alter table public.products add column if not exists model_image_urls jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists inventory jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists total_stock integer not null default 0;

alter table public.products drop constraint if exists products_category_check;
alter table public.products
add constraint products_category_check
check (category in ('dress', 'outerwear', 'daily', 'bottom', 'set', 'other'));

alter table public.products enable row level security;

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
on public.products for select to anon, authenticated using (published = true);

drop policy if exists "Authenticated users can read all products" on public.products;
create policy "Authenticated users can read all products"
on public.products for select to authenticated using (true);

drop policy if exists "Authenticated users can create products" on public.products;
create policy "Authenticated users can create products"
on public.products for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update products" on public.products;
create policy "Authenticated users can update products"
on public.products for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated users can delete products" on public.products;
create policy "Authenticated users can delete products"
on public.products for delete to authenticated using (true);

-- =========================================================
-- 图片存储桶
-- =========================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');

drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images"
on storage.objects for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "Authenticated users can update product images" on storage.objects;
create policy "Authenticated users can update product images"
on storage.objects for update to authenticated using (bucket_id = 'product-images') with check (bucket_id = 'product-images');

drop policy if exists "Authenticated users can delete product images" on storage.objects;
create policy "Authenticated users can delete product images"
on storage.objects for delete to authenticated using (bucket_id = 'product-images');

-- =========================================================
-- 店铺设置（电话 / 微信 / 二维码 / 地址 / 营业时间）
-- 前台公开读取，店主（已登录）可写
-- =========================================================
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings"
on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "Authenticated can insert settings" on public.site_settings;
create policy "Authenticated can insert settings"
on public.site_settings for insert to authenticated with check (true);

drop policy if exists "Authenticated can update settings" on public.site_settings;
create policy "Authenticated can update settings"
on public.site_settings for update to authenticated using (true) with check (true);

-- 初始占位（可在后台修改）
insert into public.site_settings (key, value) values
  ('phone', ''),
  ('wechat', ''),
  ('wechat_qr', ''),
  ('address', ''),
  ('hours', ''),
  ('theme', 'autumn-clay'),
  ('feature_product_id', ''),
  ('hero_image_url', ''),
  ('hero_line1', ''),
  ('hero_line2', ''),
  ('hero_sub', ''),
  ('announce', '')
on conflict (key) do nothing;

-- =========================================================
-- 穿搭 / 搭配（Lookbook），点击展示整套单品
-- =========================================================
create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image_url text not null,
  image_urls jsonb not null default '[]'::jsonb,
  items jsonb not null default '[]'::jsonb,
  sort integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.outfits enable row level security;

drop policy if exists "Public can read published outfits" on public.outfits;
create policy "Public can read published outfits"
on public.outfits for select to anon, authenticated using (published = true);

drop policy if exists "Authenticated can read all outfits" on public.outfits;
create policy "Authenticated can read all outfits"
on public.outfits for select to authenticated using (true);

drop policy if exists "Authenticated can insert outfits" on public.outfits;
create policy "Authenticated can insert outfits"
on public.outfits for insert to authenticated with check (true);

drop policy if exists "Authenticated can update outfits" on public.outfits;
create policy "Authenticated can update outfits"
on public.outfits for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated can delete outfits" on public.outfits;
create policy "Authenticated can delete outfits"
on public.outfits for delete to authenticated using (true);
