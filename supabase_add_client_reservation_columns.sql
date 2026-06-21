-- Colonnes client pour les réservations Mbnb
alter table reservations
add column if not exists client_nom text,
add column if not exists client_telephone text,
add column if not exists client_email text,
add column if not exists client_message text,
add column if not exists heure_arrivee text;

-- Colonnes standard utiles si elles n'existent pas encore
alter table reservations
add column if not exists logement_id bigint,
add column if not exists logement_titre text,
add column if not exists ville text,
add column if not exists arrivee text,
add column if not exists depart text,
add column if not exists voyageurs integer,
add column if not exists paiement text,
add column if not exists devise text,
add column if not exists total numeric,
add column if not exists statut text,
add column if not exists created_at timestamptz default now();
