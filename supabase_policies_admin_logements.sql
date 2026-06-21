-- Politiques pour gérer les logements depuis Admin prototype
alter table logements enable row level security;

DROP POLICY IF EXISTS "Admin prototype peut modifier logements" ON logements;
DROP POLICY IF EXISTS "Admin prototype peut supprimer logements" ON logements;
DROP POLICY IF EXISTS "Public peut lire logements" ON logements;

CREATE POLICY "Public peut lire logements"
ON logements
FOR SELECT
USING (true);

CREATE POLICY "Admin prototype peut modifier logements"
ON logements
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin prototype peut supprimer logements"
ON logements
FOR DELETE
USING (true);
