import { Header } from '@/components/composite/Header';
import { Footer } from '@/components/composite/Footer';
import { AnnouncementBar } from '@/components/composite/AnnouncementBar';
import { getStoreSettings, getNavbarItems } from '@/lib/actions/store-settings';
import { getHomepageHeroData } from '@/lib/actions/homepage-hero';
import { getSiteContent } from '@/lib/actions/site-content';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const [settings, navbarItems, heroData, siteContent] = await Promise.all([
    getStoreSettings(),
    getNavbarItems(),
    getHomepageHeroData(),
    getSiteContent(),
  ]);

  // Determine navigation: prefer heroData.navigation if configured, fallback to navbarItems or default
  let navigation = undefined;
  if (heroData?.navigation && heroData.navigation.length > 0) {
    navigation = heroData.navigation
      .filter((item) => item.is_active !== false)
      .map((item) => ({
        label: item.label,
        href: item.href,
      }));
  } else {
    const activeNav = (navbarItems || []).filter((item) => item.is_active);
    if (activeNav.length > 0) {
      navigation = activeNav.map((item) => ({
        label: item.label,
        href: item.href,
      }));
    }
  }

  const brandName = heroData?.brandName || settings?.site_name || 'Angelika';
  const brandTagline = heroData?.brandTagline || settings?.site_tagline || 'Fashions';
  const logoUrl = heroData?.logoUrl || settings?.logo_url || '/images/logo.png';
  const logoHref = heroData?.logoHref || '/';
  const whatsappNumber = heroData?.conciergeWhatsApp?.replace(/[^0-9]/g, '') || settings?.contact_whatsapp?.replace(/[^0-9]/g, '') || '919876543210';

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar
        enabled={settings?.announcement_bar_enabled}
        text={settings?.announcement_bar_text}
        link={settings?.announcement_bar_link}
        bgColor={settings?.announcement_bar_bg_color || '#C9A84C'}
        textColor={settings?.announcement_bar_text_color || '#F3EEE8'}
      />
      <Header
        navigation={navigation}
        brandName={brandName}
        brandTagline={brandTagline}
        logoUrl={logoUrl}
        logoHref={logoHref}
      />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <Footer
        content={siteContent?.footer}
        contactEmail={settings?.contact_email}
        contactPhone={settings?.contact_phone}
        contactWhatsapp={settings?.contact_whatsapp}
        siteName={brandName}
        tagline={brandTagline}
        socialInstagram={settings?.social_instagram || undefined}
        socialFacebook={settings?.social_facebook || undefined}
        socialWhatsapp={settings?.social_whatsapp || undefined}
        socialYoutube={settings?.social_youtube || undefined}
      />
    </div>
  );
}
