-- Keep signed mobile and dashboard uploads private and constrained to supported
-- screenshot formats. The browser uploads directly to Storage, not through Vercel.
update storage.buckets
set file_size_limit = 20971520,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/bmp']
where id = 'mobile-evidence';
