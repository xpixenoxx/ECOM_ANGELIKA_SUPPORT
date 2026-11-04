'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from '@/components/ui/Toast';

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function ResetPasswordPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword, updatePassword, loading: authLoading } = useAuth();

  const isUpdate = searchParams.get('type') === 'update';
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!isUpdate) {
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else {
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
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
      if (!isUpdate) {
        const { error } = await resetPassword(email.trim());
        if (error) {
          toast.error(error.message);
          return;
        }
        setEmailSent(true);
        toast.success('Password reset link sent! Check your email.');
      } else {
        const { error } = await updatePassword(password);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('Password updated successfully!');
        router.push('/login?password_reset=true');
        router.refresh();
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6" aria-label="Angelika Fashions - Home">
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
            <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">
              {isUpdate ? 'Set New Password' : 'Reset Password'}
            </h1>
            <p className="text-[var(--color-slate)] mt-2">
              {isUpdate
                ? 'Enter your new password below'
                : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </ScrollReveal>
        </div>

        {/* Main Card */}
        <Card variant="elevated" padding="lg">
          <CardHeader className="pb-2">
            <CardTitle className="sr-only">{isUpdate ? 'Set New Password' : 'Reset Password'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {emailSent && !isUpdate && (
              <StaggerItem variant="slide">
                <div className="p-4 bg-[var(--color-success-bg)] border border-[var(--color-success)]/30 rounded-[var(--radius-lg)]">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 flex-shrink-0 mt-0.5 text-[var(--color-success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    <div>
                      <p className="font-medium text-[var(--color-success)]">Check your email</p>
                      <p className="text-sm text-[var(--color-slate)]">
                        We&apos;ve sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <StaggerContainer variant="fast">
                {!isUpdate && !emailSent && (
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
                      size="lg"
                    />
                  </StaggerItem>
                )}

                {isUpdate && (
                  <>
                    <StaggerItem variant="slide">
                      <Input
                        type="password"
                        label="New Password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        error={errors.password}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        size="lg"
                        hint="At least 8 characters with uppercase, lowercase, and number"
                      />
                    </StaggerItem>

                    <StaggerItem variant="slide">
                      <Input
                        type="password"
                        label="Confirm New Password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (e.target.value !== password) {
                            setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
                          } else {
                            setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                          }
                        }}
                        error={errors.confirmPassword}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        size="lg"
                      />
                    </StaggerItem>
                  </>
                )}

                <StaggerItem variant="scale">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isSubmitting || authLoading}
                    disabled={isSubmitting || authLoading}
                  >
                    {isUpdate ? 'Update Password' : !emailSent ? 'Send Reset Link' : 'Resend Link'}
                  </Button>
                </StaggerItem>
              </StaggerContainer>
            </form>

            {!isUpdate && !emailSent && (
              <div className="text-center pt-4 border-t border-[var(--color-whisper)]">
                <p className="text-[var(--color-slate)]">
                  Remember your password?{' '}
                  <LinkButton
                    variant="ghost"
                    size="sm"
                    href="/login"
                    className="text-[var(--color-gold)] hover:text-[var(--color-gold-hover)]"
                  >
                    Sign in
                  </LinkButton>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Support */}
        <ScrollReveal variant="fadeUp" delay={0.3} className="mt-6 text-center">
          <LinkButton
            variant="whatsapp"
            href="https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I%20need%20help%20resetting%20my%20password"
            className="w-full"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Need help? Chat with Vidhya on WhatsApp
          </LinkButton>
        </ScrollReveal>
      </div>
    </div>
  );
}