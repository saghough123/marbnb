-- Marbnb : profils comptes locataires/hôtes
-- A lancer dans Supabase -> SQL Editor -> New query -> Run

create table if not exists profiles (
  id uuid primary key,
  nom text,
  email text,
  telephone text,
  role text check (role in ('locataire', 'hote', 'admin')) default 'locataire',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

DROP POLICY IF EXISTS "profiles_insert_public" ON profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_update_public" ON profiles;

CREATE POLICY "profiles_insert_public"
ON profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "profiles_select_public"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "profiles_update_public"
ON profiles FOR UPDATE
USING (true)
WITH CHECK (true);
