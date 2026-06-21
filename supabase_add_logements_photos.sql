-- Ajouter la colonne galerie photos aux logements publiés
alter table logements
add column if not exists photos text;
