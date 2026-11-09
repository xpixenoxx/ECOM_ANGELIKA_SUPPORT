import { User } from '@supabase/supabase-js';

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  megaMenu?: {
    columns: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    featured?: {
      image: string;
      title: string;
      description: string;
      href: string;
      cta: string;
    };
  };
}

const defaultNavigation: NavItem[] = [
  {
    label: 'Kurtis',
    href: '/shop/kurtis',
    children: [
      { label: 'All Kurtis', href: '/shop/kurtis' },
      { label: 'Short Kurtis', href: '/shop/kurtis?length=short' },
      { label: 'Knee Length', href: '/shop/kurtis?length=knee' },
      { label: 'Anarkali Kurtis', href: '/shop/kurtis?type=anarkali' },
      { label: 'Cotton Kurtis', href: '/shop/kurtis?fabric=cotton' },
      { label: 'Festive Kurtis', href: '/shop/kurtis?occasion=festive' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'By Length & Cut',
          links: [
            { label: 'Short (Above Knee)', href: '/shop/kurtis?length=short' },
            { label: 'Knee Length', href: '/shop/kurtis?length=knee' },
            { label: 'Calf & Ankle Length', href: '/shop/kurtis?length=calf' },
            { label: 'Anarkali & Flared', href: '/shop/kurtis?type=anarkali' },
            { label: 'Straight Cut', href: '/shop/kurtis?type=straight' },
          ],
        },
        {
          title: 'By Occasion',
          links: [
            { label: 'Daily & Casual Wear', href: '/shop/kurtis?occasion=daily' },
            { label: 'Work & Office Wear', href: '/shop/kurtis?occasion=office' },
            { label: 'Festive Celebrations', href: '/shop/kurtis?occasion=festive' },
            { label: 'Evening & Parties', href: '/shop/kurtis?occasion=party' },
          ],
        },
        {
          title: 'By Fabric & Craft',
          links: [
            { label: 'Hand-Block Printed Cotton', href: '/shop/kurtis?fabric=cotton' },
            { label: 'Chanderi Silk & Cotton', href: '/shop/kurtis?fabric=chanderi' },
            { label: 'Royal Velvet & Zari', href: '/shop/kurtis?fabric=velvet' },
            { label: 'Jaipur Gota Patti Kurta', href: '/shop/kurtis?type=gota-patti' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-kurtis.jpg',
        title: "Vidhya's Pick: Hand Block Printed Kurti",
        description: 'Authentic Rajasthani hand block printing with natural botanical dyes.',
        href: '/product/hand-block-printed-kurti',
        cta: 'Shop Kurtis',
      },
    },
  },
  {
    label: 'Salwars',
    href: '/shop/salwars',
    children: [
      { label: 'All Salwar Suits', href: '/shop/salwars' },
      { label: 'Palazzo Sets', href: '/shop/salwars?type=palazzo' },
      { label: 'Churidar Sets', href: '/shop/salwars?type=churidar' },
      { label: 'Sharara Sets', href: '/shop/salwars?type=sharara' },
      { label: 'Anarkali Suits', href: '/shop/salwars?type=anarkali' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'By Style & Silhouette',
          links: [
            { label: 'Palazzo Suit Sets', href: '/shop/salwars?type=palazzo' },
            { label: 'Classic Churidar Sets', href: '/shop/salwars?type=churidar' },
            { label: 'Straight Pant Suits', href: '/shop/salwars?type=pant' },
            { label: 'Flared Sharara Sets', href: '/shop/salwars?type=sharara' },
            { label: 'Floor-Length Anarkalis', href: '/shop/salwars?type=anarkali' },
          ],
        },
        {
          title: 'By Occasion',
          links: [
            { label: 'Wedding Guest & Mehendi', href: '/shop/salwars?occasion=wedding' },
            { label: 'Festive Celebrations', href: '/shop/salwars?occasion=festive' },
            { label: 'Office & Everyday Elegance', href: '/shop/salwars?occasion=office' },
            { label: 'Cocktail & Evening Parties', href: '/shop/salwars?occasion=party' },
          ],
        },
        {
          title: 'By Fabric & Weave',
          links: [
            { label: 'Mulberry Silk Blend', href: '/shop/salwars?fabric=silk' },
            { label: 'Flowing Pure Chiffon', href: '/shop/salwars?fabric=chiffon' },
            { label: 'Embroidered Georgette', href: '/shop/salwars?fabric=georgette' },
            { label: 'Breathable Chanderi', href: '/shop/salwars?fabric=chanderi' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-salwars.jpg',
        title: "Editor's Choice: Chiffon Anarkali Set",
        description: 'Powder blue twirl-ready silhouette adorned with delicate artisanal threadwork.',
        href: '/product/chiffon-anarkali-set',
        cta: 'Shop Salwars',
      },
    },
  },
  {
    label: 'Lehengas',
    href: '/shop/lehengas',
    children: [
      { label: 'All Lehengas', href: '/shop/lehengas' },
      { label: 'Bridal Lehengas', href: '/shop/lehengas?type=bridal' },
      { label: 'Party Lehengas', href: '/shop/lehengas?type=party' },
      { label: 'Mirror Work Lehengas', href: '/shop/lehengas?type=mirror-work' },
      { label: 'Designer Lehengas', href: '/shop/lehengas?type=designer' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'By Occasion & Style',
          links: [
            { label: 'Bridal & Wedding Lehengas', href: '/shop/lehengas?type=bridal' },
            { label: 'Sangeet & Cocktail Nights', href: '/shop/lehengas?occasion=party' },
            { label: 'Reception & Black-Tie', href: '/shop/lehengas?occasion=wedding' },
            { label: 'Lightweight Festive Lehengas', href: '/shop/lehengas?type=festive' },
          ],
        },
        {
          title: 'By Embroidery & Craft',
          links: [
            { label: 'Kutch Mirror Work', href: '/shop/lehengas?type=mirror-work' },
            { label: 'Gold Zari & Zardozi', href: '/shop/lehengas?type=zari' },
            { label: 'Gota Patti Embroidery', href: '/shop/lehengas?type=gota-patti' },
            { label: 'Handcrafted Resham Threadwork', href: '/shop/lehengas?type=resham' },
          ],
        },
        {
          title: 'By Fabric',
          links: [
            { label: 'Raw Silk & Brocade', href: '/shop/lehengas?fabric=silk' },
            { label: 'Plush Heritage Velvet', href: '/shop/lehengas?fabric=velvet' },
            { label: 'Ethereal Organza', href: '/shop/lehengas?fabric=organza' },
            { label: 'Heavy Georgette', href: '/shop/lehengas?fabric=georgette' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-lehengas.jpg',
        title: 'Masterpiece: Crimson Mirror Work Lehenga',
        description: 'Authentic hand-embroidered Kutch mirrors on deep crimson raw silk.',
        href: '/product/mirror-work-lehenga',
        cta: 'Shop Lehengas',
      },
    },
  },
  {
    label: 'Sarees',
    href: '/shop/sarees',
    children: [
      { label: 'All Sarees', href: '/shop/sarees' },
      { label: 'Silk Sarees', href: '/shop/sarees?type=silk' },
      { label: 'Banarasi Sarees', href: '/shop/sarees?type=banarasi' },
      { label: 'Tissue Sarees', href: '/shop/sarees?type=tissue' },
      { label: 'Organza Sarees', href: '/shop/sarees?type=organza' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'By Weave & Heritage',
          links: [
            { label: 'Banarasi Tissue Sarees', href: '/shop/sarees?type=banarasi' },
            { label: 'Pure Mulberry Silk Sarees', href: '/shop/sarees?type=silk' },
            { label: 'Sheer Floral Organza', href: '/shop/sarees?type=organza' },
            { label: 'Kanjivaram Style Weaves', href: '/shop/sarees?type=kanjivaram' },
            { label: 'Chanderi Silk-Cotton', href: '/shop/sarees?fabric=chanderi' },
          ],
        },
        {
          title: 'By Occasion',
          links: [
            { label: 'Bridal & Wedding Trousseau', href: '/shop/sarees?occasion=wedding' },
            { label: 'Festive Puja & Celebrations', href: '/shop/sarees?occasion=festive' },
            { label: 'Cocktail & Evening Parties', href: '/shop/sarees?occasion=party' },
            { label: 'Everyday Classic Drapes', href: '/shop/sarees?occasion=casual' },
          ],
        },
        {
          title: 'By Fabric & Sheen',
          links: [
            { label: 'Pure Mulberry Silk', href: '/shop/sarees?fabric=silk' },
            { label: 'Handwoven Tissue Silk', href: '/shop/sarees?fabric=tissue' },
            { label: 'Lightweight Organza', href: '/shop/sarees?fabric=organza' },
            { label: 'Delicate Chiffon', href: '/shop/sarees?fabric=chiffon' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-sarees.jpg',
        title: 'Heritage Weave: Mulberry Silk Saree',
        description: 'Ivory pure mulberry silk with rich gold zari borders that drape like a dream.',
        href: '/product/mulberry-silk-saree',
        cta: 'Shop Sarees',
      },
    },
  },
  {
    label: 'Dupattas',
    href: '/shop/dupattas',
    children: [
      { label: 'All Dupattas', href: '/shop/dupattas' },
      { label: 'Embroidered Dupattas', href: '/shop/dupattas?type=embroidered' },
      { label: 'Gota Patti Dupattas', href: '/shop/dupattas?type=gota-patti' },
      { label: 'Silk & Chiffon Dupattas', href: '/shop/dupattas?fabric=chiffon' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'By Style & Work',
          links: [
            { label: 'Heavy Embroidered Drapes', href: '/shop/dupattas?type=embroidered' },
            { label: 'Jaipur Gota Patti Borders', href: '/shop/dupattas?type=gota-patti' },
            { label: 'Phulkari & Bandhani Art', href: '/shop/dupattas?type=phulkari' },
            { label: 'Hand Block Printed Mulmul', href: '/shop/dupattas?type=block-print' },
          ],
        },
        {
          title: 'By Border & Detailing',
          links: [
            { label: 'Scalloped Embroidered Borders', href: '/shop/dupattas?type=scalloped' },
            { label: 'Gold & Silver Zari Lace', href: '/shop/dupattas?type=zari' },
            { label: 'Handcrafted Tassels & Latkans', href: '/shop/dupattas?type=tassels' },
            { label: 'Minimalist Piping & Borders', href: '/shop/dupattas?type=minimal' },
          ],
        },
        {
          title: 'By Fabric',
          links: [
            { label: 'Pure Organza Silk', href: '/shop/dupattas?fabric=organza' },
            { label: 'Weightless Pure Chiffon', href: '/shop/dupattas?fabric=chiffon' },
            { label: 'Tussar & Matka Silk', href: '/shop/dupattas?fabric=silk' },
            { label: 'Fine Mulmul Cotton', href: '/shop/dupattas?fabric=cotton' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-dupattas.jpg',
        title: 'Artisanal Accent: Embroidered Dupatta',
        description: 'Statement gota patti border hand-finished by master craftspeople in Jaipur.',
        href: '/product/embroidered-dupatta',
        cta: 'Shop Dupattas',
      },
    },
  },
  {
    label: 'New Arrivals',
    href: '/new-arrivals',
    children: [
      { label: 'All New Arrivals', href: '/new-arrivals' },
      { label: "Vidhya's Latest Picks", href: '/vidhyas-picks' },
      { label: 'New Season Kurtis', href: '/shop/kurtis' },
      { label: 'New Festive Sarees', href: '/shop/sarees' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'Latest Additions',
          links: [
            { label: 'New Season Kurtis', href: '/shop/kurtis' },
            { label: 'Latest Salwar & Palazzo Sets', href: '/shop/salwars' },
            { label: 'Bridal & Party Lehengas', href: '/shop/lehengas' },
            { label: 'Fresh Saree Weaves', href: '/shop/sarees' },
          ],
        },
        {
          title: 'Trending Themes',
          links: [
            { label: "Vidhya's Personal Picks", href: '/vidhyas-picks' },
            { label: 'Monsoon Florals & Pastels', href: '/shop/kurtis?fabric=cotton' },
            { label: 'Royal Wedding Edit', href: '/shop/lehengas?type=bridal' },
            { label: 'Handcrafted Luxury Dupattas', href: '/shop/dupattas' },
          ],
        },
        {
          title: 'Special Features',
          links: [
            { label: 'Limited Edition Collections', href: '/new-arrivals' },
            { label: 'Custom Tailoring & Sizing', href: '/size-guide' },
            { label: 'Styling Consultation', href: '/about/vidhya' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-new-arrivals.jpg',
        title: 'Fresh Couture Arrivals',
        description: 'Explore the latest handcrafted pieces personally curated by designer Vidhya.',
        href: '/new-arrivals',
        cta: 'Explore New In',
      },
    },
  },
  {
    label: 'Sale',
    href: '/sale',
    children: [
      { label: 'All Sale Items', href: '/sale' },
      { label: 'Kurtis on Sale', href: '/shop/kurtis' },
      { label: 'Salwar Sets on Sale', href: '/shop/salwars' },
      { label: 'Sarees on Sale', href: '/shop/sarees' },
    ],
    megaMenu: {
      columns: [
        {
          title: 'Curated Deals',
          links: [
            { label: 'Kurtis with Savings', href: '/shop/kurtis' },
            { label: 'Salwar & Palazzo Suits', href: '/shop/salwars' },
            { label: 'Handwoven Sarees', href: '/shop/sarees' },
            { label: 'Festive Lehengas', href: '/shop/lehengas' },
          ],
        },
        {
          title: 'Special Discounts',
          links: [
            { label: 'Up to 25% Off Kurtis', href: '/shop/kurtis' },
            { label: 'Up to 20% Off Festive Wear', href: '/sale' },
            { label: 'End of Season Clearance', href: '/sale' },
            { label: 'Complete Wardrobe Sets', href: '/shop' },
          ],
        },
        {
          title: 'Customer Perks',
          links: [
            { label: 'Free Insured Express Shipping', href: '/shipping' },
            { label: '15-Day Easy Exchanges', href: '/returns' },
            { label: 'WhatsApp Concierge', href: '/contact' },
          ],
        },
      ],
      featured: {
        image: '/images/collection-sale.jpg',
        title: 'Festive Season Clearance',
        description: 'Enjoy exclusive savings on timeless luxury Indian ethnic silhouettes.',
        href: '/sale',
        cta: 'Shop Sale',
      },
    },
  },
];

export { defaultNavigation };

export function getUserDisplayData(user: User | null): { name: string; email: string; avatarUrl?: string } | null {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  return {
    name: metadata['full_name'] || metadata['name'] || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatarUrl: metadata['avatar_url'] || metadata['picture'],
  };
}
