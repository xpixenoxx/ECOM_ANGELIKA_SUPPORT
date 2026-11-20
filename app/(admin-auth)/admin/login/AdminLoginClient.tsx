'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { adminLoginAction } from '@/lib/actions/admin-auth';
import { getSupabaseClient } from '@/lib/supabase/client';

function sanitizeAdminRedirect(raw: string | null): string {
  if (!raw) return '/admin';
  if (
    raw.startsWith('/admin') &&
    !raw.startsWith('/admin/login') &&
    !raw.startsWith('//') &&
    !raw.startsWith('/\\')
  ) {
    return raw;
  }
  return '/admin';
}

export function AdminLoginClient() {
  const searchParams = useSearchParams();
  const redirectTarget = sanitizeAdminRedirect(searchParams.get('redirect'));
  const errorParam = searchParams.get('error');
  const signedOutParam = searchParams.get('signedout') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam === 'unauthorized') {
      setErrorMessage(
        'Your current account does not have Admin Portal permissions. Sign in with an administrator account below.'
      );
    }
    if (signedOutParam) {
      setInfoMessage('You have been signed out of the Admin Portal.');
    }
  }, [errorParam, signedOutParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Please enter a valid administrator email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Primary authentication via Server Action (writes SSR cookies directly, verifies admin role)
      const serverRes = await adminLoginAction(cleanEmail, password);
      if (!serverRes.success) {
        setErrorMessage(serverRes.error || 'Authentication failed. Please check your credentials.');
        setIsSubmitting(false);
        return;
      }

      // 2. Best-effort sync of browser Supabase client session so client components reflect user immediately
      try {
        const browserSupabase = getSupabaseClient();
        await Promise.race([
          browserSupabase.auth.signInWithPassword({ email: cleanEmail, password }),
          new Promise((resolve) => setTimeout(resolve, 2500)),
        ]);
      } catch {
        // Non-blocking: server SSR session cookies are already set
      }

      // 3. Full hard navigation so Cloudflare Edge middleware and AdminLayout see fresh session cookies
      window.location.href = redirectTarget;
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to reach authentication server. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#0B0B0D] text-[#F5F2EB] flex flex-col justify-between relative overflow-hidden">
      {/* Subtle architectural gold glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(201,168,76,0.22), transparent 45%), radial-gradient(circle at 80% 85%, rgba(201,168,76,0.14), transparent 45%)',
        }}
        aria-hidden="true"
      />

      {/* Minimal Admin Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#9E7C24] flex items-center justify-center shadow-lg shadow-[#C9A84C]/20">
            <span className="font-cormorant text-[#0B0B0D] font-bold text-xl leading-none">A</span>
          </div>
          <div className="flex flex-col">
            <span className="font-cormorant text-lg font-semibold tracking-wide text-[#F5F2EB] leading-tight">
              Angelika Fashions
            </span>
            <span className="text-[10px] uppercase tracking-[0.26em] text-[#C9A84C] font-semibold">
              Atelier Admin Console
            </span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#B8B2A6] hover:text-[#F5F2EB] transition-colors px-3 py-1.5 rounded-md border border-white/10 hover:border-white/25"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Storefront</span>
        </Link>
      </header>

      {/* Main Sign-In Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-[#141418]/95 backdrop-blur-xl shadow-2xl shadow-black/60 p-7 sm:p-9">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center text-[#D4AF37]">
                <Shield className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#C9A84C] font-semibold">
                  Restricted Access
                </p>
                <h1 className="font-cormorant text-2xl sm:text-3xl font-semibold text-[#F5F2EB] leading-tight">
                  Admin Portal Sign In
                </h1>
              </div>
            </div>

            <p className="text-sm text-[#A59F93] mb-6 leading-relaxed">
              Sign in with your authorized Angelika administrator credentials to manage products,
              homepage content, orders, and storefront settings.
            </p>

            {infoMessage && (
              <div
                role="status"
                className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-200"
              >
                {infoMessage}
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-200"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-400" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#C7C1B5] mb-2"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8478]"
                    aria-hidden="true"
                  />
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@angelikafashions.com"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-white/15 bg-[#0E0E12] pl-10 pr-4 py-3 text-sm text-[#F5F2EB] placeholder:text-[#666159] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#C7C1B5] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8478]"
                    aria-hidden="true"
                  />
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-white/15 bg-[#0E0E12] pl-10 pr-11 py-3 text-sm text-[#F5F2EB] placeholder:text-[#666159] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25 transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8A8478] hover:text-[#F5F2EB] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8922A] hover:from-[#DFBC49] hover:to-[#C9A033] text-[#0B0B0D] font-semibold text-sm py-3.5 px-4 shadow-lg shadow-[#C9A84C]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Verifying Admin Access...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Console</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-[#8A8478]">
              <span>Role-verified staff portal</span>
              <Link href="/login" className="text-[#C9A84C] hover:underline">
                Customer Sign In →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4 text-center text-[11px] text-[#6E695F] border-t border-white/5">
        Angelika Fashions Atelier Administration · Authorized Personnel Only
      </footer>
    </div>
  );
}
