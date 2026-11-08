'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger';
import { toast } from '@/components/ui/Toast';
import { sendPasswordResetOtp, verifyPasswordResetOtp } from '@/lib/actions/auth-otp';

type FormErrors = {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
};

export function ResetPasswordPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Step State
  const [otpStep, setOtpStep] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const validateStep1 = () => {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: FormErrors = {};
    if (!otp.trim()) {
      newErrors.otp = '6-digit verification code is required';
    } else if (otp.trim().length !== 6) {
      newErrors.otp = 'Verification code must be exactly 6 digits';
    }

    if (!password) {
      newErrors.password = 'New password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Dispatch Reset OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setIsSubmitting(true);
    try {
      const res = await sendPasswordResetOtp(email.trim());
      if (!res.success) {
        toast.error('Unable to Send Code', res.message);
        return;
      }

      setOtpStep(true);
      setDevCode(res.devCode || null);
      setCooldown(30);
      toast.success('Code Dispatched', res.message);
    } catch (err: any) {
      toast.error('Unexpected Error', err?.message || 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP and update password
  const handleVerifyAndUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);
    try {
      const res = await verifyPasswordResetOtp({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: password,
      });

      if (!res.success) {
        toast.error('Verification Failed', res.message);
        return;
      }

      toast.success('Password Updated!', 'Please sign in with your new password.');
      router.push('/login?mode=signin&reset_success=true');
    } catch (err: any) {
      toast.error('Error', err?.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend code handler
  const handleResend = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await sendPasswordResetOtp(email.trim());
      if (res.success) {
        setDevCode(res.devCode || null);
        setCooldown(30);
        toast.success('New Code Sent', res.message);
      } else {
        toast.error('Error', res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4" aria-label="Angelika Fashions - Home">
            <motion.span
              className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)] tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Angelika
            </motion.span>
          </Link>
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <h1 className="text-[var(--font-display)] text-2xl sm:text-3xl font-medium text-[var(--color-ink)]">
              {otpStep ? 'Verify & Reset Password' : 'Reset Your Password'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-slate)] mt-1.5">
              {otpStep
                ? `Enter the 6-digit code sent to ${email}`
                : 'Enter your registered email to receive a 6-digit verification code'}
            </p>
          </ScrollReveal>
        </div>

        {/* Main Card */}
        <Card variant="elevated" padding="lg" className="border border-[var(--color-whisper)] shadow-md rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="sr-only">Password Reset Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Dev Mode Notification if Resend API key is not yet set in .env.local */}
            {devCode && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <span className="font-semibold block mb-0.5">Development Preview:</span>
                Your OTP code is <strong className="font-mono text-sm tracking-widest text-amber-950">{devCode}</strong>.
                <span className="block text-[11px] text-amber-700 mt-1">
                  (Emails in test mode without a verified domain only deliver to your Resend account email; use this code to proceed).
                </span>
              </div>
            )}

            {!otpStep ? (
              /* STEP 1: Enter Email Form */
              <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
                <StaggerContainer variant="fast">
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
                      autoFocus
                      disabled={isSubmitting}
                      size="md"
                    />
                  </StaggerItem>

                  <StaggerItem variant="scale">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={isSubmitting}
                      disabled={isSubmitting || !email.trim()}
                    >
                      {isSubmitting ? 'Sending Code...' : 'Send 6-Digit Reset Code'}
                    </Button>
                  </StaggerItem>
                </StaggerContainer>
              </form>
            ) : (
              /* STEP 2: Enter 6-digit OTP & New Password Form */
              <form onSubmit={handleVerifyAndUpdate} className="space-y-4" noValidate>
                <StaggerContainer variant="fast">
                  {/* 6-Digit OTP Input */}
                  <StaggerItem variant="slide">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(val);
                          if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
                        }}
                        autoFocus
                        disabled={isSubmitting}
                        className="w-full text-center tracking-[8px] text-2xl font-bold font-mono py-2.5 px-3 border border-[var(--color-whisper)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40 bg-[var(--color-snow)] focus:bg-white transition-all"
                      />
                      {errors.otp && <p className="text-xs text-rose-500 mt-1">{errors.otp}</p>}
                    </div>
                  </StaggerItem>

                  {/* New Password */}
                  <StaggerItem variant="slide">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      label="New Password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      error={errors.password}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      size="md"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[var(--color-slate)] hover:text-[var(--color-gold)] p-1 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      }
                    />
                  </StaggerItem>

                  {/* Confirm Password */}
                  <StaggerItem variant="slide">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm New Password"
                      placeholder="Re-enter new password"
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-[var(--color-slate)] hover:text-[var(--color-gold)] p-1 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                      }
                    />
                  </StaggerItem>

                  {/* Submit Button */}
                  <StaggerItem variant="scale">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={isSubmitting}
                      disabled={isSubmitting || otp.length !== 6 || !password}
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify & Set New Password'}
                    </Button>
                  </StaggerItem>

                  {/* Resend Code & Back Controls */}
                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setOtpStep(false)}
                      className="text-[var(--color-slate)] hover:text-[var(--color-ink)] underline"
                    >
                      &larr; Change email
                    </button>

                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={cooldown > 0 || isSubmitting}
                      className="text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] font-semibold disabled:opacity-40"
                    >
                      {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </StaggerContainer>
              </form>
            )}

            <div className="text-center pt-4 border-t border-[var(--color-whisper)]">
              <p className="text-xs text-[var(--color-slate)]">
                Remember your password?{' '}
                <LinkButton
                  variant="ghost"
                  size="sm"
                  href="/login"
                  className="text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] p-0"
                >
                  Sign in
                </LinkButton>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support Note */}
        <ScrollReveal variant="fadeUp" delay={0.2} className="mt-6 text-center">
          <p className="text-xs text-[var(--color-slate)]">
            Having trouble? Email our atelier concierge at{' '}
            <a href="mailto:concierge@angelikafashions.com" className="text-[var(--color-gold)] underline">
              concierge@angelikafashions.com
            </a>
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}
