-- ============================================================================
-- Q-LINK KENYA - SUPABASE DATABASE SETUP
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor to set up the database
-- Supabase Dashboard → Your Project → SQL Editor → Create new query
-- ============================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
  city text,
  county text,
  avatar_url text,
  created_at timestamp DEFAULT now()
);

-- 2. Create service categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text,
  description text,
  color text,
  created_at timestamp DEFAULT now()
);

-- 3. Create service providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  description text,
  category text NOT NULL,
  sub_services text[],
  counties text[],
  city text,
  base_price numeric,
  price_unit text,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  doc_business_reg text,
  doc_tax_pin text,
  doc_id_document text,
  created_at timestamp DEFAULT now()
);

-- 4. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_category text NOT NULL,
  sub_services text[],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  address text NOT NULL,
  county text NOT NULL,
  city text NOT NULL,
  notes text,
  price numeric NOT NULL,
  qr_code text,
  created_at timestamp DEFAULT now(),
  completed_at timestamp
);

-- 5. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp DEFAULT now()
);

-- 6. Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  target_audience text NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'customers', 'providers')),
  priority text NOT NULL DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamp DEFAULT now(),
  expires_at timestamp
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view profiles of other users for provider info" ON profiles
  FOR SELECT USING (true); -- Allow public viewing of profiles

-- 9. RLS Policies for service_providers
CREATE POLICY "Users can view all providers" ON service_providers
  FOR SELECT USING (true);

CREATE POLICY "Providers can update their own profile" ON service_providers
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = provider_id);

CREATE POLICY "Customers can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update bookings they're involved in" ON bookings
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = provider_id);

-- 11. RLS Policies for announcements
CREATE POLICY "All users can view announcements" ON announcements
  FOR SELECT USING (true);

-- 12. Create indexes for performance
CREATE INDEX idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);

-- 13. Insert default service categories
INSERT INTO service_categories (name, icon, color, description) VALUES
  ('Home Care', '🏠', 'from-cyan-500 to-teal-600', 'Plumbing, electrical, maintenance'),
  ('Health', '⚕️', 'from-emerald-500 to-green-600', 'Medical & wellness services'),
  ('Business', '💼', 'from-violet-500 to-purple-600', 'Consulting & professional services'),
  ('Beauty', '💅', 'from-pink-500 to-rose-600', 'Hair, makeup & beauty services'),
  ('Repair', '🔧', 'from-amber-500 to-orange-600', 'Device & equipment repairs'),
  ('Education', '📚', 'from-blue-500 to-cyan-600', 'Tutoring & educational services'),
  ('Travel', '✈️', 'from-red-500 to-pink-600', 'Travel planning & assistance'),
  ('Legal', '⚖️', 'from-slate-500 to-slate-600', 'Legal consultation')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- NEXT STEPS:
-- 1. Run this entire script in your Supabase SQL Editor
-- 2. Go to Authentication → Users to create your first user
-- 3. Update your Supabase URL and key in .env file if not done
-- 4. Test registration and login
-- ============================================================================
