'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils/cn';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthModal } from '@/components/ui/AuthModal';
import { createOrder, getUserAddresses, saveAddress } from '@/lib/actions/checkout';
import {
  getCheckoutOtpStatus,
  sendCheckoutOtp,
  verifyCheckoutOtpAndSignIn,
  type CheckoutOtpStatus,
} from '@/lib/actions/checkout-otp';
import { createClient } from '@/lib/supabase/client';
import { lookupPincode, type PincodeDetails } from '@/lib/utils/pincode';
import { PRICING_CONSTANTS } from '@/lib/pricing';
import type { Address } from '@/types/commerce';

interface AddressFormData {
  id?: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
  type?: 'Home' | 'Office' | 'Other';
  isDefault?: boolean;
}

const toAddressForm = (addr: Address & { id?: string; is_default?: boolean; isDefault?: boolean }): AddressFormData => ({
  id: addr.id,
  firstName: addr.firstName,
  lastName: addr.lastName,
  address1: addr.address1,
  address2: addr.address2,
  city: addr.city,
  state: addr.state,
  postalCode: addr.postalCode,
  country: addr.country || 'India',
  phone: addr.phone,
  email: addr.email,
  isDefault: addr.is_default || addr.isDefault,
});

const toAddress = (form: AddressFormData): Address => ({
  firstName: form.firstName,
  lastName: form.lastName,
  address1: form.address1,
  address2: form.address2 || '',
  city: form.city,
  state: form.state,
  postalCode: form.postalCode,
  country: form.country || 'India',
  phone: form.phone,
  email: form.email,
});

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const formatPrice = (val: number): string => `₹${Math.round(val).toLocaleString('en-IN')}`;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9]\d{5}$/;

const validateEmailValue = (val: string): string => {
  const clean = (val || '').trim();
  if (!clean) return 'Email address is required.';
  if (!EMAIL_REGEX.test(clean)) return 'Please enter a valid email address.';
  return '';
};

const validatePhoneValue = (val: string): string => {
  const clean = (val || '').replace(/\D/g, '');
  if (!clean) return 'Mobile number is required.';
  if (clean.length !== 10 || !PHONE_REGEX.test(clean)) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }
  return '';
};

const validatePincodeValue = (val: string): string => {
  const clean = (val || '').trim().replace(/\D/g, '');
  if (!clean) return '6-digit pincode is required.';
  if (clean.length !== 6 || !PINCODE_REGEX.test(clean)) {
    return 'Enter a valid 6-digit Indian pincode.';
  }
  return '';
};

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 rounded-xl border border-[#C9BFB0] bg-[#FDFCFA] text-sm text-[#1A1A1A] placeholder:text-[#8E8477] focus:bg-white focus:outline-none focus:border-[#9A7718] focus:ring-2 focus:ring-[#C9A84C]/25 transition-all';
const INPUT_ERR_CLASS =
  'w-full px-3.5 py-2.5 rounded-xl border border-rose-400 bg-rose-50/40 text-sm text-[#1A1A1A] placeholder:text-[#8E8477] focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all';

export default function CheckoutPage() {
  const { user, profile, signOut, refreshProfile, refreshSession } = useAuth();
  const {
    items,
    subtotal,
    shippingCost: cartShippingCost,
    discountAmount,
    total: cartTotal,
    itemCount,
    appliedCoupon,
    isLoading: cartLoading,
    validateCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  // Contact & Address State
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [savedAddresses, setSavedAddresses] = useState<AddressFormData[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [newAddress, setNewAddress] = useState<AddressFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    type: 'Home',
    isDefault: true,
  });

  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [selectedPayment, setSelectedPayment] = useState<'razorpay' | 'cod'>('razorpay');
  const [notes, setNotes] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Inline Checkout OTP Auto-Account State
  const [otpStatus, setOtpStatus] = useState<CheckoutOtpStatus>({
    emailOtpReady: false,
    mobileOtpReady: false,
    mobileProvider: null,
    anyOtpReady: false,
  });
  const [otpChannel, setOtpChannel] = useState<'mobile' | 'email'>('mobile');
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpFeedback, setOtpFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Pincode & Coupon State
  const [pincodeInfo, setPincodeInfo] = useState<PincodeDetails | null>(null);
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponNotice, setCouponNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [availableOffers, setAvailableOffers] = useState([
    { code: 'FIRST10', title: '10% OFF', desc: 'Min ₹1,999' },
    { code: 'ROYAL500', title: '₹500 OFF', desc: 'Min ₹4,999' },
    { code: 'COUTURE15', title: '15% OFF', desc: 'Min ₹5,999' },
  ]);

  // Submission & Validation State
  const submittingRef = useRef(false);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const addressSectionRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [checkoutIdempotencyKey] = useState<string>(() =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? `chk_${crypto.randomUUID()}`
      : `chk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  );

  // Load OTP availability & active coupons on mount
  useEffect(() => {
    getCheckoutOtpStatus()
      .then((st) => {
        setOtpStatus(st);
        setOtpChannel(st.mobileOtpReady ? 'mobile' : 'email');
      })
      .catch(() => {});

    async function loadOffers() {
      try {
        const supabase = createClient();
        const { data, error: cErr } = await supabase
          .from('coupons')
          .select('code, name, type, value, min_order_amount, is_active')
          .eq('is_active', true)
          .order('value', { ascending: false })
          .limit(4);

        if (!cErr && data && data.length > 0) {
          setAvailableOffers(
            data.map((c: any) => ({
              code: c.code,
              title: c.type === 'percentage' ? `${c.value}% OFF` : `₹${Number(c.value).toLocaleString('en-IN')} OFF`,
              desc: c.min_order_amount ? `Min ₹${Number(c.min_order_amount).toLocaleString('en-IN')}` : c.name,
            }))
          );
        }
      } catch {
        // Fallback offers remain active
      }
    }
    loadOffers();
  }, []);

  // OTP resend countdown
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setInterval(() => setOtpCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [otpCooldown]);

  const loadAddresses = useCallback(async () => {
    if (!user) {
      setShowNewAddressForm(true);
      return;
    }
    try {
      const addresses = await getUserAddresses(user.id);
      const mapped = addresses.map(toAddressForm);
      setSavedAddresses(mapped);
      if (mapped.length > 0 && mapped[0]) {
        setSelectedAddressId(mapped[0].id || '');
        setShowNewAddressForm(false);
        if (mapped[0].phone && !phone) setPhone(mapped[0].phone);
      } else {
        setShowNewAddressForm(true);
      }
    } catch {
      setShowNewAddressForm(true);
    }
  }, [user, phone]);

  useEffect(() => {
    if (user) {
      loadAddresses();
      if (user.email) setEmail(user.email);
    } else {
      setSavedAddresses([]);
      setSelectedAddressId('');
      setShowNewAddressForm(true);
    }
  }, [user, loadAddresses]);

  useEffect(() => {
    if (profile) {
      if (profile.email) setEmail(profile.email);
      if (profile.phone) setPhone(profile.phone.replace(/\D/g, '').slice(-10));
      if (profile.full_name && !newAddress.firstName) {
        const parts = profile.full_name.trim().split(/\s+/);
        setNewAddress((prev) => ({
          ...prev,
          firstName: prev.firstName || parts[0] || '',
          lastName: prev.lastName || parts.slice(1).join(' ') || '',
        }));
      }
    }
  }, [profile, newAddress.firstName]);

  const codEligible = cartTotal <= PRICING_CONSTANTS.COD_MAX_AMOUNT;
  useEffect(() => {
    if (!codEligible && selectedPayment === 'cod') {
      setSelectedPayment('razorpay');
    }
  }, [codEligible, selectedPayment]);

  const codFee = selectedPayment === 'cod' ? PRICING_CONSTANTS.COD_FEE : 0;
  const total = cartTotal + codFee;
  const hasOutOfStockItems = items.some((item) => item.inventory_quantity === 0);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setNewAddress((prev) => ({ ...prev, email: val }));
    if (fieldErrors['email']) setFieldErrors((prev) => ({ ...prev, email: validateEmailValue(val) }));
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    setNewAddress((prev) => ({ ...prev, phone: digits }));
    if (fieldErrors['phone']) setFieldErrors((prev) => ({ ...prev, phone: validatePhoneValue(digits) }));
  };

  const handlePincodeChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setNewAddress((prev) => ({ ...prev, postalCode: clean }));
    if (fieldErrors['postalCode']) {
      setFieldErrors((prev) => ({ ...prev, postalCode: validatePincodeValue(clean) }));
    }
    if (clean.length === 6 && PINCODE_REGEX.test(clean)) {
      setFieldErrors((prev) => ({ ...prev, postalCode: '' }));
      setIsResolvingPin(true);
      try {
        const info = await lookupPincode(clean);
        if (info && (info.city || info.state)) {
          setPincodeInfo(info);
          setNewAddress((prev) => ({
            ...prev,
            city: info.city || prev.city,
            state: info.state || prev.state,
          }));
          setFieldErrors((prev) => ({
            ...prev,
            city: info.city ? '' : prev['city'] || '',
            state: info.state ? '' : prev['state'] || '',
          }));
        } else {
          setPincodeInfo(null);
        }
      } catch {
        setPincodeInfo(null);
      } finally {
        setIsResolvingPin(false);
      }
    } else {
      setPincodeInfo(null);
    }
  };

  const handleSendCheckoutOtp = async () => {
    const emailErr = validateEmailValue(email);
    const phoneErr = validatePhoneValue(phone);
    if (emailErr || phoneErr) {
      setFieldErrors((prev) => ({ ...prev, email: emailErr, phone: phoneErr }));
      setOtpFeedback({
        type: 'error',
        text: emailErr || phoneErr,
      });
      return;
    }

    setOtpSending(true);
    setOtpFeedback(null);
    try {
      const fullName = `${newAddress.firstName} ${newAddress.lastName}`.trim();
      const res = await sendCheckoutOtp({
        email,
        phone,
        fullName,
        preferredChannel: otpChannel,
      });
      if (res.success) {
        setOtpSentTo(res.maskedTarget || email);
        setOtpCooldown(45);
        setOtpFeedback({ type: 'info', text: res.message });
      } else {
        setOtpFeedback({ type: 'error', text: res.message });
      }
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyCheckoutOtp = async () => {
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setOtpFeedback({ type: 'error', text: 'Please enter the 6-digit verification code.' });
      return;
    }
    setOtpVerifying(true);
    setOtpFeedback(null);
    try {
      const fullName = `${newAddress.firstName} ${newAddress.lastName}`.trim();
      const res = await verifyCheckoutOtpAndSignIn({
        email,
        phone,
        otp: otpCode.trim(),
        fullName,
      });
      if (res.success) {
        await refreshSession();
        setOtpCode('');
        setOtpSentTo(null);
        setOtpFeedback({ type: 'success', text: res.message });
        setError('');
      } else {
        setOtpFeedback({ type: 'error', text: res.message });
      }
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCodeInput).trim().toUpperCase();
    if (!code) return;
    setCouponApplying(true);
    setCouponNotice(null);
    try {
      const res = await applyCoupon(code);
      if (res.valid) {
        setCouponNotice({ type: 'success', text: `Voucher ${code} applied!` });
        setCouponCodeInput('');
      } else {
        setCouponNotice({ type: 'error', text: res.error || 'Coupon could not be applied' });
      }
    } catch {
      setCouponNotice({ type: 'error', text: 'Could not apply coupon right now.' });
    } finally {
      setCouponApplying(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (submittingRef.current || isProcessing) return;
    if (items.length === 0) return;

    setError('');
    const nextFieldErrors: Record<string, string> = {};

    const finalEmail = (email || user?.email || newAddress.email || '').trim();
    const finalPhone = (phone || newAddress.phone || savedAddresses.find((a) => a.id === selectedAddressId)?.phone || '')
      .replace(/\D/g, '')
      .slice(-10);

    const emailErr = validateEmailValue(finalEmail);
    if (emailErr) nextFieldErrors['email'] = emailErr;

    const phoneErr = validatePhoneValue(finalPhone);
    if (phoneErr) nextFieldErrors['phone'] = phoneErr;

    // When live OTP delivery is active and user hasn't verified/signed in yet, prompt OTP verification in Section 1
    if (!user && otpStatus.anyOtpReady) {
      setFieldErrors((prev) => ({ ...prev, ...nextFieldErrors }));
      setError('Please verify your 6-digit OTP in Step 1 so your account & order history are saved automatically.');
      contactSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    let shippingAddress: Address;
    if (showNewAddressForm || !selectedAddressId) {
      if (!newAddress.firstName?.trim()) nextFieldErrors['firstName'] = 'First name is required';
      if (!newAddress.lastName?.trim()) nextFieldErrors['lastName'] = 'Last name is required';
      if (!newAddress.address1?.trim()) nextFieldErrors['address1'] = 'Flat / house / street address is required';
      const pinErr = validatePincodeValue(newAddress.postalCode || '');
      if (pinErr) nextFieldErrors['postalCode'] = pinErr;
      if (!newAddress.city?.trim()) nextFieldErrors['city'] = 'City is required';
      if (!newAddress.state?.trim()) nextFieldErrors['state'] = 'Please select your state';

      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        setError('Please complete the highlighted fields to place your order.');
        (nextFieldErrors['email'] || nextFieldErrors['phone'] ? contactSectionRef : addressSectionRef).current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        return;
      }

      shippingAddress = toAddress({ ...newAddress, phone: finalPhone, email: finalEmail });
    } else {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId);
      if (!addr) {
        setError('Please select or enter a delivery address.');
        addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        setError('Please enter a valid contact email and 10-digit mobile number.');
        contactSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      shippingAddress = toAddress({ ...addr, phone: finalPhone || addr.phone, email: finalEmail });
    }

    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions to proceed.');
      return;
    }

    setFieldErrors({});
    submittingRef.current = true;
    setIsProcessing(true);

    const resetSubmitting = () => {
      submittingRef.current = false;
      setIsProcessing(false);
    };

    try {
      // Save new address to signed-in account silently for future 1-click checkouts
      if (user && (showNewAddressForm || savedAddresses.length === 0) && saveNewAddress) {
        saveAddress(user.id, { ...shippingAddress, is_default: savedAddresses.length === 0 })
          .then((saved) => {
            if (saved.success) refreshProfile().catch(() => {});
          })
          .catch(() => {});
      }

      const validation = await validateCart();
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        resetSubmitting();
        return;
      }

      const result = await createOrder({
        items,
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod: selectedPayment,
        email: finalEmail,
        phone: finalPhone,
        notes: notes.trim() || undefined,
        coupon: appliedCoupon || undefined,
        userId: user?.id,
        giftWrap,
        giftMessage: giftWrap
          ? `${giftRecipient ? 'To: ' + giftRecipient + ' — ' : ''}${giftMessage}`.trim()
          : undefined,
        whatsappOptIn,
        idempotencyKey: checkoutIdempotencyKey,
      });

      if (!result.success) {
        setError(result.error || 'Failed to place order. Please try again.');
        resetSubmitting();
        return;
      }

      const tokenParam = result.receiptToken
        ? `&token=${encodeURIComponent(result.receiptToken)}`
        : '';

      if (selectedPayment === 'razorpay' && result.razorpayOrderId) {
        const razorpayKey = result.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!razorpayKey) {
          setError('Razorpay checkout key is not configured. Please try again later or choose COD.');
          resetSubmitting();
          return;
        }

        const openRazorpayModal = () => {
          const RazorpayCtor = (window as any).Razorpay;
          if (typeof RazorpayCtor !== 'function') {
            setError('Razorpay Checkout could not initialize. Please refresh and try again.');
            resetSubmitting();
            return;
          }

          let handlerTriggered = false;
          const razorpay = new RazorpayCtor({
            key: razorpayKey,
            amount: result.amountPaise || Math.round(total * 100),
            currency: result.currency || 'INR',
            name: 'Angelika Fashions',
            description: `Order ${result.orderNumber || result.orderId}`,
            order_id: result.razorpayOrderId,
            handler: async (response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }) => {
              handlerTriggered = true;
              try {
                const verifyResp = await fetch('/api/payments/verify-razorpay', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                });
                const verifyResult = await verifyResp.json().catch(() => ({}));

                if (verifyResp.ok && verifyResult.success) {
                  const verifiedToken = verifyResult.receiptToken
                    ? `&token=${encodeURIComponent(verifyResult.receiptToken)}`
                    : tokenParam;
                  if (verifyResult.status === 'pending_capture') {
                    window.location.href = `/order-success?order_id=${verifyResult.orderId || result.orderId}${verifiedToken}&verifying=1`;
                    return;
                  }
                  await clearCart();
                  window.location.href = `/order-success?order_id=${verifyResult.orderId || result.orderId}${verifiedToken}`;
                } else {
                  setError(
                    verifyResult?.error ||
                      'We received your payment callback, but verification could not complete immediately. Please check your order status before retrying.'
                  );
                  resetSubmitting();
                }
              } catch {
                window.location.href = `/order-success?order_id=${result.orderId}${tokenParam}&verifying=1`;
              }
            },
            prefill: {
              name: `${shippingAddress.firstName} ${shippingAddress.lastName || ''}`.trim(),
              email: finalEmail,
              contact: finalPhone,
            },
            notes: {
              order_id: result.orderId || '',
              order_number: result.orderNumber || '',
            },
            theme: { color: '#C9A84C' },
            modal: {
              confirm_close: true,
              ondismiss: () => {
                if (!handlerTriggered) {
                  setError('Payment window was closed before completion. You can safely retry payment below.');
                  resetSubmitting();
                }
              },
            },
          });

          razorpay.on('payment.failed', (failure: any) => {
            setError(
              failure?.error?.description ||
                failure?.error?.reason ||
                'Payment could not be completed. Please try again or choose another payment method.'
            );
            resetSubmitting();
          });
          razorpay.open();
        };

        const existingScript = document.getElementById('razorpay-checkout-script');
        if (existingScript && typeof (window as any).Razorpay === 'function') {
          openRazorpayModal();
        } else {
          if (existingScript) existingScript.remove();
          const script = document.createElement('script');
          script.id = 'razorpay-checkout-script';
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => openRazorpayModal();
          script.onerror = () => {
            setError('Could not load Razorpay Checkout. Please check your connection and try again.');
            resetSubmitting();
          };
          document.body.appendChild(script);
        }
      } else if (selectedPayment === 'cod') {
        await clearCart();
        window.location.href = `/order-success?order_id=${result.orderId}${tokenParam}`;
      } else {
        setError('Payment session could not be created. Please try again.');
        resetSubmitting();
      }
    } catch (err) {
      console.error('Order placement failed:', err);
      setError('An unexpected error occurred while placing your order. Please try again.');
      resetSubmitting();
    }
  };

  if (cartLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#EFEAE2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 border-3 border-[#B89334] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#5C5347]">Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#EFEAE2] flex items-center justify-center px-4">
        <div className="bg-white border border-[#D8CFC2] rounded-2xl shadow-sm p-10 text-center max-w-md w-full space-y-4">
          <h1 className="font-display text-3xl text-[#1A1A1A]">Your Bag is Empty</h1>
          <p className="text-sm text-[#665E52]">Add pieces to your bag before checking out.</p>
          <Button variant="primary" asChild className="w-full">
            <Link href="/shop">Explore Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEAE2] text-[#1A1A1A]">
      {/* Minimal Distraction-Free Top Bar — NO Logo Image, NO Storefront Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#DDD4C7] shadow-[0_1px_6px_rgba(26,26,26,0.04)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#574F44] hover:text-[#1A1A1A] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Bag</span>
          </Link>

          <span className="font-display text-base sm:text-lg tracking-[0.22em] uppercase text-[#1A1A1A] font-medium select-none">
            Angelika Fashions
          </span>

          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#574F44]">
            <svg className="w-3.5 h-3.5 text-[#9A7718]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span className="hidden sm:inline">100% Secure Checkout</span>
            <span className="sm:hidden">Secure</span>
          </div>
        </div>
      </header>

      {/* Main Single-Page Two-Column Checkout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: 3 Crisp, High-Contrast All-Visible Sections */}
          <div className="lg:col-span-7 space-y-6">
            {/* SECTION 1: CONTACT & INSTANT OTP VERIFICATION */}
            <section
              ref={contactSectionRef}
              className="bg-white border border-[#D8CFC2] rounded-2xl shadow-[0_4px_18px_rgba(26,26,26,0.06)] overflow-hidden"
            >
              <div className="bg-[#FAF7F2] border-b border-[#E7E0D5] px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-[#E6C975] text-xs font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-[#1A1A1A]">
                      Contact &amp; Account Verification
                    </h2>
                    <p className="text-xs text-[#6B6256]">
                      {user
                        ? 'Your account stays logged in for 1-click tracking & future orders'
                        : 'Verify once to auto-save your account & live order tracking'}
                    </p>
                  </div>
                </div>
                {user && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold whitespace-nowrap">
                    ✓ Signed In
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                {user ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs space-y-0.5">
                        <p className="font-semibold text-emerald-950 text-sm">
                          {profile?.full_name || user.user_metadata?.['full_name'] || 'Signed-in Patron'}
                        </p>
                        <p className="text-emerald-800">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="text-xs font-semibold text-emerald-900 underline hover:text-[#1A1A1A] self-start sm:self-auto cursor-pointer"
                      >
                        Switch Account
                      </button>
                    </div>

                    <div>
                      <label htmlFor="checkout-phone-auth" className="block text-xs font-semibold text-[#332E28] mb-1.5">
                        Delivery Mobile Number (10 digits) *
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-2.5 rounded-xl border border-[#C9BFB0] bg-[#F5F1EB] text-xs font-bold text-[#4A433A]">
                          +91
                        </span>
                        <input
                          id="checkout-phone-auth"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="9876543210"
                          className={fieldErrors['phone'] ? INPUT_ERR_CLASS : INPUT_CLASS}
                        />
                      </div>
                      {fieldErrors['phone'] && (
                        <p className="text-xs text-rose-600 mt-1">{fieldErrors['phone']}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="checkout-email" className="block text-xs font-semibold text-[#332E28] mb-1.5">
                          Email Address *
                        </label>
                        <input
                          id="checkout-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          placeholder="you@example.com"
                          className={fieldErrors['email'] ? INPUT_ERR_CLASS : INPUT_CLASS}
                        />
                        {fieldErrors['email'] && (
                          <p className="text-xs text-rose-600 mt-1">{fieldErrors['email']}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="checkout-phone" className="block text-xs font-semibold text-[#332E28] mb-1.5">
                          Mobile Number *
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-2.5 rounded-xl border border-[#C9BFB0] bg-[#F5F1EB] text-xs font-bold text-[#4A433A]">
                            +91
                          </span>
                          <input
                            id="checkout-phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            placeholder="9876543210"
                            className={fieldErrors['phone'] ? INPUT_ERR_CLASS : INPUT_CLASS}
                          />
                        </div>
                        {fieldErrors['phone'] && (
                          <p className="text-xs text-rose-600 mt-1">{fieldErrors['phone']}</p>
                        )}
                      </div>
                    </div>

                    {/* Seamless Inline Checkout OTP Verification + Auto-Account Creation */}
                    {otpStatus.anyOtpReady ? (
                      <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#DFD1B5] space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                              Instant 6-Digit OTP Verification
                            </p>
                            <p className="text-xs text-[#61584D] mt-0.5">
                              Confirms your number &amp; automatically creates/signs into your account — no password setup needed.
                            </p>
                          </div>

                          {otpStatus.mobileOtpReady && otpStatus.emailOtpReady && (
                            <div className="inline-flex rounded-lg border border-[#D8CFC2] bg-white p-0.5 text-[11px] font-semibold flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => setOtpChannel('mobile')}
                                className={cn(
                                  'px-2.5 py-1 rounded-md cursor-pointer transition-colors',
                                  otpChannel === 'mobile' ? 'bg-[#1A1A1A] text-white' : 'text-[#5C5347]'
                                )}
                              >
                                Mobile OTP
                              </button>
                              <button
                                type="button"
                                onClick={() => setOtpChannel('email')}
                                className={cn(
                                  'px-2.5 py-1 rounded-md cursor-pointer transition-colors',
                                  otpChannel === 'email' ? 'bg-[#1A1A1A] text-white' : 'text-[#5C5347]'
                                )}
                              >
                                Email OTP
                              </button>
                            </div>
                          )}
                        </div>

                        {!otpSentTo ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={handleSendCheckoutOtp}
                              disabled={otpSending}
                              className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#332E28] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {otpSending
                                ? 'Sending OTP...'
                                : otpChannel === 'mobile' && otpStatus.mobileOtpReady
                                  ? 'Send Mobile OTP'
                                  : 'Send 6-Digit Email OTP'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAuthModal(true)}
                              className="text-xs font-semibold text-[#8A6914] hover:underline cursor-pointer"
                            >
                              Or Sign In with Password / Google
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit OTP"
                                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#B89334] bg-white font-mono text-sm tracking-[0.25em] text-center text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30"
                              />
                              <button
                                type="button"
                                onClick={handleVerifyCheckoutOtp}
                                disabled={otpVerifying || otpCode.length < 6}
                                className="px-5 py-2.5 rounded-xl bg-[#B89334] hover:bg-[#9E7B22] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer transition-colors"
                              >
                                {otpVerifying ? 'Verifying...' : 'Verify & Continue'}
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[#6B6256]">
                              <span>Code sent to <strong>{otpSentTo}</strong></span>
                              <button
                                type="button"
                                onClick={handleSendCheckoutOtp}
                                disabled={otpCooldown > 0 || otpSending}
                                className="font-semibold text-[#8A6914] hover:underline disabled:opacity-50 cursor-pointer"
                              >
                                {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                              </button>
                            </div>
                          </div>
                        )}

                        {otpFeedback && (
                          <p
                            className={cn(
                              'text-xs font-medium',
                              otpFeedback.type === 'error'
                                ? 'text-rose-700'
                                : otpFeedback.type === 'success'
                                  ? 'text-emerald-700'
                                  : 'text-[#6E5412]'
                            )}
                          >
                            {otpFeedback.text}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DDD0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="text-[#5C5347]">
                          Returning customer? Sign in once — Chrome keeps you logged in with saved addresses &amp; My Orders.
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAuthModal(true)}
                          className="font-bold text-[#8A6914] hover:underline whitespace-nowrap self-start sm:self-auto cursor-pointer"
                        >
                          Sign In / Create Account →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* SECTION 2: DELIVERY ADDRESS */}
            <section
              ref={addressSectionRef}
              className="bg-white border border-[#D8CFC2] rounded-2xl shadow-[0_4px_18px_rgba(26,26,26,0.06)] overflow-hidden"
            >
              <div className="bg-[#FAF7F2] border-b border-[#E7E0D5] px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-[#E6C975] text-xs font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-[#1A1A1A]">Delivery Address</h2>
                    <p className="text-xs text-[#6B6256]">Where should we ship your Angelika piece?</p>
                  </div>
                </div>
                {user && savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm((v) => !v)}
                    className="text-xs font-semibold text-[#8A6914] hover:underline cursor-pointer"
                  >
                    {showNewAddressForm ? 'Use Saved Address' : '+ New Address'}
                  </button>
                )}
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                {/* Saved Addresses for Logged-In Returning Customers */}
                {user && savedAddresses.length > 0 && !showNewAddressForm && (
                  <div className="space-y-3">
                    {savedAddresses.map((addr, idx) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id || idx}
                          type="button"
                          onClick={() => setSelectedAddressId(addr.id || '')}
                          className={cn(
                            'w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3',
                            isSelected
                              ? 'border-[#B89334] bg-[#FCF9F2]'
                              : 'border-[#E2DAD0] bg-white hover:border-[#C9BFB0]'
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                              isSelected ? 'border-[#B89334] bg-[#B89334]' : 'border-[#BFB5A6]'
                            )}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <div className="text-xs space-y-0.5">
                            <p className="text-sm font-semibold text-[#1A1A1A]">
                              {addr.firstName} {addr.lastName}
                              {addr.isDefault && (
                                <span className="ml-2 px-2 py-0.5 rounded bg-[#1A1A1A] text-[#E6C975] text-[10px] uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                            </p>
                            <p className="text-[#5C5347]">
                              {addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}
                            </p>
                            <p className="text-[#5C5347]">
                              {addr.city}, {addr.state} — {addr.postalCode}
                            </p>
                            {addr.phone && <p className="text-[#7A7165]">Phone: +91 {addr.phone}</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Compact Clean Address Form */}
                {(showNewAddressForm || !user || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="addr-first" className="block text-xs font-semibold text-[#332E28] mb-1.5">
                          First Name *
                        </label>
                        <input
                          id="addr-first"
                          type="text"
                          autoComplete="given-name"
                          value={newAddress.firstName}
                          onChange={(e) => {
                            setNewAddress((prev) => ({ ...prev, firstName: e.target.value }));
                            if (fieldErrors['firstName']) setFieldErrors((p) => ({ ...p, firstName: '' }));
                          }}
                          placeholder="e.g. Ananya"
                          className={fieldErrors['firstName'] ? INPUT_ERR_CLASS : INPUT_CLASS}
                        />
                        {fieldErrors['firstName'] && (
                          <p className="text-xs text-rose-600 mt-1">{fieldErrors['firstName']}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="addr-last" className="block text-xs font-semibold text-[#332E28] mb-1.5">
                          Last Name *
                        </label>
                        <input
                          id="addr-last"
                          type="text"
                          autoComplete="family-name"
                          value={newAddress.lastName}
                          onChange={(e) => {
                            setNewAddress((prev) => ({ ...prev, lastName: e.target.value }));
                            if (fieldErrors['lastName']) setFieldErrors((p) => ({ ...p, lastName: '' }));
                          }}
                          placeholder="e.g. Sharma"
                          className={fieldErrors['lastName'] ? INPUT_ERR_CLASS : INPUT_CLASS}
                        />
                        {fieldErrors['lastName'] && (
                          <p className="text-xs text-rose-600 mt-1">{fieldErrors['lastName']}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="addr-pin" className="block text-xs font-semibold text-[#332E28] mb-1.5">
                          Pincode *
                        </label>
                        <div className="relative">
                          <input
                            id="addr-pin"
                            type="text"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            maxLength={6}
                            value={newAddress.postalCode}
                            onChange={(e) => handlePincodeChange(e.target.value)}
                            placeholder="e.g. 500081"
                            className={fieldErrors['postalCode'] ? INPUT_ERR_CLASS : INPUT_CLASS}
                          />
                          {isResolvingPin && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-[#B89334] border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                        {fieldErrors['postalCode'] ? (
                          <p className="text-xs text-rose-600 mt-1">{fieldErrors['postalCode']}</p>
                        ) : pincodeInfo ? (
                          <p className="text-[11px] text-emerald-700 font-medium mt-1">
                            ✓ Deliverable to {pincodeInfo.city}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label htmlFor="addr-city" className="block text-xs font-semibold text-[#332E28] mb-1.5">
                          City *
                        </label>
                        <input
                          id="addr-city"
                          type="text"
                          autoComplete="address-level2"
                          value={newAddress.city}
                          onChange={(e) => {
                            setNewAddress((prev) => ({ ...prev, city: e.target.value }));
                            if (fieldErrors['city']) setFieldErrors((p) => ({ ...p, city: '' }));
                          }}
                          placeholder="City"
                          className={fieldErrors['city'] ? INPUT_ERR_CLASS : INPUT_CLASS}
                        />
                        {fieldErrors['city'] && (
                          <p className="text-xs text-rose-600 mt-1">{fieldErrors['city']}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="addr-state" className="block text-xs font-semibold text-[#332E28] mb-1.5">
                          State *
                        </label>
                        <select
                          id="addr-state"
                          autoComplete="address-level1"
                          value={newAddress.state}
                          onChange={(e) => {
                            setNewAddress((prev) => ({ ...prev, state: e.target.value }));
                            if (fieldErrors['state']) setFieldErrors((p) => ({ ...p, state: '' }));
                          }}
                          className={fieldErrors['state'] ? INPUT_ERR_CLASS : INPUT_CLASS}
                        >
                          <option value="">Select state</option>
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        {fieldErrors['state'] && (
                          <p className="text-xs text-rose-600 mt-1">{fieldErrors['state']}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="addr-line1" className="block text-xs font-semibold text-[#332E28] mb-1.5">
                        Flat / House No., Building, Street *
                      </label>
                      <input
                        id="addr-line1"
                        type="text"
                        autoComplete="address-line1"
                        value={newAddress.address1}
                        onChange={(e) => {
                          setNewAddress((prev) => ({ ...prev, address1: e.target.value }));
                          if (fieldErrors['address1']) setFieldErrors((p) => ({ ...p, address1: '' }));
                        }}
                        placeholder="House / Flat No., Street, Colony"
                        className={fieldErrors['address1'] ? INPUT_ERR_CLASS : INPUT_CLASS}
                      />
                      {fieldErrors['address1'] && (
                        <p className="text-xs text-rose-600 mt-1">{fieldErrors['address1']}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="addr-line2" className="block text-xs font-semibold text-[#332E28] mb-1.5">
                        Landmark / Area (Optional)
                      </label>
                      <input
                        id="addr-line2"
                        type="text"
                        autoComplete="address-line2"
                        value={newAddress.address2 || ''}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, address2: e.target.value }))}
                        placeholder="Near park, temple, or apartment gate"
                        className={INPUT_CLASS}
                      />
                    </div>

                    {user && (
                      <div className="pt-1">
                        <Checkbox
                          id="save-addr-opt"
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                          label={
                            <span className="text-xs text-[#574F44]">
                              Save this address to my account for faster future checkouts
                            </span>
                          }
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Collapsible Optional Gift Wrap & Delivery Note (keeps checkout super clean!) */}
                <details className="pt-2 border-t border-[#ECE6DC] group">
                  <summary className="text-xs font-semibold text-[#7A5E12] cursor-pointer list-none flex items-center justify-between py-1 select-none">
                    <span>+ Add Complimentary Gift Wrap or Atelier Delivery Note (Optional)</span>
                    <span className="text-[#8E8477] group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <div className="pt-3 space-y-3">
                    <Checkbox
                      id="gift-wrap-opt"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      label={
                        <span className="text-xs font-medium text-[#1A1A1A]">
                          Add complimentary heirloom gift box &amp; handwritten card
                        </span>
                      }
                    />
                    {giftWrap && (
                      <div className="grid sm:grid-cols-2 gap-3 pl-6">
                        <input
                          type="text"
                          value={giftRecipient}
                          onChange={(e) => setGiftRecipient(e.target.value)}
                          placeholder="Recipient name"
                          className={INPUT_CLASS}
                        />
                        <input
                          type="text"
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="Short personal note..."
                          className={INPUT_CLASS}
                        />
                      </div>
                    )}
                    <div>
                      <label htmlFor="atelier-notes" className="block text-xs font-semibold text-[#332E28] mb-1.5">
                        Tailoring / Delivery Note
                      </label>
                      <textarea
                        id="atelier-notes"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any custom fitting preference or delivery timing instruction..."
                        className={`${INPUT_CLASS} min-h-[68px] resize-y`}
                      />
                    </div>
                  </div>
                </details>
              </div>
            </section>

            {/* SECTION 3: PAYMENT METHOD & COMPLETE ORDER */}
            <section className="bg-white border border-[#D8CFC2] rounded-2xl shadow-[0_4px_18px_rgba(26,26,26,0.06)] overflow-hidden">
              <div className="bg-[#FAF7F2] border-b border-[#E7E0D5] px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-[#E6C975] text-xs font-bold flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-[#1A1A1A]">Payment Method</h2>
                    <p className="text-xs text-[#6B6256]">256-bit SSL encrypted • Instant order confirmation</p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                {/* Online Razorpay Card */}
                <button
                  type="button"
                  onClick={() => setSelectedPayment('razorpay')}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer',
                    selectedPayment === 'razorpay'
                      ? 'border-[#B89334] bg-[#FCF9F2] shadow-[0_2px_10px_rgba(184,147,52,0.12)]'
                      : 'border-[#E2DAD0] bg-white hover:border-[#C9BFB0]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        selectedPayment === 'razorpay' ? 'border-[#B89334] bg-[#B89334]' : 'border-[#BFB5A6]'
                      )}
                    >
                      {selectedPayment === 'razorpay' && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-[#1A1A1A]">
                          Pay Online (UPI, GPay, PhonePe, Cards, NetBanking)
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#1A1A1A] text-[#E6C975] text-[10px] font-bold uppercase tracking-wider">
                          Recommended · Zero Fee
                        </span>
                      </div>
                      <p className="text-xs text-[#61584D] mt-1">
                        Instant confirmation &amp; priority dispatch • Secured by Razorpay
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {['UPI / QR', 'Google Pay', 'PhonePe', 'Visa / Mastercard', 'RuPay', 'NetBanking'].map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded bg-white border border-[#DDD5C9] text-[11px] font-medium text-[#4A433A]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>

                {/* COD Card */}
                <button
                  type="button"
                  disabled={!codEligible}
                  onClick={() => codEligible && setSelectedPayment('cod')}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border-2 transition-all',
                    !codEligible
                      ? 'border-[#ECE6DC] bg-[#F7F5F2] opacity-60 cursor-not-allowed'
                      : selectedPayment === 'cod'
                        ? 'border-[#B89334] bg-[#FCF9F2] shadow-[0_2px_10px_rgba(184,147,52,0.12)] cursor-pointer'
                        : 'border-[#E2DAD0] bg-white hover:border-[#C9BFB0] cursor-pointer'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        selectedPayment === 'cod' ? 'border-[#B89334] bg-[#B89334]' : 'border-[#BFB5A6]'
                      )}
                    >
                      {selectedPayment === 'cod' && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-[#1A1A1A]">Cash on Delivery (COD)</span>
                        <span className="text-xs text-[#6B6256]">
                          (+₹{PRICING_CONSTANTS.COD_FEE} handling fee)
                        </span>
                      </div>
                      <p className="text-xs text-[#61584D] mt-0.5">
                        {codEligible
                          ? `Pay Cash or UPI at your doorstep (available on orders up to ₹${PRICING_CONSTANTS.COD_MAX_AMOUNT.toLocaleString('en-IN')}).`
                          : `COD is available only on orders up to ₹${PRICING_CONSTANTS.COD_MAX_AMOUNT.toLocaleString('en-IN')}. Please use Pay Online.`}
                      </p>
                    </div>
                  </div>
                </button>

                {/* WhatsApp updates + Terms */}
                <div className="pt-2 space-y-2.5 border-t border-[#ECE6DC]">
                  <Checkbox
                    id="wa-updates"
                    checked={whatsappOptIn}
                    onChange={(e) => setWhatsappOptIn(e.target.checked)}
                    label={
                      <span className="text-xs text-[#574F44]">
                        Send live order &amp; courier dispatch updates on WhatsApp
                      </span>
                    }
                  />
                  <Checkbox
                    id="terms-accept"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    label={
                      <span className="text-xs text-[#574F44]">
                        I agree to the{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#8A6914] font-semibold underline">
                          Terms &amp; Conditions
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#8A6914] font-semibold underline">
                          Privacy Policy
                        </a>
                        .
                      </span>
                    }
                  />
                </div>

                {/* Single Crisp Error Banner */}
                {error && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium flex items-start gap-2"
                  >
                    <span className="font-bold">!</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Primary Place Order / Pay CTA */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={!termsAccepted || isProcessing || hasOutOfStockItems}
                  className="w-full py-4 px-6 rounded-xl bg-[#1A1A1A] hover:bg-[#2E2923] text-white font-semibold text-sm tracking-[0.12em] uppercase border border-[#C9A84C]/60 shadow-[0_6px_20px_rgba(26,26,26,0.18)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#E6C975] border-t-transparent rounded-full animate-spin" />
                      <span>Securing Your Order...</span>
                    </>
                  ) : hasOutOfStockItems ? (
                    'Remove Out-of-Stock Items in Bag'
                  ) : selectedPayment === 'razorpay' ? (
                    `Pay ${formatPrice(total)} Securely`
                  ) : (
                    `Confirm COD Order • ${formatPrice(total)}`
                  )}
                </button>

                <p className="text-[11px] text-center text-[#7A7165]">
                  ✦ Handcrafted Indian Couture • Dispatched within 24–48 hrs • Easy Returns
                </p>
              </div>
            </section>
          </div>

          {/* RIGHT STICKY COLUMN: ALWAYS-VISIBLE ORDER SUMMARY & COUPONS */}
          <aside className="lg:col-span-5 lg:sticky lg:top-20 space-y-5">
            <div className="bg-white border border-[#D8CFC2] rounded-2xl shadow-[0_4px_18px_rgba(26,26,26,0.06)] overflow-hidden">
              <div className="bg-[#FAF7F2] border-b border-[#E7E0D5] px-5 sm:px-6 py-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-medium text-[#1A1A1A]">
                  Order Summary ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </h2>
                <Link href="/cart" className="text-xs font-semibold text-[#8A6914] hover:underline">
                  Edit Bag
                </Link>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* Items List */}
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3.5 items-center">
                      <div className="w-14 h-16 rounded-lg overflow-hidden bg-[#F2ECE3] border border-[#E5DDD0] flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A1A] truncate">{item.product_name}</p>
                        <p className="text-xs text-[#6B6256] mt-0.5">
                          {item.color} • Size {item.size} • Qty {item.quantity}
                        </p>
                        {item.inventory_quantity === 0 && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Out of stock</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-[#1A1A1A] whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Privilege Coupon / Promo Code (Always Accessible!) */}
                <div className="pt-4 border-t border-[#E7E0D5] space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7A5E12]">
                    Privilege Voucher / Coupon
                  </p>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-xs">
                        <span className="font-bold text-emerald-800">✓ {appliedCoupon.code}</span>
                        <span className="text-emerald-700 ml-2">(-{formatPrice(discountAmount)} saved)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCoupon()}
                        className="text-xs font-semibold text-rose-700 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          placeholder="Enter voucher code"
                          className="flex-1 px-3 py-2 rounded-xl border border-[#C9BFB0] bg-[#FDFCFA] text-xs uppercase tracking-wider text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#9A7718]"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          disabled={couponApplying || !couponCodeInput.trim()}
                          className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#332E28] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer transition-colors"
                        >
                          {couponApplying ? '...' : 'Apply'}
                        </button>
                      </div>

                      {availableOffers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {availableOffers.map((offer) => (
                            <button
                              key={offer.code}
                              type="button"
                              onClick={() => handleApplyCoupon(offer.code)}
                              disabled={couponApplying}
                              className="px-2.5 py-1.5 rounded-lg border border-dashed border-[#C9A84C] bg-[#FCF9F2] hover:bg-[#F5EBD4] text-left transition-colors cursor-pointer"
                            >
                              <span className="text-[11px] font-bold text-[#7A5E12]">{offer.code}</span>
                              <span className="text-[10px] text-[#6B6256] ml-1.5">
                                {offer.title} ({offer.desc})
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {couponNotice && (
                    <p
                      className={cn(
                        'text-xs font-medium',
                        couponNotice.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
                      )}
                    >
                      {couponNotice.text}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-[#E7E0D5] space-y-2 text-sm">
                  <div className="flex justify-between text-[#5C5347]">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#1A1A1A]">{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Voucher Savings</span>
                      <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#5C5347]">
                    <span>Insured Shipping</span>
                    <span className={cartShippingCost === 0 ? 'font-semibold text-emerald-700' : 'font-medium text-[#1A1A1A]'}>
                      {cartShippingCost === 0 ? 'FREE' : formatPrice(cartShippingCost)}
                    </span>
                  </div>
                  {codFee > 0 && (
                    <div className="flex justify-between text-[#5C5347]">
                      <span>COD Handling Fee</span>
                      <span className="font-medium text-[#1A1A1A]">{formatPrice(codFee)}</span>
                    </div>
                  )}
                  <div className="pt-3 mt-2 border-t border-[#DDD4C7] flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-bold text-[#1A1A1A]">Total Payable</span>
                      <span className="block text-[11px] text-[#7A7165]">Inclusive of all Indian GST</span>
                    </div>
                    <span className="text-2xl font-bold text-[#1A1A1A]">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Card */}
            <div className="bg-white border border-[#D8CFC2] rounded-2xl p-4 grid grid-cols-3 gap-2 text-center text-[11px] text-[#574F44]">
              <div>
                <p className="font-bold text-[#1A1A1A]">Razorpay SSL</p>
                <p className="text-[10px] text-[#7A7165]">256-Bit Encrypted</p>
              </div>
              <div className="border-x border-[#E7E0D5]">
                <p className="font-bold text-[#1A1A1A]">Insured Delivery</p>
                <p className="text-[10px] text-[#7A7165]">Pan-India Tracking</p>
              </div>
              <div>
                <p className="font-bold text-[#1A1A1A]">Easy Returns</p>
                <p className="text-[10px] text-[#7A7165]">Atelier Support</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Password / Google Sign-In Modal for Returning Customers */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            refreshSession().catch(() => {});
          }}
        />
      )}
    </div>
  );
}
