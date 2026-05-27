create table if not exists issuer_profiles (
  wallet_address   text primary key,
  institution      text,
  institution_type text,
  department       text,
  website          text,
  address          text,
  updated_at       timestamptz not null default now()
);
