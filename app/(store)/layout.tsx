import { Header } from '@/components/composite/Header';
import { Footer } from '@/components/composite/Footer';
import { AnnouncementBar } from '@/components/composite/AnnouncementBar';
import { WhatsAppFloatButton } from '@/components/composite/WhatsAppFloatButton';
import { StoreChrome } from '@/components/composite/StoreChrome';
import { getStoreSettings, getNavbarItems } from '@/lib/actions/store-settings';
import { getHomepageHeroData } from '@/lib/actions/homepage-hero';
import { getSiteContent } from '@/lib/actions/site-content';
import { getStorefrontCategoryStatuses } from '@/lib/actions/shop';
import { defaultNavigation } from '@/components/composite/header/header-navigation';
import type { ReactNode } from 'react';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const [settings, navbarItems, heroData, siteContent, storeCategories] = await Promise.all([
    getStoreSettings(),
    getNavbarItems(),
    getHomepageHeroData(),
    getSiteContent(),
    getStorefrontCategoryStatuses(),
  ]);

  // Determine navigation: prefer heroData.navigation if configured, fallback to navbarItems or default
  let navigation = defaultNavigation.map((item) => ({ ...item }));
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

  // Sync live Product Categories (hidden/renamed/newly added) with top navigation
  if (storeCategories.length > 0) {
    const catBySlug = new Map(storeCategories.map((c) => [c.slug.toLowerCase(), c]));
    const existingSlugs = new Set<string>();

    navigation = navigation
      .filter((item) => {
        const match = item.href.match(/^\/shop\/([^/?#]+)$/);
        if (!match?.[1]) return true;
        const slug = match[1].toLowerCase();
        const dbCat = catBySlug.get(slug);
        if (dbCat && dbCat.is_active === false) return false;
        return true;
      })
      .map((item) => {
        const match = item.href.match(/^\/shop\/([^/?#]+)$/);
        if (!match?.[1]) return item;
        const slug = match[1].toLowerCase();
        existingSlugs.add(slug);
        const dbCat = catBySlug.get(slug);
        if (dbCat && dbCat.name) {
          return { ...item, label: dbCat.name };
        }
        return item;
      });

    // Append newly created active categories not yet represented in top-level nav
    const newActiveCats = storeCategories
      .filter((c) => c.is_active && !existingSlugs.has(c.slug.toLowerCase()))
      .map((c) => ({ label: c.name, href: `/shop/${c.slug}` }));

    if (newActiveCats.length > 0) {
      const insertIdx = navigation.findIndex(
        (item) => item.href === '/new-arrivals' || item.href === '/sale'
      );
      if (insertIdx === -1) {
        navigation = [...navigation, ...newActiveCats];
      } else {
        navigation = [
          ...navigation.slice(0, insertIdx),
          ...newActiveCats,
          ...navigation.slice(insertIdx),
        ];
      }
    }
  }

  const brandName = heroData?.brandName || settings?.site_name || 'Angelika';
  const brandTagline = heroData?.brandTagline || settings?.site_tagline || 'Fashions';
  const logoUrl = heroData?.logoUrl?.trim() || settings?.logo_url || '/images/logo.png';
  const logoHref = heroData?.logoHref || '/';
  const rawWhatsapp =
    heroData?.conciergeWhatsApp?.replace(/[^0-9]/g, '') ||
    settings?.contact_whatsapp?.replace(/[^0-9]/g, '') ||
    '917207256690';
  const whatsappNumber = rawWhatsapp && rawWhatsapp !== '919876543210' ? rawWhatsapp : (rawWhatsapp || '917207256690');

  return (
    <StoreChrome
      logoUrl={logoUrl}
      brandName={brandName}
      brandTagline={brandTagline}
      header={
        <>
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
        </>
      }
      footer={
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
      }
      whatsapp={
        whatsappNumber ? (
          <WhatsAppFloatButton
            phoneNumber={whatsappNumber}
            businessName={brandName}
            conciergeTitle={
              (heroData?.conciergeTitle || "Vidhya's Concierge")
                .replace(/conciergesss/gi, 'Concierge')
                .replace(/sss$/gi, '')
                .trim() || "Vidhya's Concierge"
            }
            conciergeSubtitle={
              (heroData?.conciergeSubtitle || 'Bespoke Styling Chat')
                .replace(/chatsss/gi, 'Chat')
                .replace(/sss$/gi, '')
                .trim() || 'Bespoke Styling Chat'
            }
          />
        ) : undefined
      }
    >
      {children}
    </StoreChrome>
  );
}
