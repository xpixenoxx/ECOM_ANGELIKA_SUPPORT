import type { Metadata } from 'next';
import { getSiteContent, DEFAULT_SITE_CONTENT } from '@/lib/actions/site-content';
import { ContactClient } from './ContactClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const contactContent =
    siteContent?.['contact-page'] || DEFAULT_SITE_CONTENT['contact-page']!;

  return {
    title:
      contactContent?.seo?.metaTitle ||
      'Contact Us | Concierge & Styling Studio | Angelika Fashions',
    description:
      contactContent?.seo?.metaDescription ||
      'Get in touch with Angelika Fashions - styling advice, order support, wholesale inquiries, or just say hello. Real people, real responses.',
  };
}

export default async function ContactPage() {
  const siteContent = await getSiteContent();
  const contactContent =
    siteContent?.['contact-page'] || DEFAULT_SITE_CONTENT['contact-page']!;

  return <ContactClient content={contactContent} />;
}
