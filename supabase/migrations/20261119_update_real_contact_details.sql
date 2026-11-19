-- Migration: Update store_settings with real Angelika Fashions contact details
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Date: 2026-11-19

UPDATE store_settings
SET
  contact_phone    = '+917207256690',
  contact_whatsapp = '+917207256690',
  social_whatsapp  = '+917207256690',
  social_instagram = 'https://www.instagram.com/angelika_fashions',
  updated_at       = NOW()
WHERE id = (SELECT id FROM store_settings LIMIT 1);

-- Verify the update
SELECT
  contact_phone,
  contact_whatsapp,
  social_whatsapp,
  social_instagram,
  contact_email,
  address
FROM store_settings
LIMIT 1;
