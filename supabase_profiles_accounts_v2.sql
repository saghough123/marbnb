-- Marbnb : profils comptes locataires/hôtes
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  nom text,
  email text unique,
  telephone text,
  role text default 'locataire',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

DROP POLICY IF EXISTS "profiles_insert_public" ON profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_update_public" ON profiles;

CREATE POLICY "profiles_insert_public" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_public" ON profiles FOR UPDATE USING (true) WITH CHECK (true);
