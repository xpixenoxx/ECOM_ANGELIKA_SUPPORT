import type { SiteContent } from '@/lib/actions/site-content-types';

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
        id: 'party-wear-dresses',
        title: 'Party Wear Dresses',
        subtitle: 'Festive & Evening Ensembles',
        image: '/images/category-showcase/showcase-party-wear-dresses.jpg',
        href: '/shop?occasion=party',
        cta: 'Explore Dresses',
        row: 1,
      },
      {
        id: 'office-wear-3piece',
        title: 'Office Wear 3-Piece',
        subtitle: 'Contemporary Formal Sets',
        image: '/images/category-showcase/showcase-office-wear-3piece.jpg',
        href: '/shop/salwars?occasion=office',
        cta: 'Shop 3-Piece',
        row: 1,
      },
      {
        id: 'coord-sets',
        title: 'Co-ord Sets',
        subtitle: 'Modern Matching Ensembles',
        image: '/images/category-showcase/showcase-coord-sets.jpg',
        href: '/shop/kurtis?type=coord-sets',
        cta: 'Shop Co-ords',
        row: 1,
      },
      {
        id: 'lehengas',
        title: 'Lehengas',
        subtitle: 'Bridal & Royal Celebrations',
        image: '/images/category-showcase/showcase-lehengas.jpg',
        href: '/shop/lehengas',
        cta: 'Explore Lehengas',
        row: 2,
      },
      {
        id: 'daily-wear-sarees',
        title: 'Daily Wear Sarees',
        subtitle: 'Lightweight Tissue & Cotton',
        image: '/images/category-showcase/showcase-daily-wear-sarees.jpg',
        href: '/shop/sarees?occasion=casual',
        cta: 'Shop Daily Sarees',
        row: 3,
      },
      {
        id: 'office-wear-sarees',
        title: 'Office Wear Sarees',
        subtitle: 'Sophisticated Silk Drapes',
        image: '/images/category-showcase/showcase-office-wear-sarees.jpg',
        href: '/shop/sarees?occasion=office',
        cta: 'Shop Office Sarees',
        row: 3,
      },
      {
        id: 'party-wear-sarees',
        title: 'Party Wear Sarees',
        subtitle: 'Pure Kanjivaram & Banarasi',
        image: '/images/category-showcase/showcase-party-wear-sarees.jpg',
        href: '/shop/sarees?occasion=party',
        cta: 'Explore Party Sarees',
        row: 4,
      },
      {
        id: 'womens-frocks',
        title: "Women's Frocks",
        subtitle: 'Flared Anarkalis & Gowns',
        image: '/images/category-showcase/showcase-womens-frocks.jpg',
        href: '/shop/salwars?type=anarkali',
        cta: 'Shop Frocks',
        row: 5,
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
  'shop-page': {
    hero: {
      badge: 'HANDCRAFTED LUXURY EDIT',
      title: 'All Collections',
      titleHighlight: 'Collections',
      description: 'Explore our complete collection of handcrafted kurtis, sarees, salwars, lehengas, and dupattas.',
      backgroundImage: '/images/hero-bg.jpg',
      showFeaturedCard: true,
      featuredCardImage: '/images/collection-kurtis.jpg',
      featuredCardTag: 'CURATED BY VIDHYA',
      featuredCardText: '27 Pieces • Pure Handloom'
    },
    announcement: {
      enabled: true,
      badge: 'SPECIAL OFFER',
      headline: 'Complimentary Bespoke Consultation on orders above ₹15,000 | Use Code: ATELIER',
      code: 'ATELIER',
      link: '/shop',
      linkText: 'Explore Atelier →'
    },
    navigation: {
      enabled: true,
      label: 'COLLECTIONS:',
      items: [
        {
          slug: '',
          name: 'All Collections',
          image: '/images/hero-new-couture.jpg',
          href: '/shop'
        },
        {
          slug: 'kurtis',
          name: 'Kurtis',
          image: '/images/collection-kurtis.jpg',
          href: '/shop/kurtis'
        },
        {
          slug: 'salwars',
          name: 'Salwars',
          image: '/images/collection-salwars.jpg',
          href: '/shop/salwars'
        },
        {
          slug: 'lehengas',
          name: 'Lehengas',
          image: '/images/collection-lehengas.jpg',
          href: '/shop/lehengas'
        },
        {
          slug: 'sarees',
          name: 'Sarees',
          image: '/images/collection-sarees.jpg',
          href: '/shop/sarees'
        },
        {
          slug: 'dupattas',
          name: 'Dupattas',
          image: '/images/collection-dupattas.jpg',
          href: '/shop/dupattas'
        }
      ]
    },
    sidebar: {
      title: 'FILTER COLLECTION',
      categoryTitle: 'CATEGORY',
      activeTag: 'ACTIVE FILTERS',
      viewAllText: 'Clear All Filters',
      viewAllHref: '/shop',
      inStockLabel: 'In Stock Only',
      vidhyasPicksLabel: "Vidhya's Picks Only"
    },
    concierge: {
      enabled: true,
      title: 'Need Bespoke Sizing or Styling?',
      subtitle: 'Connect with Vidhya on WhatsApp for custom measurements, fabric swatches, and heirloom bridal consultations.',
      link: 'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20need%20styling%20advice%20for%20the%20All%20Collections%20catalogue.'
    },
    seo: {
      metaTitle: 'Shop All Collections | Handcrafted Ethnic Luxury | Angelika Fashions',
      metaDescription: 'Explore the complete Angelika collection of handcrafted luxury ethnic wear, kurtis, sarees, lehengas, and dupattas.'
    },
    productsMode: 'database',
    products: []
  },
  'about-page': {
    hero: {
      badge: 'OUR STORY',
      title: 'Crafted with Intention, Worn with Pride',
      titleHighlight1: 'Intention',
      titleHighlight2: 'Pride',
      description: 'Angelika Fashions began with a simple belief: ethnic wear should make you feel like the best version of yourself - rooted, radiant, and entirely you.',
      backgroundImage: '/images/about-hero.jpg',
      primaryCtaText: 'Explore Collection',
      primaryCtaLink: '/shop',
      secondaryCtaText: "View Vidhya's Picks",
      secondaryCtaLink: '/vidhyas-picks',
      scrollText: 'Scroll to discover our journey →'
    },
    founderNote: {
      badge: 'A Note from Vidhya',
      title: 'Why Angelika Exists',
      image: '/images/vidhya-founder.jpg',
      quotePart1: '"I started Angelika"',
      quotePart2: "because I couldn't find",
      quotePart3: 'ethnic wear that felt like me."',
      quoteAuthor: '— Vidhya R., Founder',
      storyParagraphs: [
        "Growing up in a family where textiles were dinner table conversation, I learned early that fabric carries memory. My grandmother's Banarasi sarees, my mother's hand-block printed kurtas - each piece held a story.",
        "But when I started shopping for myself, I found a gap. Mass-market ethnic wear felt impersonal - synthetic fabrics, generic prints, sizing that never quite worked. The luxury boutiques were beautiful but intimidating, with price tags that didn't reflect the craft.",
        "Angelika was born from that gap. We work directly with artisan clusters - no middlemen, no markup games. I personally approve every design, every colorway, every stitch. When you wear Angelika, you're wearing something I'd proudly wear to my own cousin's wedding.",
        "This isn't just a brand. It's a promise: authentic craftsmanship, honest pricing, and a personal relationship with every woman who chooses us. Welcome to the family."
      ],
      ctaText: 'Chat with Vidhya',
      ctaLink: 'https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya'
    },
    values: {
      badge: 'OUR VALUES',
      title: 'What We Stand For',
      items: [
        {
          icon: 'shield',
          title: 'Authentic Craftsmanship',
          description: 'Every piece is sourced directly from artisan clusters across India - Banaras, Chanderi, Jaipur, and beyond. We honor generations of handloom weaving, block printing, and embroidery traditions.'
        },
        {
          icon: 'heart',
          title: 'Personal Curation',
          description: 'Vidhya personally selects every design, fabric, and color. No mass-produced trends - only pieces she would wear herself and gift to the women in her life.'
        },
        {
          icon: 'clock',
          title: 'Timeless Over Trendy',
          description: 'We create heirlooms, not fast fashion. Our silhouettes transcend seasons - a Banarasi saree today will be just as beautiful twenty years from now.'
        },
        {
          icon: 'users',
          title: 'Community First',
          description: 'Every purchase supports artisan livelihoods. We work on fair-trade principles, ensuring craftspeople receive recognition and fair compensation for their mastery.'
        }
      ]
    },
    journey: {
      badge: 'OUR JOURNEY',
      title: 'Milestones Along the Way',
      milestones: [
        { year: '2019', title: 'The Beginning', description: 'Vidhya starts curating ethnic wear for friends and family from her living room in Bangalore.', icon: '🏠' },
        { year: '2020', title: 'First Pop-Up', description: 'First physical pop-up at a Bangalore boutique - 200 pieces sold in 3 days.', icon: '🛍️' },
        { year: '2021', title: 'Artisan Partnerships', description: 'Direct partnerships established with 12 weaving clusters across Banaras, Chanderi, and Maheshwar.', icon: '🤝' },
        { year: '2022', title: 'Online Launch', description: 'Angelika Fashions website goes live. First order shipped to Chennai within 4 hours.', icon: '💻' },
        { year: '2023', title: "Vidhya's Picks", description: 'Monthly curated edit launches - personal styling notes from Vidhya for each piece.', icon: '✨' },
        { year: '2024', title: '10,000+ Customers', description: 'Community grows to 10,000+ women across India and 15 countries. Angelika Circle loyalty program launches.', icon: '👑' },
        { year: '2025', title: 'Flagship Studio', description: 'First experience studio opens in Indiranagar, Bangalore - by appointment only.', icon: '🏪' },
        { year: '2026', title: 'Today', description: 'Continuing the journey - new collections, deeper artisan relationships, and more ways to serve our community.', icon: '🌟' }
      ]
    },
    team: {
      badge: 'MEET THE TEAM',
      title: 'The People Behind Angelika',
      members: [
        { name: 'Vidhya R.', role: 'Founder & Creative Director', bio: 'Former textile designer turned entrepreneur. Believes every woman deserves to feel like royalty in her ethnic wear.', image: '/images/team-vidhya.jpg' },
        { name: 'Priya S.', role: 'Head of Artisan Relations', bio: 'Travels to weaving villages monthly. Speaks 4 languages. Ensures every artisan feels valued and heard.', image: '/images/team-priya.jpg' },
        { name: 'Meera K.', role: 'Customer Experience Lead', bio: 'Knows 500+ customers by name. Your styling questions, size doubts, gift dilemmas - she solves them all.', image: '/images/team-meera.jpg' },
        { name: 'Arjun M.', role: 'Operations & Logistics', bio: 'Makes sure your order reaches you before the occasion. 99.2% on-time delivery rate. Obsessed with packaging.', image: '/images/team-arjun.jpg' }
      ]
    },
    artisanSpotlight: {
      badge: 'ARTISAN STORIES',
      title: 'Hands That Create Magic',
      image: '/images/artisan-workshop.jpg',
      paragraphs: [
        "Behind every Angelika piece are hands that have inherited generations of knowledge. In the narrow lanes of Banaras, master weavers like Ramesh-ji spend 14 days on a single saree, each thread placed with intention.",
        "In Chanderi, Meera-behen leads a collective of 40 women who hand-block print our cotton kurtis using natural dyes - a skill passed from mother to daughter for three centuries.",
        "These aren't suppliers. They're partners. We visit their workshops, share chai with their families, and celebrate their festivals. When you wear Angelika, you carry their stories, their patience, and their pride."
      ],
      ctaText: 'Read More Artisan Stories',
      ctaLink: '/artisan-stories'
    },
    bottomCta: {
      title: 'Ready to Find Your Perfect Piece?',
      description: "Whether it's for a wedding, a festival, or simply because you deserve beauty in your everyday - we're here to help you discover it.",
      primaryCtaText: 'Shop Collection',
      primaryCtaLink: '/shop',
      secondaryCtaText: 'Find My Size',
      secondaryCtaLink: '/size-finder',
      whatsappText: 'Chat with Vidhya',
      whatsappLink: 'https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I%20need%20styling%20help'
    },
    seo: {
      metaTitle: 'Our Story | Angelika Fashions',
      metaDescription: 'Discover the story behind Angelika Fashions - founded by Vidhya, bringing premium ethnic wear with a personal touch.'
    }
  },
  'shipping-page': {
    header: {
      eyebrow: 'COMPLIMENTARY & EXPRESS COURIER',
      title: 'Shipping & Delivery Policy',
      description: 'Every Angelika creation is handcrafted with reverence by master weavers and individually inspected before dispatch. Here is how we ensure seamless, insured delivery to your doorstep.'
    },
    highlights: [
      {
        label: 'PAN-INDIA SHIPPING',
        value: 'Free on ₹999+',
        subtext: 'Standard ₹99 under ₹999'
      },
      {
        label: 'DISPATCH TIME',
        value: '24 – 48 Hours',
        subtext: 'Ready-to-wear collections'
      },
      {
        label: 'GLOBAL COURIER',
        value: 'Worldwide Delivery',
        subtext: 'Express via DHL / FedEx'
      }
    ],
    sections: [
      {
        id: 'domestic-timelines',
        title: '1. Domestic Shipping Timelines (India)',
        content: "We partner with India's premier air express carriers (Bluedart, Delhivery, and DTDC) to deliver your heirlooms securely:",
        tierBoxes: [
          {
            title: 'METRO CITIES (TIER 1)',
            description: 'Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, Kolkata: 2 to 4 business days.'
          },
          {
            title: 'NON-METRO & REGIONAL TOWNS',
            description: 'Tier 2 & Tier 3 locations across India: 4 to 7 business days.'
          }
        ]
      },
      {
        id: 'made-to-order',
        title: '2. Made-to-Order & Bridal Trousseau Orders',
        content: "Custom-tailored ensembles, custom blouses, and bridal lehengas require bespoke hand-embroidery and zari finishing. These pieces have an atelier creation window of 10 to 14 business days before dispatch. You will receive progress photographs and status updates via WhatsApp from designer Vidhya's concierge team."
      },
      {
        id: 'cod-guidelines',
        title: '3. Cash on Delivery (COD) Guidelines',
        content: 'Cash on Delivery is available across 19,000+ Indian pin codes for orders up to ₹10,000. For security and authentic verification, our automated concierge will send an OTP confirmation via SMS/WhatsApp prior to warehouse dispatch.'
      },
      {
        id: 'international-shipping',
        title: '4. International Worldwide Shipping',
        content: 'We ship to over 50 countries including the United States, United Kingdom, Canada, UAE, Singapore, and Australia. International orders are dispatched via DHL Express or FedEx International Priority (typically 5 to 8 business days). Customs duties or local import taxes, if applicable in your jurisdiction, are determined by destination customs authorities.'
      },
      {
        id: 'packaging-insurance',
        title: '5. Tamper-Proof Luxury Packaging & Insurance',
        content: 'Every garment is packed in breathable cotton muslin dust bags, encased in rigid magnetic keepsake boxes with branded tamper-evident security tape. All parcels are 100% insured until signed by you upon delivery.'
      }
    ],
    concierge: {
      eyebrow: 'NEED URGENT EVENT DELIVERY?',
      title: "Speak with Vidhya's Concierge for Same-Day / Express Priority",
      description: 'If you need your ensemble delivered urgently for a wedding, pooja, or festive gathering, reach out directly and we will coordinate priority flight dispatch.',
      whatsappText: 'WhatsApp Priority Dispatch Desk',
      whatsappLink: 'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20have%20an%20urgent%20event%20shipping%20query.',
      trackOrderText: 'Track Your Live Order',
      trackOrderLink: '/track-order'
    },
    seo: {
      metaTitle: 'Shipping & Delivery Policy | Angelika Fashions',
      metaDescription: 'Learn about our domestic and international shipping policies, dispatch timelines, and complimentary delivery for handcrafted luxury ethnic wear.'
    }
  },
  'returns-page': {
    header: {
      eyebrow: '7-DAY COMPLIMENTARY ASSURANCE',
      title: 'Returns & Size Exchanges',
      description: "We want you to feel extraordinary in every Angelika ensemble. If the fit isn't immaculate, our atelier provides seamless doorstep size exchanges and easy returns."
    },
    process: {
      title: 'How Our 3-Step Size Exchange Works',
      steps: [
        {
          stepNumber: 1,
          title: 'Initiate in 30 Seconds',
          description: "Connect with Vidhya's WhatsApp Concierge or visit your Account orders page within 7 days of delivery."
        },
        {
          stepNumber: 2,
          title: 'Complimentary Pickup',
          description: 'Our courier will collect the unworn garment from your doorstep with original tags and dust bag intact.'
        },
        {
          stepNumber: 3,
          title: 'Fresh Size Dispatched',
          description: 'Your replacement size or custom tailored fit is dispatched via express courier with zero additional shipping charges.'
        }
      ]
    },
    sections: [
      {
        id: 'exchange-window',
        title: '1. 7-Day Exchange Window',
        content: 'You may initiate a size exchange or return within 7 calendar days from the date of confirmed delivery. To be eligible, the piece must be in its original pristine condition, unworn, unwashed, unaltered, and accompanied by the original Silk Mark / brand tags and cotton dust bag.'
      },
      {
        id: 'custom-stitching',
        title: '2. Custom Stitching & Blouse Alterations',
        content: 'If you ordered custom-stitched blouses or bespoke waist adjustments and require fine-tuning, our master tailors provide one round of complimentary alterations. Simply share your updated measurements or photographs with Vidhya on WhatsApp.'
      },
      {
        id: 'refund-options',
        title: '3. Refund Options',
        content: 'If you prefer a return rather than a size exchange:',
        bulletPoints: [
          'Atelier Store Credit (Recommended): Receive 100% of your order value as lifelong store credit plus a bonus 10% styling credit for your next order.',
          'Original Payment Source: Refunds to original debit/credit cards or net banking are processed within 3 to 5 business days following quality verification at our atelier.'
        ]
      },
      {
        id: 'non-returnable',
        title: '4. Non-Returnable Items',
        content: 'Due to hygiene considerations and authentic artisan uniqueness, customized bridal couture made strictly to custom body measurements and final archive sale items marked as "Final Sale" cannot be refunded, though size adjustments can still be arranged.'
      }
    ],
    concierge: {
      eyebrow: 'READY TO EXCHANGE A SIZE?',
      title: 'Our Concierge Team Handles the Whole Process For You',
      description: "You don't need to fill out complex forms. Just drop a message with your Order ID and preferred size.",
      whatsappText: 'Start Size Exchange on WhatsApp',
      whatsappLink: 'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20like%20to%20request%20a%20size%20exchange%20for%20my%20order.',
      secondaryCtaText: 'Use Interactive Size Finder',
      secondaryCtaLink: '/size-finder'
    },
    seo: {
      metaTitle: 'Returns & Size Exchanges | Angelika Fashions',
      metaDescription: 'Our 7-day complimentary size exchange and return policy for handcrafted Indian luxury ethnic wear.'
    }
  },
  'size-finder-page': {
    header: {
      badge: '',
      title: 'Discover Your Signature Drape',
      description: 'Handcrafted luxury ethnic wear should never feel constrained. Our interactive studio calculates your tailored proportion based on your posture, height, and preferred ease.'
    },
    studio: {
      step1Title: 'Which Ensemble Are You Styling?',
      step1Subtitle: 'Select a category to calibrate drape measurements',
      step2Title: 'Calibrate Your Fit Method'
    },
    silhouettes: [
      {
        id: 'kurtis',
        name: 'Kurtis & Tunics',
        tagline: 'Straight cuts, A-line & kalidar everyday luxury',
        image: '/images/cat-kurtis.jpg',
        defaultLengthInches: 43,
        sizes: [
          { size: 'XS', bust: 32, waist: 26, hips: 36, length: 42, shoulder: 14.0, label: 'XS (Size 32)' },
          { size: 'S', bust: 34, waist: 28, hips: 38, length: 42, shoulder: 14.5, label: 'S (Size 34)' },
          { size: 'M', bust: 36, waist: 30, hips: 40, length: 43, shoulder: 15.0, label: 'M (Size 36)' },
          { size: 'L', bust: 38, waist: 32, hips: 42, length: 43, shoulder: 15.5, label: 'L (Size 38)' },
          { size: 'XL', bust: 40, waist: 34, hips: 44, length: 44, shoulder: 16.0, label: 'XL (Size 40)' },
          { size: 'XXL', bust: 42, waist: 36, hips: 46, length: 44, shoulder: 16.5, label: 'XXL (Size 42)' },
          { size: '3XL', bust: 44, waist: 38, hips: 48, length: 45, shoulder: 17.0, label: '3XL (Size 44)' }
        ]
      },
      {
        id: 'salwars',
        name: 'Salwar & Palazzo Suits',
        tagline: 'Three-piece sets with relaxed palazzo or churidar',
        image: '/images/cat-salwars.jpg',
        defaultLengthInches: 43,
        sizes: [
          { size: 'XS', bust: 34, waist: 28, hips: 38, length: 42, shoulder: 14.0, label: 'XS (Size 34)' },
          { size: 'S', bust: 36, waist: 30, hips: 40, length: 42, shoulder: 14.5, label: 'S (Size 36)' },
          { size: 'M', bust: 38, waist: 32, hips: 42, length: 43, shoulder: 15.0, label: 'M (Size 38)' },
          { size: 'L', bust: 40, waist: 34, hips: 44, length: 43, shoulder: 15.5, label: 'L (Size 40)' },
          { size: 'XL', bust: 42, waist: 36, hips: 46, length: 44, shoulder: 16.0, label: 'XL (Size 42)' },
          { size: 'XXL', bust: 44, waist: 38, hips: 48, length: 44, shoulder: 16.5, label: 'XXL (Size 44)' }
        ]
      },
      {
        id: 'lehengas',
        name: 'Bridal & Festive Lehengas',
        tagline: 'High-waisted flared skirt with tailored padded choli',
        image: '/images/cat-lehengas.jpg',
        defaultLengthInches: 43,
        sizes: [
          { size: 'XS', bust: 32, waist: 26, hips: 36, length: 42, shoulder: 13.5, label: 'XS (Waist 26")' },
          { size: 'S', bust: 34, waist: 28, hips: 38, length: 42, shoulder: 14.0, label: 'S (Waist 28")' },
          { size: 'M', bust: 36, waist: 30, hips: 40, length: 43, shoulder: 14.5, label: 'M (Waist 30")' },
          { size: 'L', bust: 38, waist: 32, hips: 42, length: 43, shoulder: 15.0, label: 'L (Waist 32")' },
          { size: 'XL', bust: 40, waist: 34, hips: 44, length: 44, shoulder: 15.5, label: 'XL (Waist 34")' },
          { size: 'XXL', bust: 42, waist: 36, hips: 46, length: 44, shoulder: 16.0, label: 'XXL (Waist 36")' }
        ]
      },
      {
        id: 'sarees',
        name: 'Sarees & Blouse Styling',
        tagline: '5.5m unstitched drape with customized silk choli',
        image: '/images/cat-sarees.jpg',
        defaultLengthInches: 216,
        isFreeSize: true,
        freeSizeNote: 'Sarees are standard 5.5m Free Size drape. Sizing applies to your tailored blouse stitching.',
        sizes: [
          { size: 'XS', bust: 32, waist: 26, hips: 36, length: 14, shoulder: 13.5, label: 'Blouse XS (32")' },
          { size: 'S', bust: 34, waist: 28, hips: 38, length: 14.5, shoulder: 14.0, label: 'Blouse S (34")' },
          { size: 'M', bust: 36, waist: 30, hips: 40, length: 15, shoulder: 14.5, label: 'Blouse M (36")' },
          { size: 'L', bust: 38, waist: 32, hips: 42, length: 15.5, shoulder: 15.0, label: 'Blouse L (38")' },
          { size: 'XL', bust: 40, waist: 34, hips: 44, length: 16, shoulder: 15.5, label: 'Blouse XL (40")' },
          { size: 'XXL', bust: 42, waist: 36, hips: 46, length: 16.5, shoulder: 16.0, label: 'Blouse XXL (42")' }
        ]
      },
      {
        id: 'dupattas',
        name: 'Artisanal Dupattas',
        tagline: 'Handwoven 2.5m pure silk & chanderi stoles',
        image: '/images/cat-dupattas.jpg',
        defaultLengthInches: 98,
        isFreeSize: true,
        freeSizeNote: 'Dupattas are universal Free Size (2.5 Meters x 1 Meter). No sizing required.',
        sizes: [
          { size: 'Free Size', bust: 0, waist: 0, hips: 0, length: 98, shoulder: 0, label: 'Universal 2.5m Drape' }
        ]
      }
    ],
    virtualCall: {
      badge: 'Complimentary Virtual Drape Call',
      description: 'Bridal or festive celebration coming up? Connect directly over a WhatsApp video call to see real drape movement and live fabric falls before confirming.',
      ctaText: 'Book 1-on-1 Consultation Call',
      whatsappLink: 'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20love%20to%20book%20a%20virtual%20drape%20consultation.'
    },
    guide: {
      title: "Designer Vidhya's Guide to Taking Flawless Body Measurements",
      principles: [
        {
          step: '01',
          title: 'Flexible Vinyl Tape',
          description: 'Avoid metal tapes. Use a soft tailor tape that hugs natural body contours without stretching.'
        },
        {
          step: '02',
          title: 'Proper Undergarments',
          description: 'Measure over the exact style of innerwear you plan to wear with your ethnic ensemble.'
        },
        {
          step: '03',
          title: 'One-Finger Slack',
          description: 'Keep one finger between the tape and body so the fabric drapes without uncomfortable pinching.'
        },
        {
          step: '04',
          title: 'Natural Posture',
          description: 'Stand naturally with arms relaxed at sides. Do not pull your belly in or hold breath.'
        }
      ],
      whatsappTitle: 'Want Our Master Drapers to Review Your Fit?',
      whatsappDescription: 'Send your measurements or a photo over WhatsApp. Designer Vidhya and our master tailors will confirm your exact size within 15 minutes.',
      whatsappButtonText: 'Verify Sizing on WhatsApp With Vidhya',
      whatsappLink: 'https://wa.me/919876543210?text=Hi%20Vidhya,%20can%20you%20review%20my%20measurements%20for%20an%20Angelika%20order?'
    },
    seo: {
      metaTitle: 'Size Finder & Couture Fit Studio | Angelika Fashions',
      metaDescription: 'Find your perfect size for handcrafted Indian luxury ethnic wear - sarees, lehengas, kurtis, salwars, and dupattas with personalized fit recommendations.'
    }
  },
  'size-guide-page': {
    header: {
      eyebrow: 'TAILORED FIT & MEASUREMENT CHARTS',
      title: 'Garment Size Guide',
      description: 'Every body is unique. Angelika silhouettes are designed with generous 2-inch side seams for easy custom alterations, ensuring a bespoke drape that flatters your form.'
    },
    promoBanner: {
      eyebrow: 'AI SILHOUETTE ASSISTANT',
      title: 'Want instant recommendations based on your height and fit preference?',
      description: 'Answer 3 simple questions to calculate your exact Angelika sizing.',
      buttonText: 'Launch Interactive Size Finder →',
      buttonLink: '/size-finder'
    },
    kurtis: {
      title: 'Standard Ready-to-Wear Kurti Measurements (Inches)',
      subtitle: 'Measurements are garment dimensions',
      rows: [
        { size: 'XS (34)', bust: '34"', waist: '28"', hip: '38"', shoulder: '14.0"', kurtiLength: '44"' },
        { size: 'S (36)', bust: '36"', waist: '30"', hip: '40"', shoulder: '14.5"', kurtiLength: '45"' },
        { size: 'M (38)', bust: '38"', waist: '32"', hip: '42"', shoulder: '15.0"', kurtiLength: '45"' },
        { size: 'L (40)', bust: '40"', waist: '34"', hip: '44"', shoulder: '15.5"', kurtiLength: '46"' },
        { size: 'XL (42)', bust: '42"', waist: '36"', hip: '46"', shoulder: '16.0"', kurtiLength: '46"' },
        { size: 'XXL (44)', bust: '44"', waist: '38"', hip: '48"', shoulder: '16.5"', kurtiLength: '47"' },
        { size: '3XL (46)', bust: '46"', waist: '40"', hip: '50"', shoulder: '17.0"', kurtiLength: '47"' }
      ]
    },
    lehengas: {
      title: 'Bridal & Festive Lehenga Skirt Measurements (Inches)',
      subtitle: 'With drawstring waist + zipper closure',
      rows: [
        { size: 'XS (26)', waist: '26"', hip: '36"', skirtLength: '42"', flare: '4.5 Meters' },
        { size: 'S (28)', waist: '28"', hip: '38"', skirtLength: '42"', flare: '4.5 Meters' },
        { size: 'M (30)', waist: '30"', hip: '40"', skirtLength: '43"', flare: '5.0 Meters' },
        { size: 'L (32)', waist: '32"', hip: '42"', skirtLength: '43"', flare: '5.0 Meters' },
        { size: 'XL (34)', waist: '34"', hip: '44"', skirtLength: '44"', flare: '5.5 Meters' },
        { size: 'XXL (36)', waist: '36"', hip: '46"', skirtLength: '44"', flare: '5.5 Meters' }
      ]
    },
    blouses: {
      title: 'Bespoke Blouse Stitching & Measurements',
      description: 'All sarees and lehengas include unstitched pure silk blouse fabrics with zari borders. If you select our custom stitching service, our master drapers will tailor your choli according to your exact bust, underbust, armhole, and front/back neckline depth.',
      paddingNote: 'Non-padded, soft contour padded, or double padded with concealed side/back hook placket.',
      seamNote: '2.5 inches of extra fabric margin included inside every blouse for future alterations.'
    },
    howToMeasure: {
      title: 'How to Take Accurate Body Measurements',
      steps: [
        {
          title: '1. Bust / Chest',
          description: 'Measure around the fullest part of your bust, keeping the measuring tape parallel to the floor without pulling tight.'
        },
        {
          title: '2. Natural Waist',
          description: 'Measure around the narrowest part of your waistline, roughly 1 to 2 inches above your navel.'
        },
        {
          title: '3. Hip Circumference',
          description: 'Stand with feet together and measure around the fullest curve of your hips and buttocks.'
        }
      ]
    },
    stylingDesk: {
      eyebrow: 'BETWEEN SIZES OR NEED CUSTOM DRAPE GUIDANCE?',
      title: "Designer Vidhya's Personal Styling Desk",
      description: 'Share your measurements with Vidhya on WhatsApp for custom tailored fit guidance before your order is cut.',
      buttonText: 'Consult Vidhya on WhatsApp →',
      whatsappLink: 'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20like%20sizing%20guidance%20for%20my%20order.'
    },
    seo: {
      metaTitle: 'Garment Size Guide & Measurement Charts | Angelika Fashions',
      metaDescription: 'Complete sizing guide, bust, waist, and hip measurements for luxury handcrafted kurtis, lehengas, and custom blouses.'
    }
  },
  'faq-page': {
    header: {
      badge: 'HELP CENTER',
      title: 'Frequently Asked Questions',
      description: "Quick answers to common questions. Can't find what you need? Chat with Vidhya or Meera on WhatsApp - they respond within hours.",
    },
    searchPlaceholder: 'Search questions...',
    categories: [
      {
        id: 'orders',
        label: 'Orders & Payments',
        icon: '📦',
        items: [
          {
            id: 'ord-1',
            q: 'What payment methods do you accept?',
            a: 'We accept all major credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, wallets, and Cash on Delivery (up to ₹5,000). For international orders, we accept cards via Stripe and PayPal. EMI options available on orders above ₹3,000.',
          },
          {
            id: 'ord-2',
            q: 'Is Cash on Delivery available everywhere?',
            a: 'COD is available in 25,000+ pincodes across India for orders up to ₹5,000. A COD fee of ₹50 applies. Check availability at checkout by entering your pincode.',
          },
          {
            id: 'ord-3',
            q: 'Can I modify or cancel my order after placing it?',
            a: "Yes, within 2 hours of placing the order. After that, it may have already been processed for shipping. Contact us immediately via WhatsApp - we'll do our best to help.",
          },
          {
            id: 'ord-4',
            q: 'Do you offer gift wrapping?',
            a: 'Yes! Gift wrapping is complimentary on all orders. Add a personal note at checkout. For special occasions, we offer premium gift boxes (₹199) with tissue paper, ribbon, and a handwritten card.',
          },
          {
            id: 'ord-5',
            q: 'My payment failed but money was deducted. What now?',
            a: "This is usually a temporary bank hold that releases within 24-48 hours. If not resolved in 2 days, contact us with your order ID and we'll escalate with our payment partner.",
          },
        ],
      },
      {
        id: 'shipping',
        label: 'Shipping & Delivery',
        icon: '🚚',
        items: [
          {
            id: 'ship-1',
            q: 'What are your shipping charges?',
            a: "Free shipping on orders ₹2,999+ within India. Below that, it's ₹99. International shipping starts at $15, free on orders $300+. Express delivery (1-2 days) available in major metros for ₹199.",
          },
          {
            id: 'ship-2',
            q: 'How long does delivery take?',
            a: 'India: 2-5 business days (1-2 days in major metros). International: 5-10 business days via DHL Express. Custom/stitch-to-order items take 2-3 weeks - timeline shown on product page.',
          },
          {
            id: 'ship-3',
            q: 'Can I change my delivery address after ordering?',
            a: "Yes, if the order hasn't shipped yet. Contact us immediately on WhatsApp with your order ID and new address. Once shipped, we can't redirect but you can reschedule delivery with the courier.",
          },
          {
            id: 'ship-4',
            q: 'Do you ship to PO Boxes / APO addresses?',
            a: 'We cannot ship to PO Boxes or APO/FPO addresses as our courier partners require a physical address with a contact number for delivery.',
          },
          {
            id: 'ship-5',
            q: "What if I'm not home during delivery?",
            a: "Our courier partners make 2 delivery attempts. If both fail, the package goes to the local hub for 5 days pickup. You'll receive SMS/email with hub details. Contact us to reschedule.",
          },
        ],
      },
      {
        id: 'returns',
        label: 'Returns & Exchanges',
        icon: '↩️',
        items: [
          {
            id: 'ret-1',
            q: 'What is your return policy?',
            a: '15-day hassle-free returns for unworn items with original tags and packaging. Free pickup in India. Refund to original payment method within 5-7 days of receiving the return.',
          },
          {
            id: 'ret-2',
            q: 'Are sale items returnable?',
            a: 'Items at 50%+ off (marked "Final Sale") are non-returnable. Other sale items (under 50% off) follow our standard 15-day return policy.',
          },
          {
            id: 'ret-3',
            q: 'How do I initiate a return?',
            a: "Go to your Account → Orders → Select order → Click \"Return\". Choose items, reason, and pickup date. Our courier will collect within 48 hours. Or WhatsApp us - we'll handle it.",
          },
          {
            id: 'ret-4',
            q: 'What about exchanges?',
            a: "Exchanges for size/color are free and prioritized. Select \"Exchange\" during return initiation. We'll ship the new item as soon as the return is scanned by the courier.",
          },
          {
            id: 'ret-5',
            q: 'I received a damaged/incorrect item. What should I do?',
            a: "We're so sorry! Please WhatsApp us a photo within 24 hours of delivery. We'll arrange immediate replacement (no return needed for damaged items) and a goodwill gesture.",
          },
        ],
      },
      {
        id: 'sizing',
        label: 'Sizing & Fit',
        icon: '📏',
        items: [
          {
            id: 'size-1',
            q: 'How do I find my size?',
            a: 'Use our Size Finder tool - enter your bust, waist, hips measurements and get personalized recommendations for each category. Or chat with Meera on WhatsApp for a guided session.',
          },
          {
            id: 'size-2',
            q: 'Do your sizes run true to size?',
            a: 'Our sizing follows standard Indian measurements. However, handcrafted pieces may have 0.5-1" variation. The Size Finder accounts for this. When in doubt, size up for comfort.',
          },
          {
            id: 'size-3',
            q: 'Can I get a custom size?',
            a: 'Yes! We offer made-to-measure on most kurtis, salwars, and lehengas. Additional ₹500-1,500 depending on complexity. 2-3 week lead time. Book a consultation via WhatsApp.',
          },
          {
            id: 'size-4',
            q: "What if the size doesn't fit?",
            a: "Free size exchanges within 15 days. We'll ship the new size as soon as the return is picked up. No questions asked - we want you to love the fit.",
          },
          {
            id: 'size-5',
            q: 'Do you have plus sizes?',
            a: "Yes, up to 3XL (bust 44\") in most categories. We're expanding to 4XL. Use the Size Finder - it works for all sizes. Custom sizing available beyond 3XL.",
          },
        ],
      },
      {
        id: 'products',
        label: 'Products & Care',
        icon: '🧵',
        items: [
          {
            id: 'prod-1',
            q: 'Are your fabrics authentic?',
            a: 'Absolutely. We source directly from artisan clusters: Banarasi silk from Varanasi, Chanderi from Madhya Pradesh, Bandhani from Gujarat/Kutch, block prints from Rajasthan. Each piece comes with an artisan story card.',
          },
          {
            id: 'prod-2',
            q: 'How do I care for silk/embroidered pieces?',
            a: 'Dry clean only for silk, zari, and heavy embroidery. Cotton/linen: gentle machine wash cold, line dry in shade. Avoid direct sunlight for colors. Care label inside each garment.',
          },
          {
            id: 'prod-3',
            q: 'Will the color match the website photos?',
            a: 'We photograph in natural light with color-calibrated equipment. However, screen calibration varies. For critical color matching (weddings), order a fabric swatch (₹99, refundable on purchase).',
          },
          {
            id: 'prod-4',
            q: 'Are pieces exactly as shown?',
            a: "Handcrafted pieces have slight variations - that's the beauty of artisan work. Motif placement, color intensity, and embroidery density may vary slightly. No two pieces are identical.",
          },
          {
            id: 'prod-5',
            q: 'Do you restock sold-out items?',
            a: "Most designs are limited edition. Popular basics (solid kurtis, plain dupattas) are restocked. Sign up for \"Notify Me\" on the product page. Vidhya's Notes subscribers get early restock alerts.",
          },
        ],
      },
      {
        id: 'account',
        label: 'Account & Loyalty',
        icon: '👤',
        items: [
          {
            id: 'acc-1',
            q: 'How do I create an account?',
            a: 'Click "Account" → "Sign Up". Use email or phone. No password needed - we send a magic link/OTP. Accounts unlock: order tracking, wishlist, size profile, loyalty points, early sale access.',
          },
          {
            id: 'acc-2',
            q: 'What is Angelika Circle loyalty program?',
            a: 'Free to join. Earn 5 points per ₹100 spent. Tiers: Silver (0 pts), Gold (1,000 pts), Platinum (5,000 pts). Benefits: cashback, free shipping, early access, birthday gifts, personal styling. Points never expire.',
          },
          {
            id: 'acc-3',
            q: 'How do I redeem loyalty points?',
            a: 'Go to Account → Loyalty. Redeem 500 pts = ₹100 off, 1,000 pts = ₹250 off, 2,500 pts = free express shipping (1 year), 5,000 pts = personal styling session with Vidhya.',
          },
          {
            id: 'acc-4',
            q: 'Can I delete my account?',
            a: 'Yes, in Account → Profile → Danger Zone. This permanently removes your data. Order history is retained for legal compliance but anonymized. Contact us if you need assistance.',
          },
        ],
      },
      {
        id: 'custom',
        label: 'Custom & Wholesale',
        icon: '✨',
        items: [
          {
            id: 'cust-1',
            q: 'Do you offer custom designs?',
            a: 'Yes! Two options: Semi-custom (color/fabric changes on existing designs, +₹500-2,000, 2 weeks) and Fully custom (from your sketch/inspiration, +₹3,000+, 3-4 weeks). Book a WhatsApp consultation.',
          },
          {
            id: 'cust-2',
            q: 'Can you replicate a design I saw elsewhere?',
            a: "We can create inspired-by pieces but don't copy other designers' work. Share your inspiration photos - Vidhya will design something unique incorporating those elements.",
          },
          {
            id: 'cust-3',
            q: 'Do you accept wholesale/bulk orders?',
            a: 'Yes, for boutiques, stylists, and corporate gifting. Minimum 10 pieces. 20-30% off MRP depending on volume. 4-6 week lead time. Email wholesale@angelikafashions.com with requirements.',
          },
          {
            id: 'cust-4',
            q: 'Can I order matching outfits for a group?',
            a: 'Absolutely! Popular for bridesmaid lehengas, family function coordination. We ensure color consistency across sizes. Group discount: 10% off 5+ pieces, 15% off 10+. WhatsApp us to coordinate.',
          },
        ],
      },
    ],
    stillNeedHelp: {
      title: 'Still Need Help?',
      description: "Couldn't find your answer? Our team is here for you. No bots, no tickets - just real people who care.",
      whatsappButtonText: 'WhatsApp Us',
      whatsappLink: 'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20have%20a%20question',
      emailButtonText: 'Email Us',
      emailLink: 'mailto:hello@angelikafashions.com',
      contactButtonText: 'Contact Form',
      contactLink: '/contact',
    },
    seo: {
      metaTitle: 'FAQ & Help Center | Angelika Fashions',
      metaDescription: 'Find answers to common questions about orders, payments, shipping, returns, custom sizing, artisan fabrics, and bulk orders at Angelika Fashions.',
    },
  },
  'contact-page': {
    header: {
      badge: 'GET IN TOUCH',
      title: "We'd Love to Hear from You",
      description:
        'Whether you need styling advice, have a question about an order, or just want to say hello - Vidhya, Meera, and the team are here for you. No bots, no ticket numbers, just real people.',
    },
    contactOptions: [
      {
        id: 'studio',
        icon: 'studio',
        title: 'Visit Our Studio',
        description: 'By appointment only',
        detail: 'Indiranagar, Bangalore\nMon-Sat: 11 AM - 7 PM',
        cta: 'Book Appointment',
        href: '/book-appointment',
        isWhatsApp: false,
      },
      {
        id: 'email',
        icon: 'email',
        title: 'Email Us',
        description: 'Response within 24 hours',
        detail: 'hello@angelikafashions.com\nstyling@angelikafashions.com',
        cta: 'Write Email',
        href: 'mailto:hello@angelikafashions.com',
        isWhatsApp: false,
      },
      {
        id: 'whatsapp',
        icon: 'whatsapp',
        title: 'Call / WhatsApp',
        description: 'Mon-Sat: 10 AM - 8 PM',
        detail: '+91 98765 43210\n+91 87654 32109',
        cta: 'Chat on WhatsApp',
        href: 'https://wa.me/919876543210',
        isWhatsApp: true,
      },
    ],
    form: {
      title: 'Send Us a Message',
      description: 'We typically respond within 4 hours during business hours.',
      subjects: [
        { value: 'styling', label: 'Styling Advice' },
        { value: 'sizing', label: 'Size & Fit Guidance' },
        { value: 'order', label: 'Order Inquiry' },
        { value: 'return', label: 'Returns & Exchange' },
        { value: 'wholesale', label: 'Wholesale / Bulk Orders' },
        { value: 'artisan', label: 'Artisan Collaboration' },
        { value: 'media', label: 'Press & Media' },
        { value: 'career', label: 'Careers' },
        { value: 'other', label: 'Other' },
      ],
      newsletterLabel: "Subscribe to Vidhya's monthly style notes & early access invites",
      submitButtonText: 'Send Message',
      successTitle: 'Message Sent!',
      successDescription: "Thank you for reaching out. We'll get back to you within 24 hours.",
    },
    quickAnswers: {
      title: 'Quick Answers',
      faqs: [
        {
          q: 'How can I get styling advice for an upcoming event?',
          a: "You can book a free virtual styling session with Vidhya or Meera via WhatsApp. Share your event details, photos of the venue/outfit inspiration, and we'll curate 3-5 complete looks for you within 24 hours.",
        },
        {
          q: 'Do you ship internationally?',
          a: 'Yes, we ship to 25+ countries via DHL Express. International orders typically arrive in 5-7 business days. Duties and taxes are calculated at checkout. Free shipping on orders above $300 USD.',
        },
        {
          q: 'What is your return policy?',
          a: '15-day hassle-free returns for unworn items with original tags. Free pickup in India. For international returns, we provide a prepaid label and refund minus a $15 restocking fee. Custom/stitch-to-order items are non-returnable.',
        },
      ],
      viewAllText: 'View All FAQs (6 questions)',
      viewAllLink: '/faq',
    },
    socialProof: {
      title: 'Why Customers Love Us',
      reviews: [
        {
          text: "Meera helped me find the perfect lehenga for my sister's wedding over WhatsApp. Felt like shopping with a friend.",
          author: 'Priya K., Delhi',
        },
        {
          text: 'The styling session was a game-changer. Vidhya curated 3 looks for my engagement - I wore one, gifted the others!',
          author: 'Ananya S., Mumbai',
        },
        {
          text: 'Return process was seamless. Pickup arranged next day, refund in 48 hours. No questions asked.',
          author: 'Rashmi T., Bangalore',
        },
      ],
    },
    newsletter: {
      title: "Join Vidhya's Inner Circle",
      description:
        'Monthly style edits, early access to new collections, artisan stories, and exclusive offers. No spam, just love. 15,000+ women already subscribed.',
      buttonText: 'Subscribe',
      placeholder: 'Enter your email',
    },
    seo: {
      metaTitle: 'Contact Us | Concierge & Styling Studio | Angelika Fashions',
      metaDescription:
        'Get in touch with Angelika Fashions - styling advice, order support, wholesale inquiries, or just say hello. Real people, real responses.',
    },
  },
  'wholesale-page': {
    header: {
      eyebrow: 'GLOBAL BOUTIQUE & RETAIL PARTNERSHIPS',
      title: 'Wholesale & B2B Inquiries',
      description:
        'Partner with Angelika Fashions to curate handcrafted Indian haute couture, pure silk handloom sarees, and bridal lehengas for your luxury boutique, overseas salon, or festive corporate curation.',
    },
    benefits: [
      {
        icon: '⚜',
        title: 'Artisan Direct Pricing',
        description: 'Wholesale tiers with direct weaving loom margins, eliminating intermediaries.',
      },
      {
        icon: '✈',
        title: 'Worldwide Doorstep Delivery',
        description:
          'Express air cargo with full customs clearance and insured tracking across US, UK, UAE & Australia.',
      },
      {
        icon: '✂',
        title: 'Custom Label & Sizing',
        description:
          'Bespoke color palettes, customized blouse patterns, and private label tags for retail partners.',
      },
    ],
    form: {
      title: 'Wholesale Partner Registration',
      moqNote: 'MOQ starts from 15 pieces per order across assorted styles.',
      submitButtonText: 'Submit Wholesale Request',
      tiers: [
        { value: '15 – 30 pieces', label: '15 – 30 pieces (Starter Boutique Tier)' },
        { value: '30 – 75 pieces', label: '30 – 75 pieces (Seasonal Collection Tier)' },
        { value: '75+ pieces', label: '75+ pieces (Full Retail & Salon Tier)' },
      ],
      successTitle: 'Thank You for Your Wholesale Inquiry',
      successDescription:
        "Our wholesale director and designer Vidhya's team will review your boutique requirements and reach out with our seasonal lookbook and B2B line sheets within 24 hours.",
      whatsappDeskButtonText: 'Expedite Inquiry via WhatsApp B2B Desk →',
      whatsappDeskLink: 'https://wa.me/919876543210',
    },
    footerSupport: {
      prefixText: 'Prefer direct communication?',
      linkText: 'Connect directly with our B2B Director on WhatsApp →',
      whatsappLink:
        'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20like%20to%20discuss%20a%20wholesale%20partnership.',
    },
    seo: {
      metaTitle: 'Wholesale & B2B Inquiries | Boutique Partnerships | Angelika Fashions',
      metaDescription:
        'Partner with Angelika Fashions for wholesale handcrafted Indian couture, silk sarees, and bridal lehengas with direct loom pricing and worldwide delivery.',
    },
  },
  'designer-vidhya-page': {
    header: {
      breadcrumbHome: 'Home',
      breadcrumbAbout: 'About Us',
      breadcrumbCurrent: 'Meet Designer Vidhya',
      eyebrow: 'THE CREATIVE SOUL BEHIND ANGELIKA',
      title: 'Meet Designer Vidhya',
      quote:
        '"Ethnic wear shouldn\'t just be worn for an occasion; it should feel like an heirloom that holds the memory of the celebration and honors the hands that wove it."',
    },
    story: {
      eyebrow: 'HERITAGE & ATELIER PHILOSOPHY',
      title: 'Reinventing Handloom Couture for the Contemporary Woman',
      paragraphs: [
        'Trained in the historic weaving heartlands of Varanasi, Chanderi, and Kanchipuram, Vidhya established Angelika Fashions to bridge the generational divide between timeless Indian textiles and effortless modern silhouettes.',
        'Every drape is conceived around comfort, movement, and genuine pure silk authenticity. Rejecting synthetic polyester copies and mass production, Vidhya works directly with over 40 artisan master weaving families across India.',
      ],
      image: '/images/categories/sarees.jpg',
      imageAlt: 'Designer Vidhya draping handloom silk',
      designerName: 'Vidhya',
      designerRole: 'Founder & Creative Director',
      metrics: [
        { value: '100%', label: 'Certified Pure Handloom' },
        { value: '40+', label: 'Weaving Families Supported' },
        { value: '12k+', label: 'Global Drapes Styled' },
      ],
    },
    tenets: {
      title: "The Three Tenets of Vidhya's Atelier",
      items: [
        {
          number: '1.',
          title: 'Ethical Loom Direct',
          description:
            'Fair living wages and direct artisan profit sharing without distributor commissions.',
        },
        {
          number: '2.',
          title: 'Weightless Grandeur',
          description:
            'Re-engineering traditional heavy zari into breathable, feather-light drapes you can dance in.',
        },
        {
          number: '3.',
          title: 'Private Client Styling',
          description:
            'Complimentary direct consultation with Vidhya to personalize blouse cuts, dupatta styling, and trousseau curation.',
        },
      ],
    },
    consultation: {
      eyebrow: 'CONSULT DIRECTLY WITH VIDHYA',
      title: 'Book a Personal WhatsApp Styling Session',
      description:
        'Need advice on which silhouette suits your body type or which color palette matches your bridal celebration? Designer Vidhya is available for complimentary styling consultations.',
      buttonText: 'Chat with Designer Vidhya on WhatsApp →',
      whatsappUrl:
        'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20would%20love%20a%20personal%20styling%20session%20with%20you.',
    },
    seo: {
      metaTitle: 'Meet Designer Vidhya | Angelika Fashions Atelier',
      metaDescription:
        'Discover the artisanal journey, design philosophy, and master craft heritage of Designer Vidhya at Angelika Fashions.',
    },
  },
  'vidhyas-picks-page': {
    header: {
      eyebrowBadge: "FOUNDER'S CURATION",
      badgeSubtitle: 'Updated Monthly',
      title: "Vidhya's Personal Picks",
      titleHighlight: 'Personal',
      description:
        '“Every piece in this edit is an authentic favorite from my own wardrobe. Hand-selected directly from master looms across Varanasi, Kutch, and Jaipur — chosen for effortless drape, pure natural fiber, and timeless elegance.”',
      founder: {
        name: 'Vidhya Sharma',
        role: 'Founder & Creative Director · Angelika Fashions',
        experience: 'Curating pure handloom weaves since 2018',
        avatar: '/images/about/vidhya-profile.jpg',
        storyLinkText: 'Read Story →',
        storyLinkHref: '/about/vidhya',
      },
      featuredStats: {
        stat1Value: '100%',
        stat1Label: 'Natural Silk',
        stat2Value: '5 Categories',
        stat2Label: 'Artisan Looms',
        stat3Value: 'Limited',
        stat3Label: 'Bespoke Batches',
      },
    },
    curationStandards: {
      eyebrow: 'THE CURATION STANDARD',
      title: 'Why Every Pick is Rare & Special',
      subtitle:
        'We reject mass manufacturing. Every piece in Vidhya’s Picks meets four strict artisanal principles.',
      items: [
        {
          icon: '🪡',
          title: 'Direct Loom Provenance',
          description:
            'Directly commissioned from master weavers in Varanasi, Chanderi, and Kutch with fair-wage artisan partnerships.',
        },
        {
          icon: '👗',
          title: 'Wear-Tested Drapes',
          description:
            'Personally styled and fitted by Vidhya to guarantee all-day comfort, zero-scratch necklines, and effortless fall.',
        },
        {
          icon: '💎',
          title: 'Micro-Batch Exclusivity',
          description:
            'Created in limited editions of only 20–50 units per weave to ensure your look remains singular and unique.',
        },
        {
          icon: '💬',
          title: '1-on-1 Concierge Styling',
          description:
            'Direct WhatsApp styling advice from Vidhya’s personal team for drape options, blouse matching, and custom lengths.',
        },
      ],
    },
    archive: {
      eyebrow: 'CURATION ARCHIVE',
      title: 'Explore Past Monthly Editions',
      subtitle:
        'Each month brings a distinct theme, fresh fabrics, and personal styling narratives.',
      ctaText: 'Browse All Collections →',
      ctaHref: '/shop',
    },
    concierge: {
      badge: 'COMPLIMENTARY CONCIERGE',
      title: 'Unsure About Draping, Blouse Cuts, or Sizing?',
      description:
        'Connect directly with designer Vidhya Sharma and our senior bridal styling desk. We provide drape video guides, bespoke size alterations, and fabric matching for your special occasion.',
      whatsappNumber: '+91 98765 43210',
      whatsappUrl:
        'https://wa.me/919876543210?text=Hi%20Vidhya,%20I%20need%20styling%20advice%20for%20an%20upcoming%20event.',
      sizeGuideText: 'Open Interactive Size Guide',
      sizeGuideHref: '/size-finder',
    },
    newsletter: {
      eyebrow: 'PRIVATE PREVIEWS',
      title: "Get Next Month's Edit 48 Hours Before Public Release",
      description:
        'Join Vidhya’s Private Notes. Receive artisanal stories, limited edition early reservations, and personal drape masterclass videos.',
      buttonText: 'Join VIP List',
      disclaimer: 'Zero spam. Unsubscribe at any time. We respect your private styling journey.',
    },
    monthlyEdits: [
      {
        month: 'January 2026',
        slug: 'january-2026',
        theme: 'New Beginnings in Silk',
        subtitle: 'Lustrous Mulberry Silks & Airy Chiffons for the Fresh Season',
        note: 'Starting the year with the fabrics that feel like fresh starts — lightweight silks, soft chiffons, and the kind of pieces that make you feel ready for anything.',
        coverImage: '/images/vp-jan-1.jpg',
        heroStory:
          'As the light shifts into the new year, this edit celebrates purity of form and effortless movement. We sourced unadulterated mulberry silks from Varanasi weavers and featherlight chiffons crafted for fluid draping from morning rituals to evening soirées.',
        curatorInsight:
          '“When silk drapes true to your natural posture, you never have to adjust it twice. That ease is what luxury really means.” — Vidhya',
        products: [
          {
            id: 'vp-jan-1',
            slug: 'mulberry-silk-saree',
            name: 'Mulberry Silk Saree',
            price: 7999,
            originalPrice: 9999,
            image: '/images/vp-jan-1.jpg',
            color: 'Ivory & Antique Gold',
            colorFamily: 'white',
            category: 'Sarees',
            fabric: 'Pure Mulberry Silk',
            origin: 'Varanasi Master Weavers',
            discount: 20,
            vidhyaNote:
              'The saree I wore to my own housewarming. Drapes like an absolute dream and catches subtle morning light.',
            tags: ['saree', 'sarees', 'sari', 'silk', 'ivory', 'white', 'gold', 'varanasi'],
          },
          {
            id: 'vp-jan-2',
            slug: 'chiffon-anarkali-set',
            name: 'Chiffon Anarkali Set',
            price: 5499,
            originalPrice: 6899,
            image: '/images/vp-jan-2.jpg',
            color: 'Powder Blue',
            colorFamily: 'blue',
            category: 'Kurtis',
            fabric: 'Pure Viscose Chiffon',
            origin: 'Jaipur Hand-Dye Atelier',
            discount: 20,
            vidhyaNote:
              'Twirl factor: 10/10. Designed with lightweight flare for all-day festive comfort without heaviness.',
            tags: ['kurti', 'kurtis', 'kurta', 'anarkali', 'blue', 'powder blue', 'chiffon', 'flared'],
          },
          {
            id: 'vp-jan-3',
            slug: 'silk-blend-palazzo-set',
            name: 'Silk Blend Palazzo Set',
            price: 3999,
            originalPrice: 4999,
            image: '/images/vp-jan-3.jpg',
            color: 'Sage Green',
            colorFamily: 'green',
            category: 'Salwars',
            fabric: 'Chanderi Silk Blend',
            origin: 'Chanderi Artisan Cluster',
            discount: 20,
            vidhyaNote:
              'My personal go-to for gallery previews and client meetings. Polished, comfortable, and never wrinkles.',
            tags: ['salwar', 'salwars', 'suit', 'palazzo', 'green', 'sage', 'silk', 'workwear'],
          },
        ],
      },
      {
        month: 'December 2025',
        slug: 'december-2025',
        theme: 'Festive Finery',
        subtitle: 'Gold Zari, Hand-Cut Mirrors, and Opulent Jewel Tones',
        note: 'The season of light calls for pieces that catch it. Gold zari, mirror work, deep jewel tones — everything you need to shine with understated grandeur.',
        coverImage: '/images/vp-dec-1.jpg',
        heroStory:
          'December in Indian tradition is a tapestry of weddings, celebrations, and winter galas. For this edit, we partnered with Kutch mirror artisans and Banaras master weavers to create festive pieces that radiate warmth.',
        curatorInsight:
          '“Real zari never glares loudly; it glows warmly from within like candlelight.” — Vidhya',
        products: [
          {
            id: 'vp-dec-1',
            slug: 'banarasi-tissue-saree',
            name: 'Banarasi Tissue Saree',
            price: 12999,
            originalPrice: 15999,
            image: '/images/vp-dec-1.jpg',
            color: 'Champagne Gold',
            colorFamily: 'gold',
            category: 'Sarees',
            fabric: 'Handwoven Banarasi Tissue Zari',
            origin: 'Varanasi Heritage Looms',
            discount: 18,
            vidhyaNote:
              'Tissue sarees are pure magic — they catch low ambient light and glow softly from within. A true heirloom piece.',
            tags: ['saree', 'sarees', 'sari', 'gold', 'tissue', 'champagne', 'banarasi', 'zari'],
          },
          {
            id: 'vp-dec-2',
            slug: 'mirror-work-lehenga',
            name: 'Mirror Work Festive Lehenga',
            price: 18999,
            originalPrice: 22999,
            image: '/images/vp-dec-2.jpg',
            color: 'Deep Crimson Red',
            colorFamily: 'red',
            category: 'Lehengas',
            fabric: 'Raw Silk & Fine Organza',
            origin: 'Kutch Artisanal Guild',
            discount: 17,
            vidhyaNote:
              'Hand-embroidered mirrors by craftswomen in Kutch. Each mirror reflects light individually for an ethereal aura.',
            tags: ['lehenga', 'lehengas', 'red', 'crimson', 'mirror work', 'raw silk', 'wedding'],
          },
          {
            id: 'vp-dec-3',
            slug: 'velvet-kurti-set',
            name: 'Velvet Kurti Set with Cigarette Pants',
            price: 6999,
            originalPrice: 8499,
            image: '/images/vp-dec-3.jpg',
            color: 'Emerald Green',
            colorFamily: 'green',
            category: 'Kurtis',
            fabric: 'Plush Micro-Velvet & Zari',
            origin: 'Kashmir Tilla Artisans',
            discount: 17,
            vidhyaNote:
              'Winter wedding dressing sorted. Deep emerald velvet that feels luxurious to touch without weighing you down.',
            tags: ['kurti', 'kurtis', 'velvet', 'green', 'emerald', 'zari', 'winter'],
          },
        ],
      },
      {
        month: 'November 2025',
        slug: 'november-2025',
        theme: 'Wedding Guest Edit',
        subtitle: 'Effortless Versatility for High-Energy Sangeets & Haldis',
        note: 'When the wedding invitations stack high, you need pieces that look breathtaking in photographs yet let you dance until 3 AM in total ease.',
        coverImage: '/images/vp-nov-1.jpg',
        heroStory:
          'Wedding guest fashion often forces a choice between grandeur and ease. This edit was conceived to eradicate that compromise with airy organzas and featherlight shararas.',
        curatorInsight:
          '“The best wedding outfits are the ones where you forget you are wearing couture and just dance.” — Vidhya',
        products: [
          {
            id: 'vp-nov-1',
            slug: 'organza-saree-set',
            name: 'Organza Saree Set',
            price: 8999,
            originalPrice: 10999,
            image: '/images/vp-nov-1.jpg',
            color: 'Rose Gold & Blush Pink',
            colorFamily: 'pink',
            category: 'Sarees',
            fabric: 'Silk Organza & Micro-Sequins',
            origin: 'Surat Silk Looms',
            discount: 18,
            vidhyaNote:
              'Organza with subtle hand-placed micro-sequin work. Looks ethereal in natural daylight and photographs beautifully.',
            tags: ['saree', 'sarees', 'sari', 'pink', 'rose gold', 'organza', 'blush'],
          },
          {
            id: 'vp-nov-2',
            slug: 'sharara-set-navy',
            name: 'Lucknow Chikankari Sharara Set',
            price: 7499,
            originalPrice: 9299,
            image: '/images/vp-nov-2.jpg',
            color: 'Navy Blue',
            colorFamily: 'blue',
            category: 'Salwars',
            fabric: 'Flowing Georgette & Crepe',
            origin: 'Lucknow Chikankari Cluster',
            discount: 19,
            vidhyaNote:
              'Shararas are the ultimate dance-floor companion. This flare moves with every step and never catches your heels.',
            tags: ['salwar', 'salwars', 'suit', 'sharara', 'blue', 'navy', 'georgette'],
          },
          {
            id: 'vp-nov-3',
            slug: 'gota-patti-kurta',
            name: 'Jaipur Gota Patti Festive Kurta',
            price: 4299,
            originalPrice: 5299,
            image: '/images/vp-nov-3.jpg',
            color: 'Mustard Yellow',
            colorFamily: 'yellow',
            category: 'Kurtis',
            fabric: 'Chanderi Cotton',
            origin: 'Jaipur Gota Craft Center',
            discount: 18,
            vidhyaNote:
              'Authentic gota patti hand-stitched in Jaipur. Sunny enough for Haldi, dressy enough for an intimate Sangeet.',
            tags: ['kurti', 'kurtis', 'kurta', 'yellow', 'mustard', 'gota patti', 'cotton', 'haldi'],
          },
        ],
      },
    ],
    additionalPicks: [
      {
        id: 'na-1',
        slug: 'royal-crimson-zari-bridal-lehenga',
        name: 'Royal Crimson Zari Bridal Lehenga Set',
        price: 28999,
        originalPrice: 34999,
        image: '/images/collection-lehengas.jpg',
        color: 'Deep Crimson & Gold',
        colorFamily: 'red',
        category: 'Lehengas',
        fabric: 'Pure Silk & Zari',
        origin: 'Banaras Heritage Looms',
        discount: 17,
        vidhyaNote: 'Pure silk and antique gold zari embroidery. Designed for breathtaking bridal grandeur.',
        month: 'Curated Signature',
        theme: 'Bridal Regalia',
        tags: ['lehenga', 'lehengas', 'choli', 'bridal', 'crimson', 'red', 'gold', 'zari', 'wedding', 'silk'],
      },
      {
        id: 'na-6',
        slug: 'heritage-temple-kanjivaram-silk-saree',
        name: 'Heritage Temple Kanjivaram Silk Saree',
        price: 22499,
        originalPrice: 26999,
        image: '/images/collection-sarees.jpg',
        color: 'Royal Gold & Magenta',
        colorFamily: 'gold',
        category: 'Sarees',
        fabric: 'Pure Kanjivaram Silk',
        origin: 'Kanchipuram Master Looms',
        discount: 17,
        vidhyaNote: 'Woven on heirloom pit looms with pure gold zari temple borders. Authentic Silk Mark certified.',
        month: 'Curated Signature',
        theme: 'Heritage Weaves',
        tags: ['saree', 'sarees', 'sari', 'kanjivaram', 'silk', 'gold', 'temple', 'magenta', 'wedding'],
      },
      {
        id: 'na-7',
        slug: 'lucknowi-mukaish-chikankari-georgette-saree',
        name: 'Lucknowi Mukaish Chikankari Georgette Saree',
        price: 15499,
        originalPrice: 18999,
        image: '/images/cat-sarees.jpg',
        color: 'Pastel Peach Pink',
        colorFamily: 'pink',
        category: 'Sarees',
        fabric: 'Pure Georgette',
        origin: 'Lucknow Master Artisans',
        discount: 18,
        vidhyaNote: 'Delicate shadow needlework with metallic mukaish sparkles for a graceful evening drape.',
        month: 'Curated Signature',
        theme: 'Heritage Weaves',
        tags: ['saree', 'sarees', 'sari', 'chikankari', 'georgette', 'pink', 'peach', 'mukaish', 'pastel'],
      },
      {
        id: 'na-4',
        slug: 'hand-block-printed-chanderi-cotton-kurti',
        name: 'Hand-Block Printed Chanderi Cotton Kurti',
        price: 6499,
        originalPrice: 7999,
        image: '/images/collection-kurtis.jpg',
        color: 'Pastel Mint Green & Indigo',
        colorFamily: 'green',
        category: 'Kurtis',
        fabric: 'Chanderi Cotton',
        origin: 'Jaipur Block Print Looms',
        discount: 19,
        vidhyaNote: 'Crafted with natural azo-free dyes and hand-carved teak wood blocks. Perfect for summer brunches.',
        month: 'Curated Signature',
        theme: 'Artisanal Daily',
        tags: ['kurti', 'kurtis', 'kurta', 'green', 'mint', 'indigo', 'block print', 'chanderi', 'cotton'],
      },
      {
        id: 'kp-2',
        slug: 'pristine-white-shadow-work-lucknowi-kurti',
        name: 'Pristine White Shadow Work Lucknowi Kurti',
        price: 3999,
        originalPrice: 4799,
        image: '/images/cat-kurtis.jpg',
        color: 'Pristine White',
        colorFamily: 'white',
        category: 'Kurtis',
        fabric: 'Mulmul Muslin',
        origin: 'Lucknow Heritage Guild',
        discount: 17,
        vidhyaNote: 'Classic Bakhiya needlework on ultra-soft pure mulmul muslin. Clean, cooling, and understated.',
        month: 'Curated Signature',
        theme: 'Pure Whites',
        tags: ['kurti', 'kurtis', 'kurta', 'white', 'lucknowi', 'chikankari', 'mulmul', 'cotton', 'summer'],
      },
      {
        id: 'na-3',
        slug: 'banarasi-silk-brocade-palazzo-churidar-set',
        name: 'Banarasi Silk Brocade Palazzo & Churidar Set',
        price: 14499,
        originalPrice: 17999,
        image: '/images/collection-salwars.jpg',
        color: 'Emerald Green & Gold',
        colorFamily: 'green',
        category: 'Salwars',
        fabric: 'Pure Banarasi Brocade Silk',
        origin: 'Varanasi Master Looms',
        discount: 19,
        vidhyaNote: 'Opulent Banarasi brocade pants paired with an effortless raw silk kurta.',
        month: 'Curated Signature',
        theme: 'Festive Separates',
        tags: ['salwar', 'salwars', 'suit', 'brocade', 'green', 'emerald', 'gold', 'banarasi', 'palazzo', 'churidar'],
      },
      {
        id: 'na-8',
        slug: 'amritsari-hand-embroidered-phulkari-dupatta',
        name: 'Amritsari Hand-Embroidered Phulkari Dupatta',
        price: 3299,
        originalPrice: 3999,
        image: '/images/collection-dupattas.jpg',
        color: 'Ruby Red & Gold Multi',
        colorFamily: 'red',
        category: 'Dupattas',
        fabric: 'Chanderi Silk',
        origin: 'Amritsar Craft Cluster',
        discount: 18,
        vidhyaNote: 'Traditional geometric flower pattern embroidered by hand with vibrant floss silk threads.',
        month: 'Curated Signature',
        theme: 'Heirloom Stoles',
        tags: ['dupatta', 'dupattas', 'scarf', 'red', 'gold', 'phulkari', 'amritsari', 'silk', 'festive'],
      },
      {
        id: 'vp-dupatta-2',
        slug: 'banarasi-katan-silk-zari-dupatta',
        name: 'Banarasi Katan Silk Zari Dupatta',
        price: 4599,
        originalPrice: 5499,
        image: '/images/artisan-workshop.jpg',
        color: 'Deep Royal Blue & Gold',
        colorFamily: 'blue',
        category: 'Dupattas',
        fabric: 'Pure Katan Silk',
        origin: 'Varanasi Heritage Looms',
        discount: 16,
        vidhyaNote: 'Lustrous katan silk adorned with antique gold zari bootis along the scalloped pallu.',
        month: 'Curated Signature',
        theme: 'Heirloom Stoles',
        tags: ['dupatta', 'dupattas', 'scarf', 'blue', 'royal blue', 'gold', 'banarasi', 'katan silk', 'zari'],
      },
    ],
    seo: {
      metaTitle: "Vidhya's Picks | Founder's Curated Handloom Ethnic Wear | Angelika",
      metaDescription:
        "Explore Vidhya's personal curation of handwoven sarees, artisanal kurtis, festive lehengas, and elegant salwars direct from master looms.",
    },
  },
  'brand-story': {
    badge: 'Our Story',
    title: 'Crafted with Love, Worn with Pride',
    headingPrefix: 'Crafted with',
    headingHighlight: 'Love',
    headingSuffix: ', Worn with Pride',
    image: '/images/vidhya-story.jpg',
    imageAlt: 'Vidhya in her atelier',
    storyParagraphs: [
      "Angelika Fashions was born from Vidhya's passion for preserving Indian textile heritage while creating contemporary silhouettes for the modern woman.",
      "Every piece in our collection is thoughtfully designed, from selecting the finest fabrics to collaborating with skilled artisans who bring generations of expertise to each stitch.",
      "When you wear Angelika, you're not just wearing clothes — you're wearing a piece of tradition reimagined for today, made with integrity and worn with confidence.",
    ],
    story: "Angelika Fashions was born from Vidhya's passion for preserving Indian textile heritage while creating contemporary silhouettes for the modern woman.\n\nEvery piece in our collection is thoughtfully designed, from selecting the finest fabrics to collaborating with skilled artisans who bring generations of expertise to each stitch.\n\nWhen you wear Angelika, you're not just wearing clothes — you're wearing a piece of tradition reimagined for today, made with integrity and worn with confidence.",
    quote: '"Fashion that honors where you come from while embracing where you are going."',
    primaryCtaText: 'Read Our Story',
    primaryCtaLink: '/about',
    whatsappCtaText: 'Chat with Vidhya',
    readStoryLink: '/about',
    chatWhatsappLink: 'https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I%20would%20like%20to%20know%20more',
    whatsappLink: "https://wa.me/91XXXXXXXXXX?text=Hi%20Vidhya,%20I'd%20like%20to%20know%20more%20about%20your%20journey",
  },
  'kurtis-page': {
    badge: 'Handcrafted Luxury Edit',
    title: 'Kurtis',
    description: 'Discover our complete range of handcrafted Indian ethnic kurtis, tunics, and anarkalis, thoughtfully made with artisanal perfection and breathable natural textiles.',
    heroImage: '/images/hero-new-couture.jpg',
    cardImage: '/images/collection-kurtis.jpg',
    cardBadge: 'Curated by Vidhya',
    cardSubtitle: '48 Handcrafted Pieces',
    showPromoBanner: true,
    promoBadge: 'Festive Offer',
    promoText: 'Enjoy 15% off on all handcrafted Chanderi and Silk Kurtis. Use code: KURTI15',
    promoCtaText: 'Shop Kurtis',
    promoCtaLink: '/shop/kurtis',
    showStylingGuide: true,
    stylingBadge: 'ATELIER NOTES & STYLING',
    stylingTitle: "Vidhya's Styling Guide for Kurtis",
    stylingNote: "Our kurtis are cut from pure breathable Chanderi, Mulmul and Tussar silk. For a contemporary festive look, pair straight-cut kurtis with cigarette pants, or flared anarkalis with statement jhumkas.",
    stylingImage: '/images/vidhya-story.jpg',
    highlights: [
      {
        title: 'Handloom Textiles',
        description: 'Woven on authentic wooden looms using pure Chanderi silk and combed mulmul cotton.',
      },
      {
        title: 'Artisanal Block Prints',
        description: 'Hand-block printed by master artisans using organic azo-free earthen dyes.',
      },
      {
        title: 'Tailored Silhouettes',
        description: 'Comfortable relaxed drapes with thoughtful internal seam allowances for a bespoke fit.',
      },
    ],
    showCategoryStrip: true,
    showSidebar: true,
    productsMode: 'custom',
    products: [
      {
        id: 'kp-1',
        name: 'Kutch Ajrakh Modal Silk Kurti',
        category: 'KURTIS',
        price: 4999,
        originalPrice: 5999,
        discount: 17,
        image: '/images/collection-kurtis.jpg',
        href: '/product/kutch-ajrakh-modal-silk-kurti',
        isNew: true,
        isVidhyasPick: true,
        fabric: 'Silk',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-2',
        name: 'Pristine White Shadow Work Lucknowi Kurti',
        category: 'KURTIS',
        price: 3999,
        originalPrice: 4799,
        discount: 17,
        image: '/images/collection-lehengas.jpg',
        href: '/product/pristine-white-shadow-work-lucknowi-kurti',
        isNew: true,
        isVidhyasPick: false,
        fabric: 'Cotton',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-3',
        name: 'Hand Block Printed Kurti',
        category: 'KURTIS',
        price: 2499,
        originalPrice: 3299,
        discount: 24,
        image: '/images/collection-kurtis.jpg',
        href: '/product/hand-block-printed-kurti',
        isNew: true,
        isVidhyasPick: false,
        fabric: 'Cotton',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-4',
        name: 'Velvet Kurti Set',
        category: 'KURTIS',
        price: 6999,
        originalPrice: 8499,
        discount: 18,
        image: '/images/cat-sarees.jpg',
        href: '/product/velvet-kurti-set',
        isNew: true,
        isVidhyasPick: true,
        fabric: 'Velvet',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-5',
        name: 'Chanderi Cotton Kurti',
        category: 'KURTIS',
        price: 3199,
        originalPrice: 3999,
        discount: 20,
        image: '/images/cat-kurtis.jpg',
        href: '/product/chanderi-cotton-kurti',
        isNew: true,
        isVidhyasPick: false,
        fabric: 'Chanderi',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
      {
        id: 'kp-6',
        name: 'Gota Patti Kurta',
        category: 'KURTIS',
        price: 4299,
        originalPrice: 5299,
        discount: 19,
        image: '/images/cat-lehengas.jpg',
        href: '/product/gota-patti-kurta',
        isNew: true,
        isVidhyasPick: false,
        fabric: 'Cotton',
        rating: 4.8,
        reviewCount: 12,
        inStock: true,
      },
    ],
    metaTitle: 'Designer Kurtis and Tunics Online | Angelika Fashions',
    metaDescription: 'Shop handcrafted Indian ethnic kurtis, anarkalis and tunics by Vidhya at Angelika Fashions. Pure Chanderi silk and mulmul cotton with express delivery.',
  },
  footer: {
    brandName: 'Angelika',
    brandTagline: 'Fashions',
    logoUrl: '/images/logo.png',
    tagline: 'Modern Indian luxury — rooted in craft, elevated for today.',
    showAtelierDesk: true,
    atelierBadge: "VIDHYA'S STYLING ATELIER",
    atelierStatusText: 'Concierge Active',
    atelierTitle: 'Personal Styling & Drape Consultation',
    atelierDescription: 'Complimentary bespoke drape guidance, custom blouse measurements & festive trousseau curation directly with designer Vidhya.',
    atelierWhatsappCta: 'Connect with Vidhya on WhatsApp',
    atelierWhatsappNumber: '+91 98765 43210',
    atelierWhatsappMessage: 'Hi Vidhya, I would love personal styling guidance and drape consultation for my order.',
    atelierPhone: '+91 98765 43210',
    atelierEmail: 'hallo@angelikafashions.com',
    atelierSchedule: 'Mon - Sat: 10:00 AM - 7:00 PM IST · Direct atelier response',
    socialTitle: 'Connect With Us',
    socialLinks: [
      { platform: 'instagram', href: 'https://instagram.com/angelikafashions', label: 'Instagram', handle: '@angelikafashions', enabled: true },
      { platform: 'whatsapp', href: 'https://wa.me/919876543210', label: 'WhatsApp Concierge', handle: 'Chat with Vidhya', enabled: true },
      { platform: 'facebook', href: 'https://facebook.com/angelikafashions', label: 'Facebook', handle: 'Angelika Fashions', enabled: true },
      { platform: 'pinterest', href: 'https://pinterest.com/angelikafashions', label: 'Pinterest', handle: 'Angelika Haute Couture', enabled: true },
      { platform: 'youtube', href: 'https://youtube.com/angelikafashions', label: 'YouTube', handle: 'Angelika Atelier', enabled: true },
    ],
    columns: [
      {
        id: 'col-shop',
        title: 'Shop Collections',
        links: [
          { label: 'Handcrafted Kurtis', href: '/shop/kurtis' },
          { label: 'Salwars & Palazzo Sets', href: '/shop/salwars' },
          { label: 'Bridal & Festive Lehengas', href: '/shop/lehengas' },
          { label: 'Pure Silk & Chanderi Sarees', href: '/shop/sarees' },
          { label: 'Artisanal Dupattas', href: '/shop/dupattas' },
          { label: 'New Arrivals', href: '/new-arrivals', badge: 'New' },
          { label: "Vidhya's Curated Picks", href: '/vidhyas-picks', badge: 'Curated' },
          { label: 'Festive Archive Sale', href: '/sale', badge: 'Sale' },
        ],
      },
      {
        id: 'col-concierge',
        title: 'Client Concierge',
        links: [
          { label: 'Track Your Order', href: '/track-order' },
          { label: 'Shipping & Delivery Policy', href: '/shipping' },
          { label: 'Returns & Size Exchanges', href: '/returns' },
          { label: 'Interactive Size Finder', href: '/size-finder' },
          { label: 'Garment Size Guide', href: '/size-guide' },
          { label: 'Frequently Asked Questions', href: '/faq' },
          { label: 'Contact Our Concierge', href: '/contact' },
          { label: 'Wholesale & B2B Inquiries', href: '/wholesale' },
        ],
      },
      {
        id: 'col-story',
        title: 'The Atelier Story',
        links: [
          { label: 'Our Heritage & Philosophy', href: '/about' },
          { label: 'Meet Designer Vidhya', href: '/about/vidhya' },
          { label: 'Master Weaving Traditions', href: '/about#craft' },
          { label: 'Ethical & Sustainable Craft', href: '/about#sustainability' },
          { label: 'Editorial Style Journal', href: '/new-arrivals' },
          { label: 'Press & Celebrity Spotlights', href: '/about#press' },
          { label: 'Careers at Angelika', href: '/contact?subject=careers' },
        ],
      },
      {
        id: 'col-trust',
        title: 'Policies & Trust',
        links: [
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Cookie Policy', href: '/cookies' },
          { label: 'Accessibility Commitment', href: '/accessibility' },
          { label: 'Client Account & Profile', href: '/account' },
          { label: 'My Saved Wishlist', href: '/wishlist' },
          { label: '100% Silk Mark Authenticity', href: '/about#authenticity' },
        ],
      },
    ],
    paymentLabel: 'Payment Options:',
    paymentOptions: {
      upi: true,
      visa: true,
      mastercard: true,
      rupay: true,
      netbanking: true,
      cod: true,
      amex: true,
    },
    trustBadges: [
      { id: 'tb-ssl', text: '256-Bit SSL Encrypted Checkout', icon: 'ssl', enabled: true },
      { id: 'tb-handloom', text: '100% Certified Authentic Handloom', icon: 'handloom', enabled: true },
      { id: 'tb-shipping', text: 'Pan-India Express & Global Shipping', icon: 'shipping', enabled: true },
      { id: 'tb-exchange', text: '7-Day Complimentary Size Exchange', icon: 'exchange', enabled: true },
    ],
    copyright: '© 2026 Angelika. All rights reserved. Handcrafted with reverence for Indian heritage.',
    showScrollTop: true,
    scrollTopText: 'Top',
    bottomLinks: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
  newsletter: {
    title: 'Join the Angelika Circle',
    subtitle: 'Receive exclusive invitations to preview new arrivals, bespoke styling sessions, and private editorial drops.',
    buttonText: 'Subscribe',
  },
  'checkout-address-page': {
    header: {
      stepperDeliveryLabel: 'Delivery',
      stepperDeliverySubtext: 'Shipping address',
      stepperPaymentLabel: 'Payment',
      stepperPaymentSubtext: 'Choose payment method',
      contactSectionTitle: '1. Contact Details & Dispatch Updates',
    },
    contact: {
      emailLabel: 'Email Address *',
      emailPlaceholder: 'you@example.com',
      phoneLabel: 'Mobile Number *',
      phonePlaceholder: '10-digit number',
      phonePrefix: 'IN +91',
      whatsappUpdatesText: 'Send dispatch updates & live tracking photos via WhatsApp',
      whatsappDefaultChecked: true,
    },
    shipping: {
      sectionHeading: '2. Shipping Destination',
      firstNameLabel: 'First Name *',
      firstNamePlaceholder: 'e.g. Priya',
      lastNameLabel: 'Last Name *',
      lastNamePlaceholder: 'e.g. Sharma',
      address1Label: 'Flat / House No., Apartment & Street Address *',
      address1Placeholder: 'e.g. Flat 402, Lotus Residency, MG Road',
      address2Label: 'Landmark / Floor (Optional)',
      address2Placeholder: 'e.g. Near Indiranagar Metro Station',
      pincodeLabel: 'Pincode *',
      pincodePlaceholder: '6-digit pincode',
      cityLabel: 'City / District *',
      cityPlaceholder: 'City',
      stateLabel: 'State *',
      statePlaceholder: 'Select state',
      addressTypeLabel: 'Address Type',
      addressTypes: [
        { id: 'Home', label: 'Home', icon: '🏠' },
        { id: 'Office', label: 'Office', icon: '🏢' },
        { id: 'Other', label: 'Other', icon: '✨' },
      ],
    },
    deliveryAndGifting: {
      pincodeResolvingText: 'Resolving...',
      deliveringToPrefix: 'Delivering to',
      expectedDeliveryPrefix: '⚡ Expected delivery by',
      giftWrapTitle: 'Complimentary Luxury Gift Packaging',
      giftWrapSubtitle: 'Includes rigid keepsake box, personalized hand-calligraphed note card, and silk ribbon.',
      giftMessageLabel: 'Gift Message on Handcrafted Card',
      giftMessagePlaceholder: 'Wishing you radiant joy on your special day...',
    },
    buttonsAndSecurity: {
      deliverToAddressButtonText: 'Deliver to This Address',
      addNewAddressButtonText: '+ Add New Delivery Address',
      continueToPaymentButtonText: 'Proceed to Payment',
      securityBadgeText: '256-bit Bank Grade Encryption & Protected Checkout',
    },
  },
};
