-- sexy-db スキーマ。Supabase ダッシュボードの SQL Editor に貼って実行する。
-- 再実行しても壊れないよう if not exists / or replace を使う。

create table if not exists public.actresses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 100),
  birth_date    date not null,
  height_cm     integer not null check (height_cm between 100 and 220),
  cup           integer not null check (cup between 1 and 12),
  flesh_raw     double precision not null,
  skeleton_raw  double precision not null,
  face_raw      double precision not null,
  photo_path    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists actresses_user_id_idx on public.actresses (user_id, created_at);

-- updated_at を自動更新
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists actresses_set_updated_at on public.actresses;
create trigger actresses_set_updated_at
  before update on public.actresses
  for each row execute function public.set_updated_at();

-- 行レベルセキュリティ: 本人の行だけ
alter table public.actresses enable row level security;

drop policy if exists "actresses: own rows" on public.actresses;
create policy "actresses: own rows" on public.actresses
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 写真バケット(非公開、署名付き URL で読む)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- パスの先頭フォルダが自分の user_id のオブジェクトだけ触れる
drop policy if exists "photos: own select" on storage.objects;
create policy "photos: own select" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos: own insert" on storage.objects;
create policy "photos: own insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos: own update" on storage.objects;
create policy "photos: own update" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos: own delete" on storage.objects;
create policy "photos: own delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
