import fs from 'fs/promises';
import path from 'path';

export * from './site-content-types';
import type { SiteContent } from './site-content-types';

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    title: 'Grace in Every Drape',
    subtitle: 'Timeless traditional wear for the modern woman. Rooted in heritage, designed for your today.',
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
    secondaryCtaText: "Vidhya's Picks",
    secondaryCtaLink: '/vidhyas-picks',
    backgroundImage: '/images/hero-new-couture.jpg',
  },
  features: {
    items: [
      { icon: '🚚', title: 'Free Shipping', desc: 'On orders ₹2,999+ across India', description: 'On orders ₹2,999+ across India' },
      { icon: '🔄', title: '15-Day Returns', desc: 'Hassle-free returns & exchanges', description: 'Hassle-free returns & exchanges' },
      { icon: '💬', title: 'Personal Styling', desc: 'Chat with Vidhya on WhatsApp', description: 'Chat with Vidhya on WhatsApp' },
      { icon: '🎁', title: 'Gift Wrapping', desc: 'Complimentary on all orders', description: 'Complimentary on all orders' },
    ],
  },
  'vidhyas-picks': {
    badge: "Vidhya's Picks",
    title: "Handpicked by Vidhya",
    titleHighlight: "Vidhya",
    ctaText: "View All Picks",
    ctaLink: "/vidhyas-picks",
    items: [
      {
        id: "vp-1",
        name: "Kutch Ajrakh Modal Silk Kurti",
        category: "Kurtis",
        price: 4999,
        originalPrice: 5999,
        compare_at_price: 5999,
        discount: 17,
        image: "/images/products/kurti-ajrakh-1.jpg",
        slug: "kutch-ajrakh-modal-silk-kurti",
        badge: "VIDHYA'S PICK",
        isVidhyasPick: true,
      },
      {
        id: "vp-2",
        name: "Ivory & Gold Chanderi Angrakha Suit",
        category: "Salwars",
        price: 7499,
        originalPrice: 8999,
        compare_at_price: 8999,
        discount: 17,
        image: "/images/products/salwar-angrakha-1.jpg",
        slug: "ivory-gold-chanderi-angrakha-suit",
        badge: "VIDHYA'S PICK",
        isVidhyasPick: true,
      },
      {
        id: "vp-3",
        name: "Heritage Temple Kanjivaram Silk Saree",
        category: "Sarees",
        price: 14999,
        originalPrice: 17999,
        compare_at_price: 17999,
        discount: 17,
        image: "/images/products/saree-kanjivaram-1.jpg",
        slug: "heritage-temple-kanjivaram-silk-saree",
        badge: "VIDHYA'S PICK",
        isVidhyasPick: true,
      },
      {
        id: "vp-4",
        name: "Lucknowi Mukaish Chiffon Saree",
        category: "Sarees",
        price: 6499,
        originalPrice: 7999,
        compare_at_price: 7999,
        discount: 19,
        image: "/images/products/saree-chikankari-1.jpg",
        slug: "lucknowi-mukaish-chiffon-saree",
        badge: "VIDHYA'S PICK",
        isVidhyasPick: true,
      },
    ],
  },
  categories: {
    badge: 'Curated Collections',
    title: 'Shop by Category',
    subtitle: 'Discover our complete range of premium ethnic wear, each category handcrafted with timeless artisanal detail.',
    items: [
      {
        title: 'Kurtis',
        subtitle: 'Hand-block printed cotton',
        image: '/images/collection-kurtis.jpg',
        href: '/shop/kurtis',
        cta: 'Shop Kurtis',
        color: 'from-[var(--color-kurti)] to-[var(--color-gold-hover)]',
      },
      {
        title: 'Salwars',
        subtitle: 'Elegant palazzo & churidar sets',
        image: '/images/collection-salwars.jpg',
        href: '/shop/salwars',
        cta: 'Shop Salwars',
        color: 'from-[var(--color-salwar)] to-[var(--color-gold-hover)]',
      },
      {
        title: 'Lehengas',
        subtitle: 'Bridal & festive wear',
        image: '/images/collection-lehengas.jpg',
        href: '/shop/lehengas',
        cta: 'Shop Lehengas',
        color: 'from-[var(--color-lehenga)] to-[var(--color-gold-hover)]',
      },
      {
        title: 'Sarees',
        subtitle: 'Silk, cotton & chiffon drapes',
        image: '/images/collection-sarees.jpg',
        href: '/shop/sarees',
        cta: 'Shop Sarees',
        color: 'from-[var(--color-saree)] to-[var(--color-gold-hover)]',
      },
      {
        title: 'Dupattas',
        subtitle: 'Embroidered & printed accents',
        image: '/images/collection-dupattas.jpg',
        href: '/shop/dupattas',
        cta: 'Shop Dupattas',
        color: 'from-[var(--color-dupatta)] to-[var(--color-gold-hover)]',
      },
    ],
  },
  'new-arrivals': {
    badge: 'New Arrivals',
    heading: 'Fresh from',
    headingHighlight: 'the Atelier',
    ctaText: 'View All New',
    ctaLink: '/new-arrivals',
    mode: 'custom',
    limit: 8,
    items: [
      {
        id: 'na-1',
        name: 'Royal Crimson Zari Bridal Lehenga Set',
        category: 'Salwars',
        price: 28999,
        originalPrice: 34999,
        image: '/images/collection-lehengas.jpg',
        href: '/shop/salwars',
        isVidhyasPick: true,
        discount: 17,
      },
      {
        id: 'na-2',
        name: 'Handcrafted Velvet Zardosi Couture Ensemble',
        category: 'Kurtis',
        price: 11999,
        originalPrice: 14999,
        image: '/images/cat-lehengas.jpg',
        href: '/shop/kurtis',
        isVidhyasPick: false,
        discount: 20,
      },
      {
        id: 'na-3',
        name: 'Banarasi Silk Brocade Palazzo & Churidar Set',
        category: 'Salwars',
        price: 14499,
        originalPrice: 17999,
        image: '/images/collection-salwars.jpg',
        href: '/shop/salwars',
        isVidhyasPick: false,
        discount: 19,
      },
      {
        id: 'na-4',
        name: 'Hand-Block Printed Chanderi Cotton Kurti',
        category: 'Kurtis',
        price: 6499,
        originalPrice: 7999,
        image: '/images/collection-kurtis.jpg',
        href: '/shop/kurtis',
        isVidhyasPick: true,
        discount: 19,
      },
      {
        id: 'na-5',
        name: 'Handwoven Gold Zari Chanderi Saree',
        category: 'Sarees',
        price: 12999,
        originalPrice: 15499,
        image: '/images/artisan-workshop.jpg',
        href: '/product/handwoven-gold-zari-chanderi-saree',
        isVidhyasPick: false,
        discount: 16,
      },
      {
        id: 'na-6',
        name: 'Heritage Temple Kanjivaram Silk Saree',
        category: 'Sarees',
        price: 22499,
        originalPrice: 26999,
        image: '/images/collection-sarees.jpg',
        href: '/product/heritage-temple-kanjivaram-silk-saree',
        isVidhyasPick: true,
        discount: 17,
      },
      {
        id: 'na-7',
        name: 'Lucknowi Mukaish Chikankari Georgette Saree',
        category: 'Sarees',
        price: 15499,
        originalPrice: 18999,
        image: '/images/cat-sarees.jpg',
        href: '/product/lucknowi-mukaish-chikankari-georgette-saree',
        isVidhyasPick: true,
        discount: 18,
      },
      {
        id: 'na-8',
        name: 'Amritsari Hand-Embroidered Phulkari Dupatta',
        category: 'Dupattas',
        price: 3299,
        originalPrice: 3999,
        image: '/images/collection-dupattas.jpg',
        href: '/product/amritsari-hand-embroidered-phulkari-dupatta',
        isVidhyasPick: false,
        discount: 18,
      },
    ],
  },
  'shop-the-look': {
    title: 'Festive Elegance',
    badge: 'Curated Ensemble',
    subtitle: 'Click pins on image to explore',
    lifestyle_image_url: '/images/products/lehenga-bridal-1.jpg',
    lifestyle_image_alt: 'Festive Elegance Ensemble',
    productName: 'Mirror Work Lehenga',
    productPrice: 18999,
    productOriginalPrice: 22999,
    productImage: '/images/products/lehenga-mirror-1.jpg',
    productSlug: 'mirror-work-lehenga',
    pinX: 47,
    pinY: 64,
  },
  'lehengas-page': {
  "hero": {
    "badge": "HANDCRAFTED LUXURY EDIT",
    "title": "Lehengas",
    "titleHighlight": "Bridal",
    "description": "Bridal & festive lehengas handcrafted with royal zari, zardozi embroidery, and flowing kalidar silhouettes.",
    "backgroundImage": "/images/cat-lehengas.jpg",
    "showFeaturedCard": true,
    "featuredCardImage": "/images/cat-lehengas.jpg",
    "featuredCardTag": "CURATED BY VIDHYA",
    "featuredCardText": "5 Pieces"
  },
  "announcement": {
    "enabled": true,
    "badge": "BRIDAL OFFER",
    "headline": "Bridal Special: Complimentary matching cancan skirt & bespoke blouse tailoring with every Lehenga ensemble.",
    "code": "BRIDAL20",
    "link": "/shop/lehengas",
    "linkText": "Shop Lehengas →"
  },
  "navigation": {
    "enabled": true,
    "label": "COLLECTIONS:",
    "items": [
      {
        "slug": "",
        "name": "All Collections",
        "image": "/images/hero-new-couture.jpg",
        "href": "/shop"
      },
      {
        "slug": "kurtis",
        "name": "Kurtis",
        "image": "/images/collection-kurtis.jpg",
        "href": "/shop/kurtis"
      },
      {
        "slug": "salwars",
        "name": "Salwars",
        "image": "/images/collection-salwars.jpg",
        "href": "/shop/salwars"
      },
      {
        "slug": "lehengas",
        "name": "Lehengas",
        "image": "/images/collection-lehengas.jpg",
        "href": "/shop/lehengas"
      },
      {
        "slug": "sarees",
        "name": "Sarees",
        "image": "/images/collection-sarees.jpg",
        "href": "/shop/sarees"
      },
      {
        "slug": "dupattas",
        "name": "Dupattas",
        "image": "/images/collection-dupattas.jpg",
        "href": "/shop/dupattas"
      }
    ]
  },
  "sidebar": {
    "title": "FILTER COLLECTION",
    "categoryTitle": "CATEGORY",
    "activeTag": "ACTIVE COLLECTION",
    "viewAllText": "View All Collections",
    "viewAllHref": "/shop",
    "inStockLabel": "In Stock Only",
    "vidhyasPicksLabel": "Vidhya's Picks Only"
  },
  "concierge": {
    "enabled": true,
    "title": "VIDHYA'S CONCIERGE",
    "subtitle": "Bespoke Styling Chat",
    "link": "https://wa.me/919999999999?text=Hi%20Vidhya%2C%20I%20am%20exploring%20Lehengas%20at%20Angelika"
  },
  "seo": {
    "metaTitle": "Designer Bridal & Festive Lehengas | Handcrafted Couture - Angelika Fashions",
    "metaDescription": "Explore luxury bridal lehengas, reception ensembles, and sangeet outfits handcrafted with zardozi and gota patti embroidery by designer Vidhya."
  },
  "products": [
    {
      "id": "lehenga-1",
      "name": "Royal Crimson Bridal Zardozi Lehenga",
      "category": "Lehengas",
      "style": "Bridal Lehenga Set",
      "price": 24999,
      "originalPrice": 29999,
      "discount": 17,
      "image": "/images/cat-lehengas.jpg",
      "slug": "royal-crimson-bridal-zardozi-lehenga",
      "badge": "NEW",
      "fabric": "Raw Silk & Velvet",
      "color": "Red",
      "sizes": [
        "XS",
        "S",
        "M",
        "L",
        "XL"
      ],
      "inStock": true,
      "isVidhyasPick": true,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "lehenga-2",
      "name": "Midnight Emerald Velvet Reception Lehenga",
      "category": "Lehengas",
      "style": "Reception Lehenga Set",
      "price": 21500,
      "originalPrice": 25999,
      "discount": 17,
      "image": "/images/collection-sarees.jpg",
      "slug": "midnight-emerald-velvet-reception-lehenga",
      "badge": "NEW",
      "fabric": "Micro Velvet",
      "color": "Green",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "inStock": true,
      "isVidhyasPick": false,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "lehenga-3",
      "name": "Pastel Blush Hand-Painted Organza Lehenga",
      "category": "Lehengas",
      "style": "Organza Floral Lehenga",
      "price": 16499,
      "originalPrice": 19999,
      "discount": 18,
      "image": "/images/collection-dupattas.jpg",
      "slug": "pastel-blush-hand-painted-organza-lehenga",
      "badge": "NEW",
      "fabric": "Pure Organza",
      "color": "Pink",
      "sizes": [
        "XS",
        "S",
        "M",
        "L"
      ],
      "inStock": true,
      "isVidhyasPick": true,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "lehenga-4",
      "name": "Mustard Gold Gota Patti Sangeet Lehenga",
      "category": "Lehengas",
      "style": "Sangeet Lehenga Ensemble",
      "price": 14999,
      "originalPrice": 17999,
      "discount": 17,
      "image": "/images/collection-salwars.jpg",
      "slug": "mustard-gold-gota-patti-sangeet-lehenga",
      "badge": "NEW",
      "fabric": "Chanderi Silk",
      "color": "Gold",
      "sizes": [
        "S",
        "M",
        "L",
        "XL",
        "Free Size"
      ],
      "inStock": true,
      "isVidhyasPick": false,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "lehenga-5",
      "name": "Crimson Silk Flared Twirl Lehenga",
      "category": "Lehengas",
      "style": "Flared Kalidar Lehenga",
      "price": 18999,
      "originalPrice": 22999,
      "discount": 17,
      "image": "/images/cat-lehengas.jpg",
      "slug": "crimson-silk-flared-twirl-lehenga",
      "badge": "NEW",
      "fabric": "Raw Silk",
      "color": "Red",
      "sizes": [
        "XS",
        "S",
        "M",
        "L",
        "XL"
      ],
      "inStock": true,
      "isVidhyasPick": true,
      "rating": 4.8,
      "reviewCount": 12
    }
  ]
},
  'salwars-page': {
  "hero": {
    "badge": "HANDCRAFTED LUXURY EDIT",
    "title": "Salwar Suits & Sets",
    "titleHighlight": "Suits",
    "description": "Discover our curated collection of handcrafted Indian ethnic couture, featuring intricate zari embroidery, chanderi silks, and flowing silhouettes designed for celebratory moments.",
    "backgroundImage": "/images/collection-salwars.jpg",
    "showFeaturedCard": true,
    "featuredCardImage": "/images/collection-salwars.jpg",
    "featuredCardTag": "CURATED BY VIDHYA",
    "featuredCardText": "Signature Ensemble • Handcrafted Pieces"
  },
  "announcement": {
    "enabled": true,
    "badge": "OFFER",
    "headline": "Festive Special: Complimentary matching dupatta & express bespoke tailoring with every Salwar ensemble.",
    "code": "FESTIVE15",
    "link": "/shop/salwars",
    "linkText": "Shop Offer →"
  },
  "navigation": {
    "enabled": true,
    "label": "COLLECTIONS:",
    "items": [
      {
        "slug": "",
        "name": "All Collections",
        "image": "/images/hero-new-couture.jpg",
        "href": "/shop"
      },
      {
        "slug": "kurtis",
        "name": "Kurtis",
        "image": "/images/collection-kurtis.jpg",
        "href": "/shop/kurtis"
      },
      {
        "slug": "salwars",
        "name": "Salwars",
        "image": "/images/collection-salwars.jpg",
        "href": "/shop/salwars"
      },
      {
        "slug": "lehengas",
        "name": "Lehengas",
        "image": "/images/collection-lehengas.jpg",
        "href": "/shop/lehengas"
      },
      {
        "slug": "sarees",
        "name": "Sarees",
        "image": "/images/collection-sarees.jpg",
        "href": "/shop/sarees"
      },
      {
        "slug": "dupattas",
        "name": "Dupattas",
        "image": "/images/collection-dupattas.jpg",
        "href": "/shop/dupattas"
      }
    ]
  },
  "sidebar": {
    "title": "FILTER COLLECTION",
    "categoryTitle": "CATEGORY",
    "activeTag": "ACTIVE COLLECTION",
    "viewAllText": "View All Collections",
    "viewAllHref": "/shop",
    "inStockLabel": "In Stock Only",
    "vidhyasPicksLabel": "Vidhya's Picks Only"
  },
  "concierge": {
    "enabled": true,
    "title": "VIDHYA'S CONCIERGE",
    "subtitle": "Bespoke Styling Chat",
    "link": "https://wa.me/919999999999?text=Hi%20Vidhya%2C%20I%20am%20exploring%20Salwars%20at%20Angelika"
  },
  "seo": {
    "metaTitle": "Salwar Suits & Sets | Handcrafted Designer Ethnic Wear - Angelika Fashions",
    "metaDescription": "Shop handcrafted luxury Indian salwar suits, angrakhas, shararas, and palazzo sets curated by designer Vidhya. Free bespoke tailoring & luxury gift wrapping."
  },
  "products": [
    {
      "id": "salwar-1",
      "name": "Ivory & Gold Chanderi Angrakha Suit",
      "category": "Salwars",
      "style": "Angrakha Suit Set",
      "price": 7499,
      "originalPrice": 8999,
      "discount": 17,
      "image": "/images/products/salwar-angrakha-1.jpg",
      "slug": "ivory-gold-chanderi-angrakha-suit",
      "badge": "NEW",
      "fabric": "Chanderi Silk",
      "color": "Ivory",
      "sizes": [
        "XS",
        "S",
        "M",
        "L",
        "XL"
      ],
      "inStock": true,
      "isVidhyasPick": true,
      "rating": 4.8,
      "reviewCount": 18
    },
    {
      "id": "salwar-2",
      "name": "Banarasi Silk Brocade Palazzo & Churidar Set",
      "category": "Salwars",
      "style": "Palazzo Set",
      "price": 14499,
      "originalPrice": 17999,
      "discount": 19,
      "image": "/images/collection-salwars.jpg",
      "slug": "banarasi-silk-brocade-palazzo-churidar-set",
      "badge": "NEW",
      "fabric": "Banarasi Silk",
      "color": "Gold",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "inStock": true,
      "isVidhyasPick": false,
      "rating": 4.8,
      "reviewCount": 22
    },
    {
      "id": "salwar-3",
      "name": "Royal Velvet Zardosi Handcrafted Anarkali Suit",
      "category": "Salwars",
      "style": "Anarkali Set",
      "price": 18499,
      "originalPrice": 21999,
      "discount": 16,
      "image": "/images/cat-lehengas.jpg",
      "slug": "royal-velvet-zardosi-anarkali-suit",
      "badge": "NEW",
      "fabric": "Silk Velvet",
      "color": "Red",
      "sizes": [
        "M",
        "L",
        "XL"
      ],
      "inStock": true,
      "isVidhyasPick": true,
      "rating": 4.8,
      "reviewCount": 26
    },
    {
      "id": "salwar-4",
      "name": "Lucknowi Chikankari Georgette Sharara Set",
      "category": "Salwars",
      "style": "Sharara Ensemble",
      "price": 9999,
      "originalPrice": 12499,
      "discount": 20,
      "image": "/images/collection-kurtis.jpg",
      "slug": "lucknowi-chikankari-georgette-sharara-set",
      "badge": "NEW",
      "fabric": "Pure Georgette",
      "color": "Pink",
      "sizes": [
        "XS",
        "S",
        "M",
        "L"
      ],
      "inStock": true,
      "isVidhyasPick": false,
      "rating": 4.8,
      "reviewCount": 30
    },
    {
      "id": "salwar-5",
      "name": "Emerald Green Gota Patti Chanderi Suit",
      "category": "Salwars",
      "style": "Straight Suit Set",
      "price": 8499,
      "originalPrice": 9999,
      "discount": 15,
      "image": "/images/hero-new-couture.jpg",
      "slug": "emerald-green-gota-patti-chanderi-suit",
      "badge": "NEW",
      "fabric": "Chanderi Silk",
      "color": "Green",
      "sizes": [
        "S",
        "M",
        "L",
        "XL",
        "XXL"
      ],
      "inStock": true,
      "isVidhyasPick": true,
      "rating": 4.8,
      "reviewCount": 34
    },
    {
      "id": "salwar-6",
      "name": "Royal Indigo Pure Raw Silk Straight Suit",
      "category": "Salwars",
      "style": "Straight Suit Set",
      "price": 8999,
      "originalPrice": 10499,
      "discount": 14,
      "image": "/images/collection-sarees.jpg",
      "slug": "royal-indigo-pure-raw-silk-straight-suit",
      "badge": "NEW",
      "fabric": "Silk",
      "color": "Blue",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "inStock": true,
      "isVidhyasPick": false,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "salwar-7",
      "name": "Ivory & Gold Chanderi Angrakha Suit (Heritage Edition)",
      "category": "Salwars",
      "style": "Angrakha Suit Set",
      "price": 7499,
      "originalPrice": 8999,
      "discount": 17,
      "image": "/images/products/salwar-angrakha-1.jpg",
      "slug": "ivory-gold-chanderi-angrakha-suit-heritage",
      "badge": "NEW",
      "fabric": "Chanderi Silk",
      "color": "Gold",
      "sizes": [
        "XS",
        "S",
        "M",
        "L",
        "XL"
      ],
      "inStock": true,
      "isVidhyasPick": true,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "salwar-8",
      "name": "Pastel Powder Blue Organza Dupatta Suit Set",
      "category": "Salwars",
      "style": "Palazzo Set",
      "price": 6999,
      "originalPrice": 8499,
      "discount": 18,
      "image": "/images/collection-dupattas.jpg",
      "slug": "pastel-powder-blue-organza-suit-set",
      "badge": "NEW",
      "fabric": "Organza",
      "color": "Blue",
      "sizes": [
        "XS",
        "S",
        "M",
        "L",
        "XL"
      ],
      "inStock": true,
      "isVidhyasPick": false,
      "rating": 4.8,
      "reviewCount": 38
    },
    {
      "id": "salwar-9",
      "name": "Chiffon Anarkali Set",
      "category": "Salwars",
      "style": "Anarkali Set",
      "price": 5499,
      "originalPrice": 6899,
      "discount": 20,
      "image": "/images/cat-salwars.jpg",
      "slug": "chiffon-anarkali-set",
      "badge": "NEW",
      "fabric": "Chiffon",
      "color": "Pink",
      "sizes": [
        "S",
        "M",
        "L",
        "XL",
        "Free Size"
      ],
      "inStock": true,
      "isVidhyasPick": true,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "salwar-10",
      "name": "Silk Palazzo Set",
      "category": "Salwars",
      "style": "Palazzo Set",
      "price": 5999,
      "originalPrice": 7499,
      "discount": 20,
      "image": "/images/vp-jan-3.jpg",
      "slug": "silk-palazzo-set",
      "badge": "NEW",
      "fabric": "Silk",
      "color": "Purple",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "inStock": true,
      "isVidhyasPick": false,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "salwar-11",
      "name": "Sharara Set",
      "category": "Salwars",
      "style": "Sharara Ensemble",
      "price": 7499,
      "originalPrice": 9299,
      "discount": 19,
      "image": "/images/collection-kurtis.jpg",
      "slug": "sharara-set",
      "badge": "NEW",
      "fabric": "Cotton",
      "color": "Red",
      "sizes": [
        "XS",
        "S",
        "M",
        "L",
        "XL"
      ],
      "inStock": true,
      "isVidhyasPick": false,
      "rating": 4.8,
      "reviewCount": 12
    }
  ]
},
  'sarees-page': {
  "hero": {
    "badge": "HANDCRAFTED LUXURY EDIT",
    "title": "Sarees",
    "titleHighlight": "Silk",
    "description": "Silk, cotton & chiffon drapes",
    "backgroundImage": "/images/cat-sarees.jpg",
    "showFeaturedCard": true,
    "featuredCardImage": "/images/collection-sarees.jpg",
    "featuredCardTag": "CURATED BY VIDHYA",
    "featuredCardText": "6 Pieces"
  },
  "announcement": {
    "enabled": true,
    "badge": "FESTIVE WEAVE",
    "headline": "Festive Heirloom: Complimentary matching unstitched blouse piece & fall-pico with every Saree order.",
    "code": "SAREE15",
    "link": "/shop/sarees",
    "linkText": "Explore Sarees →"
  },
  "navigation": {
    "enabled": true,
    "label": "COLLECTIONS:",
    "items": [
      {
        "slug": "",
        "name": "All Collections",
        "image": "/images/hero-new-couture.jpg",
        "href": "/shop"
      },
      {
        "slug": "kurtis",
        "name": "Kurtis",
        "image": "/images/collection-kurtis.jpg",
        "href": "/shop/kurtis"
      },
      {
        "slug": "salwars",
        "name": "Salwars",
        "image": "/images/collection-salwars.jpg",
        "href": "/shop/salwars"
      },
      {
        "slug": "lehengas",
        "name": "Lehengas",
        "image": "/images/collection-lehengas.jpg",
        "href": "/shop/lehengas"
      },
      {
        "slug": "sarees",
        "name": "Sarees",
        "image": "/images/collection-sarees.jpg",
        "href": "/shop/sarees"
      },
      {
        "slug": "dupattas",
        "name": "Dupattas",
        "image": "/images/collection-dupattas.jpg",
        "href": "/shop/dupattas"
      }
    ]
  },
  "sidebar": {
    "title": "FILTER COLLECTION",
    "categoryTitle": "CATEGORY",
    "activeTag": "ACTIVE COLLECTION",
    "viewAllText": "View All Collections",
    "viewAllHref": "/shop",
    "inStockLabel": "In Stock Only",
    "vidhyasPicksLabel": "Vidhya's Picks Only"
  },
  "concierge": {
    "enabled": true,
    "title": "VIDHYA'S CONCIERGE",
    "subtitle": "Bespoke Styling Chat",
    "link": "https://wa.me/919999999999?text=Hi%20Vidhya%2C%20I%20am%20exploring%20Sarees%20at%20Angelika"
  },
  "seo": {
    "metaTitle": "Designer Silk, Chanderi & Banarasi Sarees | Handcrafted Couture - Angelika Fashions",
    "metaDescription": "Explore luxury Kanjivaram silk sarees, Chanderi drapes, Lucknowi chikankari, and Banarasi brocades curated by designer Vidhya."
  },
  "products": [
    {
      "id": "saree-1",
      "name": "Heritage Temple Kanjivaram Silk Saree",
      "category": "Sarees",
      "style": "Kanjivaram Saree",
      "price": 22499,
      "originalPrice": 26999,
      "discount": 17,
      "image": "/images/products/saree-kanjivaram-1.jpg",
      "slug": "heritage-temple-kanjivaram-silk-saree",
      "badge": "NEW",
      "fabric": "Silk",
      "color": "Purple",
      "sizes": [
        "Free Size"
      ],
      "inStock": true,
      "isVidhyasPick": true,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "saree-2",
      "name": "Handwoven Gold Zari Chanderi Saree",
      "category": "Sarees",
      "style": "Chanderi Saree",
      "price": 12999,
      "originalPrice": 15499,
      "discount": 16,
      "image": "/images/products/saree-chanderi-1.jpg",
      "slug": "handwoven-gold-zari-chanderi-saree",
      "badge": "NEW",
      "fabric": "Chanderi",
      "color": "Green",
      "sizes": [
        "Free Size"
      ],
      "inStock": true,
      "isVidhyasPick": false,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "saree-3",
      "name": "Lucknowi Mukaish Chikankari Georgette Saree",
      "category": "Sarees",
      "style": "Chikankari Georgette Saree",
      "price": 15499,
      "originalPrice": 18999,
      "discount": 18,
      "image": "/images/products/saree-chikankari-1.jpg",
      "slug": "lucknowi-mukaish-chikankari-georgette-saree",
      "badge": "NEW",
      "fabric": "Georgette",
      "color": "Teal Blue",
      "sizes": [
        "Free Size"
      ],
      "inStock": true,
      "isVidhyasPick": true,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "saree-4",
      "name": "Mulberry Silk Saree",
      "category": "Sarees",
      "style": "Classic Silk Saree",
      "price": 7999,
      "originalPrice": 9999,
      "discount": 20,
      "image": "/images/products/saree-mulberry-1.jpg",
      "slug": "mulberry-silk-saree",
      "badge": "NEW",
      "fabric": "Silk",
      "color": "Plum",
      "sizes": [
        "Free Size"
      ],
      "inStock": true,
      "isVidhyasPick": false,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "saree-5",
      "name": "Vintage Floral Banarasi Brocade Silk Saree",
      "category": "Sarees",
      "style": "Banarasi Brocade Saree",
      "price": 18999,
      "originalPrice": 23499,
      "discount": 19,
      "image": "/images/products/saree-banarasi-1.jpg",
      "slug": "vintage-floral-banarasi-brocade-silk-saree",
      "badge": "NEW",
      "fabric": "Silk",
      "color": "Multicolor Floral",
      "sizes": [
        "Free Size"
      ],
      "inStock": true,
      "isVidhyasPick": true,
      "rating": 4.8,
      "reviewCount": 12
    },
    {
      "id": "saree-6",
      "name": "Hand-Painted Pure Organza Silk Saree",
      "category": "Sarees",
      "style": "Floral Organza Saree",
      "price": 13999,
      "originalPrice": 16999,
      "discount": 18,
      "image": "/images/products/saree-organza-1.jpg",
      "slug": "hand-painted-pure-organza-silk-saree",
      "badge": "NEW",
      "fabric": "Organza",
      "color": "Pink",
      "sizes": [
        "Free Size"
      ],
      "inStock": true,
      "isVidhyasPick": false,
      "rating": 4.8,
      "reviewCount": 12
    }
  ]
},
  'dupattas-page': {
    hero: {
      badge: "HANDCRAFTED LUXURY EDIT",
      title: "Dupattas",
      titleHighlight: "Dupattas",
      description: "Embroidered & printed accents",
      backgroundImage: "/images/collection-dupattas.jpg",
      showFeaturedCard: true,
      featuredCardImage: "/images/products/dupatta-embroidered-1.jpg",
      featuredCardTag: "CURATED BY VIDHYA",
      featuredCardText: "5 Pieces"
    },
    announcement: {
      enabled: true,
      badge: "OFFER",
      headline: "Festive Special: Complimentary matching tasseled borders & express tailoring with every Dupatta ensemble.",
      code: "FESTIVE15",
      link: "/shop",
      linkText: "Shop Offer →"
    },
    navigation: {
      enabled: true,
      label: "COLLECTIONS:",
      items: [
        {
          slug: "",
          name: "ALL COLLECTIONS",
          image: "/images/collection-kurtis.jpg",
          href: "/shop"
        },
        {
          slug: "kurtis",
          name: "KURTIS",
          image: "/images/collection-kurtis.jpg",
          href: "/shop/kurtis"
        },
        {
          slug: "salwars",
          name: "SALWARS",
          image: "/images/collection-salwars.jpg",
          href: "/shop/salwars"
        },
        {
          slug: "lehengas",
          name: "LEHENGAS",
          image: "/images/collection-lehengas.jpg",
          href: "/shop/lehengas"
        },
        {
          slug: "sarees",
          name: "SAREES",
          image: "/images/cat-sarees.jpg",
          href: "/shop/sarees"
        },
        {
          slug: "dupattas",
          name: "DUPATTAS",
          image: "/images/collection-dupattas.jpg",
          href: "/shop/dupattas"
        }
      ]
    },
    sidebar: {
      title: "FILTER COLLECTION",
      categoryTitle: "CATEGORY",
      activeTag: "ACTIVE COLLECTION",
      viewAllText: "← View All Collections",
      viewAllHref: "/shop",
      inStockLabel: "In Stock Only",
      vidhyasPicksLabel: "Vidhya's Picks Only"
    },
    concierge: {
      enabled: true,
      title: "VIDHYA'S CONCIERGE",
      subtitle: "Bespoke Styling Chat",
      link: "https://wa.me/919876543210"
    },
    seo: {
      metaTitle: "Handcrafted Luxury Dupattas | Angelika Fashions by Vidhya",
      metaDescription: "Explore handcrafted Banarasi katan silk, Phulkari georgette, Chanderi gota border, and scalloped organza dupattas curated by Vidhya."
    },
    products: [
      {
        id: "dupatta-1",
        name: "Royal Gold Banarasi Katan Silk Dupatta",
        category: "Dupattas",
        style: "Banarasi Kadhwa",
        price: 4499,
        originalPrice: 5499,
        discount: 18,
        image: "/images/products/dupatta-banarasi-1.jpg",
        slug: "royal-gold-banarasi-katan-silk-dupatta",
        badge: "NEW",
        fabric: "Silk",
        color: "Gold",
        sizes: ["Free Size"],
        inStock: true,
        isVidhyasPick: true,
        rating: 4.8,
        reviewCount: 12
      },
      {
        id: "dupatta-2",
        name: "Amritsari Hand-Embroidered Phulkari Dupatta",
        category: "Dupattas",
        style: "Hand-Embroidered Phulkari",
        price: 3299,
        originalPrice: 3999,
        discount: 18,
        image: "/images/products/dupatta-phulkari-1.jpg",
        slug: "amritsari-hand-embroidered-phulkari-dupatta",
        badge: "NEW",
        fabric: "Georgette",
        color: "Multicolor",
        sizes: ["Free Size"],
        inStock: true,
        isVidhyasPick: false,
        rating: 4.8,
        reviewCount: 12
      },
      {
        id: "dupatta-3",
        name: "Chanderi Silk Gota Border Dupatta",
        category: "Dupattas",
        style: "Gota Kinari Border",
        price: 2799,
        originalPrice: 3299,
        discount: 15,
        image: "/images/products/dupatta-chanderi-1.jpg",
        slug: "chanderi-silk-gota-border-dupatta",
        badge: "NEW",
        fabric: "Chanderi",
        color: "Mustard Gold",
        sizes: ["Free Size"],
        inStock: true,
        isVidhyasPick: true,
        rating: 4.8,
        reviewCount: 12
      },
      {
        id: "dupatta-4",
        name: "Pearl Scalloped Organza Dupatta",
        category: "Dupattas",
        style: "Laser-Cut Scallop",
        price: 3899,
        originalPrice: 4499,
        discount: 13,
        image: "/images/products/dupatta-organza-1.jpg",
        slug: "pearl-scalloped-organza-dupatta",
        badge: "NEW",
        fabric: "Organza",
        color: "Ivory",
        sizes: ["Free Size"],
        inStock: true,
        isVidhyasPick: false,
        rating: 4.8,
        reviewCount: 12
      },
      {
        id: "dupatta-5",
        name: "Embroidered Dupatta",
        category: "Dupattas",
        style: "Gota Patti Festive",
        price: 1499,
        originalPrice: 1999,
        discount: 25,
        image: "/images/products/dupatta-embroidered-1.jpg",
        slug: "embroidered-dupatta",
        badge: "NEW",
        fabric: "Cotton",
        color: "Green",
        sizes: ["Free Size"],
        inStock: true,
        isVidhyasPick: false,
        rating: 4.8,
        reviewCount: 12
      }
    ]
  },
  'new-arrivals-page': {
    "header": {
        "badge": "JUST LANDED",
        "title": "New Arrivals",
        "description": "Fresh drops every week. Handcrafted pieces from our artisan partners across India."
    },
    "categories": [
        "All",
        "Sarees",
        "Lehengas",
        "Kurtis",
        "Salwars",
        "Dupattas",
        "Gowns",
        "Co-ords",
        "Accessories"
    ],
    "itemsPerPage": 12,
    "seo": {
        "metaTitle": "New Arrivals | Fresh Indian Ethnic Wear | Angelika Fashions",
        "metaDescription": "Discover the latest handcrafted ethnic wear arrivals at Angelika Fashions - fresh sarees, lehengas, kurtis, salwars, and dupattas every week."
    },
    "products": [
        {
            "id": "new-1",
            "slug": "hand-block-printed-kurti",
            "name": "All Silk Saree",
            "price": 2000,
            "originalPrice": 2000,
            "image": "/images/new-1.jpg",
            "color": "Crimson",
            "colorHex": "#DC143C",
            "category": "All",
            "discount": 0,
            "isNew": true,
            "isTrending": true,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes"
            ]
        },
        {
            "id": "new-2",
            "slug": "velvet-kurti-set",
            "name": "Sarees Cotton Lehenga Set",
            "price": 2500,
            "originalPrice": 2778,
            "image": "/images/new-2.jpg",
            "color": "Emerald",
            "colorHex": "#1B7A3D",
            "category": "Sarees",
            "discount": 10,
            "isNew": true,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made"
            ]
        },
        {
            "id": "new-3",
            "slug": "chanderi-cotton-kurti",
            "name": "Lehengas Chiffon Kurti",
            "price": 3000,
            "originalPrice": 3529,
            "image": "/images/new-3.jpg",
            "color": "Navy",
            "colorHex": "#1E3A8A",
            "category": "Lehengas",
            "discount": 15,
            "isNew": true,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made",
                "Limited Edition"
            ]
        },
        {
            "id": "new-4",
            "slug": "gota-patti-kurta",
            "name": "Kurtis Organza Salwar Suit",
            "price": 3500,
            "originalPrice": 4375,
            "image": "/images/new-4.jpg",
            "color": "Gold",
            "colorHex": "#C9A84C",
            "category": "Kurtis",
            "discount": 20,
            "isNew": true,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes"
            ]
        },
        {
            "id": "new-5",
            "slug": "chiffon-anarkali-set",
            "name": "Salwars Velvet Dupatta",
            "price": 4000,
            "originalPrice": 5333,
            "image": "/images/new-5.jpg",
            "color": "Ivory",
            "colorHex": "#FFFFF0",
            "category": "Salwars",
            "discount": 25,
            "isNew": true,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made"
            ]
        },
        {
            "id": "new-6",
            "slug": "silk-palazzo-set",
            "name": "Dupattas Banarasi Gown",
            "price": 4500,
            "originalPrice": 6429,
            "image": "/images/new-6.jpg",
            "color": "Sage",
            "colorHex": "#8A9A5B",
            "category": "Dupattas",
            "discount": 30,
            "isNew": true,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made",
                "Limited Edition"
            ]
        },
        {
            "id": "new-7",
            "slug": "sharara-set-navy",
            "name": "Gowns Chanderi Anarkali",
            "price": 5000,
            "originalPrice": 5000,
            "image": "/images/new-7.jpg",
            "color": "Lavender",
            "colorHex": "#967BB6",
            "category": "Gowns",
            "discount": 0,
            "isNew": true,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes"
            ]
        },
        {
            "id": "new-8",
            "slug": "mirror-work-lehenga",
            "name": "Co-ords Handloom Co-ord Set",
            "price": 5500,
            "originalPrice": 6111,
            "image": "/images/new-8.jpg",
            "color": "Coral",
            "colorHex": "#FF6F61",
            "category": "Co-ords",
            "discount": 10,
            "isNew": true,
            "isTrending": true,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made"
            ]
        },
        {
            "id": "new-9",
            "slug": "mulberry-silk-saree",
            "name": "Accessories Silk Saree",
            "price": 6000,
            "originalPrice": 7059,
            "image": "/images/new-9.jpg",
            "color": "Charcoal",
            "colorHex": "#36454F",
            "category": "Accessories",
            "discount": 15,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made",
                "Limited Edition"
            ]
        },
        {
            "id": "new-10",
            "slug": "banarasi-tissue-saree",
            "name": "All Cotton Lehenga Set",
            "price": 6500,
            "originalPrice": 8125,
            "image": "/images/new-10.jpg",
            "color": "Rose",
            "colorHex": "#FF66CC",
            "category": "All",
            "discount": 20,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes"
            ]
        },
        {
            "id": "new-11",
            "slug": "organza-saree-set",
            "name": "Sarees Chiffon Kurti",
            "price": 7000,
            "originalPrice": 9333,
            "image": "/images/new-11.jpg",
            "color": "Teal",
            "colorHex": "#008080",
            "category": "Sarees",
            "discount": 25,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made"
            ]
        },
        {
            "id": "new-12",
            "slug": "embroidered-dupatta",
            "name": "Lehengas Organza Salwar Suit",
            "price": 7500,
            "originalPrice": 10714,
            "image": "/images/new-12.jpg",
            "color": "Amber",
            "colorHex": "#FFBF00",
            "category": "Lehengas",
            "discount": 30,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made",
                "Limited Edition"
            ]
        },
        {
            "id": "new-13",
            "slug": "hand-block-printed-kurti",
            "name": "Kurtis Velvet Dupatta",
            "price": 8000,
            "originalPrice": 8000,
            "image": "/images/new-1.jpg",
            "color": "Crimson",
            "colorHex": "#DC143C",
            "category": "Kurtis",
            "discount": 0,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes"
            ]
        },
        {
            "id": "new-14",
            "slug": "velvet-kurti-set",
            "name": "Salwars Banarasi Gown",
            "price": 8500,
            "originalPrice": 9444,
            "image": "/images/new-2.jpg",
            "color": "Emerald",
            "colorHex": "#1B7A3D",
            "category": "Salwars",
            "discount": 10,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made"
            ]
        },
        {
            "id": "new-15",
            "slug": "chanderi-cotton-kurti",
            "name": "Dupattas Chanderi Anarkali",
            "price": 9000,
            "originalPrice": 10588,
            "image": "/images/new-3.jpg",
            "color": "Navy",
            "colorHex": "#1E3A8A",
            "category": "Dupattas",
            "discount": 15,
            "isNew": false,
            "isTrending": true,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made",
                "Limited Edition"
            ]
        },
        {
            "id": "new-16",
            "slug": "gota-patti-kurta",
            "name": "Gowns Handloom Co-ord Set",
            "price": 9500,
            "originalPrice": 11875,
            "image": "/images/new-4.jpg",
            "color": "Gold",
            "colorHex": "#C9A84C",
            "category": "Gowns",
            "discount": 20,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes"
            ]
        },
        {
            "id": "new-17",
            "slug": "chiffon-anarkali-set",
            "name": "Co-ords Silk Saree",
            "price": 10000,
            "originalPrice": 13333,
            "image": "/images/new-5.jpg",
            "color": "Ivory",
            "colorHex": "#FFFFF0",
            "category": "Co-ords",
            "discount": 25,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made"
            ]
        },
        {
            "id": "new-18",
            "slug": "silk-palazzo-set",
            "name": "Accessories Cotton Lehenga Set",
            "price": 10500,
            "originalPrice": 15000,
            "image": "/images/new-6.jpg",
            "color": "Sage",
            "colorHex": "#8A9A5B",
            "category": "Accessories",
            "discount": 30,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made",
                "Limited Edition"
            ]
        },
        {
            "id": "new-19",
            "slug": "sharara-set-navy",
            "name": "All Chiffon Kurti",
            "price": 11000,
            "originalPrice": 11000,
            "image": "/images/new-7.jpg",
            "color": "Lavender",
            "colorHex": "#967BB6",
            "category": "All",
            "discount": 0,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes"
            ]
        },
        {
            "id": "new-20",
            "slug": "mirror-work-lehenga",
            "name": "Sarees Organza Salwar Suit",
            "price": 11500,
            "originalPrice": 12778,
            "image": "/images/new-8.jpg",
            "color": "Coral",
            "colorHex": "#FF6F61",
            "category": "Sarees",
            "discount": 10,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made"
            ]
        },
        {
            "id": "new-21",
            "slug": "mulberry-silk-saree",
            "name": "Lehengas Velvet Dupatta",
            "price": 12000,
            "originalPrice": 14118,
            "image": "/images/new-9.jpg",
            "color": "Charcoal",
            "colorHex": "#36454F",
            "category": "Lehengas",
            "discount": 15,
            "isNew": false,
            "isTrending": false,
            "inStock": false,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made",
                "Limited Edition"
            ]
        },
        {
            "id": "new-22",
            "slug": "banarasi-tissue-saree",
            "name": "Kurtis Banarasi Gown",
            "price": 12500,
            "originalPrice": 15625,
            "image": "/images/new-10.jpg",
            "color": "Rose",
            "colorHex": "#FF66CC",
            "category": "Kurtis",
            "discount": 20,
            "isNew": false,
            "isTrending": true,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes"
            ]
        },
        {
            "id": "new-23",
            "slug": "organza-saree-set",
            "name": "Salwars Chanderi Anarkali",
            "price": 13000,
            "originalPrice": 17333,
            "image": "/images/new-11.jpg",
            "color": "Teal",
            "colorHex": "#008080",
            "category": "Salwars",
            "discount": 25,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made"
            ]
        },
        {
            "id": "new-24",
            "slug": "embroidered-dupatta",
            "name": "Dupattas Handloom Co-ord Set",
            "price": 13500,
            "originalPrice": 19286,
            "image": "/images/new-12.jpg",
            "color": "Amber",
            "colorHex": "#FFBF00",
            "category": "Dupattas",
            "discount": 30,
            "isNew": false,
            "isTrending": false,
            "inStock": true,
            "tags": [
                "Handwoven",
                "Natural Dyes",
                "Artisan Made",
                "Limited Edition"
            ]
        }
    ]
},
  'sale-page': {
    header: {
      badge: 'SALE ON NOW',
      title: 'Seasonal Sale',
      titleHighlight: 'Sale',
      description: "Up to 65% off on handcrafted ethnic wear. 18 pieces. Once they're gone, they're gone.",
      freeShippingThresholdText: 'Free shipping on orders ₹2,999+'
    },
    events: [
      {
        title: 'End of Season Sale',
        description: 'Up to 60% off selected styles. While stocks last.',
        endDate: '2026-02-15',
        badge: 'ENDS SOON',
        link: '/sale?event=end-of-season-sale'
      },
      {
        title: 'Final Clearance',
        description: 'Last chance on discontinued designs. 50-70% off.',
        endDate: '2026-01-31',
        badge: 'FINAL DAYS',
        link: '/sale?event=final-clearance'
      },
      {
        title: 'Festival Archive',
        description: 'Previous season festive wear at archive prices.',
        endDate: '2026-03-01',
        badge: 'ARCHIVE',
        link: '/sale?event=festival-archive'
      }
    ],
    categories: ['All', 'Up to 30% Off', '30-50% Off', '50%+ Off', 'Final Sale'],
    itemsPerPage: 12,
    policies: [
      {
        icon: 'document',
        title: 'Final Sale Policy',
        description: 'Items marked "Final Sale" (50%+ off) cannot be returned or exchanged. All other sale items follow our standard 15-day return policy.'
      },
      {
        icon: 'truck',
        title: 'Express Shipping',
        description: 'Free shipping on orders ₹2,999+. Sale orders ship within 24 hours. COD available on sale items up to ₹5,000.'
      },
      {
        icon: 'chat',
        title: 'Need Help Choosing?',
        description: 'Chat with Vidhya or Meera on WhatsApp for personalized sale picks. They know every piece.'
      }
    ],
    seo: {
      metaTitle: 'Seasonal Sale - Up to 65% Off Handcrafted Ethnic Wear | Angelika',
      metaDescription: 'Shop luxury handcrafted ethnic wear at seasonal markdowns. Sarees, Lehengas, Salwars & Dupattas up to 65% off. Limited quantities.'
    },
    products: [
      {
        id: 'sale-10',
        slug: 'banarasi-tissue-saree',
        name: 'Lehengas Chanderi Lehenga Set',
        price: 3570,
        originalPrice: 10200,
        image: '/images/sale-10.jpg',
        color: 'Rose',
        colorHex: '#FF66CC',
        category: 'Lehengas',
        discount: 65,
        isFinalSale: true,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-20',
        slug: 'mirror-work-lehenga',
        name: 'Salwars Silk Salwar Suit',
        price: 6370,
        originalPrice: 18200,
        image: '/images/sale-8.jpg',
        color: 'Coral',
        colorHex: '#FF6F61',
        category: 'Salwars',
        discount: 65,
        isFinalSale: true,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-9',
        slug: 'mulberry-silk-saree',
        name: 'Sarees Banarasi Saree',
        price: 3760,
        originalPrice: 9400,
        image: '/images/sale-9.jpg',
        color: 'Charcoal',
        colorHex: '#36454F',
        category: 'Sarees',
        discount: 60,
        isFinalSale: true,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-8',
        slug: 'mirror-work-lehenga',
        name: 'Accessories Velvet Co-ord Set',
        price: 3870,
        originalPrice: 8600,
        image: '/images/sale-8.jpg',
        color: 'Coral',
        colorHex: '#FF6F61',
        category: 'Accessories',
        discount: 55,
        isFinalSale: true,
        inStock: true,
        lowStock: true
      },
      {
        id: 'sale-18',
        slug: 'silk-palazzo-set',
        name: 'Lehengas Chanderi Lehenga Set',
        price: 7470,
        originalPrice: 16600,
        image: '/images/sale-6.jpg',
        color: 'Sage',
        colorHex: '#8A9A5B',
        category: 'Lehengas',
        discount: 55,
        isFinalSale: true,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-7',
        slug: 'sharara-set-navy',
        name: 'Co-ords Organza Anarkali',
        price: 3900,
        originalPrice: 7800,
        image: '/images/sale-7.jpg',
        color: 'Lavender',
        colorHex: '#967BB6',
        category: 'Co-ords',
        discount: 50,
        isFinalSale: true,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-17',
        slug: 'chiffon-anarkali-set',
        name: 'Sarees Banarasi Saree',
        price: 7900,
        originalPrice: 15800,
        image: '/images/sale-5.jpg',
        color: 'Ivory',
        colorHex: '#FFFFF0',
        category: 'Sarees',
        discount: 50,
        isFinalSale: true,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-6',
        slug: 'silk-palazzo-set',
        name: 'Gowns Chiffon Gown',
        price: 3850,
        originalPrice: 7000,
        image: '/images/sale-6.jpg',
        color: 'Sage',
        colorHex: '#8A9A5B',
        category: 'Gowns',
        discount: 45,
        isFinalSale: false,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-5',
        slug: 'chiffon-anarkali-set',
        name: 'Dupattas Cotton Dupatta',
        price: 3720,
        originalPrice: 6200,
        image: '/images/sale-5.jpg',
        color: 'Ivory',
        colorHex: '#FFFFF0',
        category: 'Dupattas',
        discount: 40,
        isFinalSale: false,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-15',
        slug: 'chanderi-cotton-kurti',
        name: 'Co-ords Organza Anarkali',
        price: 8520,
        originalPrice: 14200,
        image: '/images/sale-3.jpg',
        color: 'Navy',
        colorHex: '#1E3A8A',
        category: 'Co-ords',
        discount: 40,
        isFinalSale: false,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-4',
        slug: 'gota-patti-kurta',
        name: 'Salwars Silk Salwar Suit',
        price: 3510,
        originalPrice: 5400,
        image: '/images/sale-4.jpg',
        color: 'Gold',
        colorHex: '#C9A84C',
        category: 'Salwars',
        discount: 35,
        isFinalSale: false,
        inStock: true,
        lowStock: true
      },
      {
        id: 'sale-14',
        slug: 'velvet-kurti-set',
        name: 'Gowns Chiffon Gown',
        price: 8710,
        originalPrice: 13400,
        image: '/images/sale-2.jpg',
        color: 'Emerald',
        colorHex: '#1B7A3D',
        category: 'Gowns',
        discount: 35,
        isFinalSale: false,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-3',
        slug: 'chanderi-cotton-kurti',
        name: 'Kurtis Handloom Kurti',
        price: 3220,
        originalPrice: 4600,
        image: '/images/sale-3.jpg',
        color: 'Navy',
        colorHex: '#1E3A8A',
        category: 'Kurtis',
        discount: 30,
        isFinalSale: false,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-13',
        slug: 'hand-block-printed-kurti',
        name: 'Dupattas Cotton Dupatta',
        price: 8820,
        originalPrice: 12600,
        image: '/images/sale-1.jpg',
        color: 'Crimson',
        colorHex: '#DC143C',
        category: 'Dupattas',
        discount: 30,
        isFinalSale: false,
        inStock: true,
        lowStock: true
      },
      {
        id: 'sale-2',
        slug: 'velvet-kurti-set',
        name: 'Lehengas Chanderi Lehenga Set',
        price: 2850,
        originalPrice: 3800,
        image: '/images/sale-2.jpg',
        color: 'Emerald',
        colorHex: '#1B7A3D',
        category: 'Lehengas',
        discount: 25,
        isFinalSale: false,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-12',
        slug: 'embroidered-dupatta',
        name: 'Salwars Silk Salwar Suit',
        price: 8850,
        originalPrice: 11800,
        image: '/images/sale-12.jpg',
        color: 'Amber',
        colorHex: '#FFBF00',
        category: 'Salwars',
        discount: 25,
        isFinalSale: false,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-1',
        slug: 'hand-block-printed-kurti',
        name: 'Sarees Banarasi Saree',
        price: 2400,
        originalPrice: 3000,
        image: '/images/sale-1.jpg',
        color: 'Crimson',
        colorHex: '#DC143C',
        category: 'Sarees',
        discount: 20,
        isFinalSale: false,
        inStock: true,
        lowStock: false
      },
      {
        id: 'sale-11',
        slug: 'organza-saree-set',
        name: 'Kurtis Handloom Kurti',
        price: 8800,
        originalPrice: 11000,
        image: '/images/sale-11.jpg',
        color: 'Teal',
        colorHex: '#008080',
        category: 'Kurtis',
        discount: 20,
        isFinalSale: false,
        inStock: true,
        lowStock: false
      }
    ]
  },
  'my-angelika-look': {
    tag: '#MyAngelikaLook',
    title: '#MyAngelikaLook',
    subtitle: 'See how our community styles their Angelika favorites. Tag @angelikafashions for a chance to be featured.',
    instagramUrl: 'https://instagram.com/angelikafashions',
    instagramHandle: '@angelikafashions',
    buttonText: 'Follow us on Instagram',
    posts: [
      {
        id: 'ig-1',
        image_url: '/images/insta-1.jpg',
        handle: '@ananya_couture',
        caption: 'Hand-block printed Chanderi kurtis stacked and ready for festive season.',
        productName: 'Hand-Block Printed Kurti',
        productLink: '/shop/kurtis',
        likes: 1240,
        isFeatured: true
      },
      {
        id: 'ig-2',
        image_url: '/images/insta-2.jpg',
        handle: '@meera_styling',
        caption: 'Twin regal ensembles: Emerald Chanderi Anarkali & Teal Sharara Set.',
        productName: 'Emerald Velvet & Silk Sharara',
        productLink: '/shop/salwars',
        likes: 2180,
        isFeatured: true
      },
      {
        id: 'ig-3',
        image_url: '/images/insta-3.jpg',
        handle: '@divya_weddings',
        caption: 'Royal Crimson Bridal Zardozi Lehenga in palace courtyard glow.',
        productName: 'Royal Crimson Bridal Lehenga',
        productLink: '/shop/lehengas',
        likes: 3450,
        isFeatured: true
      },
      {
        id: 'ig-4',
        image_url: '/images/insta-4.jpg',
        handle: '@kavita_drapes',
        caption: 'Timeless temple heritage in peacock blue Banarasi tissue saree.',
        productName: 'Peacock Blue Banarasi Saree',
        productLink: '/shop/sarees',
        likes: 1890,
        isFeatured: true
      },
      {
        id: 'ig-5',
        image_url: '/images/insta-5.jpg',
        handle: '@shreya_accents',
        caption: 'A kaleidoscope of hand-embroidered phulkari & gota patti dupattas.',
        productName: 'Royal Gold Banarasi Dupatta',
        productLink: '/shop/dupattas',
        likes: 980,
        isFeatured: false
      },
      {
        id: 'ig-6',
        image_url: '/images/insta-6.jpg',
        handle: '@vidhya_atelier',
        caption: 'From sketch to drape: handloom silk saree styled at the Angelika studio.',
        productName: 'Heritage Kanjivaram Silk Saree',
        productLink: '/shop/sarees',
        likes: 2840,
        isFeatured: true
      },
      {
        id: 'ig-7',
        image_url: '/images/insta-7.jpg',
        handle: '@artisan_stories',
        caption: 'Generations of mastery: master weaver on the pit loom weaving pure zari silk.',
        productName: 'Handloom Zari Silk Edit',
        productLink: '/shop',
        likes: 4120,
        isFeatured: true
      },
      {
        id: 'ig-8',
        image_url: '/images/insta-8.jpg',
        handle: '@priya_lifestyle',
        caption: 'Subtle textures and earthy palettes. Handcrafted luxury made for everyday grace.',
        productName: 'Chanderi Cotton Kurti Set',
        productLink: '/shop/kurtis',
        likes: 1560,
        isFeatured: false
      }
    ]
  },
  'privacy-policy-page': {
    badge: 'Legal & Policy',
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: January 2026',
    contactEmail: 'support@angelikafashions.com',
    contactLink: '/contact',
    sections: [
      {
        id: 'sec-1',
        title: '1. Information We Collect',
        content: 'At Angelika Fashions, we collect personal information necessary to deliver exceptional craftsmanship and service. This includes your name, shipping address, billing address, phone number, email address, and order history.'
      },
      {
        id: 'sec-2',
        title: '2. How We Use Your Information',
        content: 'We use your data solely to fulfill orders, process payments securely, provide order tracking updates via SMS or WhatsApp, and improve your shopping experience. We never sell or rent your personal information to third parties.'
      },
      {
        id: 'sec-3',
        title: '3. Payment Security',
        content: 'All payment transactions are encrypted using 256-bit SSL encryption and processed through trusted PCI-DSS certified payment gateways (Razorpay, Stripe). We do not store complete credit card or debit card numbers on our servers.'
      },
      {
        id: 'sec-4',
        title: '4. Contact Us',
        content: 'If you have any questions about this Privacy Policy or your personal information, please contact us at support@angelikafashions.com.'
      }
    ],
    seo: {
      metaTitle: 'Privacy Policy | Angelika Fashions',
      metaDescription: 'Learn how Angelika Fashions protects your privacy, personal information, and payment security.'
    }
  },
  'terms-page': {
    badge: 'Legal & Policy',
    title: 'Terms of Service',
    lastUpdated: 'Last updated: January 2026',
    contactLink: '/contact',
    faqLink: '/faq',
    sections: [
      {
        id: 'sec-1',
        title: '1. General Overview',
        content: 'Welcome to Angelika Fashions. By visiting our site and/or purchasing handcrafted garments from us, you engage in our service and agree to be bound by the following terms and conditions.'
      },
      {
        id: 'sec-2',
        title: '2. Products and Handcrafted Variations',
        content: 'Our collections are handcrafted by skilled artisans. As each piece involves hand-block printing, hand-embroidery, and traditional weaving techniques, subtle variations in color, texture, and motif placement are intrinsic to authentic artisan craftsmanship and are not considered defects.'
      },
      {
        id: 'sec-3',
        title: '3. Pricing and Orders',
        content: 'All prices are listed in Indian Rupees (₹) inclusive of applicable taxes unless stated otherwise. We reserve the right to modify prices or discontinue items without prior notice.'
      },
      {
        id: 'sec-4',
        title: '4. Support & Questions',
        content: 'For any questions regarding these terms, please visit our Contact Page or reach out to us at Customer Support FAQ.'
      }
    ],
    seo: {
      metaTitle: 'Terms of Service | Angelika Fashions',
      metaDescription: 'Terms of service and conditions of use for handcrafted Indian luxury wear at Angelika Fashions.'
    }
  },
  'cookies-page': {
    badge: 'Legal & Policy',
    title: 'Cookie Policy',
    lastUpdated: 'Last updated: January 2026',
    conciergeEmail: 'concierge@angelikafashions.com',
    contactLink: '/contact',
    sections: [
      {
        id: 'sec-1',
        title: '1. What Are Cookies?',
        content: 'Cookies are small encrypted text files stored on your browser or device when you explore the Angelika Fashions digital atelier. They allow our website to recognize your preferences, remember your bag and wishlist selections, and deliver a tailored luxury shopping experience.'
      },
      {
        id: 'sec-2',
        title: '2. Categories of Cookies We Employ',
        content: '• Essential Atelier Cookies: Vital for core functions such as shopping bag persistence, secure user authentication, and checkout flow.\n• Preference & Craft Cookies: Remember your selected size recommendations, currency settings, and recently viewed heirloom designs.\n• Analytical Performance Cookies: Help us anonymously evaluate how clients interact with collections and discover ways to optimize navigation speed.'
      },
      {
        id: 'sec-3',
        title: '3. Managing Your Cookie Preferences',
        content: 'You have complete autonomy over your cookie preferences. You can adjust your browser settings to decline or clear cookies at any time. Please note that disabling essential cookies may impact certain concierge and checkout features on our atelier platform.'
      },
      {
        id: 'sec-4',
        title: '4. Concierge Enquiries',
        content: 'For further questions regarding our cookie protocols or data protection practices, please connect with our concierge team at concierge@angelikafashions.com.'
      }
    ],
    seo: {
      metaTitle: 'Cookie Policy | Angelika Fashions',
      metaDescription: 'Understand how Angelika Fashions utilizes cookies to provide an elevated browsing and bespoke shopping experience.'
    }
  },
  'accessibility-page': {
    badge: 'Inclusivity & Standards',
    title: 'Accessibility Statement',
    lastUpdated: 'Last updated: January 2026',
    sections: [
      {
        id: 'sec-1',
        title: 'Our Dedication to Inclusivity',
        content: 'At Angelika Fashions, we believe true luxury is welcoming and universally accessible. We are passionately committed to ensuring our digital atelier conforms to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA benchmarks, delivering a seamless experience for visitors of all abilities.'
      },
      {
        id: 'sec-2',
        title: 'Key Accessibility Initiatives',
        content: '• Clear Contrast & Typography: Carefully chosen color contrast ratios and legible type scales to ease readability across all devices.\n• Full Keyboard Navigation: All interactive elements, navigation dropdowns, modals, and checkout steps are fully operable via keyboard.\n• Assistive Technology Support: Comprehensive ARIA labels, semantic landmark regions, and descriptive alt attributes for screen readers.\n• Reduced Motion Accommodations: Respect for user system preferences regarding reduced animations and motion effects.'
      },
      {
        id: 'sec-3',
        title: 'Assisted Shopping Concierge',
        content: 'If you experience any challenge navigating our site or require assistance completing an order, designer Vidhya and our concierge team are available to guide you personally via WhatsApp, phone, or email:'
      }
    ],
    conciergeDesk: {
      showCard: true,
      title: 'Vidhya’s Direct Concierge Desk',
      email: 'concierge@angelikafashions.com',
      phone: '+91 98765 43210',
      phoneRaw: '919876543210',
      hours: 'Mon – Sat, 10:00 AM – 7:30 PM IST'
    },
    seo: {
      metaTitle: 'Accessibility Statement | Angelika Fashions',
      metaDescription: 'Angelika Fashions is committed to digital accessibility and inclusivity for all clients.'
    }
  },
  'brand-story': {
    badge: 'Our Story',
    title: 'Artisanal Luxury, Rooted in Indian Heritage',
    story: 'Every piece in the Angelika collection is thoughtfully curated by designer Vidhya, honoring ancient weaving traditions while embracing contemporary silhouettes.\n\nWhen you wear Angelika, you are not just wearing clothes — you are wearing a piece of tradition reimagined for today, made with integrity and worn with confidence.',
    quote: '"Fashion that honors where you come from while embracing where you are going."',
    image: '/images/hero-luxury-couture.jpg',
    readStoryLink: '/about',
    chatWhatsappLink: 'https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I%20would%20like%20to%20know%20more',
  },
  newsletter: {
    title: 'Join the Angelika Circle',
    subtitle: 'Receive exclusive invitations to preview new arrivals, bespoke styling sessions, and private editorial drops.',
    buttonText: 'Subscribe',
  },
};

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'site-content.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Ignore if already exists
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(CONTENT_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SITE_CONTENT,
      ...parsed,
      hero: { ...DEFAULT_SITE_CONTENT.hero, ...(parsed.hero || {}) },
      features: {
        items: (parsed.features?.items && parsed.features.items.length > 0)
          ? parsed.features.items
          : DEFAULT_SITE_CONTENT.features.items,
      },
      'vidhyas-picks': {
        ...DEFAULT_SITE_CONTENT['vidhyas-picks'],
        ...(parsed['vidhyas-picks'] || {}),
        items: (parsed['vidhyas-picks']?.items && parsed['vidhyas-picks'].items.length > 0)
          ? parsed['vidhyas-picks'].items
          : DEFAULT_SITE_CONTENT['vidhyas-picks']!.items,
      },
      categories: {
        ...DEFAULT_SITE_CONTENT.categories,
        ...(parsed.categories || {}),
        items: (parsed.categories?.items && parsed.categories.items.length > 0)
          ? parsed.categories.items
          : (DEFAULT_SITE_CONTENT.categories?.items || []),
      },
      'new-arrivals': {
        ...DEFAULT_SITE_CONTENT['new-arrivals'],
        ...(parsed['new-arrivals'] || {}),
        items: (parsed['new-arrivals']?.items && parsed['new-arrivals'].items.length > 0)
          ? parsed['new-arrivals'].items
          : (DEFAULT_SITE_CONTENT['new-arrivals']?.items || []),
      },
      'shop-the-look': {
        ...DEFAULT_SITE_CONTENT['shop-the-look'],
        ...(parsed['shop-the-look'] || {}),
      },
      'salwars-page': {
        ...DEFAULT_SITE_CONTENT['salwars-page'],
        ...(parsed['salwars-page'] || {}),
        hero: {
          ...DEFAULT_SITE_CONTENT['salwars-page']!.hero,
          ...(parsed['salwars-page']?.hero || {}),
        },
        announcement: {
          ...DEFAULT_SITE_CONTENT['salwars-page']!.announcement,
          ...(parsed['salwars-page']?.announcement || {}),
        },
        navigation: {
          ...DEFAULT_SITE_CONTENT['salwars-page']!.navigation,
          ...(parsed['salwars-page']?.navigation || {}),
        },
        sidebar: {
          ...DEFAULT_SITE_CONTENT['salwars-page']!.sidebar,
          ...(parsed['salwars-page']?.sidebar || {}),
        },
        concierge: {
          ...DEFAULT_SITE_CONTENT['salwars-page']!.concierge,
          ...(parsed['salwars-page']?.concierge || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['salwars-page']!.seo,
          ...(parsed['salwars-page']?.seo || {}),
        },
        products: (parsed['salwars-page']?.products && parsed['salwars-page'].products.length > 0)
          ? parsed['salwars-page'].products
          : DEFAULT_SITE_CONTENT['salwars-page']!.products,
      },
      'lehengas-page': {
        ...DEFAULT_SITE_CONTENT['lehengas-page'],
        ...(parsed['lehengas-page'] || {}),
        hero: {
          ...DEFAULT_SITE_CONTENT['lehengas-page']!.hero,
          ...(parsed['lehengas-page']?.hero || {}),
        },
        announcement: {
          ...DEFAULT_SITE_CONTENT['lehengas-page']!.announcement,
          ...(parsed['lehengas-page']?.announcement || {}),
        },
        navigation: {
          ...DEFAULT_SITE_CONTENT['lehengas-page']!.navigation,
          ...(parsed['lehengas-page']?.navigation || {}),
        },
        sidebar: {
          ...DEFAULT_SITE_CONTENT['lehengas-page']!.sidebar,
          ...(parsed['lehengas-page']?.sidebar || {}),
        },
        concierge: {
          ...DEFAULT_SITE_CONTENT['lehengas-page']!.concierge,
          ...(parsed['lehengas-page']?.concierge || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['lehengas-page']!.seo,
          ...(parsed['lehengas-page']?.seo || {}),
        },
        products: (parsed['lehengas-page']?.products && parsed['lehengas-page'].products.length > 0)
          ? parsed['lehengas-page'].products
          : DEFAULT_SITE_CONTENT['lehengas-page']!.products,
      },
      'sarees-page': {
        ...DEFAULT_SITE_CONTENT['sarees-page'],
        ...(parsed['sarees-page'] || {}),
        hero: {
          ...DEFAULT_SITE_CONTENT['sarees-page']!.hero,
          ...(parsed['sarees-page']?.hero || {}),
        },
        announcement: {
          ...DEFAULT_SITE_CONTENT['sarees-page']!.announcement,
          ...(parsed['sarees-page']?.announcement || {}),
        },
        navigation: {
          ...DEFAULT_SITE_CONTENT['sarees-page']!.navigation,
          ...(parsed['sarees-page']?.navigation || {}),
        },
        sidebar: {
          ...DEFAULT_SITE_CONTENT['sarees-page']!.sidebar,
          ...(parsed['sarees-page']?.sidebar || {}),
        },
        concierge: {
          ...DEFAULT_SITE_CONTENT['sarees-page']!.concierge,
          ...(parsed['sarees-page']?.concierge || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['sarees-page']!.seo,
          ...(parsed['sarees-page']?.seo || {}),
        },
        products: (parsed['sarees-page']?.products && parsed['sarees-page'].products.length > 0)
          ? parsed['sarees-page'].products
          : DEFAULT_SITE_CONTENT['sarees-page']!.products,
      },
      'dupattas-page': {
        ...DEFAULT_SITE_CONTENT['dupattas-page'],
        ...(parsed['dupattas-page'] || {}),
        hero: {
          ...DEFAULT_SITE_CONTENT['dupattas-page']!.hero,
          ...(parsed['dupattas-page']?.hero || {}),
        },
        announcement: {
          ...DEFAULT_SITE_CONTENT['dupattas-page']!.announcement,
          ...(parsed['dupattas-page']?.announcement || {}),
        },
        navigation: {
          ...DEFAULT_SITE_CONTENT['dupattas-page']!.navigation,
          ...(parsed['dupattas-page']?.navigation || {}),
        },
        sidebar: {
          ...DEFAULT_SITE_CONTENT['dupattas-page']!.sidebar,
          ...(parsed['dupattas-page']?.sidebar || {}),
        },
        concierge: {
          ...DEFAULT_SITE_CONTENT['dupattas-page']!.concierge,
          ...(parsed['dupattas-page']?.concierge || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['dupattas-page']!.seo,
          ...(parsed['dupattas-page']?.seo || {}),
        },
        products: (parsed['dupattas-page']?.products && parsed['dupattas-page'].products.length > 0)
          ? parsed['dupattas-page'].products
          : DEFAULT_SITE_CONTENT['dupattas-page']!.products,
      },
      'new-arrivals-page': {
        ...DEFAULT_SITE_CONTENT['new-arrivals-page'],
        ...(parsed['new-arrivals-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['new-arrivals-page']!.header,
          ...(parsed['new-arrivals-page']?.header || {}),
        },
        categories: (parsed['new-arrivals-page']?.categories && parsed['new-arrivals-page'].categories.length > 0)
          ? parsed['new-arrivals-page'].categories
          : DEFAULT_SITE_CONTENT['new-arrivals-page']!.categories,
        seo: {
          ...DEFAULT_SITE_CONTENT['new-arrivals-page']!.seo,
          ...(parsed['new-arrivals-page']?.seo || {}),
        },
        products: (parsed['new-arrivals-page']?.products && parsed['new-arrivals-page'].products.length > 0)
          ? parsed['new-arrivals-page'].products
          : DEFAULT_SITE_CONTENT['new-arrivals-page']!.products,
      },
      'sale-page': {
        ...DEFAULT_SITE_CONTENT['sale-page'],
        ...(parsed['sale-page'] || {}),
        header: {
          ...DEFAULT_SITE_CONTENT['sale-page']!.header,
          ...(parsed['sale-page']?.header || {}),
        },
        events: (parsed['sale-page']?.events && parsed['sale-page'].events.length > 0)
          ? parsed['sale-page'].events
          : DEFAULT_SITE_CONTENT['sale-page']!.events,
        categories: (parsed['sale-page']?.categories && parsed['sale-page'].categories.length > 0)
          ? parsed['sale-page'].categories
          : DEFAULT_SITE_CONTENT['sale-page']!.categories,
        policies: (parsed['sale-page']?.policies && parsed['sale-page'].policies.length > 0)
          ? parsed['sale-page'].policies
          : DEFAULT_SITE_CONTENT['sale-page']!.policies,
        seo: {
          ...DEFAULT_SITE_CONTENT['sale-page']!.seo,
          ...(parsed['sale-page']?.seo || {}),
        },
        products: (parsed['sale-page']?.products && parsed['sale-page'].products.length > 0)
          ? parsed['sale-page'].products
          : DEFAULT_SITE_CONTENT['sale-page']!.products,
      },
      'my-angelika-look': {
        ...DEFAULT_SITE_CONTENT['my-angelika-look'],
        ...(parsed['my-angelika-look'] || {}),
        posts: (parsed['my-angelika-look']?.posts && parsed['my-angelika-look'].posts.length > 0)
          ? parsed['my-angelika-look'].posts
          : DEFAULT_SITE_CONTENT['my-angelika-look']!.posts,
      },
      'privacy-policy-page': {
        ...DEFAULT_SITE_CONTENT['privacy-policy-page'],
        ...(parsed['privacy-policy-page'] || {}),
        sections: (parsed['privacy-policy-page']?.sections && parsed['privacy-policy-page'].sections.length > 0)
          ? parsed['privacy-policy-page'].sections
          : DEFAULT_SITE_CONTENT['privacy-policy-page']!.sections,
        seo: {
          ...DEFAULT_SITE_CONTENT['privacy-policy-page']!.seo,
          ...(parsed['privacy-policy-page']?.seo || {}),
        },
      },
      'terms-page': {
        ...DEFAULT_SITE_CONTENT['terms-page'],
        ...(parsed['terms-page'] || {}),
        sections: (parsed['terms-page']?.sections && parsed['terms-page'].sections.length > 0)
          ? parsed['terms-page'].sections
          : DEFAULT_SITE_CONTENT['terms-page']!.sections,
        seo: {
          ...DEFAULT_SITE_CONTENT['terms-page']!.seo,
          ...(parsed['terms-page']?.seo || {}),
        },
      },
      'cookies-page': {
        ...DEFAULT_SITE_CONTENT['cookies-page'],
        ...(parsed['cookies-page'] || {}),
        sections: (parsed['cookies-page']?.sections && parsed['cookies-page'].sections.length > 0)
          ? parsed['cookies-page'].sections
          : DEFAULT_SITE_CONTENT['cookies-page']!.sections,
        seo: {
          ...DEFAULT_SITE_CONTENT['cookies-page']!.seo,
          ...(parsed['cookies-page']?.seo || {}),
        },
      },
      'accessibility-page': {
        ...DEFAULT_SITE_CONTENT['accessibility-page'],
        ...(parsed['accessibility-page'] || {}),
        sections: (parsed['accessibility-page']?.sections && parsed['accessibility-page'].sections.length > 0)
          ? parsed['accessibility-page'].sections
          : DEFAULT_SITE_CONTENT['accessibility-page']!.sections,
        conciergeDesk: {
          ...DEFAULT_SITE_CONTENT['accessibility-page']!.conciergeDesk,
          ...(parsed['accessibility-page']?.conciergeDesk || {}),
        },
        seo: {
          ...DEFAULT_SITE_CONTENT['accessibility-page']!.seo,
          ...(parsed['accessibility-page']?.seo || {}),
        },
      },
      'brand-story': {
        ...DEFAULT_SITE_CONTENT['brand-story'],
        ...(parsed['brand-story'] || {}),
      },
      newsletter: {
        ...DEFAULT_SITE_CONTENT.newsletter,
        ...(parsed.newsletter || {}),
      },
    };
  } catch (err) {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function updateSectionContent(
  sectionId: string,
  sectionData: any
): Promise<{ success: boolean; content?: SiteContent; error?: string }> {
  try {
    await ensureDataDir();
    const currentContent = await getSiteContent();

    let normalizedData = sectionData;
    if (sectionId === 'features' && Array.isArray(sectionData?.items)) {
      normalizedData = {
        items: sectionData.items.map((item: any) => ({
          icon: item.icon || '✨',
          title: item.title || '',
          desc: item.desc || item.description || '',
          description: item.desc || item.description || '',
        })),
      };
    } else if (sectionId === 'vidhyas-picks' && Array.isArray(sectionData?.items)) {
      normalizedData = {
        ...sectionData,
        items: sectionData.items.map((item: any, idx: number) => ({
          id: item.id || `vp-${idx + 1}`,
          name: item.name || '',
          category: item.category || 'Collection',
          price: Number(String(item.price).replace(/[^0-9.]/g, '')) || 0,
          originalPrice: item.originalPrice || item.compare_at_price
            ? Number(String(item.originalPrice || item.compare_at_price).replace(/[^0-9.]/g, ''))
            : null,
          compare_at_price: item.originalPrice || item.compare_at_price
            ? Number(String(item.originalPrice || item.compare_at_price).replace(/[^0-9.]/g, ''))
            : null,
          discount: item.discount ?? (
            item.originalPrice && item.price
              ? Math.round(((Number(item.originalPrice) - Number(item.price)) / Number(item.originalPrice)) * 100)
              : 0
          ),
          image: item.image || '/images/placeholder.jpg',
          slug: item.slug || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `product-${idx + 1}`),
          badge: item.badge || "VIDHYA'S PICK",
          isVidhyasPick: item.isVidhyasPick ?? true,
        })),
      };
    }

    const updatedContent: SiteContent = {
      ...currentContent,
      [sectionId]: normalizedData,
    };

    await fs.writeFile(CONTENT_FILE, JSON.stringify(updatedContent, null, 2), 'utf-8');

    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      await supabase
        .from('content_blocks')
        .upsert(
          {
            key: sectionId,
            type: sectionId,
            title: sectionId,
            content: normalizedData,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
    } catch (sbErr) {
      // Non-blocking fallback
    }

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/admin/content');
      revalidatePath('/vidhyas-picks');
      revalidatePath('/new-arrivals');
      revalidatePath('/shop/salwars');
      revalidatePath('/shop/lehengas');
      revalidatePath('/shop/sarees');
      revalidatePath('/shop/dupattas');
      revalidatePath('/sale');
      revalidatePath('/privacy');
      revalidatePath('/terms');
      revalidatePath('/cookies');
      revalidatePath('/accessibility');
    } catch (e) {
      // Non-blocking
    }

    return { success: true, content: updatedContent };
  } catch (error: any) {
    console.error(`Error updating section ${sectionId}:`, error);
    return { success: false, error: error.message || 'Failed to save section content' };
  }
}
