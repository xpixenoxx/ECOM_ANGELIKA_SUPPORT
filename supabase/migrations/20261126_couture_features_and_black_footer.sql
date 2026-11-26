-- 20261126_couture_features_and_black_footer.sql
-- Idempotently upgrades the live Supabase `content_blocks` rows for `features`
-- (zero-emoji Couture Assurances Strip) and `footer` (Jet-Black Boutique Footer v2).
-- Safe to run multiple times regardless of whether `key` has a UNIQUE constraint.

DO $$
DECLARE
  v_features_json jsonb := '{
    "eyebrow": "THE ANGELIKA ATELIER PROMISE",
    "showGrid": true,
    "showWaves": true,
    "items": [
      {
        "icon": "shipping",
        "eyebrow": "Complimentary Dispatch",
        "title": "Complimentary Shipping",
        "desc": "Insured pan-India express delivery on orders ₹2,999+",
        "description": "Insured pan-India express delivery on orders ₹2,999+",
        "href": "/shipping"
      },
      {
        "icon": "returns",
        "eyebrow": "Effortless Care",
        "title": "15-Day Exchanges",
        "desc": "Seamless size exchanges & atelier-assisted returns",
        "description": "Seamless size exchanges & atelier-assisted returns",
        "href": "/returns"
      },
      {
        "icon": "styling",
        "eyebrow": "Vidhya Atelier",
        "title": "Personal Styling",
        "desc": "Private drape & trousseau guidance with Vidhya",
        "description": "Private drape & trousseau guidance with Vidhya",
        "href": "/contact"
      },
      {
        "icon": "gift",
        "eyebrow": "Signature Packaging",
        "title": "Couture Gift Wrapping",
        "desc": "Hand-tied heirloom boxes complimentary on every order",
        "description": "Hand-tied heirloom boxes complimentary on every order",
        "href": "/about"
      }
    ]
  }'::jsonb;

  v_footer_json jsonb := '{
    "layoutVersion": 2,
    "brandName": "Angelika",
    "brandTagline": "Fashions",
    "logoUrl": "/images/logo.png",
    "useLogoImage": false,
    "tagline": "Modern Indian luxury — rooted in craft, elevated for today.",
    "aboutText": "Angelika Fashions is an independent Indian luxury couture house, proudly celebrating heritage handlooms and contemporary silhouettes. Founded by designer Vidhya, every drape is crafted with timeless artistry for the modern woman.",
    "readMoreLabel": "Read More",
    "readMoreHref": "/about",
    "showRegionSelector": true,
    "regionLabel": "India (INR ₹)",
    "regionOptions": [
      "India (INR ₹)",
      "United Arab Emirates (AED د.إ)",
      "United Kingdom (GBP £)",
      "United States (USD $)"
    ],
    "showAtelierDesk": false,
    "socialTitle": "Connect With Us",
    "socialLinks": [
      {
        "id": "social-fb",
        "platform": "facebook",
        "icon": "facebook",
        "href": "https://facebook.com/angelikafashions",
        "label": "Facebook",
        "handle": "Angelika Fashions",
        "enabled": true
      },
      {
        "id": "social-ig",
        "platform": "instagram",
        "icon": "instagram",
        "href": "https://instagram.com/angelikafashions",
        "label": "Instagram",
        "handle": "@angelikafashions",
        "enabled": true
      },
      {
        "id": "social-wa",
        "platform": "whatsapp",
        "icon": "whatsapp",
        "href": "https://wa.me/917207256690",
        "label": "WhatsApp Concierge",
        "handle": "Chat with Vidhya",
        "enabled": true
      },
      {
        "id": "social-yt",
        "platform": "youtube",
        "icon": "youtube",
        "href": "https://youtube.com/angelikafashions",
        "label": "YouTube",
        "handle": "Angelika Atelier",
        "enabled": true
      }
    ],
    "columns": [
      {
        "id": "col-care",
        "title": "Customer Care",
        "links": [
          { "label": "Delivery", "href": "/shipping" },
          { "label": "Returns & Exchanges", "href": "/returns" },
          { "label": "Track Your Order", "href": "/track-order" },
          { "label": "Size Finder", "href": "/size-finder" },
          { "label": "Contact Us", "href": "/contact" }
        ]
      },
      {
        "id": "col-about",
        "title": "About Angelika",
        "links": [
          { "label": "Our Story", "href": "/about" },
          { "label": "Meet Designer Vidhya", "href": "/about/vidhya" },
          { "label": "Angelika on Instagram", "href": "https://instagram.com/angelikafashions", "external": true },
          { "label": "The Edit", "href": "/vidhyas-picks" },
          { "label": "New Arrivals", "href": "/new-arrivals" }
        ]
      }
    ],
    "paymentLabel": "Payment Options:",
    "paymentOptions": {
      "amex": true,
      "gpay": true,
      "upi": true,
      "mastercard": true,
      "rupay": true,
      "visa": true,
      "razorpay": true,
      "netbanking": true,
      "cod": true
    },
    "trustBadges": [],
    "copyright": "© 2026 Angelika Fashions.",
    "showScrollTop": false,
    "scrollTopText": "Top",
    "bottomLinks": [
      { "label": "Terms of Service", "href": "/terms" },
      { "label": "Privacy Policy", "href": "/privacy" },
      { "label": "Shipping Policy", "href": "/shipping" },
      { "label": "Refund Policy", "href": "/returns" },
      { "label": "Cookies", "href": "/cookies" },
      { "label": "Accessibility", "href": "/accessibility" }
    ]
  }'::jsonb;
BEGIN
  IF EXISTS (SELECT 1 FROM public.content_blocks WHERE key = 'features') THEN
    UPDATE public.content_blocks
    SET
      title = 'Couture Assurances Strip',
      content = v_features_json || jsonb_build_object('_updated_at', NOW()),
      is_active = true,
      updated_at = NOW()
    WHERE key = 'features';
  ELSE
    INSERT INTO public.content_blocks (key, type, title, content, is_active, updated_at)
    VALUES (
      'features',
      'stats_bar',
      'Couture Assurances Strip',
      v_features_json || jsonb_build_object('_updated_at', NOW()),
      true,
      NOW()
    );
  END IF;

  IF EXISTS (SELECT 1 FROM public.content_blocks WHERE key = 'footer') THEN
    UPDATE public.content_blocks
    SET
      title = 'Global Boutique Footer (Black)',
      content = v_footer_json || jsonb_build_object('_updated_at', NOW()),
      is_active = true,
      updated_at = NOW()
    WHERE key = 'footer';
  ELSE
    INSERT INTO public.content_blocks (key, type, title, content, is_active, updated_at)
    VALUES (
      'footer',
      'text_block',
      'Global Boutique Footer (Black)',
      v_footer_json || jsonb_build_object('_updated_at', NOW()),
      true,
      NOW()
    );
  END IF;
END $$;
