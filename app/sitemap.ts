import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/server';
import { hasValidSupabaseConfig } from '@/lib/env';

function getBaseUrl(): string {
  return (process.env['NEXT_PUBLIC_SITE_URL'] || 'https://angelikafashions.com').replace(/\/+$/, '');
}

const STATIC_ROUTES: Array<{ path: string; changeFrequency: 'daily' | 'weekly' | 'monthly'; priority: number }> = [
  { path: '', changeFrequency: 'daily', priority: 1.0 },
  { path: '/shop', changeFrequency: 'daily', priority: 0.9 },
  { path: '/new-arrivals', changeFrequency: 'daily', priority: 0.9 },
  { path: '/sale', changeFrequency: 'daily', priority: 0.85 },
  { path: '/vidhyas-picks', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/about/vidhya', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/size-guide', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/size-finder', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/shipping', changeFrequency: 'monthly', priority: 0.55 },
  { path: '/returns', changeFrequency: 'monthly', priority: 0.55 },
  { path: '/wholesale', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/track-order', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/accessibility', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/cookies', changeFrequency: 'monthly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  if (!hasValidSupabaseConfig()) {
    return entries;
  }

  try {
    const supabase = createPublicClient();
    const [{ data: categories }, { data: products }] = await Promise.all([
      supabase
        .from('categories')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('products')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1000),
    ]);

    for (const cat of categories || []) {
      if (!cat.slug) continue;
      entries.push({
        url: `${baseUrl}/shop/${encodeURIComponent(cat.slug)}`,
        lastModified: cat.updated_at ? new Date(cat.updated_at) : now,
        changeFrequency: 'daily',
        priority: 0.85,
      });
    }

    for (const prod of products || []) {
      if (!prod.slug) continue;
      entries.push({
        url: `${baseUrl}/product/${encodeURIComponent(prod.slug)}`,
        lastModified: prod.updated_at ? new Date(prod.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch (err) {
    console.warn('[sitemap] Dynamic DB entries unavailable:', err);
  }

  return entries;
}
