// Cloudflare Pages compatible — see wrangler.toml for Workers config
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.cashfree.com https://*.cashfree.com https://checkout.razorpay.com https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://lh3.googleusercontent.com https://*.googleusercontent.com https://graph.facebook.com https://*.cloudinary.com https://*.cashfree.com https://*.razorpay.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cashfree.com https://sandbox.cashfree.com https://*.cashfree.com https://api.razorpay.com https://lumberjack.razorpay.com https://api.stripe.com https://fonts.googleapis.com https://fonts.gstatic.com",
  "frame-src https://sdk.cashfree.com https://api.cashfree.com https://sandbox.cashfree.com https://*.cashfree.com https://api.razorpay.com https://checkout.razorpay.com https://js.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://api.cashfree.com https://sandbox.cashfree.com https://*.cashfree.com https://api.razorpay.com",
  "frame-ancestors 'none'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    cpus: 2,
    webpackBuildWorker: false,
    // ppr: true, // Requires Next.js canary - disabled for stable build
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: [
        'localhost:3000',
        'angelikafashions.com',
        'www.angelikafashions.com',
        'angelika-fashions.pages.dev',
        'angelikafashions.pages.dev',
        '*.angelikafashions.com',
      ],
    },
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      'motion',
      '@radix-ui/react-icons',
      'date-fns',
    ],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'graph.facebook.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/api/looks/active',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/vidhyas_picks',
        destination: '/vidhyas-picks',
        permanent: true,
      },
      {
        source: '/vidhyaspicks',
        destination: '/vidhyas-picks',
        permanent: true,
      },
      {
        source: '/picks',
        destination: '/vidhyas-picks',
        permanent: true,
      },
      {
        source: '/vidhyas-pick',
        destination: '/vidhyas-picks',
        permanent: true,
      },
      {
        source: '/vidhya',
        destination: '/about#vidhya',
        permanent: true,
      },
    ];
  },
  webpack(config, { isServer, dev, nextRuntime }) {
    config.experiments = { ...config.experiments, topLevelAwait: true };

    if (!isServer || nextRuntime === 'edge') {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        'fs/promises': false,
        path: false,
        net: false,
        tls: false,
        crypto: false,
        http: false,
        https: false,
        child_process: false,
        dns: false,
        os: false,
        zlib: false,
        stream: false,
      };
    }

    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    return config;
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
};

export default nextConfig;
