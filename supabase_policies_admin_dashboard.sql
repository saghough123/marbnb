-- Policies dashboard admin prototype
alter table reservations enable row level security;

DROP POLICY IF EXISTS "Admin prototype peut lire reservations" ON reservations;
DROP POLICY IF EXISTS "Admin prototype peut modifier reservations" ON reservations;
DROP POLICY IF EXISTS "Public peut creer reservations" ON reservations;

CREATE POLICY "Public peut creer reservations"
ON reservations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin prototype peut lire reservations"
ON reservations
FOR SELECT
USING (true);

CREATE POLICY "Admin prototype peut modifier reservations"
ON reservations
FOR UPDATE
USING (true)
WITH CHECK (true);
