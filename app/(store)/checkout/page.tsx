'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { Radio, RadioGroup } from '@/components/ui/Radio';
import { Checkbox } from '@/components/ui/Checkbox';
import { Stepper } from '@/components/ui/Stepper';
import { LinkButton } from '@/components/ui/LinkButton';
import { cn } from '@/lib/utils/cn';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { createOrder, getUserAddresses, saveAddress, verifyRazorpayPayment } from '@/lib/actions/checkout';
import { lookupPincode, type PincodeDetails } from '@/lib/utils/pincode';
import type { Address } from '@/types/commerce';

// Local form interface extending Address with UI-specific fields
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

const toAddressForm = (addr: Address): AddressFormData => ({
  firstName: addr.firstName,
  lastName: addr.lastName,
  address1: addr.address1,
  address2: addr.address2,
  city: addr.city,
  state: addr.state,
  postalCode: addr.postalCode,
  country: addr.country,
  phone: addr.phone,
  email: addr.email,
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

const steps = [
  { id: 'delivery', label: 'Delivery', description: 'Shipping address' },
  { id: 'payment', label: 'Payment', description: 'Choose payment method' },
  { id: 'review', label: 'Review', description: 'Confirm your order' },
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const paymentMethods = [
  {
    id: 'razorpay',
    name: 'Online Payment',
    description: 'UPI, Credit/Debit Cards, Net Banking, Wallets, EMI',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 8h20M10 12h4M10 16h4" />
      </svg>
    ),
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when your order arrives (₹49 handling fee, max ₹10,000)',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

const formatPrice = (val: number): string => {
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
};

const formatPricePlain = (val: number): string => {
  return Math.round(val).toLocaleString('en-IN');
};

export default function CheckoutPage() {
  const { user, profile, refreshProfile } = useAuth();
  const {
    items,
    subtotal,
    shippingCost: cartShippingCost,
    taxAmount,
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

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [savedAddresses, setSavedAddresses] = useState<AddressFormData[]>([]);
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
    isDefault: false,
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'razorpay' | 'cod'>('razorpay');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [notes, setNotes] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // World-class luxury additions
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [pincodeInfo, setPincodeInfo] = useState<PincodeDetails | null>(null);
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponNotice, setCouponNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const availableOffers = [
    { code: 'FIRST10', title: '10% OFF', desc: 'Welcome privilege on your couture order (min ₹1,999)', badge: 'VIP Welcome' },
    { code: 'ROYAL500', title: '₹500 OFF', desc: 'Flat ₹500 off on heritage sets above ₹4,999', badge: 'Royal Edition' },
    { code: 'COUTURE15', title: '15% OFF', desc: '15% festive luxury discount on orders above ₹5,999', badge: 'Festive Luxe' },
  ];

  const handlePincodeChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setNewAddress(prev => ({ ...prev, postalCode: clean }));

    if (clean.length === 6) {
      setIsResolvingPin(true);
      try {
        const info = await lookupPincode(clean);
        if (info && (info.city || info.state)) {
          setPincodeInfo(info);
          setNewAddress(prev => ({
            ...prev,
            city: info.city || prev.city,
            state: info.state || prev.state,
          }));
        } else {
          setPincodeInfo(null);
        }
      } catch (err) {
        console.warn('Pincode auto-lookup error:', err);
      } finally {
        setIsResolvingPin(false);
      }
    } else {
      setPincodeInfo(null);
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
        setCouponNotice({ type: 'success', text: `Privilege voucher ${code} applied!` });
        setCouponCodeInput('');
      } else {
        setCouponNotice({ type: 'error', text: res.error || 'Invalid coupon code' });
      }
    } catch {
      setCouponNotice({ type: 'error', text: 'Failed to apply coupon' });
    } finally {
      setCouponApplying(false);
    }
  };

  // Load saved addresses on mount
  useEffect(() => {
    if (user) {
      loadAddresses();
    } else {
      setShowNewAddressForm(true);
    }
  }, [user]);

  // Sync email/phone with profile
  useEffect(() => {
    if (profile) {
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const loadAddresses = async () => {
    if (!user) {
      setShowNewAddressForm(true);
      return;
    }
    try {
      const addresses = await getUserAddresses(user.id);
      setSavedAddresses(addresses.map(toAddressForm));
      if (addresses.length > 0) {
        setSelectedAddressId(addresses[0].id || '');
        setShowNewAddressForm(false);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
      setShowNewAddressForm(true);
    }
  };

  const handleSaveAddress = async (addressData: AddressFormData) => {
    if (!user) {
      setShowNewAddressForm(false);
      return;
    }
    try {
      const result = await saveAddress(user.id, toAddress(addressData));
      if (result.success && result.address) {
        const newAddr = toAddressForm(result.address);
        setSavedAddresses(prev => [newAddr, ...prev]);
        setSelectedAddressId(newAddr.id || '');
        setShowNewAddressForm(false);
        if (result.address.is_default) {
          await refreshProfile();
        }
      } else {
        setError(result.error || 'Failed to save address');
      }
    } catch (err) {
      console.error('Failed to save address:', err);
      setError('Failed to save address');
    }
  };

  const activeAddress: AddressFormData = (showNewAddressForm || !selectedAddressId)
    ? newAddress
    : (savedAddresses.find(a => a.id === selectedAddressId) || newAddress);

  const subtotalValue = subtotal;
  const shippingCost = cartShippingCost;
  const codFee = selectedPayment === 'cod' ? 49 : 0;
  const total = cartTotal + codFee;

  const hasOutOfStockItems = items.some(item => item.inventory_quantity === 0);
  const hasLowStockItems = items.some(item => item.inventory_quantity > 0 && item.inventory_quantity < item.quantity);

  const nextStep = () => {
    setError('');
    if (currentStep === 0) {
      if (showNewAddressForm || !selectedAddressId) {
        if (
          !newAddress.firstName?.trim() ||
          !newAddress.lastName?.trim() ||
          !newAddress.address1?.trim() ||
          !newAddress.city?.trim() ||
          !newAddress.state?.trim() ||
          !newAddress.postalCode?.trim()
        ) {
          setError('Please fill in all required address fields');
          return;
        }

        const finalEmail = email?.trim() || newAddress.email?.trim() || user?.email || '';
        if (!finalEmail || !finalEmail.includes('@')) {
          setError('Please enter a valid email address for order confirmation');
          return;
        }

        const phoneDigits = (newAddress.phone || phone || '').replace(/\D/g, '');
        if (phoneDigits.length < 10) {
          setError('Please enter a valid 10-digit mobile number');
          return;
        }

        const pin = (newAddress.postalCode || '').trim();
        if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
          setError('Please enter a valid 6-digit delivery pincode');
          return;
        }

        if (user) {
          handleSaveAddress(newAddress);
        }
      } else {
        const addr = savedAddresses.find(a => a.id === selectedAddressId);
        if (!addr) {
          setError('Please select or add a delivery address');
          return;
        }
      }
    }
    if (currentStep === 1 && !selectedPayment) {
      setError('Please select a payment method');
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setError('');
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handlePlaceOrder = async () => {
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }
    if (items.length === 0) return;

    setIsProcessing(true);
    setError('');

    try {
      // Validate cart
      const validation = await validateCart();
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        setIsProcessing(false);
        return;
      }

      // Determine selected address
      let shippingAddress: Address;
      if (showNewAddressForm || !selectedAddressId) {
        if (!newAddress.firstName?.trim() || !newAddress.address1?.trim()) {
          setError('Please complete your delivery address before placing order');
          setIsProcessing(false);
          setCurrentStep(0);
          return;
        }
        shippingAddress = toAddress(newAddress);
      } else {
        const addr = savedAddresses.find(a => a.id === selectedAddressId);
        if (!addr) {
          setError('Please select a delivery address');
          setIsProcessing(false);
          setCurrentStep(0);
          return;
        }
        shippingAddress = toAddress(addr);
      }

      const finalEmail = email?.trim() || newAddress.email?.trim() || user?.email || '';
      const finalPhone = phone?.trim() || newAddress.phone?.trim() || '';

      if (!finalEmail) {
        setError('Please enter your email address for order confirmation');
        setIsProcessing(false);
        return;
      }
      if (!finalPhone) {
        setError('Please enter your phone number');
        setIsProcessing(false);
        return;
      }

      // Prepare order data
      const orderData = {
        items,
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod: selectedPayment,
        email: finalEmail,
        phone: finalPhone,
        notes,
        coupon: appliedCoupon || undefined,
        userId: user?.id,
        giftWrap,
        giftMessage: giftWrap ? `${giftRecipient ? 'To: ' + giftRecipient + ' — ' : ''}${giftMessage}` : undefined,
        whatsappOptIn,
      };

      const result = await createOrder(orderData);

      if (!result.success) {
        setError(result.error || 'Failed to place order');
        setIsProcessing(false);
        return;
      }

      if (selectedPayment === 'razorpay' && result.razorpayOrderId) {
        // Redirect to Razorpay checkout
        const razorpayOptions = {
          key: process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'],
          amount: Math.round(total * 100), // Razorpay requires paise
          currency: 'INR',
          name: 'Angelika Fashions',
          description: `Order ${result.orderId}`,
          order_id: result.razorpayOrderId,
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            const verifyResult = await verifyRazorpayPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            if (verifyResult.success) {
              await clearCart();
              window.location.href = `/order-success?order_id=${verifyResult.orderId}`;
            } else {
              setError(verifyResult.error || 'Payment verification failed');
              setIsProcessing(false);
            }
          },
          prefill: {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            email: finalEmail,
            contact: finalPhone,
          },
          notes: {
            order_id: result.orderId,
          },
          theme: {
            color: '#C9A84C',
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        // Load Razorpay script dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const razorpay = new (window as any).Razorpay(razorpayOptions);
          razorpay.on('payment.failed', (response: any) => {
            setError(response.error.description || 'Payment failed');
            setIsProcessing(false);
          });
          razorpay.open();
        };
        document.body.appendChild(script);
      } else if (selectedPayment === 'cod') {
        // COD order placed successfully
        await clearCart();
        window.location.href = `/order-success?order_id=${result.orderId}`;
      }
    } catch (err) {
      console.error('Order placement failed:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-slate)]">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[var(--color-white)]">
        <ScrollReveal variant="fadeUp" className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center">
            <svg className="h-12 w-12 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1 0 8" />
            </svg>
          </div>
          <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)] mb-3">
            Your Bag is Empty
          </h1>
          <p className="text-[var(--color-slate)] mb-8">
            Add items to your bag before proceeding to checkout.
          </p>
          <Button variant="primary" asChild>
            <a href="/shop">Continue Shopping</a>
          </Button>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Progress Header with Brand Logo */}
      <header className="bg-[var(--color-white)] border-b border-[var(--color-whisper)] sticky top-0 z-40 shadow-sm">
        <div className="container-custom px-6 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto mb-3">
            <Link href="/" className="flex items-center gap-2" aria-label="Angelika Fashions - Home">
              <img
                src="/images/logo.png"
                alt="Angelika Fashions"
                className="h-8 md:h-10 w-auto object-contain rounded-sm"
              />
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold tracking-tight text-[var(--color-ink)] leading-none">
                  Angelika
                </span>
                <span className="text-[8px] tracking-[0.2em] text-[var(--color-gold)] uppercase font-semibold">
                  Secure Checkout
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
              <svg className="h-4 w-4 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="font-medium">100% Secure Checkout</span>
            </div>
          </div>
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={(stepId, index) => {
              if (index < currentStep) {
                setError('');
                setCurrentStep(index);
              }
            }}
            className="max-w-4xl mx-auto"
          />
        </div>
      </header>

      {/* Checkout Content */}
      <main className="py-10">
        <div className="container-custom px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Steps */}
            <ScrollReveal variant="fadeUp" className="lg:col-span-2 space-y-6">
              <>
                <AnimatePresence mode="wait">
                  {/* Step 1: Delivery */}
                  {currentStep === 0 && (
                    <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                      <StaggerContainer variant="default">
                        <Card variant="elevated" padding="lg">
                          <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <CardTitle className="text-[var(--font-display)] text-xl">Delivery &amp; Contact Information</CardTitle>
                                <p className="text-[var(--color-slate)] text-sm mt-0.5">Enter where you'd like your handcrafted couture delivered</p>
                              </div>
                              {!user && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-gold-light)]/40 text-[var(--color-gold)] border border-[var(--color-gold)]/20 text-xs font-semibold rounded-full self-start sm:self-auto">
                                  ✦ Express Guest Checkout
                                </span>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">

                          {/* Guest Welcome Banner */}
                          {!user && (
                            <div className="p-3.5 bg-[var(--color-snow)] rounded-[var(--radius-lg)] border border-[var(--color-whisper)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] flex items-center justify-center font-bold">
                                  ✓
                                </span>
                                <span className="text-[var(--color-ink)] font-medium">
                                  Checking out as a Guest • No password required
                                </span>
                              </div>
                              <Link href="/login?redirect=/checkout" className="text-[var(--color-gold)] font-medium hover:underline flex items-center gap-1">
                                Already have an account? Sign in
                              </Link>
                            </div>
                          )}

                          {/* Saved Addresses (for logged-in users) */}
                          {user && savedAddresses.length > 0 && (
                            <StaggerItem variant="default">
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-gold)]">Saved Addresses</h4>
                                <div className="space-y-3">
                                  {savedAddresses.map((addr, index) => (
                                    <StaggerItem key={addr.id || index} variant="slide" style={{ transitionDelay: `${index * 0.08}s` }}>
                                      <Radio
                                        checked={selectedAddressId === addr.id}
                                        onChange={() => setSelectedAddressId(addr.id || '')}
                                        label={`${addr.firstName} ${addr.lastName}`}
                                        description={`${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}, ${addr.city}, ${addr.state} - ${addr.postalCode} | Phone: ${addr.phone}`}
                                        className={cn(
                                          'relative p-4 border rounded-[var(--radius-lg)] transition-all duration-200 block',
                                          selectedAddressId === addr.id
                                            ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]/20 shadow-[var(--shadow-gold)]'
                                            : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]'
                                        )}
                                      >
                                        {addr.isDefault && (
                                          <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-[var(--color-gold)] text-[var(--color-ink)] rounded-[var(--radius-sm)]">
                                            Default
                                          </span>
                                        )}
                                        <span className="absolute top-2 right-2 text-sm text-[var(--color-gold)] font-medium capitalize" style={{ right: addr.isDefault ? '70px' : '10px' }}>
                                          {addr.type}
                                        </span>
                                      </Radio>
                                    </StaggerItem>
                                  ))}
                                </div>
                              </div>
                            </StaggerItem>
                          )}

                          {/* Toggle Add New Address button for logged-in users */}
                          {user && savedAddresses.length > 0 && (
                            <div className="border-t border-[var(--color-whisper)] pt-4">
                              <Button
                                variant={showNewAddressForm ? 'secondary' : 'outline'}
                                className="w-full"
                                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                              >
                                {showNewAddressForm ? 'Cancel New Address' : '+ Add Different Address'}
                              </Button>
                            </div>
                          )}

                          {/* Address & Contact Form */}
                          <AnimatePresence>
                            {(showNewAddressForm || !user || savedAddresses.length === 0) && (
                              <motion.div
                                key="new-address"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                              >
                                {/* 1. Contact Info */}
                                <div className="space-y-3 pb-2">
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
                                    1. Contact Details (For order confirmation &amp; tracking)
                                  </h4>
                                  <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                      <label htmlFor="email" className="input-label">Email Address *</label>
                                      <Input
                                        id="email"
                                        type="email"
                                        value={email || newAddress.email || ''}
                                        onChange={(e) => {
                                          setEmail(e.target.value);
                                          setNewAddress({ ...newAddress, email: e.target.value });
                                        }}
                                        placeholder="you@example.com"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor="phone" className="input-label">Mobile Number *</label>
                                      <div className="relative flex items-center">
                                        <span className="absolute left-3 text-sm font-medium text-[var(--color-slate)] select-none">
                                          🇮🇳 +91
                                        </span>
                                        <Input
                                          id="phone"
                                          type="tel"
                                          className="pl-16"
                                          value={phone || newAddress.phone || ''}
                                          onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setPhone(val);
                                            setNewAddress({ ...newAddress, phone: val });
                                          }}
                                          placeholder="10-digit number"
                                          required
                                          maxLength={10}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* WhatsApp updates toggle */}
                                  <div className="p-3 bg-[#25D366]/5 border border-[#25D366]/20 rounded-[var(--radius-md)] flex items-center gap-3">
                                    <Checkbox
                                      id="whatsapp-updates"
                                      checked={whatsappOptIn}
                                      onChange={(e) => setWhatsappOptIn(e.target.checked)}
                                      label={
                                        <span className="text-xs text-[var(--color-ink)] flex items-center gap-1.5 font-medium">
                                          <svg className="w-4 h-4 text-[#25D366] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                                          </svg>
                                          Send dispatch updates &amp; live tracking photos via WhatsApp
                                        </span>
                                      }
                                    />
                                  </div>
                                </div>

                                {/* 2. Shipping Address */}
                                <div className="space-y-4 pt-2 border-t border-[var(--color-whisper)]">
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
                                    2. Shipping Destination
                                  </h4>
                                  <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                      <label htmlFor="firstName" className="input-label">First Name *</label>
                                      <Input
                                        id="firstName"
                                        value={newAddress.firstName || ''}
                                        onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                                        placeholder="e.g. Priya"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor="lastName" className="input-label">Last Name *</label>
                                      <Input
                                        id="lastName"
                                        value={newAddress.lastName || ''}
                                        onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                                        placeholder="e.g. Sharma"
                                        required
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label htmlFor="address1" className="input-label">Flat / House No., Apartment &amp; Street Address *</label>
                                    <Input
                                      id="address1"
                                      value={newAddress.address1 || ''}
                                      onChange={(e) => setNewAddress({ ...newAddress, address1: e.target.value })}
                                      placeholder="e.g. Flat 402, Lotus Residency, MG Road"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label htmlFor="address2" className="input-label">Landmark / Floor (Optional)</label>
                                    <Input
                                      id="address2"
                                      value={newAddress.address2 || ''}
                                      onChange={(e) => setNewAddress({ ...newAddress, address2: e.target.value })}
                                      placeholder="e.g. Near Indiranagar Metro Station"
                                    />
                                  </div>

                                  {/* Pincode with Instant Auto-Fill */}
                                  <div className="grid sm:grid-cols-3 gap-4">
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <label htmlFor="postalCode" className="input-label">Pincode *</label>
                                        {isResolvingPin && (
                                          <span className="text-[10px] text-[var(--color-gold)] animate-pulse">
                                            Resolving...
                                          </span>
                                        )}
                                      </div>
                                      <Input
                                        id="postalCode"
                                        type="text"
                                        value={newAddress.postalCode || ''}
                                        onChange={(e) => handlePincodeChange(e.target.value)}
                                        placeholder="6-digit pincode"
                                        required
                                        maxLength={6}
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor="city" className="input-label">City / District *</label>
                                      <Input
                                        id="city"
                                        value={newAddress.city || ''}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        placeholder="City"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor="state" className="input-label">State *</label>
                                      <Select value={newAddress.state || ''} onValueChange={(value) => setNewAddress({ ...newAddress, state: value })} required>
                                        <SelectTrigger placeholder="Select state" />
                                        <SelectContent>
                                          {indianStates.map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {/* Pincode Resolution & Delivery Promise Badge */}
                                  {pincodeInfo && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -4 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="p-3 bg-[var(--color-gold-light)]/25 border border-[var(--color-gold)]/30 rounded-[var(--radius-md)] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] flex items-center justify-center font-bold text-[10px]">
                                          ✓
                                        </span>
                                        <span className="font-medium text-[var(--color-ink)]">
                                          Delivering to {newAddress.city || pincodeInfo.city}, {newAddress.state || pincodeInfo.state}
                                        </span>
                                      </div>
                                      <span className="text-[var(--color-gold)] font-semibold flex items-center gap-1">
                                        ⚡ Expected delivery by {pincodeInfo.estimatedDateFormatted}
                                      </span>
                                    </motion.div>
                                  )}

                                  <div>
                                    <label htmlFor="type" className="input-label">Address Type</label>
                                    <div className="flex items-center gap-3">
                                      {(['Home', 'Office', 'Other'] as const).map((t) => (
                                        <button
                                          key={t}
                                          type="button"
                                          onClick={() => setNewAddress({ ...newAddress, type: t })}
                                          className={cn(
                                            'px-4 py-2 text-xs font-medium rounded-[var(--radius-md)] border transition-all',
                                            newAddress.type === t
                                              ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)] text-[var(--color-gold)] font-semibold shadow-sm'
                                              : 'border-[var(--color-whisper)] text-[var(--color-slate)] hover:border-[var(--color-gold)]/50'
                                          )}
                                        >
                                          {t === 'Home' ? '🏠 Home' : t === 'Office' ? '🏢 Office' : '✨ Other'}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Complimentary Luxury Gifting Option */}
                                <div className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)] border border-[var(--color-whisper)] space-y-3">
                                  <div
                                    id="gift-packaging-header"
                                    role="button"
                                    tabIndex={0}
                                    className="flex items-center justify-between cursor-pointer select-none"
                                    onClick={() => setGiftWrap(prev => !prev)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-xl">🎁</span>
                                      <div>
                                        <p className="text-sm font-semibold text-[var(--color-ink)]">
                                          Complimentary Luxury Gift Packaging
                                        </p>
                                        <p className="text-xs text-[var(--color-slate)]">
                                          Signature gilded keepsake box, gold wax seal &amp; handwritten calligraphy note
                                        </p>
                                      </div>
                                    </div>
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <Checkbox
                                        checked={giftWrap}
                                        onChange={(e) => setGiftWrap(e.target.checked)}
                                        id="gift-wrap-toggle"
                                        label=""
                                      />
                                    </div>
                                  </div>

                                  {giftWrap && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className="pt-3 border-t border-[var(--color-whisper)] space-y-3"
                                    >
                                      <div>
                                        <label htmlFor="giftRecipient" className="input-label">Recipient's Name (Optional)</label>
                                        <Input
                                          id="giftRecipient"
                                          value={giftRecipient}
                                          onChange={(e) => setGiftRecipient(e.target.value)}
                                          placeholder="e.g. For Dearest Aadhya"
                                        />
                                      </div>
                                      <div>
                                        <label htmlFor="giftMessage" className="input-label">Personal Handwritten Note (Calligraphy)</label>
                                        <textarea
                                          id="giftMessage"
                                          value={giftMessage}
                                          onChange={(e) => setGiftMessage(e.target.value)}
                                          placeholder="Write your wishes... (e.g. Wishing you a season filled with beauty and joy!)"
                                          className="input min-h-[70px] resize-none text-sm"
                                          rows={2}
                                          maxLength={150}
                                        />
                                      </div>
                                    </motion.div>
                                  )}
                                </div>

                                {user && (
                                  <div className="flex items-center gap-3 pt-2">
                                    <Checkbox
                                      checked={newAddress.isDefault || false}
                                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                      id="save-info"
                                      label="Save as default address in my account"
                                    />
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </StaggerContainer>
                  </motion.div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 1 && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <StaggerContainer variant="default">
                      <Card variant="elevated" padding="lg">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-[var(--font-display)] text-xl">Payment Method</CardTitle>
                              <p className="text-[var(--color-slate)] text-sm mt-0.5">Select your preferred payment method</p>
                            </div>
                            <span className="text-xs text-[var(--color-gold)] font-medium flex items-center gap-1">
                              🔒 256-Bit Encrypted
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <StaggerContainer variant="default">
                            <div className="space-y-4">
                              {/* 1. Online Payment Card */}
                              <div
                                onClick={() => setSelectedPayment('razorpay')}
                                className={cn(
                                  'p-4 border rounded-[var(--radius-lg)] cursor-pointer transition-all duration-200',
                                  selectedPayment === 'razorpay'
                                    ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]/20 shadow-[var(--shadow-gold)]'
                                    : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/60'
                                )}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                      selectedPayment === 'razorpay' ? 'border-[var(--color-gold)] bg-[var(--color-gold)]' : 'border-[var(--color-whisper)]'
                                    )}>
                                      {selectedPayment === 'razorpay' && <div className="w-2 h-2 rounded-full bg-[var(--color-ink)]" />}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm text-[var(--color-ink)] flex items-center gap-2">
                                        Online Payment (UPI, Cards, NetBanking, Wallets)
                                        <span className="px-2 py-0.5 text-[10px] bg-[var(--color-gold)] text-[var(--color-ink)] rounded-full font-bold uppercase">
                                          Recommended
                                        </span>
                                      </p>
                                      <p className="text-xs text-[var(--color-slate)] mt-0.5">
                                        Instant confirmation • Zero convenience fee • Faster delivery
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Supported payment method badges */}
                                <div className="mt-3 pt-3 border-t border-[var(--color-whisper)]/80 flex flex-wrap items-center gap-2">
                                  <span className="px-2 py-1 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded text-[11px] font-semibold text-[var(--color-ink)]">
                                    Google Pay
                                  </span>
                                  <span className="px-2 py-1 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded text-[11px] font-semibold text-[var(--color-ink)]">
                                    PhonePe
                                  </span>
                                  <span className="px-2 py-1 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded text-[11px] font-semibold text-[var(--color-ink)]">
                                    Paytm / UPI
                                  </span>
                                  <span className="px-2 py-1 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded text-[11px] font-semibold text-[var(--color-ink)]">
                                    Visa / Mastercard
                                  </span>
                                  <span className="px-2 py-1 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded text-[11px] font-semibold text-[var(--color-ink)]">
                                    RuPay
                                  </span>
                                  <span className="px-2 py-1 bg-[var(--color-white)] border border-[var(--color-whisper)] rounded text-[11px] font-semibold text-[var(--color-ink)]">
                                    50+ NetBanking
                                  </span>
                                </div>
                              </div>

                              {/* 2. Cash on Delivery Card */}
                              <div
                                onClick={() => setSelectedPayment('cod')}
                                className={cn(
                                  'p-4 border rounded-[var(--radius-lg)] cursor-pointer transition-all duration-200',
                                  selectedPayment === 'cod'
                                    ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]/20 shadow-[var(--shadow-gold)]'
                                    : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/60'
                                )}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                      selectedPayment === 'cod' ? 'border-[var(--color-gold)] bg-[var(--color-gold)]' : 'border-[var(--color-whisper)]'
                                    )}>
                                      {selectedPayment === 'cod' && <div className="w-2 h-2 rounded-full bg-[var(--color-ink)]" />}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm text-[var(--color-ink)] flex items-center gap-2">
                                        Cash on Delivery (COD)
                                        <span className="text-xs text-[var(--color-slate)] font-normal">
                                          (+₹49 handling fee)
                                        </span>
                                      </p>
                                      <p className="text-xs text-[var(--color-slate)] mt-0.5">
                                        Pay with Cash or UPI directly to delivery agent at your doorstep
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {selectedPayment === 'cod' && (
                                  <div className="mt-3 pt-3 border-t border-[var(--color-whisper)]/80 text-xs text-[var(--color-slate)]">
                                    Maximum order limit for COD is ₹10,000. Please keep exact change or UPI ready during delivery.
                                  </div>
                                )}
                              </div>
                            </div>
                          </StaggerContainer>

                          {/* Payment Security */}
                          <div className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)] border border-[var(--color-whisper)]">
                            <div className="flex items-start gap-3">
                              <svg className="h-5 w-5 flex-shrink-0 mt-0.5 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              </svg>
                              <div>
                                <p className="font-medium text-[var(--color-ink)] text-sm">Angelika Buyer Protection</p>
                                <p className="text-xs text-[var(--color-slate)] mt-0.5">
                                  Every payment is protected by bank-level 256-bit SSL encryption. We offer instant refunds for any order cancellations or approved returns.
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </StaggerContainer>
                  </motion.div>
                )}

                {/* Step 3: Review */}
                {currentStep === 2 && (
                  <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <StaggerContainer variant="default">
                      <Card variant="elevated" padding="lg">
                        <CardHeader>
                          <CardTitle className="text-[var(--font-display)] text-xl">Review &amp; Confirm Order</CardTitle>
                          <p className="text-[var(--color-slate)] text-sm mt-0.5">Please verify your details before final placement</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Delivery Address Summary */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
                                Delivery Address &amp; Contact
                              </h4>
                              <button
                                type="button"
                                onClick={() => setCurrentStep(0)}
                                className="text-xs text-[var(--color-gold)] hover:underline font-semibold"
                              >
                                Edit Address
                              </button>
                            </div>
                            {activeAddress && activeAddress.firstName ? (
                              <div className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)] border border-[var(--color-whisper)] space-y-1 text-sm">
                                <p className="font-semibold text-[var(--color-ink)]">
                                  {activeAddress.firstName} {activeAddress.lastName}
                                </p>
                                <p className="text-xs text-[var(--color-slate)]">
                                  {activeAddress.address1}{activeAddress.address2 ? `, ${activeAddress.address2}` : ''}
                                </p>
                                <p className="text-xs text-[var(--color-slate)]">
                                  {activeAddress.city}, {activeAddress.state} - {activeAddress.postalCode}
                                </p>
                                <p className="text-xs text-[var(--color-slate)] pt-1">
                                  Contact: +91 {activeAddress.phone || phone} • Email: {email || activeAddress.email}
                                </p>
                                {whatsappOptIn && (
                                  <p className="text-[11px] text-[#25D366] font-medium flex items-center gap-1 pt-1">
                                    <span>📲</span> WhatsApp tracking updates enabled
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)] border border-[var(--color-whisper)] flex items-center justify-between text-sm">
                                <span className="text-[var(--color-slate)]">No address specified</span>
                                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)}>
                                  Add Address
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Payment Method Summary */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
                                Payment Method
                              </h4>
                              <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="text-xs text-[var(--color-gold)] hover:underline font-semibold"
                              >
                                Edit Payment
                              </button>
                            </div>
                            <div className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)] border border-[var(--color-whisper)] flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">
                                  {selectedPayment === 'cod' ? '💵' : '💳'}
                                </span>
                                <div>
                                  <p className="font-semibold text-[var(--color-ink)]">
                                    {selectedPayment === 'cod' ? 'Cash on Delivery' : 'Online Payment (UPI, Cards, NetBanking)'}
                                  </p>
                                  <p className="text-xs text-[var(--color-slate)]">
                                    {selectedPayment === 'cod' ? 'Handling fee of ₹49 applies' : '100% Encrypted via Razorpay'}
                                  </p>
                                </div>
                              </div>
                              <span className="font-semibold text-sm text-[var(--color-ink)]">
                                {formatPrice(total)}
                              </span>
                            </div>
                          </div>

                          {/* Gifting Packaging Summary if selected */}
                          {giftWrap && (
                            <div className="p-3.5 bg-[var(--color-gold-light)]/20 border border-[var(--color-gold)]/30 rounded-[var(--radius-lg)] text-xs">
                              <div className="flex items-center gap-2 font-semibold text-[var(--color-gold)] mb-1">
                                <span>🎁</span>
                                <span>Luxury Complimentary Gift Packaging Included</span>
                              </div>
                              {giftRecipient && (
                                <p className="text-[var(--color-ink)] font-medium">For: {giftRecipient}</p>
                              )}
                              {giftMessage && (
                                <p className="text-[var(--color-slate)] italic mt-0.5">"{giftMessage}"</p>
                              )}
                            </div>
                          )}

                          {/* Order Items */}
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)] mb-2">
                              Order Items ({itemCount})
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                              {items.map((item) => (
                                <div key={item.id} className="flex gap-3 p-3 bg-[var(--color-snow)] rounded-[var(--radius-lg)]">
                                  <div className="w-14 h-16 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-whisper)] flex-shrink-0">
                                    <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--color-ink)] truncate">{item.product_name}</p>
                                    <p className="text-xs text-[var(--color-slate)]">{item.color} • Size: {item.size} • Qty: {item.quantity}</p>
                                    <p className="text-xs font-semibold text-[var(--color-ink)] mt-1">{formatPrice(item.price * item.quantity)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Atelier Instructions / Notes */}
                          <div>
                            <label htmlFor="notes" className="input-label">Special Atelier / Delivery Instructions (Optional)</label>
                            <textarea
                              id="notes"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Any custom tailoring preference or delivery note..."
                              className="input min-h-[60px] resize-y text-xs"
                              rows={2}
                            />
                          </div>

                          {/* Terms & Conditions */}
                          <div className="flex items-start gap-3 p-3.5 border border-[var(--color-whisper)] rounded-[var(--radius-lg)]">
                            <Checkbox
                              checked={termsAccepted}
                              onChange={(e) => setTermsAccepted(e.target.checked)}
                              id="terms"
                              label={
                                <span className="text-xs text-[var(--color-slate)]">
                                  I agree to the{' '}
                                  <a
                                    href="/terms"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-hover)]"
                                  >
                                    Terms &amp; Conditions
                                  </a>{' '}
                                  and{' '}
                                  <a
                                    href="/privacy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-hover)]"
                                  >
                                    Privacy Policy
                                  </a>
                                  . I verify that the shipping address and order details are accurate.
                                </span>
                              }
                            />
                          </div>

                          {/* Error Message */}
                          {error && (
                            <div className="p-3 bg-[var(--color-error-bg)] border border-[var(--color-error)]/30 rounded-[var(--radius-lg)] text-[var(--color-error)] text-xs">
                              {error}
                            </div>
                          )}

                          {/* Place Order Button */}
                          <Button
                            variant="primary"
                            className="w-full py-4 text-base font-semibold shadow-md"
                            onClick={handlePlaceOrder}
                            disabled={!termsAccepted || isProcessing || hasOutOfStockItems}
                          >
                            {isProcessing ? (
                              <>
                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Securing Your Couture Order...
                              </>
                            ) : hasOutOfStockItems ? (
                              'Resolve Out of Stock Items'
                            ) : (
                              `Place Order • ${formatPrice(total)}`
                            )}
                          </Button>

                          <p className="text-[11px] text-center text-[var(--color-mist)]">
                            ✦ 100% Handcrafted Certified Ethnic Couture • Dispatched within 24–48 hours
                          </p>
                        </CardContent>
                      </Card>
                    </StaggerContainer>
                  </motion.div>
                )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <MagneticButton variant="secondary" strength={0.3} onClick={prevStep} disabled={currentStep === 0}>
                    Back
                  </MagneticButton>
                  {currentStep < steps.length - 1 ? (
                    <MagneticButton variant="primary" strength={0.3} onClick={nextStep}>
                      Continue
                      <svg className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </MagneticButton>
                  ) : null}
                </div>
              </>
            </ScrollReveal>

            {/* Order Summary Sidebar */}
            <ScrollReveal variant="fadeUp" delay={0.2} className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card variant="elevated" padding="lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[var(--font-display)] text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-12 h-14 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-whisper)] flex-shrink-0">
                            <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-ink)] truncate">{item.product_name}</p>
                            <p className="text-xs text-[var(--color-slate)]">{item.color} • {item.size} × {item.quantity}</p>
                          </div>
                          <span className="text-sm font-medium text-[var(--color-ink)]">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Coupons & Available Offers */}
                    <div className="border-t border-[var(--color-whisper)] pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)] flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Privilege Vouchers
                        </span>
                      </div>

                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-2.5 bg-[var(--color-success-bg)] border border-[var(--color-success)]/30 rounded-[var(--radius-md)]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[var(--color-success)]">✓ {appliedCoupon.code}</span>
                            <span className="text-xs text-[var(--color-slate)]">(-{formatPrice(discountAmount)})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCoupon()}
                            className="text-xs text-[var(--color-error)] hover:underline font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={couponCodeInput}
                              onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                              placeholder="Enter coupon code"
                              className="text-xs uppercase tracking-wider h-9"
                            />
                            <Button
                              variant="primary"
                              size="sm"
                              className="h-9 px-3 text-xs"
                              onClick={() => handleApplyCoupon()}
                              disabled={couponApplying || !couponCodeInput.trim()}
                            >
                              {couponApplying ? 'Applying...' : 'Apply'}
                            </Button>
                          </div>

                          {/* Quick 1-Click Available Offer Chips */}
                          <div className="space-y-1.5 pt-1">
                            {availableOffers.map((offer) => (
                              <div
                                key={offer.code}
                                className="p-2 border border-dashed border-[var(--color-gold)]/30 rounded-[var(--radius-md)] bg-[var(--color-white)] flex items-center justify-between hover:border-[var(--color-gold)] transition-colors"
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-[var(--color-gold)]">{offer.code}</span>
                                    <span className="text-[9px] px-1.5 py-0.2 bg-[var(--color-gold)]/10 text-[var(--color-gold)] font-medium rounded-full">
                                      {offer.badge}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[var(--color-slate)] truncate">{offer.desc}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleApplyCoupon(offer.code)}
                                  className="text-xs font-semibold text-[var(--color-gold)] hover:underline flex-shrink-0"
                                >
                                  Apply
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {couponNotice && (
                        <p className={cn('text-xs', couponNotice.type === 'success' ? 'text-[var(--color-success)] font-medium' : 'text-[var(--color-error)]')}>
                          {couponNotice.text}
                        </p>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t border-[var(--color-whisper)] pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-slate)]">Subtotal ({itemCount} items)</span>
                        <span className="font-medium text-[var(--color-ink)]">{formatPrice(subtotalValue)}</span>
                      </div>
                      {discountAmount > 0 && appliedCoupon && (
                        <div className="flex justify-between text-sm text-[var(--color-success)] font-medium">
                          <span>Privilege Savings ({appliedCoupon.code})</span>
                          <span>- {formatPrice(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-slate)]">Express Courier</span>
                        <span className="font-medium text-[var(--color-success)]">
                          {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-[var(--color-slate)]">
                        <span>GST / Taxes</span>
                        <span className="font-medium">₹0 (Included)</span>
                      </div>
                      {selectedPayment === 'cod' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-slate)]">COD Convenience Fee</span>
                          <span className="font-medium">{formatPrice(codFee)}</span>
                        </div>
                      )}
                      {giftWrap && (
                        <div className="flex justify-between text-sm text-[var(--color-gold)]">
                          <span>Luxury Keepsake Packaging</span>
                          <span className="font-medium">FREE (Complimentary)</span>
                        </div>
                      )}

                      <div className="border-t border-[var(--color-whisper)] pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-[var(--color-ink)]">Total Payable</span>
                          <span className="text-[var(--color-ink)]">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Atelier Trust & Security Seals */}
                <div className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)] border border-[var(--color-whisper)] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
                    <svg className="h-4 w-4 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>The Angelika Guarantee</span>
                  </div>
                  <div className="space-y-2 text-xs text-[var(--color-slate)]">
                    <div className="flex items-start gap-2">
                      <span className="text-[var(--color-gold)]">✦</span>
                      <span><strong>100% Authentic Handloom</strong> &amp; certified pure silk &amp; velvet couture</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[var(--color-gold)]">✦</span>
                      <span><strong>7-Day Returns &amp; Exchanges</strong> with doorstep pickup</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[var(--color-gold)]">✦</span>
                      <span><strong>Hand-Inspected</strong> and dispatched from our Varanasi &amp; Jaipur ateliers</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[var(--color-whisper)] flex items-center justify-between text-[11px] text-[var(--color-slate)]">
                    <span>Questions? WhatsApp Concierge</span>
                    <a
                      href="https://wa.me/91XXXXXXXXXX"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] font-semibold hover:underline flex items-center gap-1"
                    >
                      Chat with Vidhya's Team
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>
    </div>
  );
}