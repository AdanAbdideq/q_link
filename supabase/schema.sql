-- ============================================================
-- Q-LINK Kenya – Supabase Schema
-- Run this in the Supabase SQL editor to set up your database
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  phone       text unique,
  role        text not null check (role in ('customer', 'provider', 'admin')),
  city        text,
  county      text,
  created_at  timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
create policy "Users can view their own profile"  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone, role, city, county)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'county'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- SERVICE CATEGORIES
-- ─────────────────────────────────────────
create table public.service_categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  icon        text not null,
  description text,
  color       text default '#3b82f6',
  created_at  timestamptz default now()
);

alter table public.service_categories enable row level security;
create policy "Anyone can view service categories" on public.service_categories for select using (true);
create policy "Admins can manage service categories" on public.service_categories for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─────────────────────────────────────────
-- SERVICE PROVIDERS
-- ─────────────────────────────────────────
create table public.service_providers (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.profiles(id) on delete cascade not null unique,
  business_name   text not null,
  description     text,
  category        text not null,
  sub_services    text[] default '{}',
  counties        text[] default '{}',
  city            text,
  base_price      numeric(10,2) default 0,
  price_unit      text default 'per hour',
  rating          numeric(3,2) default 0,
  review_count    int default 0,
  is_verified     boolean default false,
  is_approved     boolean default false,
  doc_business_reg text,
  doc_tax_pin     text,
  doc_id_document text,
  created_at      timestamptz default now()
);

alter table public.service_providers enable row level security;
create policy "Anyone can view approved providers" on public.service_providers for select using (is_approved = true);
create policy "Provider can view their own record" on public.service_providers for select using (user_id = auth.uid());
create policy "Provider can update their own record" on public.service_providers for update using (user_id = auth.uid());
create policy "Provider can insert their own record" on public.service_providers for insert with check (user_id = auth.uid());
create policy "Admins can view all providers" on public.service_providers for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "Admins can update any provider" on public.service_providers for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────
create table public.bookings (
  id               uuid primary key default uuid_generate_v4(),
  customer_id      uuid references public.profiles(id) on delete set null,
  provider_id      uuid references public.service_providers(id) on delete set null,
  service_category text not null,
  sub_services     text[] default '{}',
  status           text not null default 'pending'
                     check (status in ('pending','confirmed','in_progress','completed','cancelled')),
  scheduled_date   date not null,
  scheduled_time   time not null,
  address          text not null,
  county           text not null,
  city             text not null,
  notes            text,
  price            numeric(10,2) not null,
  qr_code          text unique not null,
  created_at       timestamptz default now(),
  completed_at     timestamptz
);

alter table public.bookings enable row level security;
create policy "Customers can view their own bookings" on public.bookings for select using (customer_id = auth.uid());
create policy "Customers can create bookings" on public.bookings for insert with check (customer_id = auth.uid());
create policy "Providers can view their bookings" on public.bookings for select using (
  exists (select 1 from public.service_providers sp where sp.id = provider_id and sp.user_id = auth.uid())
);
create policy "Providers can update their bookings" on public.bookings for update using (
  exists (select 1 from public.service_providers sp where sp.id = provider_id and sp.user_id = auth.uid())
);
create policy "Admins can view all bookings" on public.bookings for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────
create table public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid references public.bookings(id) on delete cascade unique,
  customer_id uuid references public.profiles(id) on delete set null,
  provider_id uuid references public.service_providers(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

alter table public.reviews enable row level security;
create policy "Anyone can view reviews" on public.reviews for select using (true);
create policy "Customers can insert reviews for their bookings" on public.reviews for insert
  with check (customer_id = auth.uid());

-- Auto-update provider rating on new review
create or replace function public.update_provider_rating()
returns trigger language plpgsql as $$
begin
  update public.service_providers
  set
    rating = (select avg(rating) from public.reviews where provider_id = new.provider_id),
    review_count = (select count(*) from public.reviews where provider_id = new.provider_id)
  where id = new.provider_id;
  return new;
end;
$$;

create trigger on_review_insert
  after insert on public.reviews
  for each row execute procedure public.update_provider_rating();

-- ─────────────────────────────────────────
-- ANNOUNCEMENTS
-- ─────────────────────────────────────────
create table public.announcements (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  content          text not null,
  target_audience  text not null default 'all' check (target_audience in ('all','customers','providers')),
  priority         text not null default 'medium' check (priority in ('low','medium','high')),
  created_at       timestamptz default now(),
  expires_at       timestamptz
);

alter table public.announcements enable row level security;
create policy "Anyone can view announcements" on public.announcements for select using (true);
create policy "Admins can manage announcements" on public.announcements for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─────────────────────────────────────────
-- SEED: Service Categories
-- ─────────────────────────────────────────
insert into public.service_categories (name, icon, description, color) values
  ('Plumbing',     'droplets',  'Professional plumbing services for your home and business', '#3b82f6'),
  ('Electrical',   'zap',       'Certified electricians for all your electrical needs',      '#f59e0b'),
  ('Cleaning',     'sparkles',  'Home and office cleaning services',                         '#10b981'),
  ('Carpentry',    'hammer',    'Skilled carpenters for furniture and woodwork',              '#8b5cf6'),
  ('Painting',     'paintbrush','Interior and exterior painting services',                   '#ec4899'),
  ('HVAC',         'wind',      'Air conditioning and heating services',                     '#06b6d4'),
  ('Landscaping',  'flower-2',  'Garden and landscape design services',                      '#22c55e'),
  ('Moving',       'truck',     'Professional moving and relocation services',               '#f97316');
