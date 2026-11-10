-- A browser may only insert an image for a recent, server-issued handoff row.
-- Storage remains private; this policy grants no read, update, or delete access.
create or replace function public.can_upload_mobile_evidence(object_name text)
returns boolean
language sql
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.mobile_uploads
    where storage_path = object_name
      and consumed_at is null
      and created_at > now() - interval '2 hours'
  );
$function$;

revoke all on function public.can_upload_mobile_evidence(text) from public;
grant execute on function public.can_upload_mobile_evidence(text) to anon, authenticated;

drop policy if exists "upload only to active private evidence sessions" on storage.objects;
create policy "upload only to active private evidence sessions"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'mobile-evidence'
  and public.can_upload_mobile_evidence(name)
);
