/**
 * useSupabase hooks — typed data access for every entity in the app.
 * Each hook handles loading, error, and refetch patterns.
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { DbBooking, DbServiceProvider, DbAnnouncement, DbServiceCategory, DbProfile } from '@/lib/supabase';

import { useAuth } from '@/context/AuthContext';

// ─── Generic fetcher ────────────────────────────────────────────────────────
function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}

// ─── Service Categories ──────────────────────────────────────────────────────
export function useServiceCategories() {
  return useFetch<DbServiceCategory[]>(async () => {
    const { data, error } = await supabase.from('service_categories').select('*').order('name');
    if (error) throw error;
    return data ?? [];
  });
}

// ─── Providers (for customer browsing) ──────────────────────────────────────
export function useProvidersByCategory(category: string | null) {
  return useFetch<DbServiceProvider[]>(
    async () => {
      if (!category) return [];
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('category', category)
        .eq('is_approved', true)
        .order('rating', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    [category]
  );
}

// ─── Single provider ─────────────────────────────────────────────────────────
export function useProvider(providerId: string | null) {
  return useFetch<DbServiceProvider | null>(
    async () => {
      if (!providerId) return null;
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', providerId)
        .single();
      if (error) throw error;
      return data;
    },
    [providerId]
  );
}

// ─── Current user's provider profile ────────────────────────────────────────
export function useMyProviderProfile() {
  const { user } = useAuth();
  return useFetch<DbServiceProvider | null>(
    async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    [user?.id]
  );
}

// ─── Customer bookings ───────────────────────────────────────────────────────
export function useCustomerBookings() {
  const { user } = useAuth();
  return useFetch<DbBooking[]>(
    async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    [user?.id]
  );
}

// ─── Provider bookings ───────────────────────────────────────────────────────
export function useProviderBookings(providerId: string | null) {
  return useFetch<DbBooking[]>(
    async () => {
      if (!providerId) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', providerId)
        .order('scheduled_date', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    [providerId]
  );
}

// ─── All bookings (admin) ────────────────────────────────────────────────────
export function useAllBookings() {
  return useFetch<DbBooking[]>(async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
}

// ─── Announcements ────────────────────────────────────────────────────────────
export function useAnnouncements(audience?: 'customers' | 'providers') {
  return useFetch<DbAnnouncement[]>(
    async () => {
      let q = supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (audience) {
        q = q.in('target_audience', ['all', audience]);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    [audience]
  );
}

// ─── All providers (admin) ───────────────────────────────────────────────────
export function useAllProviders() {
  return useFetch<DbServiceProvider[]>(async () => {
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
}

// ─── All users (admin) ────────────────────────────────────────────────────────
export function useAllUsers() {
  return useFetch<DbProfile[]>(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
}

// ─── Platform analytics (admin) ──────────────────────────────────────────────
export function usePlatformAnalytics() {
  return useFetch<{
    totalUsers: number;
    totalProviders: number;
    totalBookings: number;
    totalRevenue: number;
    bookingsToday: number;
    activeBookings: number;
    pendingApprovals: number;
  }>(async () => {
    const today = new Date().toISOString().split('T')[0];

    const [
      { count: totalUsers },
      { count: totalProviders },
      { count: totalBookings },
      { count: bookingsToday },
      { count: activeBookings },
      { count: pendingApprovals },
      { data: revenueData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('service_providers').select('*', { count: 'exact', head: true }).eq('is_approved', true),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('scheduled_date', today),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed', 'in_progress']),
      supabase.from('service_providers').select('*', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('bookings').select('price').eq('status', 'completed'),
    ]);

    const totalRevenue = (revenueData ?? []).reduce((sum, b) => sum + (b.price ?? 0), 0);

    return {
      totalUsers: totalUsers ?? 0,
      totalProviders: totalProviders ?? 0,
      totalBookings: totalBookings ?? 0,
      totalRevenue,
      bookingsToday: bookingsToday ?? 0,
      activeBookings: activeBookings ?? 0,
      pendingApprovals: pendingApprovals ?? 0,
    };
  });
}

// ─── Booking mutations ────────────────────────────────────────────────────────
export async function createBooking(booking: Omit<DbBooking, 'id' | 'created_at' | 'completed_at'>) {
  const { data, error } = await supabase.from('bookings').insert(booking).select().single();
  if (error) throw error;
  return data as DbBooking;
}

export async function updateBookingStatus(bookingId: string, status: DbBooking['status']) {
  const update: Partial<DbBooking> = { status };
  if (status === 'completed') update.completed_at = new Date().toISOString();

  const { error } = await supabase.from('bookings').update(update).eq('id', bookingId);
  if (error) throw error;
}

export async function verifyBookingByQRCode(qrCode: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('qr_code', qrCode)
    .single();
  if (error) throw error;
  return data as DbBooking;
}

// ─── Provider mutations ───────────────────────────────────────────────────────
export async function approveProvider(providerId: string) {
  const { error } = await supabase
    .from('service_providers')
    .update({ is_approved: true, is_verified: true })
    .eq('id', providerId);
  if (error) throw error;
}

export async function rejectProvider(providerId: string) {
  const { error } = await supabase
    .from('service_providers')
    .update({ is_approved: false, is_verified: false })
    .eq('id', providerId);
  if (error) throw error;
}

export async function updateProviderProfile(providerId: string, updates: Partial<DbServiceProvider>) {
  const { error } = await supabase
    .from('service_providers')
    .update(updates)
    .eq('id', providerId);
  if (error) throw error;
}

// ─── Announcement mutations ───────────────────────────────────────────────────
export async function createAnnouncement(announcement: Omit<DbAnnouncement, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('announcements').insert(announcement).select().single();
  if (error) throw error;
  return data as DbAnnouncement;
}

export async function deleteAnnouncement(announcementId: string) {
  const { error } = await supabase.from('announcements').delete().eq('id', announcementId);
  if (error) throw error;
}
