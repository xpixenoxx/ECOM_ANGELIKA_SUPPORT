import { getNewArrivals, getVidhyasPicks, getLooks, getInstagramPosts } from '@/lib/actions/homepage';
import HomePageClient from './HomePageClient';

export const revalidate = 60;

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://angelikafashions.com/#organization',
      name: 'Angelika Fashions',
      alternateName: ['Angelika', 'Angelika by Vidhya'],
      url: 'https://angelikafashions.com',
      logo: 'https://angelikafashions.com/images/logo.png',
      founder: {
        '@type': 'Person',
        name: 'Vidhya',
        jobTitle: 'Founder & Creative Director',
      },
      description: 'Angelika Fashions is an Indian luxury couture atelier curating handcrafted ethnic wear, kurtis, salwars, lehengas, and sarees.',
      sameAs: [
        'https://instagram.com/angelikafashions',
        'https://facebook.com/angelikafashions',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi', 'Telugu'],
      },
    },
    {
      '@type': 'ClothingStore',
      '@id': 'https://angelikafashions.com/#store',
      name: 'Angelika Fashions - Luxury Indian Ethnic Wear',
      url: 'https://angelikafashions.com',
      priceRange: '₹₹',
      currenciesAccepted: 'INR',
      paymentAccepted: 'Cash, Credit Card, UPI, Net Banking, EMI',
      image: 'https://angelikafashions.com/images/hero-banner-luxury.jpg',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Indian Ethnic Wear Collections',
        itemListElement: [
          { '@type': 'OfferCatalog', name: 'Handcrafted Kurtis' },
          { '@type': 'OfferCatalog', name: 'Salwar Suits & Palazzo Sets' },
          { '@type': 'OfferCatalog', name: 'Bridal & Festive Lehengas' },
          { '@type': 'OfferCatalog', name: 'Pure Silk & Tissue Sarees' },
          { '@type': 'OfferCatalog', name: 'Artisanal Dupattas' },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://angelikafashions.com/#website',
      url: 'https://angelikafashions.com',
      name: 'Angelika Fashions',
      publisher: { '@id': 'https://angelikafashions.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://angelikafashions.com/shop?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://angelikafashions.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What makes Angelika Fashions ethnic wear unique?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Every Angelika garment is curated personally by designer Vidhya, celebrating timeless Indian craftsmanship. We handcraft kurtis, sarees, salwars, and lehengas using pure Mulberry silk, Chanderi cotton, authentic hand-block prints, and real metallic zari embroidery.',
          },
        },
        {
          '@type': 'Question',
          name: 'What ethnic wear collections are available at Angelika?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Angelika features 5 signature categories: Hand-block printed Kurtis, elegant Salwar & Palazzo sets, regal bridal and party Lehengas, pure Banarasi & Kanjivaram silk Sarees, and artisanal embroidered Dupattas.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the shipping policy and return window?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We offer free express insured shipping across all pin codes in India on orders above ₹2,999. All purchases include a 15-day hassle-free exchange and return policy.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I receive personal styling recommendations from Vidhya?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Vidhya provides personalized 1-on-1 styling consultations and size recommendations directly via WhatsApp (+91XXXXXXXXXX) to help you choose the ideal silhouette and fit.',
          },
        },
      ],
    },
  ],
};

export default async function HomePage() {
  const [vidhyasPicks, newArrivals, looks, instagramPosts] = await Promise.all([
    getVidhyasPicks(4),
    getNewArrivals(8),
    getLooks(3),
    getInstagramPosts(8),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomePageClient
        vidhyasPicks={vidhyasPicks}
        newArrivals={newArrivals}
        looks={looks}
        instagramPosts={instagramPosts}
      />
    </>
  );
}