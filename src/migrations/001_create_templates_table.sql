-- =============================================================================
-- Migration: 001_create_templates_table
-- Description: Creates the `templates` table for issuer credential templates.
--
-- The `fields` column is a JSONB array where each element defines a form field
-- that the issuer must fill in when issuing a credential from this template.
--
-- Each element in the array looks like:
-- {
--   "name": "studentName",          -- unique field key used in code
--   "label": "Student Name",        -- human-readable label shown in the UI
--   "type": "text",                 -- text | date | select | file | textarea
--   "required": true,               -- whether the field must be filled
--   "placeholder": "Enter full name", -- input placeholder text
--   "options": []                   -- only used when type is "select"
-- }
-- =============================================================================

create table if not exists templates (
  id                    uuid         primary key default gen_random_uuid(),
  issuer_wallet         text         not null,
  title                 text         not null,
  type                  text         not null
                                     check (type in ('Degree', 'Award', 'Certificate', 'Status')),
  description           text,
  issuance_mode         text         not null default 'single'
                                     check (issuance_mode in ('single', 'bulk', 'both')),
  requires_certificate  boolean      not null default false,
  fields                jsonb        not null default '[]'::jsonb,
  created_at            timestamptz  default now(),
  updated_at            timestamptz  default now()
);

create index if not exists idx_templates_issuer_wallet on templates (issuer_wallet);
