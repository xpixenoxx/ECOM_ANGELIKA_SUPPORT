'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from '@/components/ui/Toast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Tab = 'signin' | 'signup';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultTab?: Tab;
}

export function AuthModal({ onClose, onSuccess, defaultTab = 'signin' }: AuthModalProps) {
  const router = useRouter();
  const { signIn, signUp, signInWithOAuth, resetPassword } = useAuth();

  const [tab, setTab] = useState<Tab>(defaultTab);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const switchTab = (t: Tab) => {
    setTab(t);
    setErrors({});
    setAuthError('');
    setForgotMode(false);
    setResetSent(false);
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!email.trim()) {
      e.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      e.email = 'Please enter a valid email address';
    }

    if (forgotMode) {
      setErrors(e);
      return Object.keys(e).length === 0;
    }

    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }

    if (tab === 'signup') {
      if (!fullName.trim() || fullName.trim().length < 2) {
        e.fullName = 'Please enter your full name (at least 2 characters)';
      }
      if (password && confirmPassword && password !== confirmPassword) {
        e.confirmPassword = 'Passwords do not match';
      }
      if (!agreedToTerms) {
        e.terms = 'Please accept the Terms & Conditions to create your account';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (forgotMode) {
        const { error } = await resetPassword(email.trim());
        if (error) {
          setAuthError(error.message);
        } else {
          setResetSent(true);
          toast.success('Reset link sent! Check your email.');
        }
        return;
      }

      if (tab === 'signin') {
        const timeoutPromise = new Promise<{ error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error('Sign-in request timed out. Please try again.')), 7000)
        );
        const { error } = await Promise.race([signIn(email.trim(), password), timeoutPromise]);
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
            setAuthError('Incorrect email or password. Please try again.');
          } else {
            setAuthError(error.message);
          }
          return;
        }
        toast.success('Welcome back!');
        onSuccess();
      } else {
        const timeoutPromise = new Promise<{ error: Error | null }>((_, reject) =>
          setTimeout(() => reject(new Error('Registration timed out. Please try again.')), 7000)
        );
        const { error } = await Promise.race([
          signUp(email.trim(), password, { full_name: fullName.trim() }),
          timeoutPromise,
        ]);
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('already registered') || msg.includes('already exists')) {
            setAuthError('An account with this email already exists. Please sign in.');
            setTab('signin');
          } else {
            setAuthError(error.message);
          }
          return;
        }
        toast.success(`Welcome to Angelika Circle, ${fullName.trim()}!`);
        onSuccess();
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      const { error } = await signInWithOAuth('google');
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('not enabled') || msg.includes('unsupported')) {
          toast.info('Google sign-in is being set up. Please use email & password below.');
        } else {
          setAuthError(error.message);
        }
      }
    } catch {
      toast.info('Please use email & password while Google sign-in is being finalized.');
    } finally {
      setSubmitting(false);
    }
  };

  const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  const content = (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-[var(--color-ink)]/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Card */}
        <motion.div
          className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.25, ease: [0.175, 0.885, 0.32, 1.275] }}
          role="dialog"
          aria-modal="true"
          aria-label="Sign In or Create Account"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--color-mist)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-colors z-10"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Tabs */}
          {!forgotMode && (
            <div className="flex border-b border-[var(--color-whisper)] px-6 pt-6">
              <button
                type="button"
                onClick={() => switchTab('signin')}
                className={`flex-1 pb-3 text-sm font-semibold tracking-wide transition-all duration-200 ${
                  tab === 'signin'
                    ? 'text-[var(--color-ink)] border-b-2 border-[var(--color-gold)]'
                    : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className={`flex-1 pb-3 text-sm font-semibold tracking-wide transition-all duration-200 ${
                  tab === 'signup'
                    ? 'text-[var(--color-ink)] border-b-2 border-[var(--color-gold)]'
                    : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          <div className="px-6 py-5 space-y-5">
            {/* Header */}
            <div className="text-center">
              <h2 className="font-display text-xl font-medium text-[var(--color-ink)]">
                {forgotMode
                  ? 'Reset Your Password'
                  : tab === 'signin'
                  ? 'Welcome Back'
                  : 'Join Angelika Circle'}
              </h2>
              <p className="text-xs text-[var(--color-slate)] mt-1">
                {forgotMode
                  ? 'Enter your email to receive reset instructions'
                  : tab === 'signin'
                  ? 'Sign in to access your orders, wishlist, and bespoke styling'
                  : 'Enjoy member privileges, bespoke sizing, and private previews'}
              </p>
            </div>

            {/* Google Button */}
            {!forgotMode && (
              <>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--color-whisper)] rounded-[var(--radius-md)] text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-gold)] hover:bg-[var(--color-snow)] transition-all duration-200 disabled:opacity-60"
                >
                  <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  CONTINUE WITH GOOGLE
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--color-whisper)]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="px-3 bg-white text-[var(--color-mist)] font-medium">Or with email</span>
                  </div>
                </div>
              </>
            )}

            {/* Auth Error Banner */}
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-xs text-red-700 flex items-start gap-2" role="alert">
                <svg className="h-4 w-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                {authError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Full Name — signup only */}
              {tab === 'signup' && !forgotMode && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Full Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); if (errors.fullName) setErrors(p => ({ ...p, fullName: '' })); }}
                    error={errors.fullName}
                    autoComplete="name"
                    disabled={submitting}
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                  error={errors.email}
                  autoComplete="email"
                  disabled={submitting}
                />
              </div>

              {/* Password */}
              {!forgotMode && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Password</label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                    error={errors.password}
                    autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                    disabled={submitting}
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="text-[var(--color-slate)] hover:text-[var(--color-gold)] p-1 transition-colors" tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        <EyeIcon open={showPassword} />
                      </button>
                    }
                  />
                </div>
              )}

              {/* Confirm Password — signup only */}
              {tab === 'signup' && !forgotMode && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Confirm Password</label>
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(p => ({ ...p, confirmPassword: '' })); }}
                    error={errors.confirmPassword}
                    autoComplete="new-password"
                    disabled={submitting}
                    rightIcon={
                      <button type="button" onClick={() => setShowConfirm(p => !p)} className="text-[var(--color-slate)] hover:text-[var(--color-gold)] p-1 transition-colors" tabIndex={-1} aria-label={showConfirm ? 'Hide' : 'Show'}>
                        <EyeIcon open={showConfirm} />
                      </button>
                    }
                  />
                </div>
              )}

              {/* Remember Me + Forgot Password — signin only */}
              {tab === 'signin' && !forgotMode && (
                <div className="flex items-center justify-between text-xs">
                  <Checkbox
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    id="auth-modal-remember"
                  />
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setErrors({}); setAuthError(''); }}
                    className="text-[var(--color-gold)] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Reset sent confirmation */}
              {forgotMode && resetSent && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[var(--radius-md)] text-xs text-emerald-800">
                  ✓ If an account exists for <strong>{email}</strong>, a password reset link has been dispatched.
                </div>
              )}

              {/* Terms — signup only */}
              {tab === 'signup' && !forgotMode && (
                <div>
                  <Checkbox
                    id="auth-modal-terms"
                    checked={agreedToTerms}
                    onChange={(e) => { setAgreedToTerms(e.target.checked); if (errors.terms) setErrors(p => ({ ...p, terms: '' })); }}
                    label={
                      <span className="text-xs text-[var(--color-slate)] leading-relaxed">
                        I agree to the{' '}
                        <Link href="/terms" target="_blank" className="text-[var(--color-gold)] font-medium hover:underline">Terms &amp; Conditions</Link>
                        {' '}and{' '}
                        <Link href="/privacy" target="_blank" className="text-[var(--color-gold)] font-medium hover:underline">Privacy Policy</Link>
                      </span>
                    }
                  />
                  {errors.terms && (
                    <p className="mt-1 text-xs text-[var(--color-error)]" role="alert">{errors.terms}</p>
                  )}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={submitting}
                disabled={submitting}
                className="shadow-md hover:shadow-lg transition-all font-semibold tracking-wider uppercase text-xs py-3.5 mt-2"
              >
                {forgotMode
                  ? 'Send Reset Link'
                  : tab === 'signin'
                  ? 'SIGN IN TO ACCOUNT'
                  : 'CREATE MY ACCOUNT'}
              </Button>

              {/* Back to sign in from forgot */}
              {forgotMode && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setForgotMode(false); setErrors({}); setAuthError(''); }}
                    className="text-xs font-semibold text-[var(--color-gold)] hover:underline"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}
            </form>

            {/* Bottom switcher */}
            {!forgotMode && (
              <div className="text-center pt-3 border-t border-[var(--color-whisper)]">
                <p className="text-xs text-[var(--color-slate)]">
                  {tab === 'signin'
                    ? "Don't have an Angelika account yet?"
                    : 'Already a registered customer?'}
                  {' '}
                  <button
                    type="button"
                    onClick={() => switchTab(tab === 'signin' ? 'signup' : 'signin')}
                    className="font-semibold text-[var(--color-gold)] hover:underline ml-1"
                  >
                    {tab === 'signin' ? 'Create one now' : 'Sign in here'}
                  </button>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(content, document.body);
}
