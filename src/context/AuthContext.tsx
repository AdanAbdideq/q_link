import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type DbProfile = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: 'customer' | 'provider' | 'admin';
  city: string | null;
  county: string | null;
  avatar_url: string | null;
  created_at: string;
};

interface CustomerSignUpData {
  name: string;
  email: string;        // ← real email now
  password: string;
  phone?: string;
  city: string;
  county: string;
}

interface ProviderSignUpData {
  name: string;
  email: string;        // ← real email now
  password: string;
  phone?: string;
  city: string;
  county: string;
  businessName: string;
  category: string;
  description: string;
  subServices: string[];
  counties: string[];
  basePrice: number;
  priceUnit: string;
}

interface AuthContextValue {
  user: User | null;
  profile: DbProfile | null;
  session: Session | null;
  loading: boolean;
  signUpCustomer: (data: CustomerSignUpData) => Promise<unknown>;
  signUpProvider: (data: ProviderSignUpData) => Promise<unknown>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phone: string, password: string) => Promise<void>; // kept for backwards compat
  signInAdmin: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles').select('*').eq('id', userId).single();
      if (!error && data) setProfile(data as DbProfile);
    } catch { /* profile table may not exist yet */ }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) loadProfile(session.user.id);
        else setProfile(null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Customer sign up (real email) ─────────────────────────────────────────
  const signUpCustomer = async (d: CustomerSignUpData) => {
    const { data, error } = await supabase.auth.signUp({
      email: d.email,
      password: d.password,
      options: {
        data: {
          name: d.name,
          phone: d.phone ?? '',
          role: 'customer',
          city: d.city,
          county: d.county,
        },
      },
    });
    if (error) throw error;
    return data.user;
  };

  // ── Provider sign up (real email) ─────────────────────────────────────────
  const signUpProvider = async (d: ProviderSignUpData) => {
    const { data, error } = await supabase.auth.signUp({
      email: d.email,
      password: d.password,
      options: {
        data: {
          name: d.name,
          phone: d.phone ?? '',
          role: 'provider',
          city: d.city,
          county: d.county,
        },
      },
    });
    if (error) throw error;

    if (data.user) {
      const { error: pe } = await supabase.from('service_providers').insert({
        user_id: data.user.id,
        business_name: d.businessName,
        description: d.description,
        category: d.category,
        sub_services: d.subServices,
        counties: d.counties,
        city: d.city,
        base_price: d.basePrice,
        price_unit: d.priceUnit,
        is_verified: false,
        is_approved: false,
      });
      if (pe) throw pe;
    }
    return data.user;
  };

  // ── Sign in with email (primary) ──────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // ── Sign in with phone (legacy — kept for compatibility) ──────────────────
  // Still converts to the @qlink.local scheme so existing accounts work
  const signInWithPhone = async (phone: string, password: string) => {
    const email = `${phone.replace(/\D/g, '')}@qlink.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // ── Admin sign in ─────────────────────────────────────────────────────────
  const signInAdmin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // ── Sign out ──────────────────────────────────────────────────────────────
  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      signUpCustomer, signUpProvider,
      signIn, signInWithPhone, signInAdmin, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}