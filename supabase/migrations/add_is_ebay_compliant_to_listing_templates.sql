-- Migration: add is_ebay_compliant flag to listing_templates
-- Run in Supabase SQL Editor (dashboard → SQL Editor → New query)

ALTER TABLE listing_templates
  ADD COLUMN IF NOT EXISTS is_ebay_compliant BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill comment: existing templates default to false (unchecked).
-- The visual editor will update this flag on each save going forward.
