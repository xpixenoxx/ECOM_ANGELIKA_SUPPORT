'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, data?: Record<string, any>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOtp: (email: string, phone?: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'facebook') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => getSupabaseClient(), []);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: ensure loading never hangs past 2 seconds
    const safetyTimeout = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 2000);

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id).catch(() => {});
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Initial auth session check notice:', err);
        if (isMounted) setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).catch(() => {});
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) setProfile(data);
    } catch (err) {
      console.warn('Profile fetch warning:', err);
    }
  };

  const signUp = async (email: string, password: string, data?: Record<string, any>) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data },
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    // Ensure session is active immediately so user is never prompted to sign in twice
    let currentSession = authData?.session;
    let currentUser = authData?.user;

    if (!currentSession) {
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) {
        return { error: new Error(signInErr.message) };
      }
      currentSession = signInData.session;
      currentUser = signInData.user;
    }

    if (currentUser) {
      setUser(currentUser);
      setSession(currentSession);
      fetchProfile(currentUser.id).catch(() => {});
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: new Error(error.message) };
    }
    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      fetchProfile(data.user.id).catch(() => {});
    }
    return { error: null };
  };

  const signInWithOtp = async (email: string, phone?: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      phone,
      options: {
        shouldCreateUser: true,
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'facebook') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    if (data?.url) {
      try {
        const probe = await fetch(data.url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (!probe.ok && probe.status === 400) {
          const body = await probe.json().catch(() => null);
          if (body?.msg?.includes('not enabled') || body?.error_code === 'validation_failed') {
            return {
              error: new Error('Google Sign-In is not enabled yet in your Supabase project. Please enable Google provider in your Supabase Dashboard (Auth > Providers > Google), or sign in with your email and password.'),
            };
          }
        }
      } catch {
        // If probing is prevented by CORS or network, proceed to browser redirect
      }

      window.location.assign(data.url);
      return { error: null };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('guest_cart');
        localStorage.removeItem('cart_count');
        localStorage.removeItem('cart_updated');
        localStorage.removeItem('guest_wishlist');
        localStorage.removeItem('user_wishlist');
        localStorage.removeItem('wishlist_count');
        localStorage.removeItem('wishlist_updated');
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: [], totals: { itemCount: 0 } } }));
        window.dispatchEvent(new CustomEvent('wishlist:updated', { detail: { items: [] } }));
      } catch {}
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env['NEXT_PUBLIC_SITE_URL']}/auth/reset-password`,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? new Error(error.message) : null };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user') };

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      await fetchProfile(user.id);
    }
    return { error: error ? new Error(error.message) : null };
  };

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signInWithOtp,
        signInWithOAuth,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}