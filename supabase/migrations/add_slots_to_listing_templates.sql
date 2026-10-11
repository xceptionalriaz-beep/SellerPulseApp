-- Migration: add slots JSONB column to listing_templates
-- slots stores an array of slot definitions, e.g.:
-- [
--   { "role": "headline",        "blockId": "abc123", "label": "Headline" },
--   { "role": "key_features",    "blockId": "def456", "label": "Key Features" },
--   { "role": "description",     "blockId": "ghi789", "label": "Description" },
--   { "role": "condition_note",  "blockId": "jkl012", "label": "Condition Note" },
--   { "role": "trust_statement", "blockId": "mno345", "label": "Trust Statement" }
-- ]
-- Existing templates default to an empty array (no slots defined yet).

ALTER TABLE listing_templates
  ADD COLUMN IF NOT EXISTS slots JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN listing_templates.slots IS
  'Array of {role, blockId, label} objects mapping semantic slot roles to visual editor block IDs.';
