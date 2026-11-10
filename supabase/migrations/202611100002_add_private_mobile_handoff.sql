create table if not exists public.mobile_uploads (
  session_id uuid primary key,
  created_at timestamptz not null default now(),
  filename text not null,
  storage_path text not null,
  consumed_at timestamptz
);

create index if not exists mobile_uploads_created_at_idx
  on public.mobile_uploads (created_at desc);

alter table public.mobile_uploads enable row level security;
-- No anon/authenticated policies: handoff rows are server-only.

insert into storage.buckets (id, name, public)
values ('mobile-evidence', 'mobile-evidence', false)
on conflict (id) do update set public = false;
