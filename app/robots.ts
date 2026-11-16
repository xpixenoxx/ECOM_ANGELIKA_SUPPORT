import type { MetadataRoute } from 'next';

function getBaseUrl(): string {
  return (process.env['NEXT_PUBLIC_SITE_URL'] || 'https://angelikafashions.com').replace(/\/+$/, '');
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/checkout/',
          '/auth/',
          '/cart',
          '/wishlist',
          '/order-success',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
