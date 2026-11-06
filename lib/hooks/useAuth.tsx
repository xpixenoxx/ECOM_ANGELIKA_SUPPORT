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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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