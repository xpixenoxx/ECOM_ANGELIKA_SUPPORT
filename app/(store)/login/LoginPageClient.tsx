'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from '@/components/ui/Toast';
import {
  sendSignupOtp,
  verifySignupOtp,
  sendLoginOtp,
  verifyLoginOtpAndSignIn,
  serverLoginAction,
} from '@/lib/actions/auth-otp';

type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  terms?: string;
};

type SignInMethod = 'password' | 'otp';

interface LoginPageClientProps {
  initialMode?: 'signin' | 'signup';
}

export function LoginPageClient({ initialMode }: LoginPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn, signInWithOAuth, resetPassword } = useAuth();

  const rawRedirect = searchParams.get('redirect') || '/account';
  const redirectTo =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.startsWith('/\\')
      ? rawRedirect
      : '/account';
  const isLogout = searchParams.get('logout') === 'true';
  const paramMode = searchParams.get('mode');

  const [isLogin, setIsLogin] = useState(() => {
    if (initialMode === 'signup') return false;
    if (paramMode === 'signup' || paramMode === 'register') return false;
    return true;
  });
  const [signInMethod, setSignInMethod] = useState<SignInMethod>('password');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formBannerError, setFormBannerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // OTP state shared cleanly between Signup verification & Passwordless Sign-In
  const [otpStage, setOtpStage] = useState<'none' | 'signup' | 'login'>('none');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  useEffect(() => {
    if (isLogout) {
      toast.success('You have been signed out safely.');
    }
  }, [isLogout]);

  useEffect(() => {
    if (otpStage !== 'none') {
      otpInputRef.current?.focus();
    }
  }, [otpStage]);

  const switchMode = (nextIsLogin: boolean) => {
    setIsLogin(nextIsLogin);
    setForgotPasswordMode(false);
    setResetSent(false);
    setOtpStage('none');
    setOtpCode('');
    setOtpError('');
    setDevCode(null);
    setErrors({});
    setFormBannerError(null);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const cleanEmail = email.trim();

    if (!isLogin && !forgotPasswordMode && !fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    }

    if (!cleanEmail) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const needsPassword = !forgotPasswordMode && (!isLogin || signInMethod === 'password');
    if (needsPassword) {
      const minLen = isLogin ? 6 : 8;
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < minLen) {
        newErrors.password = `Password must be at least ${minLen} characters`;
      }
    }

    if (!isLogin && !forgotPasswordMode && !agreedToTerms) {
      newErrors.terms = 'Please accept the Terms & Privacy Policy to create an account';
    }

    setErrors(newErrors);

    if (newErrors.fullName) fullNameRef.current?.focus();
    else if (newErrors.email) emailRef.current?.focus();
    else if (newErrors.password) passwordRef.current?.focus();

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormBannerError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (forgotPasswordMode) {
        const { error } = await resetPassword(cleanEmail);
        if (error) {
          setFormBannerError(error.message);
          toast.error('Password Reset Failed', error.message);
        } else {
          setResetSent(true);
          toast.success('Check Your Email', 'Password reset instructions have been sent.');
        }
        return;
      }

      if (isLogin) {
        // Passwordless 6-digit Email OTP Sign-In
        if (signInMethod === 'otp') {
          const otpRes = await sendLoginOtp(cleanEmail);
          if (!otpRes.success) {
            setFormBannerError(otpRes.message);
            toast.error('Sign-In Code Notice', otpRes.message);
            return;
          }
          setOtpStage('login');
          setOtpCode('');
          setOtpError('');
          setDevCode(otpRes.devCode || null);
          setCooldown(30);
          toast.success('Sign-In Code Sent', otpRes.message);
          return;
        }

        // Standard Email & Password Sign-In with edge server action fallback
        let signInSuccess = false;
        try {
          const signInPromise = signIn(cleanEmail, password);
          const timeoutPromise = new Promise<{ error: Error }>((_, reject) =>
            setTimeout(() => reject(new Error('Sign-in request timed out.')), 7000)
          );

          const { error } = await Promise.race([signInPromise, timeoutPromise]);
          if (!error) {
            signInSuccess = true;
          } else {
            const msg = error.message.toLowerCase();
            if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
              const friendly =
                'Incorrect email or password. If you first ordered via Checkout OTP, switch to "Email Code" above to sign in instantly.';
              setFormBannerError(friendly);
              toast.error('Invalid Credentials', friendly);
              return;
            }
            console.warn('Client signIn error, trying serverLoginAction fallback:', error.message);
          }
        } catch (fetchErr) {
          console.warn('Client signIn threw, trying serverLoginAction fallback:', fetchErr);
        }

        if (!signInSuccess) {
          const serverRes = await serverLoginAction(cleanEmail, password);
          if (!serverRes.success) {
            const msg = (serverRes.error || '').toLowerCase();
            const friendly =
              msg.includes('invalid login credentials') || msg.includes('invalid credentials')
                ? 'Incorrect email or password. Or switch to "Email Code" above for instant passwordless sign-in.'
                : serverRes.error || 'Authentication failed. Please try again.';
            setFormBannerError(friendly);
            toast.error('Sign In Failed', friendly);
            return;
          }
        }

        toast.success('Welcome Back!', 'Signing you into Angelika Fashions...');
        window.location.href = redirectTo;
        return;
      }

      // Create Account: Send 6-Digit Email Verification Code
      const otpRes = await sendSignupOtp(cleanEmail, fullName.trim());
      if (!otpRes.success) {
        setFormBannerError(otpRes.message);
        toast.error('Registration Notice', otpRes.message);
        return;
      }

      setOtpStage('signup');
      setOtpCode('');
      setOtpError('');
      setDevCode(otpRes.devCode || null);
      setCooldown(30);
      toast.success('Verification Code Sent', otpRes.message);
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong. Please try again.';
      setFormBannerError(msg);
      toast.error('Unexpected Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.replace(/\D/g, '').trim();
    if (cleanOtp.length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      otpInputRef.current?.focus();
      return;
    }

    setOtpError('');
    setIsSubmitting(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (otpStage === 'login') {
        const res = await verifyLoginOtpAndSignIn({ email: cleanEmail, otp: cleanOtp });
        if (!res.success) {
          setOtpError(res.message);
          toast.error('Verification Failed', res.message);
          return;
        }
        toast.success('Signed In!', res.message);
        window.location.href = redirectTo;
        return;
      }

      const res = await verifySignupOtp({
        email: cleanEmail,
        otp: cleanOtp,
        password,
        fullName: fullName.trim(),
      });

      if (!res.success) {
        setOtpError(res.message);
        toast.error('Verification Error', res.message);
        return;
      }

      toast.success('Account Verified!', `Welcome ${fullName.trim() || 'to Angelika Fashions'}!`);

      const { error: signInErr } = await signIn(cleanEmail, password);
      if (signInErr) {
        const fallback = await serverLoginAction(cleanEmail, password);
        if (fallback.success) {
          window.location.href = redirectTo;
          return;
        }
        toast.success('Registration Complete', 'Please sign in with your email and password.');
        switchMode(true);
      } else {
        router.refresh();
        window.location.href = redirectTo;
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Verification failed. Please try again.');
      toast.error('Unexpected Error', err?.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setOtpError('');
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res =
        otpStage === 'login'
          ? await sendLoginOtp(cleanEmail)
          : await sendSignupOtp(cleanEmail, fullName.trim());

      if (res.success) {
        setDevCode(res.devCode || null);
        setCooldown(30);
        toast.success('New Code Sent', res.message);
      } else {
        setOtpError(res.message);
        toast.error('Could Not Resend', res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setFormBannerError(null);
    try {
      const { error } = await signInWithOAuth('google');
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('not enabled') || msg.includes('unsupported provider')) {
          toast.info(
            'Google Sign-In',
            'Google sign-in is being configured. Use Email Code (OTP) or Password above for instant access.'
          );
        } else {
          toast.error('Authentication Error', error.message);
        }
      }
    } catch {
      toast.info('Google Sign-In', 'Use Email Code (OTP) or Password above for instant access.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClass =
    'w-full min-h-[48px] rounded-xl bg-[#FFFFFF] px-4 py-3 text-base text-[#161310] placeholder:text-[#8A8177] border transition-colors focus:outline-none focus:border-[#A88326] focus-visible:ring-2 focus-visible:ring-[#C9A84C]/40 disabled:bg-[#F5F2EC] disabled:opacity-60';

  return (
    <div className="min-h-screen min-h-dvh bg-[#EFEAE2] text-[#161310] flex flex-col">
      {/* Minimal Distraction-Free Atelier Header */}
      <header className="sticky top-0 z-30 h-14 border-b border-[#DED6C9] bg-[#FAF7F2]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#4A433B] hover:text-[#161310] transition-colors"
          >
            <span aria-hidden="true">&larr;</span>
            <span>Back to Store</span>
          </Link>

          <Link
            href="/"
            className="font-display text-lg sm:text-xl font-semibold tracking-[0.14em] uppercase text-[#161310] hover:text-[#8C6D1F] transition-colors"
          >
            Angelika <span className="text-[#9E7B22] font-normal">Fashions</span>
          </Link>

          <Link
            href="/contact"
            className="text-xs font-medium text-[#5C5349] hover:text-[#161310] transition-colors"
          >
            Need Help?
          </Link>
        </div>
      </header>

      {/* Main Centered Auth Viewport — Fits Above the Fold */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-[440px]">
          <div className="rounded-2xl bg-[#FFFFFF] border border-[#DDD4C6] shadow-[0_18px_50px_rgba(22,19,16,0.08)] overflow-hidden">
            {/* Subtle top gold couture bar */}
            <div
              className="h-[3px] w-full bg-gradient-to-r from-[#C9A84C] via-[#E6C770] to-[#9E7B22]"
              aria-hidden="true"
            />

            {/* Flush Aligned Mode Tabs */}
            {!forgotPasswordMode && otpStage === 'none' && (
              <div
                role="tablist"
                aria-label="Account access mode"
                className="grid grid-cols-2 border-b border-[#E6DFD3] bg-[#FAF8F4]"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={isLogin}
                  onClick={() => switchMode(true)}
                  className={`py-3.5 text-xs font-semibold uppercase tracking-[0.16em] border-b-2 -mb-[1px] transition-colors cursor-pointer ${
                    isLogin
                      ? 'border-[#B68E2E] text-[#161310] bg-[#FFFFFF]'
                      : 'border-transparent text-[#6E655B] hover:text-[#161310]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isLogin}
                  onClick={() => switchMode(false)}
                  className={`py-3.5 text-xs font-semibold uppercase tracking-[0.16em] border-b-2 -mb-[1px] transition-colors cursor-pointer ${
                    !isLogin
                      ? 'border-[#B68E2E] text-[#161310] bg-[#FFFFFF]'
                      : 'border-transparent text-[#6E655B] hover:text-[#161310]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Crisp Header Copy */}
              <div className="text-center mb-5">
                <h1
                  id="auth-form-heading"
                  className="font-display text-2xl sm:text-[28px] font-medium text-[#161310] leading-tight"
                >
                  {otpStage === 'login'
                    ? 'Enter Sign-In Code'
                    : otpStage === 'signup'
                      ? 'Verify Your Email'
                      : forgotPasswordMode
                        ? 'Reset Password'
                        : isLogin
                          ? 'Welcome Back'
                          : 'Create Your Account'}
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-[#5C5349]">
                  {otpStage !== 'none'
                    ? `We sent a 6-digit code to ${email.trim().toLowerCase()}`
                    : forgotPasswordMode
                      ? 'Enter your email and we will send reset instructions'
                      : isLogin
                        ? 'Access your orders, live tracking, and saved wishlist'
                        : 'Save addresses, track orders, and enjoy faster checkout'}
                </p>
              </div>

              {/* Inline Banner Error */}
              {formBannerError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-2.5 text-xs text-[#991B1B] flex items-start gap-2 leading-relaxed"
                >
                  <span className="font-bold shrink-0" aria-hidden="true">!</span>
                  <span>{formBannerError}</span>
                </div>
              )}

              {/* OTP Verification View (Signup or Passwordless Sign-In) */}
              {otpStage !== 'none' ? (
                <form
                  onSubmit={handleVerifyOtp}
                  aria-labelledby="auth-form-heading"
                  className="space-y-4"
                  noValidate
                >
                  {devCode && (
                    <div className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-3 text-xs text-[#92400E]">
                      <span className="font-semibold block mb-0.5">Development Preview Code:</span>
                      <strong className="font-mono text-base tracking-[0.25em] text-[#78350F]">
                        {devCode}
                      </strong>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="auth-otp-code"
                      className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#4A433B] mb-2 text-center"
                    >
                      6-Digit Verification Code
                    </label>
                    <input
                      ref={otpInputRef}
                      id="auth-otp-code"
                      name="one-time-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      enterKeyHint="done"
                      maxLength={6}
                      placeholder="000000"
                      required
                      value={otpCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtpCode(val);
                        if (otpError) setOtpError('');
                      }}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(otpError)}
                      aria-describedby={otpError ? 'auth-otp-error' : undefined}
                      className={`w-full min-h-[54px] text-center tracking-[0.45em] text-2xl font-bold font-mono rounded-xl bg-[#FFFFFF] text-[#161310] placeholder:text-[#C4BBB0] border px-4 py-3 focus:outline-none focus:border-[#A88326] focus-visible:ring-2 focus-visible:ring-[#C9A84C]/40 transition-colors ${
                        otpError ? 'border-[#DC2626]' : 'border-[#B8AEA0]'
                      }`}
                    />
                    {otpError && (
                      <p
                        id="auth-otp-error"
                        role="alert"
                        className="mt-1.5 text-xs text-[#B91C1C] text-center font-medium"
                      >
                        {otpError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[48px] rounded-xl bg-[#161310] hover:bg-[#29231D] text-[#FAF6F0] text-xs font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  >
                    {isSubmitting
                      ? 'Verifying...'
                      : otpStage === 'login'
                        ? 'Verify & Sign In'
                        : 'Verify & Create Account'}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStage('none');
                        setOtpCode('');
                        setOtpError('');
                      }}
                      className="text-[#5C5349] hover:text-[#161310] underline underline-offset-4 cursor-pointer"
                    >
                      &larr; Change email
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={cooldown > 0 || isSubmitting}
                      className="font-semibold text-[#8C6D1F] hover:text-[#6E5414] disabled:opacity-45 cursor-pointer"
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Sign-In Method Segmented Toggle: Password vs Instant Email Code (OTP) */}
                  {isLogin && !forgotPasswordMode && (
                    <div
                      className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#F3EFE8] border border-[#E5DDD0] mb-5"
                      role="group"
                      aria-label="Sign in method"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSignInMethod('password');
                          setErrors({});
                          setFormBannerError(null);
                        }}
                        className={`min-h-[38px] rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          signInMethod === 'password'
                            ? 'bg-[#FFFFFF] text-[#161310] shadow-xs border border-[#DFD7CA]'
                            : 'text-[#665D53] hover:text-[#161310]'
                        }`}
                      >
                        Password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSignInMethod('otp');
                          setErrors({});
                          setFormBannerError(null);
                        }}
                        className={`min-h-[38px] rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          signInMethod === 'otp'
                            ? 'bg-[#FFFFFF] text-[#161310] shadow-xs border border-[#DFD7CA]'
                            : 'text-[#665D53] hover:text-[#161310]'
                        }`}
                      >
                        Email Code (OTP)
                      </button>
                    </div>
                  )}

                  {/* Primary Auth Form — Positioned High so Mobile Keyboard Never Obstructs Submit */}
                  <form
                    method="POST"
                    onSubmit={handleSubmit}
                    aria-labelledby="auth-form-heading"
                    className="space-y-4"
                    noValidate
                  >
                    {!isLogin && !forgotPasswordMode && (
                      <div>
                        <label
                          htmlFor="auth-full-name"
                          className="block text-xs font-semibold text-[#2E2924] mb-1.5"
                        >
                          Full Name
                        </label>
                        <input
                          ref={fullNameRef}
                          id="auth-full-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          enterKeyHint="next"
                          required
                          placeholder="e.g. Priya Sharma"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                          }}
                          disabled={isSubmitting}
                          aria-invalid={Boolean(errors.fullName)}
                          aria-describedby={errors.fullName ? 'auth-full-name-error' : undefined}
                          className={`${inputBaseClass} ${
                            errors.fullName ? 'border-[#DC2626]' : 'border-[#B8AEA0]'
                          }`}
                        />
                        {errors.fullName && (
                          <p id="auth-full-name-error" role="alert" className="mt-1 text-xs text-[#B91C1C]">
                            {errors.fullName}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="auth-email"
                        className="block text-xs font-semibold text-[#2E2924] mb-1.5"
                      >
                        Email Address
                      </label>
                      <input
                        ref={emailRef}
                        id="auth-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="username"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        enterKeyHint={forgotPasswordMode || (isLogin && signInMethod === 'otp') ? 'done' : 'next'}
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        disabled={isSubmitting}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'auth-email-error' : undefined}
                        className={`${inputBaseClass} ${
                          errors.email ? 'border-[#DC2626]' : 'border-[#B8AEA0]'
                        }`}
                      />
                      {errors.email && (
                        <p id="auth-email-error" role="alert" className="mt-1 text-xs text-[#B91C1C]">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {!forgotPasswordMode && (!isLogin || signInMethod === 'password') && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="auth-password"
                            className="block text-xs font-semibold text-[#2E2924]"
                          >
                            Password
                          </label>
                          {isLogin && (
                            <Link
                              href={`/auth/reset-password${email ? `?email=${encodeURIComponent(email.trim())}` : ''}`}
                              className="text-xs font-medium text-[#8C6D1F] hover:text-[#6B5011] hover:underline"
                            >
                              Forgot password?
                            </Link>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            ref={passwordRef}
                            id="auth-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                            enterKeyHint="done"
                            minLength={isLogin ? 6 : 8}
                            required
                            placeholder={isLogin ? 'Enter your password' : 'Create a password (8+ chars)'}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                            }}
                            disabled={isSubmitting}
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={
                              errors.password
                                ? 'auth-password-error'
                                : !isLogin
                                  ? 'auth-password-hint'
                                  : undefined
                            }
                            className={`${inputBaseClass} pr-12 ${
                              errors.password ? 'border-[#DC2626]' : 'border-[#B8AEA0]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-pressed={showPassword}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-[#5C5349] hover:text-[#161310] hover:bg-[#F3EFE8] transition-colors cursor-pointer"
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
                        </div>
                        {errors.password ? (
                          <p id="auth-password-error" role="alert" className="mt-1 text-xs text-[#B91C1C]">
                            {errors.password}
                          </p>
                        ) : !isLogin ? (
                          <p id="auth-password-hint" className="mt-1 text-[11px] text-[#6E655B]">
                            Minimum 8 characters. Browser password managers are supported.
                          </p>
                        ) : null}
                      </div>
                    )}

                    {/* Keep signed in checkbox for Sign In */}
                    {isLogin && !forgotPasswordMode && (
                      <div className="flex items-center justify-between text-xs">
                        <label
                          htmlFor="remember-me"
                          className="inline-flex items-center gap-2 text-[#4A433B] cursor-pointer select-none"
                        >
                          <input
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-[#9E9589] accent-[#B68E2E] cursor-pointer"
                          />
                          <span>Keep me signed in on this browser</span>
                        </label>
                      </div>
                    )}

                    {/* Helpful note for OTP sign-in */}
                    {isLogin && !forgotPasswordMode && signInMethod === 'otp' && (
                      <p className="text-xs text-[#5C5349] bg-[#FAF7F2] border border-[#E7DFD3] rounded-xl px-3.5 py-2.5 leading-relaxed">
                        No password needed — works for both new &amp; checkout-created accounts. We&apos;ll email a 6-digit code and keep you signed in.
                      </p>
                    )}

                    {/* Reset Sent Confirmation */}
                    {forgotPasswordMode && resetSent && (
                      <div
                        role="status"
                        className="rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-3 text-xs text-[#065F46]"
                      >
                        ✓ If an account exists for <strong>{email}</strong>, password reset instructions have been sent.
                      </div>
                    )}

                    {/* Terms Agreement in Create Account */}
                    {!isLogin && !forgotPasswordMode && (
                      <div>
                        <label
                          htmlFor="terms"
                          className="flex items-start gap-2.5 text-xs text-[#4A433B] cursor-pointer leading-relaxed"
                        >
                          <input
                            id="terms"
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => {
                              setAgreedToTerms(e.target.checked);
                              if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                            }}
                            className="mt-0.5 h-4 w-4 rounded border-[#9E9589] accent-[#B68E2E] cursor-pointer shrink-0"
                          />
                          <span>
                            I agree to the{' '}
                            <Link href="/terms" target="_blank" className="text-[#8C6D1F] font-semibold hover:underline">
                              Terms &amp; Conditions
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" target="_blank" className="text-[#8C6D1F] font-semibold hover:underline">
                              Privacy Policy
                            </Link>
                          </span>
                        </label>
                        {errors.terms && (
                          <p className="mt-1 text-xs text-[#B91C1C]" role="alert">
                            {errors.terms}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Primary Submit CTA — Crisp Dark Atelier Ink */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full min-h-[48px] rounded-xl bg-[#161310] hover:bg-[#2B251E] active:bg-[#0D0B09] text-[#FAF6F0] text-xs font-bold uppercase tracking-[0.18em] shadow-sm transition-colors cursor-pointer disabled:opacity-65 disabled:cursor-wait flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-[#FAF6F0]/30 border-t-[#E6C770] animate-spin" aria-hidden="true" />
                          <span>Please wait...</span>
                        </>
                      ) : forgotPasswordMode ? (
                        'Send Reset Link'
                      ) : isLogin ? (
                        signInMethod === 'otp' ? 'Send 6-Digit Sign-In Code' : 'Sign In'
                      ) : (
                        'Create Account'
                      )}
                    </button>

                    {forgotPasswordMode && (
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotPasswordMode(false);
                            setResetSent(false);
                            setErrors({});
                          }}
                          className="text-xs font-semibold text-[#8C6D1F] hover:underline cursor-pointer"
                        >
                          &larr; Back to Sign In
                        </button>
                      </div>
                    )}
                  </form>

                  {/* Federated Login Placed Cleanly Below Primary CTA */}
                  {!forgotPasswordMode && (
                    <>
                      <div className="relative my-5" aria-hidden="true">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[#E6DFD3]" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-3 bg-[#FFFFFF] text-[11px] font-medium uppercase tracking-[0.16em] text-[#787066]">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isSubmitting}
                        className="w-full min-h-[46px] rounded-xl bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#CFC7BA] hover:border-[#B68E2E] px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium text-[#161310] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
                        <span>Continue with Google</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Crisp Single-Line Luxury Assurance Footer */}
          <p className="mt-4 text-center text-[11px] tracking-[0.06em] text-[#6E655B]">
            100% Authentic Handcrafted Couture &middot; Secure Persistent Sign-In &middot; Pan-India Express
          </p>
        </div>
      </div>
    </div>
  );
}
