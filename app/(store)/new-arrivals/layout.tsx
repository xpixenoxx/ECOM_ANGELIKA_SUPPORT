import { Metadata } from 'next';
import { getSiteContent } from '@/lib/actions/site-content';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteContent = await getSiteContent();
    const seo = siteContent['new-arrivals-page']?.seo;
    if (seo?.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || 'Discover the latest ethnic wear arrivals at Angelika Fashions - fresh handcrafted pieces every week.',
      };
    }
  } catch {
    // fallback
  }

  return {
    title: 'New Arrivals | Handcrafted Ethnic Wear',
    description: 'Discover the latest ethnic wear arrivals at Angelika Fashions - fresh handcrafted pieces every week.',
  };
}

export default function NewArrivalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
