create table if not exists templates (
  id              uuid primary key default gen_random_uuid(),
  issuer_wallet   text not null,
  title           text not null,
  type            text not null check (type in ('Degree', 'Award', 'Certificate', 'Status')),
  description     text,
  issuance_mode   text not null default 'single' check (issuance_mode in ('single', 'bulk', 'both')),
  requires_certificate boolean not null default false,
  fields          jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_templates_issuer_wallet on templates (issuer_wallet);
