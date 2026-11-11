'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Check, MapPin, PackageCheck, Truck, ShieldAlert, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DeliveryVanTrackerProps {
  status: string;
  shiprocketStatus?: string | null;
  courierPartner?: string | null;
  trackingNumber?: string | null;
  createdAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  destinationCity?: string | null;
  className?: string;
}

interface RouteStage {
  id: string;
  label: string;
  shortLabel: string;
  caption: string;
}

const ROUTE_STAGES: RouteStage[] = [
  {
    id: 'confirmed',
    label: 'Order Confirmed',
    shortLabel: 'Confirmed',
    caption: 'Order verified & logged in our atelier',
  },
  {
    id: 'processing',
    label: 'Quality Check',
    shortLabel: 'QC & Pack',
    caption: 'Fabric inspection & heirloom keepsake boxing',
  },
  {
    id: 'dispatched',
    label: 'Dispatched',
    shortLabel: 'Dispatched',
    caption: 'Handed over to courier at atelier dock',
  },
  {
    id: 'in_transit',
    label: 'In Transit',
    shortLabel: 'In Transit',
    caption: 'Angelika express van en route via hub',
  },
  {
    id: 'out_for_delivery',
    label: 'Out for Delivery',
    shortLabel: 'Out Soon',
    caption: 'Courier vehicle approaching your destination',
  },
  {
    id: 'delivered',
    label: 'Delivered',
    shortLabel: 'Delivered',
    caption: 'Couture parcel safely handed over',
  },
];

function resolveStageState(params: {
  status: string;
  shiprocketStatus?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
}) {
  const s = (params.status || 'confirmed').toLowerCase().trim();
  const sr = (params.shiprocketStatus || '').toUpperCase().replace(/[\s-]+/g, '_');

  const isCancelled = s === 'cancelled' || s === 'canceled' || sr === 'CANCELLED' || sr === 'CANCELED';
  const isReturned =
    s === 'returned' ||
    s === 'return_requested' ||
    sr === 'RTO_INITIATED' ||
    sr === 'RTO_DELIVERED';

  if (isCancelled) {
    return {
      targetIndex: 0,
      isCancelled: true,
      isReturned: false,
      isEnRoute: false,
      isDelivered: false,
      badgeText: 'Order Cancelled',
    };
  }

  if (isReturned) {
    return {
      targetIndex: 5,
      isCancelled: false,
      isReturned: true,
      isEnRoute: false,
      isDelivered: false,
      badgeText: sr === 'RTO_DELIVERED' ? 'Returned to Atelier' : 'Return in Progress',
    };
  }

  if (s === 'delivered' || sr === 'DELIVERED') {
    return {
      targetIndex: 5,
      isCancelled: false,
      isReturned: false,
      isEnRoute: false,
      isDelivered: true,
      badgeText: 'Delivered',
    };
  }

  if (sr === 'OUT_FOR_DELIVERY' || s === 'out_for_delivery' || s === 'out for delivery') {
    return {
      targetIndex: 4,
      isCancelled: false,
      isReturned: false,
      isEnRoute: true,
      isDelivered: false,
      badgeText: 'Out for Delivery',
    };
  }

  if (sr === 'PICKED_UP' || s === 'dispatched') {
    return {
      targetIndex: 2,
      isCancelled: false,
      isReturned: false,
      isEnRoute: true,
      isDelivered: false,
      badgeText: 'Dispatched from Atelier',
    };
  }

  if (
    sr === 'IN_TRANSIT' ||
    s === 'in_transit' ||
    s === 'in transit' ||
    s === 'shipped'
  ) {
    // If explicitly marked shipped without AWB or shiprocket pickup, start at Dispatched (2); once AWB/shipped timestamp exists, cruise at In Transit (3)
    const hasTransitSignal = Boolean(params.trackingNumber || params.shippedAt || sr === 'IN_TRANSIT' || s === 'in_transit');
    const idx = hasTransitSignal ? 3 : 2;
    return {
      targetIndex: idx,
      isCancelled: false,
      isReturned: false,
      isEnRoute: true,
      isDelivered: false,
      badgeText: idx === 3 ? 'In Transit' : 'Shipped • Dispatched',
    };
  }

  if (
    s === 'processing' ||
    sr === 'AWB_ASSIGNED' ||
    sr === 'LABEL_GENERATED' ||
    sr === 'PICKUP_SCHEDULED'
  ) {
    return {
      targetIndex: 1,
      isCancelled: false,
      isReturned: false,
      isEnRoute: false,
      isDelivered: false,
      badgeText: 'Processing & Quality Check',
    };
  }

  // pending / confirmed
  return {
    targetIndex: 0,
    isCancelled: false,
    isReturned: false,
    isEnRoute: false,
    isDelivered: false,
    badgeText: s === 'pending' ? 'Order Received' : 'Order Confirmed',
  };
}

/**
 * Custom 3/4 oblique 3D-perspective luxury courier van SVG with Angelika Fashions branding.
 */
function AngelikaVan3D({
  isMoving,
  isCancelled,
  isDelivered,
}: {
  isMoving: boolean;
  isCancelled: boolean;
  isDelivered: boolean;
}) {
  const rawUid = useId();
  const uid = rawUid.replace(/:/g, '');

  const roofGradId = `van-roof-${uid}`;
  const sideGradId = `van-side-${uid}`;
  const cabFrontGradId = `van-front-${uid}`;
  const glassGradId = `van-glass-${uid}`;
  const goldGradId = `van-gold-${uid}`;
  const shadowGradId = `van-shadow-${uid}`;
  const beamGradId = `van-beam-${uid}`;
  const plaqueClipId = `van-logo-clip-${uid}`;

  return (
    <svg
      viewBox="0 0 280 146"
      className="w-full h-auto overflow-visible select-none"
      aria-label="Angelika Fashions Courier Van"
    >
      <defs>
        <linearGradient id={roofGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="100%" stopColor="#EBE1CF" />
        </linearGradient>

        <linearGradient id={sideGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBF8F1" />
          <stop offset="68%" stopColor="#F1E8D8" />
          <stop offset="100%" stopColor="#E3D5BE" />
        </linearGradient>

        <linearGradient id={cabFrontGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EDE2CE" />
          <stop offset="100%" stopColor="#CFC0A7" />
        </linearGradient>

        <linearGradient id={glassGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2A3342" />
          <stop offset="55%" stopColor="#1B212C" />
          <stop offset="100%" stopColor="#12161E" />
        </linearGradient>

        <linearGradient id={goldGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B89130" />
          <stop offset="45%" stopColor="#E5C76B" />
          <stop offset="100%" stopColor="#AA8224" />
        </linearGradient>

        <radialGradient id={shadowGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#261A10" stopOpacity="0.34" />
          <stop offset="65%" stopColor="#261A10" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#261A10" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={beamGradId} x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </linearGradient>

        <clipPath id={plaqueClipId}>
          <rect x="64" y="42" width="90" height="40" rx="4" />
        </clipPath>
      </defs>

      {/* Road Drop Shadow */}
      <ellipse cx="144" cy="131" rx="116" ry="9" fill={`url(#${shadowGradId})`} />

      {/* Warm Headlight Glow Cone while driving / en route */}
      {isMoving && !isCancelled && (
        <motion.polygon
          points="256,88 296,79 296,116 254,104"
          fill={`url(#${beamGradId})`}
          animate={{ opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Subtle Aero Wind Trails when in motion */}
      {isMoving && !isCancelled && (
        <g>
          <motion.line
            x1="4"
            y1="52"
            x2="22"
            y2="52"
            stroke="#C9A84C"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ x: [-4, 4, -4], opacity: [0.25, 0.75, 0.25] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.line
            x1="-4"
            y1="66"
            x2="19"
            y2="66"
            stroke="#8B6914"
            strokeWidth="1.6"
            strokeLinecap="round"
            animate={{ x: [0, -6, 0], opacity: [0.2, 0.65, 0.2] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
          />
          <motion.line
            x1="6"
            y1="82"
            x2="21"
            y2="82"
            stroke="#C9A84C"
            strokeWidth="1.4"
            strokeLinecap="round"
            animate={{ x: [-3, 3, -3], opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        </g>
      )}

      {/* Main Van Chassis + Suspension Bounce */}
      <motion.g
        animate={
          isMoving && !isCancelled
            ? { y: [0, -1.6, 0.4, -1.1, 0] }
            : { y: 0 }
        }
        transition={
          isMoving && !isCancelled
            ? { duration: 0.75, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.3 }
        }
      >
        {/* Far-side front wheel depth peek (+D shifted behind bumper) */}
        <ellipse cx="238" cy="112" rx="13" ry="12" fill="#1C1613" />

        {/* Far-side rear inner wheel shadow peek */}
        <ellipse cx="89" cy="113" rx="12" ry="10" fill="#181210" opacity="0.65" />

        {/* 3D Roof Top Face (Receding D = +18, -12) */}
        <polygon
          points="30,32 48,20 207,20 189,32"
          fill={`url(#${roofGradId})`}
          stroke="#D7C7AE"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Roof Gold Accent Rail */}
        <line
          x1="48"
          y1="25"
          x2="196"
          y2="25"
          stroke={`url(#${goldGradId})`}
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Rear Left Corner Vertical Chamfer Highlight */}
        <path
          d="M 27 35 Q 27 32 30 32 L 30 113 L 26 111 Z"
          fill="#DDD0BA"
        />

        {/* 3D Front Cab Sloped Windshield (Near: 189,32 -> 223,66 ; Far: 207,20 -> 241,54) */}
        <polygon
          points="189,32 207,20 241,54 223,66"
          fill={`url(#${cabFrontGradId})`}
          stroke="#CDBEAA"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Tinted Panoramic Windshield Glass Inset */}
        <polygon
          points="194,35 207,25 236,53 222,63"
          fill={`url(#${glassGradId})`}
        />
        {/* Windshield Sun Reflection Streak */}
        <polygon
          points="204,29 212,29 228,49 218,54"
          fill="#FFFFFF"
          opacity="0.16"
        />

        {/* 3D Front Hood & Nose Face */}
        <polygon
          points="223,66 241,54 259,66 242,79"
          fill="#EAE0CE"
          stroke="#CDBFA8"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        {/* 3D Front Grille Vertical Nose */}
        <polygon
          points="242,79 259,66 260,97 244,111"
          fill={`url(#${cabFrontGradId})`}
          stroke="#BBA98E"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />

        {/* Luxury Brushed Gold Front Grille */}
        <polygon
          points="247,82 257,74 257,89 247,97"
          fill="#261D19"
        />
        <line x1="248" y1="86" x2="256" y2="79" stroke="#D4B052" strokeWidth="1.2" />
        <line x1="248" y1="90" x2="256" y2="83" stroke="#D4B052" strokeWidth="1.2" />
        <line x1="248" y1="94" x2="256" y2="87" stroke="#D4B052" strokeWidth="1.2" />

        {/* Near & Far 3D Headlights */}
        <polygon
          points="237,83 244,78 245,88 238,93"
          fill={isCancelled ? '#9CA3AF' : '#FDE68A'}
          stroke="#B89130"
          strokeWidth="0.7"
        />
        <polygon
          points="256,69 260,66 260,75 256,78"
          fill={isCancelled ? '#9CA3AF' : '#FEF3C7'}
        />

        {/* Near Side Cargo + Cab Body Face */}
        <path
          d="M 30 32 L 189 32 L 223 66 L 242 79 L 244 111 L 226 113 L 182 113 L 98 113 L 30 113 Q 27 113 27 109 L 27 36 Q 27 32 30 32 Z"
          fill={`url(#${sideGradId})`}
          stroke="#CDBEAA"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />

        {/* Cab Side Door Seam & Tinted Cab Side Window */}
        <path
          d="M 183 34 L 183 111"
          stroke="#C8B89E"
          strokeWidth="1"
          strokeDasharray="none"
        />
        <polygon
          points="188,39 216,66 216,74 188,74"
          fill={`url(#${glassGradId})`}
          stroke="#3A2D28"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        {/* Side Window Reflection */}
        <polygon
          points="192,43 201,52 197,71 190,71"
          fill="#FFFFFF"
          opacity="0.14"
        />
        {/* Cab Gold Door Handle */}
        <rect x="189" y="81" width="9" height="2.6" rx="1.2" fill={`url(#${goldGradId})`} />

        {/* Side Mirror */}
        <rect x="218" y="65" width="8" height="10" rx="2" fill="#2A201B" />

        {/* Luxury Burgundy & Metallic Gold Waist Livery Ribbon along Van Side */}
        <rect x="28" y="92" width="154" height="7" fill={isCancelled ? '#881337' : '#4A1A2C'} />
        <rect x="28" y="90.2" width="154" height="1.8" fill={`url(#${goldGradId})`} />
        <rect x="28" y="99" width="154" height="1.5" fill={`url(#${goldGradId})`} />

        {/* Tail Light on Rear Left Edge */}
        <rect x="27" y="90" width="3.5" height="11" rx="1" fill="#B91C1C" />

        {/* Framed Angelika Couture Logo Medallion on Van Side Panel */}
        <g>
          <rect
            x="40"
            y="38"
            width="136"
            height="49"
            rx="5"
            fill="#F2EBE0"
            stroke={`url(#${goldGradId})`}
            strokeWidth="1.2"
          />
          <rect
            x="42.5"
            y="40.5"
            width="131"
            height="44"
            rx="3.5"
            fill="none"
            stroke="#D9C398"
            strokeWidth="0.6"
          />

          {/* Official Angelika Fashions Logo Artwork */}
          <image
            href="/images/logo.png"
            x="64"
            y="41"
            width="90"
            height="47"
            preserveAspectRatio="xMidYMin slice"
            clipPath={`url(#${plaqueClipId})`}
          />

          {/* Crisp Couture Subtitle Strip covering bottom edge */}
          <rect x="44" y="79" width="128" height="6.5" rx="1.5" fill="#F2EBE0" />
          <text
            x="108"
            y="84.2"
            textAnchor="middle"
            fill="#4A1A2C"
            fontSize="5.2"
            fontWeight="700"
            letterSpacing="2.2"
            fontFamily="Georgia, serif"
          >
            FASHIONS • COUTURE
          </text>
        </g>

        {/* Heavy Espresso Lower Rocker Sill & Front/Rear Bumpers */}
        <path
          d="M 26 108 L 52 108 L 54 114 L 28 114 Q 25 114 26 108 Z"
          fill="#261D19"
        />
        <path
          d="M 101 109 L 179 109 L 179 114 L 101 114 Z"
          fill="#261D19"
        />
        <path
          d="M 227 109 L 245 108 L 261 95 L 262 101 L 245 115 L 227 115 Z"
          fill="#261D19"
          stroke="#43352E"
          strokeWidth="0.6"
        />

        {/* Fender Wheel Wells (Dark Charcoal Arch Cutouts) */}
        <path d="M 52 114 A 22 22 0 0 1 96 114 Z" fill="#1B1411" />
        <path d="M 181 114 A 22 22 0 0 1 225 114 Z" fill="#1B1411" />
        <path d="M 50 114 A 24 24 0 0 1 98 114" fill="none" stroke="#3B2E28" strokeWidth="2.5" />
        <path d="M 179 114 A 24 24 0 0 1 227 114" fill="none" stroke="#3B2E28" strokeWidth="2.5" />

        {/* Rear & Front 3D Wheels */}
        {[74, 203].map((cx) => (
          <g key={cx} transform={`translate(${cx}, 115)`}>
            {/* 3D Rubber Tread Depth Cylinder */}
            <circle cx="-2.2" cy="0" r="16.5" fill="#110D0B" />
            <circle cx="0" cy="0" r="16.5" fill="#231B17" stroke="#120E0C" strokeWidth="1.2" />
            {/* Sidewall highlight */}
            <circle cx="0" cy="0" r="13.5" fill="none" stroke="#3B2F29" strokeWidth="1" />
            {/* Metallic Gold Luxury Alloy Rim */}
            <circle cx="0" cy="0" r="9.8" fill="#E6D5B8" stroke={`url(#${goldGradId})`} strokeWidth="1.6" />
            {/* Rotating Spokes */}
            <motion.g
              animate={isMoving && !isCancelled ? { rotate: 360 } : { rotate: 0 }}
              transition={
                isMoving && !isCancelled
                  ? { duration: 0.7, repeat: Infinity, ease: 'linear' }
                  : { duration: 0.4 }
              }
            >
              <line x1="-8" y1="0" x2="8" y2="0" stroke="#5A4620" strokeWidth="1.5" />
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#5A4620" strokeWidth="1.5" />
              <line x1="-5.6" y1="-5.6" x2="5.6" y2="5.6" stroke="#5A4620" strokeWidth="1.3" />
              <line x1="-5.6" y1="5.6" x2="5.6" y2="-5.6" stroke="#5A4620" strokeWidth="1.3" />
              <circle cx="0" cy="0" r="3.4" fill="#4A1A2C" stroke="#C9A84C" strokeWidth="1" />
            </motion.g>
          </g>
        ))}

        {/* Status Seal Badge hovering softly above roof */}
        {isDelivered && (
          <g transform="translate(216, 12)">
            <circle cx="0" cy="0" r="10" fill="#059669" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M -4 0 L -1 3 L 4.5 -3" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </motion.g>
    </svg>
  );
}

export default function DeliveryVanTracker({
  status,
  shiprocketStatus,
  courierPartner,
  trackingNumber,
  shippedAt,
  deliveredAt,
  cancelledAt,
  destinationCity,
  className,
}: DeliveryVanTrackerProps) {
  const resolved = useMemo(
    () =>
      resolveStageState({
        status,
        shiprocketStatus,
        trackingNumber,
        shippedAt,
      }),
    [status, shiprocketStatus, trackingNumber, shippedAt]
  );

  const [replayCount, setReplayCount] = useState(0);
  const [animatedIndex, setAnimatedIndex] = useState<number>(0);
  const [selectedHoverIdx, setSelectedHoverIdx] = useState<number | null>(null);
  const [isDrivingIntro, setIsDrivingIntro] = useState<boolean>(true);

  const targetIndex = resolved.targetIndex;
  const targetPct = resolved.isCancelled ? 0 : (targetIndex / (ROUTE_STAGES.length - 1)) * 100;

  // Step the highlighted waypoint label cleanly in sync as the van drives from index 0 -> targetIndex
  useEffect(() => {
    if (resolved.isCancelled) {
      setAnimatedIndex(0);
      setIsDrivingIntro(false);
      return;
    }

    setAnimatedIndex(0);
    setIsDrivingIntro(targetIndex > 0);

    if (targetIndex === 0) {
      const doneTimer = setTimeout(() => setIsDrivingIntro(false), 700);
      return () => clearTimeout(doneTimer);
    }

    const totalDurationMs = Math.max(1000, targetIndex * 340 + 450);
    const stepIntervalMs = totalDurationMs / (targetIndex + 0.35);
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let step = 1; step <= targetIndex; step++) {
      timers.push(
        setTimeout(() => {
          setAnimatedIndex(step);
        }, Math.round(step * stepIntervalMs))
      );
    }

    timers.push(
      setTimeout(() => {
        setIsDrivingIntro(false);
      }, totalDurationMs + 80)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [targetIndex, resolved.isCancelled, replayCount]);

  const activeStage = ROUTE_STAGES[selectedHoverIdx ?? animatedIndex] || ROUTE_STAGES[targetIndex]!;
  const isWheelSpinning = !resolved.isCancelled && (isDrivingIntro || resolved.isEnRoute);

  const formatShortDate = (iso?: string | null) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return null;
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[#E6DCCB] bg-gradient-to-b from-[#FDFBF7] via-[#F9F3E7] to-[#F2E8D5] p-4 sm:p-5 shadow-xs',
        className
      )}
    >
      {/* Top Status & Courier Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          {resolved.isCancelled ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/90 border border-rose-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-rose-800">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{resolved.badgeText}</span>
            </span>
          ) : resolved.isReturned ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 border border-amber-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>{resolved.badgeText}</span>
            </span>
          ) : resolved.isDelivered ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 border border-emerald-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{resolved.badgeText}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4A1A2C] border border-[#C9A84C]/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#FAF6EE]">
              <span className="w-2 h-2 rounded-full bg-[#E5C76B] animate-pulse" />
              <span>{activeStage.label}</span>
            </span>
          )}

          {(courierPartner || destinationCity) && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
              <Truck className="w-3.5 h-3.5 text-[var(--color-gold)]" />
              <span>
                {courierPartner || 'Angelika Express'}
                {trackingNumber ? ` · AWB ${trackingNumber}` : ''}
                {destinationCity ? ` · To ${destinationCity}` : ''}
              </span>
            </span>
          )}
        </div>

        {!resolved.isCancelled && (
          <button
            type="button"
            onClick={() => setReplayCount((c) => c + 1)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6B5738] hover:text-[#4A1A2C] bg-white/75 hover:bg-white border border-[#DFD2BA] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            title="Replay delivery route animation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Replay Route</span>
          </button>
        )}
      </div>

      {/* Scenic 3D Highway & Van Stage */}
      <div className="relative pt-3 pb-2">
        {/* Subtle Boutique Horizon Silhouettes */}
        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-[#9C8A6D] px-1 mb-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            Atelier Jaipur
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#C9A84C]" />
            {destinationCity ? destinationCity : 'Doorstep Delivery'}
          </span>
        </div>

        {/* Aligned Coordinate Frame for Van + Highway Track + Checkpoints */}
        <div className="relative mx-9 sm:mx-14">
          {/* 3D Van Travel Stage */}
          <div className="relative h-[84px] sm:h-[104px] w-full">
            <motion.div
              key={`van-${replayCount}-${targetIndex}-${resolved.isCancelled ? 'c' : 'a'}`}
              className="absolute bottom-0 -translate-x-1/2 w-[108px] sm:w-[144px] z-20 pointer-events-none"
              initial={{ left: resolved.isCancelled ? '6%' : '0%' }}
              animate={{ left: resolved.isCancelled ? '6%' : `${targetPct}%` }}
              transition={{
                duration: resolved.isCancelled ? 0.35 : Math.max(0.95, 0.34 * targetIndex + 0.55),
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* Floating Stage Tag Above Van */}
              <div className="flex justify-center mb-0.5">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wide shadow-xs whitespace-nowrap border',
                    resolved.isCancelled
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : resolved.isDelivered
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-[#FAF6EE]/95 text-[#4A1A2C] border-[#C9A84C]/60'
                  )}
                >
                  {resolved.isCancelled
                    ? 'Cancelled at Atelier'
                    : `Stage ${animatedIndex + 1}/6 · ${ROUTE_STAGES[animatedIndex]?.shortLabel || resolved.badgeText}`}
                </span>
              </div>

              <AngelikaVan3D
                isMoving={isWheelSpinning}
                isCancelled={resolved.isCancelled}
                isDelivered={resolved.isDelivered}
              />
            </motion.div>
          </div>

          {/* 3D Asphalt Highway & Progress Bar Directly Beneath Tires */}
          <div className="relative h-3.5 -mx-3 sm:-mx-4 px-3 sm:px-4 rounded-full bg-[#2C221E] border border-[#46362E] shadow-inner flex items-center overflow-hidden">
            {/* Animated Road Lane Dashes when In Transit */}
            <motion.div
              className="absolute inset-y-0 left-0 right-[-44px] flex items-center opacity-45 pointer-events-none"
              animate={
                isWheelSpinning
                  ? { x: [0, -44] }
                  : { x: 0 }
              }
              transition={
                isWheelSpinning
                  ? { duration: 0.65, repeat: Infinity, ease: 'linear' }
                  : { duration: 0.2 }
              }
            >
              <div
                className="w-full h-[2px]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, transparent 0px, transparent 16px, #D4B052 16px, #D4B052 28px, transparent 28px, transparent 44px)',
                }}
              />
            </motion.div>

            {/* Completed Golden Route Fill inside Track */}
            <div className="relative w-full h-1.5 rounded-full bg-[#3D302A]/70 overflow-hidden">
              {!resolved.isCancelled && (
                <motion.div
                  key={`bar-${replayCount}-${targetIndex}`}
                  className={cn(
                    'h-full rounded-full',
                    resolved.isDelivered
                      ? 'bg-gradient-to-r from-[#C9A84C] via-[#D9BA63] to-emerald-400'
                      : 'bg-gradient-to-r from-[#9F7A22] via-[#D4AF37] to-[#F3D98B]'
                  )}
                  initial={{ width: '0%' }}
                  animate={{ width: `${targetPct}%` }}
                  transition={{
                    duration: Math.max(0.95, 0.34 * targetIndex + 0.55),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              )}
            </div>
          </div>

          {/* Interactive Waypoint Checkpoint Nodes & Labels */}
          <div className="relative mt-2 h-11 sm:h-12">
            {ROUTE_STAGES.map((stage, idx) => {
              const leftPct = (idx / (ROUTE_STAGES.length - 1)) * 100;
              const isReached = !resolved.isCancelled && idx <= targetIndex;
              const isCurrent = !resolved.isCancelled && idx === targetIndex;
              const isHighlighted = !resolved.isCancelled && idx === animatedIndex;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onMouseEnter={() => setSelectedHoverIdx(idx)}
                  onMouseLeave={() => setSelectedHoverIdx(null)}
                  onClick={() => setSelectedHoverIdx((cur) => (cur === idx ? null : idx))}
                  style={{ left: `${leftPct}%` }}
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus:outline-none"
                  title={`${stage.label}: ${stage.caption}`}
                >
                  {/* Checkpoint Pin Circle */}
                  <span
                    className={cn(
                      'w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                      resolved.isCancelled && idx === 0
                        ? 'bg-rose-600 border-rose-200 text-white'
                        : isCurrent || isHighlighted
                          ? 'bg-[#4A1A2C] border-[#E5C76B] text-[#FAF6EE] scale-110 shadow-[0_0_0_4px_rgba(201,168,76,0.25)]'
                          : isReached
                            ? 'bg-[#C9A84C] border-white text-white'
                            : 'bg-[#E7DEC9] border-white text-[#9C8A6D]'
                    )}
                  >
                    {isReached && idx < targetIndex ? (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    ) : (
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isCurrent || isHighlighted ? 'bg-[#E5C76B]' : 'bg-current opacity-60'
                        )}
                      />
                    )}
                  </span>

                  {/* Stage Label */}
                  <span
                    className={cn(
                      'mt-1 text-[9px] sm:text-[11px] leading-tight text-center whitespace-nowrap transition-colors',
                      isCurrent || isHighlighted
                        ? 'font-bold text-[#4A1A2C]'
                        : isReached
                          ? 'font-semibold text-[var(--color-ink)]'
                          : 'font-medium text-[#8B7E6A] group-hover:text-[var(--color-ink)]'
                    )}
                  >
                    <span className="hidden sm:inline">{stage.label}</span>
                    <span className="sm:hidden">{stage.shortLabel}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Contextual Readout Footer */}
      <div className="mt-2 pt-3 border-t border-[#E6DCCB]/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
        <p className="text-[var(--color-ink)] font-medium">
          {resolved.isCancelled ? (
            <span className="text-rose-800">
              Dispatch halted prior to courier pickup
              {formatShortDate(cancelledAt) ? ` (${formatShortDate(cancelledAt)})` : ''}.
            </span>
          ) : (
            <>
              <span className="text-[#4A1A2C] font-semibold">{activeStage.label}:</span>{' '}
              <span className="text-[var(--color-slate)]">{activeStage.caption}</span>
            </>
          )}
        </p>
        {!resolved.isCancelled && (
          <span className="text-[11px] text-[#7D6C52] whitespace-nowrap">
            {resolved.isDelivered && formatShortDate(deliveredAt)
              ? `Delivered ${formatShortDate(deliveredAt)}`
              : formatShortDate(shippedAt)
                ? `Dispatched ${formatShortDate(shippedAt)}`
                : 'Hover any stop to inspect'}
          </span>
        )}
      </div>
    </div>
  );
}
