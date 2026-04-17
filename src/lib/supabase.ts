/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = (import.meta.env.VITE_SUPABASE_URL ?? '') as string;
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '') as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️  Missing Supabase env vars. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(
  SUPABASE_URL      || 'https://xoakkegecqckskxhjazl.supabase.co',
  SUPABASE_ANON_KEY || 'sb_publishable_jiwV8kZ5waGibmh2EJUgPA_3qejkmBi'
);
export type DbProfile = {
  id: string;
  name: string;
  phone: string | null;
  role: 'customer' | 'provider' | 'admin';
  city: string | null;
  county: string | null;
  created_at: string;
};

export type DbServiceCategory = {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  color: string;
  created_at: string;
};

export type DbServiceProvider = {
  id: string;
  user_id: string;
  business_name: string;
  description: string | null;
  category: string;
  sub_services: string[];
  counties: string[];
  city: string | null;
  base_price: number;
  price_unit: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_approved: boolean;
  doc_business_reg: string | null;
  doc_tax_pin: string | null;
  doc_id_document: string | null;
  created_at: string;
};

export type DbBooking = {
  id: string;
  customer_id: string;
  provider_id: string;
  service_category: string;
  sub_services: string[];
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  county: string;
  city: string;
  notes: string | null;
  price: number;
  qr_code: string;
  created_at: string;
  completed_at: string | null;
};

export type DbReview = {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type DbAnnouncement = {
  id: string;
  title: string;
  content: string;
  target_audience: 'all' | 'customers' | 'providers';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  expires_at: string | null;
};
