-- Politiques nécessaires pour la phase Admin prototype.
-- À lancer dans Supabase SQL Editor.
-- Important : pour production, on sécurisera ensuite avec login admin.

alter table demandes_hotes enable row level security;
alter table logements enable row level security;

-- Eviter les doublons
DROP POLICY IF EXISTS "Admin prototype peut lire demandes hotes" ON demandes_hotes;
DROP POLICY IF EXISTS "Admin prototype peut modifier demandes hotes" ON demandes_hotes;
DROP POLICY IF EXISTS "Tout le monde peut envoyer une demande hote" ON demandes_hotes;
DROP POLICY IF EXISTS "Tout le monde peut creer un logement actif" ON logements;

-- Le formulaire public peut envoyer une demande
CREATE POLICY "Tout le monde peut envoyer une demande hote"
ON demandes_hotes
FOR INSERT
WITH CHECK (true);

-- Admin prototype : lecture et modification depuis l'app
CREATE POLICY "Admin prototype peut lire demandes hotes"
ON demandes_hotes
FOR SELECT
USING (true);

CREATE POLICY "Admin prototype peut modifier demandes hotes"
ON demandes_hotes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Pour publier une demande acceptée en logement actif
CREATE POLICY "Tout le monde peut creer un logement actif"
ON logements
FOR INSERT
WITH CHECK (true);
