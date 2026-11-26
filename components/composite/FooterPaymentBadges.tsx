'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { FooterPaymentOptions } from '@/lib/actions/site-content-types';

export type PaymentBadgeKey = keyof FooterPaymentOptions;

export interface PaymentBadgeMeta {
  key: PaymentBadgeKey;
  label: string;
  shortLabel: string;
}

export const PAYMENT_BADGE_ORDER: PaymentBadgeMeta[] = [
  { key: 'amex', label: 'American Express', shortLabel: 'AMEX' },
  { key: 'gpay', label: 'Google Pay', shortLabel: 'G Pay' },
  { key: 'upi', label: 'UPI (BHIM / PhonePe / Paytm)', shortLabel: 'UPI' },
  { key: 'mastercard', label: 'Mastercard', shortLabel: 'Mastercard' },
  { key: 'rupay', label: 'RuPay', shortLabel: 'RuPay' },
  { key: 'visa', label: 'Visa', shortLabel: 'VISA' },
  { key: 'razorpay', label: 'Razorpay Secure Checkout', shortLabel: 'Razorpay' },
  { key: 'netbanking', label: 'Net Banking', shortLabel: 'NetBanking' },
  { key: 'cod', label: 'Cash on Delivery', shortLabel: 'COD' },
];

export function PaymentCardBadge({
  type,
  className,
}: {
  type: PaymentBadgeKey;
  className?: string;
}) {
  const baseClass = cn('h-[24px] w-[38px] rounded-[3px] shrink-0 block shadow-[0_0_0_1px_rgba(255,255,255,0.12)]', className);

  switch (type) {
    case 'amex':
      return (
        <svg viewBox="0 0 38 24" className={baseClass} role="img" aria-label="American Express">
          <rect width="38" height="24" rx="3" fill="#2E77BC" />
          <text
            x="19"
            y="10.8"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="6.5"
            fontWeight="800"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.4"
          >
            AM
          </text>
          <text
            x="19"
            y="18.2"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="6.5"
            fontWeight="800"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.4"
          >
            EX
          </text>
        </svg>
      );

    case 'gpay':
      return (
        <svg viewBox="0 0 38 24" className={baseClass} role="img" aria-label="Google Pay">
          <rect width="38" height="24" rx="3" fill="#FFFFFF" />
          {/* Multicolor Google G */}
          <path d="M12.9 12.1c0-.35-.03-.68-.09-1H8.4v1.9h2.52a2.16 2.16 0 0 1-.94 1.42v1.18h1.52c.89-.82 1.4-2.03 1.4-3.5z" fill="#4285F4" />
          <path d="M8.4 16.7c1.27 0 2.33-.42 3.1-1.14l-1.52-1.18c-.42.28-.96.45-1.58.45-1.22 0-2.25-.82-2.62-1.93H4.22v1.21A4.7 4.7 0 0 0 8.4 16.7z" fill="#34A853" />
          <path d="M5.78 12.9a2.82 2.82 0 0 1 0-1.8V9.89H4.22a4.7 4.7 0 0 0 0 4.22l1.56-1.21z" fill="#FBBC05" />
          <path d="M8.4 9.17c.69 0 1.31.24 1.8.7l1.35-1.35A4.52 4.52 0 0 0 8.4 7.3a4.7 4.7 0 0 0-4.18 2.59l1.56 1.21c.37-1.11 1.4-1.93 2.62-1.93z" fill="#EA4335" />
          <text
            x="24.2"
            y="15.1"
            textAnchor="middle"
            fill="#3C4043"
            fontSize="8.2"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Pay
          </text>
        </svg>
      );

    case 'upi':
      return (
        <svg viewBox="0 0 38 24" className={baseClass} role="img" aria-label="UPI">
          <rect width="38" height="24" rx="3" fill="#FFFFFF" />
          <text
            x="14.5"
            y="15.3"
            textAnchor="middle"
            fill="#1F2937"
            fontSize="8.8"
            fontWeight="800"
            fontStyle="italic"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            UPI
          </text>
          <polygon points="25.5,7.2 29.8,12 25.5,16.8 27.3,12" fill="#F37021" />
          <polygon points="28.8,7.2 33.1,12 28.8,16.8 30.6,12" fill="#098041" />
        </svg>
      );

    case 'mastercard':
      return (
        <svg viewBox="0 0 38 24" className={baseClass} role="img" aria-label="Mastercard">
          <rect width="38" height="24" rx="3" fill="#1C1C1E" />
          <circle cx="15" cy="12" r="6.4" fill="#EB001B" />
          <circle cx="23" cy="12" r="6.4" fill="#F79E1B" />
          <path
            d="M19 6.95a6.4 6.4 0 0 1 0 10.1 6.4 6.4 0 0 1 0-10.1z"
            fill="#FF5F00"
          />
        </svg>
      );

    case 'rupay':
      return (
        <svg viewBox="0 0 38 24" className={baseClass} role="img" aria-label="RuPay">
          <rect width="38" height="24" rx="3" fill="#FFFFFF" />
          <text
            x="15.2"
            y="14.9"
            textAnchor="middle"
            fill="#1E3A8A"
            fontSize="7.4"
            fontWeight="800"
            fontStyle="italic"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            RuPay
          </text>
          <polygon points="28.2,7.5 31.8,11.6 28.2,15.8 29.6,11.6" fill="#F37021" />
          <polygon points="30.6,7.5 34.2,11.6 30.6,15.8 32,11.6" fill="#098041" />
        </svg>
      );

    case 'visa':
      return (
        <svg viewBox="0 0 38 24" className={baseClass} role="img" aria-label="Visa">
          <rect width="38" height="24" rx="3" fill="#1A1F71" />
          <text
            x="19"
            y="15.4"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="9.4"
            fontWeight="900"
            fontStyle="italic"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.4"
          >
            VISA
          </text>
        </svg>
      );

    case 'razorpay':
      return (
        <svg viewBox="0 0 38 24" className={baseClass} role="img" aria-label="Razorpay">
          <rect width="38" height="24" rx="3" fill="#072654" />
          <path d="M12.5 5.8L9.1 17.8h2.6l2.3-8.2 2.4-3.8h-3.9z" fill="#3395FF" />
          <path d="M9.6 10.9l-2 6.9h2.2l1.6-5.5-1.8-1.4z" fill="#FFFFFF" />
          <text
            x="25.2"
            y="14.6"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="6.4"
            fontWeight="700"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            RZP
          </text>
        </svg>
      );

    case 'netbanking':
      return (
        <svg viewBox="0 0 38 24" className={baseClass} role="img" aria-label="Net Banking">
          <rect width="38" height="24" rx="3" fill="#FFFFFF" />
          <path d="M11 6.5L5.5 9.6h11L11 6.5z" fill="#0F172A" />
          <rect x="6.6" y="10.6" width="1.5" height="5.2" fill="#0F172A" />
          <rect x="10.25" y="10.6" width="1.5" height="5.2" fill="#0F172A" />
          <rect x="13.9" y="10.6" width="1.5" height="5.2" fill="#0F172A" />
          <rect x="5.5" y="16.5" width="11" height="1.3" fill="#0F172A" />
          <text
            x="26.5"
            y="14.4"
            textAnchor="middle"
            fill="#0F172A"
            fontSize="6.4"
            fontWeight="800"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            BANK
          </text>
        </svg>
      );

    case 'cod':
    default:
      return (
        <svg viewBox="0 0 38 24" className={baseClass} role="img" aria-label="Cash on Delivery">
          <rect width="38" height="24" rx="3" fill="#FAF6EE" />
          <rect x="1.2" y="1.2" width="35.6" height="21.6" rx="2.2" fill="none" stroke="#C9A84C" strokeWidth="1" />
          <text
            x="19"
            y="14.8"
            textAnchor="middle"
            fill="#141414"
            fontSize="8.2"
            fontWeight="800"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.6"
          >
            COD
          </text>
        </svg>
      );
  }
}
