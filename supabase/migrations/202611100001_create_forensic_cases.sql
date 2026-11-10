create extension if not exists pgcrypto;

create table if not exists public.forensic_cases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  file_sha256 text not null check (file_sha256 ~ '^[a-f0-9]{64}$'),
  filename text not null default 'evidence image',
  image_width integer not null check (image_width > 0),
  image_height integer not null check (image_height > 0),
  overall_tamper_score numeric(5,2) not null check (overall_tamper_score between 0 and 100),
  confidence_score numeric(5,2) not null check (confidence_score between 0 and 100),
  verdict text not null,
  channel_detected text not null,
  findings jsonb not null default '[]'::jsonb,
  layer_summary jsonb not null default '{}'::jsonb,
  source text not null default 'web'
);

create index if not exists forensic_cases_created_at_idx on public.forensic_cases (created_at desc);
create index if not exists forensic_cases_sha256_idx on public.forensic_cases (file_sha256);
alter table public.forensic_cases enable row level security;
-- Intentionally no anon/authenticated policies. Only server-side service-role writes are allowed.
