'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from '@/components/ui/Toast';

type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
};

interface LoginPageClientProps {
  initialMode?: 'signin' | 'signup';
}

export function LoginPageClient({ initialMode }: LoginPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn, signUp, signInWithOAuth, resetPassword, loading: authLoading } = useAuth();

  const redirectTo = searchParams.get('redirect') || '/account';
  const isLogout = searchParams.get('logout') === 'true';
  const paramMode = searchParams.get('mode');

  // Determine initial tab mode
  const [isLogin, setIsLogin] = useState(() => {
    if (initialMode === 'signup') return false;
    if (paramMode === 'signup' || paramMode === 'register') return false;
    return true;
  });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Safely show toast on signout without violating React render rules
  useEffect(() => {
    if (isLogout) {
      toast.success('You have been signed out safely.');
    }
  }, [isLogout]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (forgotPasswordMode) {
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        newErrors.fullName = 'Please enter your full name';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!agreedToTerms) {
        newErrors.terms = 'Please accept the terms & conditions to create an account';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (forgotPasswordMode) {
        const { error } = await resetPassword(email.trim());
        if (error) {
          toast.error('Password Reset Failed', error.message);
        } else {
          setResetSent(true);
          toast.success('Check Your Email', 'Password reset instructions have been sent.');
        }
        return;
      }

      if (isLogin) {
        // Sign In Flow
        const { error } = await signIn(email.trim(), password);
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
            toast.error('Invalid Credentials', 'Incorrect email or password. Please verify your details or create a new account.');
          } else {
            toast.error('Sign In Failed', error.message);
          }
          return;
        }

        toast.success('Welcome Back!', 'Signing you into Angelika Fashions...');
        window.location.href = redirectTo || '/account';
      } else {
        // Sign Up Flow - User is immediately registered and logged in with zero friction
        const { error: signUpError } = await signUp(email.trim(), password, {
          full_name: fullName.trim(),
        });

        if (signUpError) {
          const msg = signUpError.message.toLowerCase();
          if (msg.includes('already registered') || msg.includes('already exists')) {
            toast.error('Account Exists', 'An account with this email already exists. Switching to Sign In.');
            setIsLogin(true);
          } else {
            toast.error('Registration Error', signUpError.message);
          }
          return;
        }

        // Account is immediately created and session established!
        toast.success('Welcome to Angelika Circle!', `Hello ${fullName.trim() || 'there'}, your account is ready.`);
        window.location.href = redirectTo || '/account';
      }
    } catch (err: any) {
      toast.error('Unexpected Error', err?.message || 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await signInWithOAuth('google');
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('not enabled') || msg.includes('unsupported provider')) {
          toast.info('Google Sign-In', 'Google sign-in is currently undergoing setup. Please sign in or register with email and password below.');
        } else {
          toast.error('Authentication Error', error.message);
        }
      }
    } catch {
      toast.info('Google Sign-In', 'Please use email and password while social provider setup is finalized.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-snow)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-1.5 mb-4 group" aria-label="Angelika Fashions - Home">
            <img
              src="/images/logo.png"
              alt="Angelika Fashions"
              className="h-14 w-auto object-contain rounded-sm transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)]">
              Angelika Fashions
            </span>
          </Link>
          <p className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-medium">
            Handcrafted Luxury Ethnic Wear
          </p>
        </div>

        {/* Auth Card */}
        <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] shadow-xl bg-[var(--color-white)]">
          <CardHeader className="pb-4">
            {/* Elegant Mode Switcher Tabs */}
            {!forgotPasswordMode && (
              <div className="flex border-b border-[var(--color-whisper)] -mx-4 px-4 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setErrors({});
                  }}
                  className={`flex-1 pb-3 text-sm font-semibold tracking-wide transition-all duration-200 relative ${
                    isLogin
                      ? 'text-[var(--color-ink)] border-b-2 border-[var(--color-gold)]'
                      : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setErrors({});
                  }}
                  className={`flex-1 pb-3 text-sm font-semibold tracking-wide transition-all duration-200 relative ${
                    !isLogin
                      ? 'text-[var(--color-ink)] border-b-2 border-[var(--color-gold)]'
                      : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}
            <CardTitle className="pt-2 text-xl font-display font-medium text-[var(--color-ink)] text-center">
              {forgotPasswordMode
                ? 'Reset Your Password'
                : isLogin
                ? 'Welcome Back'
                : 'Join Angelika Circle'}
            </CardTitle>
            <p className="text-xs text-center text-[var(--color-slate)] mt-1">
              {forgotPasswordMode
                ? 'Enter your registered email to receive reset instructions'
                : isLogin
                ? 'Sign in to access your orders, wishlist, and bespoke styling'
                : 'Enjoy member privileges, bespoke sizing, and private previews'}
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Social Login: Single Clean Google Button */}
            {!forgotPasswordMode && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting || authLoading}
                  className="gap-3 border-[var(--color-whisper)] hover:border-[var(--color-gold)] hover:bg-[var(--color-snow)] transition-colors"
                >
                  <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-[var(--color-ink)]">Continue with Google</span>
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--color-whisper)]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="px-3 bg-[var(--color-white)] text-[var(--color-mist)] font-medium">
                      Or with email
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <StaggerContainer variant="fast">
                {/* Full Name for New Users */}
                {!isLogin && !forgotPasswordMode && (
                  <StaggerItem variant="slide">
                    <Input
                      type="text"
                      label="Full Name"
                      placeholder="e.g. Priya Sharma"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                      }}
                      error={errors.fullName}
                      autoComplete="name"
                      disabled={isSubmitting}
                      size="md"
                    />
                  </StaggerItem>
                )}

                {/* Email Address */}
                <StaggerItem variant="slide">
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    error={errors.email}
                    autoComplete="email"
                    disabled={isSubmitting}
                    size="md"
                  />
                </StaggerItem>

                {/* Password (Hidden in Forgot Password mode) */}
                {!forgotPasswordMode && (
                  <StaggerItem variant="slide">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      error={errors.password}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      disabled={isSubmitting}
                      size="md"
                      rightIcon={
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowPassword((prev) => !prev);
                          }}
                          className="text-[var(--color-slate)] hover:text-[var(--color-gold)] p-1 transition-colors cursor-pointer"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      }
                    />
                  </StaggerItem>
                )}

                {/* Confirm Password for Sign Up */}
                {!isLogin && !forgotPasswordMode && (
                  <StaggerItem variant="slide">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }}
                      error={errors.confirmPassword}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      size="md"
                      rightIcon={
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowConfirmPassword((prev) => !prev);
                          }}
                          className="text-[var(--color-slate)] hover:text-[var(--color-gold)] p-1 transition-colors cursor-pointer"
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      }
                    />
                  </StaggerItem>
                )}

                {/* Remember Me & Forgot Password in Sign In Mode */}
                {isLogin && !forgotPasswordMode && (
                  <StaggerItem variant="slide">
                    <div className="flex items-center justify-between text-xs pt-1">
                      <Checkbox
                        label="Remember me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        id="remember-me"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordMode(true);
                          setResetSent(false);
                          setErrors({});
                        }}
                        className="text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </StaggerItem>
                )}

                {/* Reset Sent Confirmation Banner */}
                {forgotPasswordMode && resetSent && (
                  <StaggerItem variant="slide">
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-[var(--radius-md)] text-xs text-emerald-800">
                      ✓ If an account exists for <strong>{email}</strong>, a password reset link has been dispatched.
                    </div>
                  </StaggerItem>
                )}

                {/* Terms Agreement in Sign Up Mode */}
                {!isLogin && !forgotPasswordMode && (
                  <StaggerItem variant="slide">
                    <div className="pt-1">
                      <Checkbox
                        label={
                          <span className="text-xs text-[var(--color-slate)] leading-relaxed">
                            I agree to the{' '}
                            <Link href="/terms" target="_blank" className="text-[var(--color-gold)] font-medium hover:underline">
                              Terms & Conditions
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" target="_blank" className="text-[var(--color-gold)] font-medium hover:underline">
                              Privacy Policy
                            </Link>
                          </span>
                        }
                        checked={agreedToTerms}
                        onChange={(e) => {
                          setAgreedToTerms(e.target.checked);
                          if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                        }}
                        id="terms"
                      />
                      {errors.terms && (
                        <p className="mt-1 text-xs text-[var(--color-error)]" role="alert">
                          {errors.terms}
                        </p>
                      )}
                    </div>
                  </StaggerItem>
                )}

                {/* Submit Action Button */}
                <StaggerItem variant="scale" className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isSubmitting || authLoading}
                    disabled={isSubmitting || authLoading}
                    className="shadow-md hover:shadow-lg transition-all font-semibold tracking-wider uppercase text-xs py-3.5"
                  >
                    {forgotPasswordMode
                      ? 'Send Reset Link'
                      : isLogin
                      ? 'Sign In to Account'
                      : 'Create My Account'}
                  </Button>
                </StaggerItem>

                {/* Back to Sign In from Forgot Password */}
                {forgotPasswordMode && (
                  <StaggerItem variant="slide" className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordMode(false);
                        setErrors({});
                      }}
                      className="text-xs font-semibold text-[var(--color-gold)] hover:underline"
                    >
                      ← Back to Sign In
                    </button>
                  </StaggerItem>
                )}
              </StaggerContainer>
            </form>

            {/* Bottom Switcher */}
            {!forgotPasswordMode && (
              <div className="text-center pt-3 border-t border-[var(--color-whisper)]">
                <p className="text-xs text-[var(--color-slate)]">
                  {isLogin ? "Don't have an Angelika account yet?" : 'Already a registered customer?'}
                  {' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                    }}
                    className="font-semibold text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] hover:underline ml-1"
                  >
                    {isLogin ? 'Create one now' : 'Sign in here'}
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-World E-commerce Trust Badges */}
        <ScrollReveal variant="fadeUp" delay={0.2} className="mt-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: '💎', title: '100% Authentic', desc: 'Handcrafted weaves' },
              { icon: '🚚', title: 'Pan-India Delivery', desc: 'Express shipping' },
              { icon: '✨', title: 'Bespoke Fit', desc: 'Custom tailored' },
            ].map((badge, i) => (
              <div
                key={i}
                className="p-3 bg-[var(--color-white)]/80 backdrop-blur-xs rounded-[var(--radius-md)] border border-[var(--color-whisper)]"
              >
                <div className="text-xl mb-1">{badge.icon}</div>
                <p className="font-semibold text-[var(--color-ink)] text-xs">{badge.title}</p>
                <p className="text-[10px] text-[var(--color-slate)]">{badge.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* WhatsApp Personal Stylist Link */}
        <ScrollReveal variant="fadeUp" delay={0.3} className="mt-5 text-center">
          <LinkButton
            variant="whatsapp"
            href="https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I%20need%20assistance%20with%20my%20Angelika%20account"
            className="w-full text-xs py-2.5"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.16c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.66-.88-3.23-1.28-5.31-4.54-5.47-4.75-.16-.21-1.31-1.74-1.31-3.32 0-1.58.83-2.36 1.12-2.68.3-.32.65-.4.87-.4.22 0 .43 0 .62.01.2.01.47-.08.73.55.27.65.92 2.25 1 2.41.08.16.13.35.03.56-.1.21-.16.35-.31.53-.16.18-.33.4-.47.54-.16.16-.33.33-.14.66.19.32.84 1.39 1.8 2.25 1.24 1.11 2.29 1.45 2.61 1.61.32.16.51.14.7-.08.19-.22.81-.94 1.03-1.26.22-.32.43-.27.73-.16.3.11 1.92.9 2.25 1.07.33.16.54.24.62.38.08.14.08.82-.16 1.49z"/>
            </svg>
            Need help? Chat with Vidhya on WhatsApp
          </LinkButton>
        </ScrollReveal>
      </div>
    </div>
  );
}
