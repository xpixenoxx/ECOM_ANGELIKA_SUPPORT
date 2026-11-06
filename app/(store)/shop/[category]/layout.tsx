import { Metadata } from 'next';
import { getSiteContent } from '@/lib/actions/site-content';

const categoryLabels: Record<string, string> = {
  kurtis: 'Kurtis',
  salwars: 'Salwars',
  lehengas: 'Lehengas',
  sarees: 'Sarees',
  dupattas: 'Dupattas',
};

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const category = (await params).category;

  if (category === 'salwars') {
    try {
      const siteContent = await getSiteContent();
      const salwarsContent = siteContent['salwars-page'];
      if (salwarsContent?.seo?.metaTitle) {
        return {
          title: salwarsContent.seo.metaTitle,
          description: salwarsContent.seo.metaDescription || 'Explore handcrafted designer salwar suits, anarkalis, and palazzos curated by Vidhya.',
        };
      }
    } catch {
      // fallback
    }
  }

  if (category === 'lehengas') {
    try {
      const siteContent = await getSiteContent();
      const lehengasContent = siteContent['lehengas-page'];
      if (lehengasContent?.seo?.metaTitle) {
        return {
          title: lehengasContent.seo.metaTitle,
          description: lehengasContent.seo.metaDescription || 'Explore handcrafted bridal & festive lehengas curated by Vidhya.',
        };
      }
    } catch {
      // fallback
    }
  }

  if (category === 'sarees') {
    try {
      const siteContent = await getSiteContent();
      const sareesContent = siteContent['sarees-page'];
      if (sareesContent?.seo?.metaTitle) {
        return {
          title: sareesContent.seo.metaTitle,
          description: sareesContent.seo.metaDescription || 'Explore luxury Kanjivaram silk sarees, Chanderi drapes, and Banarasi brocades curated by designer Vidhya.',
        };
      }
    } catch {
      // fallback
    }
  }

  if (category === 'dupattas') {
    try {
      const siteContent = await getSiteContent();
      const dupattasContent = siteContent['dupattas-page'];
      if (dupattasContent?.seo?.metaTitle) {
        return {
          title: dupattasContent.seo.metaTitle,
          description: dupattasContent.seo.metaDescription || 'Explore handcrafted Banarasi katan silk, Phulkari georgette, Chanderi gota border, and scalloped organza dupattas curated by Vidhya.',
        };
      }
    } catch {
      // fallback
    }
  }

  const label = categoryLabels[category] || category;

  return {
    title: `${label} | Premium Ethnic Wear`,
    description: `Shop premium ${label.toLowerCase()} online at Angelika Fashions. Handcrafted designs by Vidhya. Free shipping on orders above ₹2999.`,
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
