const fs = require('fs');
const path = require('path');

const root = process.cwd();

function backup(file, suffix) {
  if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
}

function fixMojibake(text) {
  // Nettoyage des caractères cassés visibles sur les boutons/catégories.
  return text
    .replace(/ðŸœª\s*Riads/g, 'Riads')
    .replace(/ðŸ\S*\s*Riads/g, 'Riads')
    .replace(/ðY\S*\s*Riads/g, 'Riads')
    .replace(/🏜️\s*Riads/g, 'Riads')
    .replace(/🏡\s*Maisons/g, 'Maisons')
    .replace(/🏢\s*Appartements/g, 'Appartements')
    .replace(/🌊\s*Bord de mer/g, 'Bord de mer')
    .replace(/🏊\s*Piscine/g, 'Piscine')
    .replace(/⭐\s*Premium/g, 'Premium')
    .replace(/🇲🇦/g, '')
    .replace(/\s{2,}/g, ' ');
}

// 1) Corriger les caractères cassés dans les pages principales.
const textFiles = [
  path.join(root, 'app', 'page.tsx'),
  path.join(root, 'app', 'resultats', 'page.tsx'),
  path.join(root, 'app', 'hote', 'page.tsx'),
  path.join(root, 'app', 'reservation-confirmation', 'page.tsx'),
];

for (const file of textFiles) {
  if (!fs.existsSync(file)) continue;
  backup(file, '.bak-client-form-chars');
  let txt = fs.readFileSync(file, 'utf8');
  const before = txt;
  txt = fixMojibake(txt);

  // Remplacer les catégories par texte simple et stable si tableau présent.
  txt = txt.replace(
    /const categories = \[[^\]]*\];/s,
    'const categories = ["Maisons", "Appartements", "Bord de mer", "Piscine", "Riads", "Premium"];'
  );

  if (txt !== before) {
    fs.writeFileSync(file, txt, 'utf8');
    console.log('OK caractères corrigés:', path.relative(root, file));
  }
}

// 2) Rendre les cartes villes/boutons catégories de la homepage cliquables si elles ne le sont pas déjà.
const homePath = path.join(root, 'app', 'page.tsx');
if (fs.existsSync(homePath)) {
  let home = fs.readFileSync(homePath, 'utf8');
  const beforeHome = home;

  // Si les villes sont affichées comme boutons sans navigation, on ajoute un fallback global côté client.
  if (!home.includes('MBNB_HOME_CLICK_FALLBACK')) {
    // S'assurer que useEffect est importé si app/page.tsx est un client component.
    home = home.replace('import { useState } from "react";', 'import { useEffect, useState } from "react";');
    home = home.replace('import { useMemo, useState } from "react";', 'import { useEffect, useMemo, useState } from "react";');
    home = home.replace('import { useState, useMemo } from "react";', 'import { useEffect, useMemo, useState } from "react";');

    const hook = `
  // MBNB_HOME_CLICK_FALLBACK
  useEffect(() => {
    const destinations = ["Casablanca", "Marrakech", "Fès", "Tanger", "Agadir"];
    const categories = ["Maisons", "Appartements", "Bord de mer", "Piscine", "Riads", "Premium"];
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const element = target.closest("button, a, div") as HTMLElement | null;
      if (!element) return;
      const text = (element.textContent || "").trim();
      const city = destinations.find((d) => text.includes(d));
      if (city && text.includes("Explorer")) {
        window.location.href = "/resultats?destination=" + encodeURIComponent(city);
        return;
      }
      const category = categories.find((c) => text.includes(c));
      if (category && element.tagName !== "A") {
        const destination = category === "Riads" ? "Riad" : category;
        window.location.href = "/resultats?destination=" + encodeURIComponent(destination);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
`;

    // Injecter après le début du composant export default function ... {, si possible.
    home = home.replace(/export default function ([^{]+)\{/, (m) => m + hook);
  }

  if (home !== beforeHome) {
    backup(homePath, '.bak-home-click-fallback');
    fs.writeFileSync(homePath, home, 'utf8');
    console.log('OK homepage: boutons catégories/villes corrigés avec fallback de navigation.');
  }
}

// 3) Ajouter formulaire client avant réservation dans /resultats.
const resultatsPath = path.join(root, 'app', 'resultats', 'page.tsx');
if (fs.existsSync(resultatsPath)) {
  backup(resultatsPath, '.bak-client-reservation-form');
  let code = fs.readFileSync(resultatsPath, 'utf8');
  const before = code;

  // Ajouter states client.
  if (!code.includes('clientNom')) {
    code = code.replace(
      'const [message, setMessage] = useState("");',
      `const [message, setMessage] = useState("");
  const [clientNom, setClientNom] = useState("");
  const [clientTelephone, setClientTelephone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientMessage, setClientMessage] = useState("");
  const [heureArrivee, setHeureArrivee] = useState("");`
    );
  }

  // Validation avant insert.
  if (!code.includes('Merci de renseigner votre nom et téléphone')) {
    code = code.replace(
      'async function reserver(logement: Logement, total: number) {\n    setMessage("");',
      `async function reserver(logement: Logement, total: number) {
    setMessage("");
    if (!clientNom.trim() || !clientTelephone.trim()) {
      setMessage("Merci de renseigner votre nom et téléphone avant de réserver.");
      return;
    }`
    );
  }

  // Ajouter champs client dans insert reservations.
  if (!code.includes('client_nom: clientNom.trim()')) {
    code = code.replace(
      'statut: paiement === "ligne" ? "Payée en ligne" : "Pré-confirmée",',
      `statut: paiement === "ligne" ? "Payée en ligne" : "Pré-confirmée",
      client_nom: clientNom.trim(),
      client_telephone: clientTelephone.trim(),
      client_email: clientEmail.trim(),
      client_message: clientMessage.trim(),
      heure_arrivee: heureArrivee,`
    );
  }

  // Ajouter paramètres vers confirmation.
  if (!code.includes('clientNom') || !code.includes('client_nom')) {
    // states/insert not added; ignore
  }
  if (!code.includes('nom: clientNom.trim()') && code.includes('const confirmParams = new URLSearchParams({')) {
    code = code.replace(
      'statut: paiement === "ligne" ? "Payée en ligne" : "Pré-confirmée",\n    });',
      `statut: paiement === "ligne" ? "Payée en ligne" : "Pré-confirmée",
      nom: clientNom.trim(),
      telephone: clientTelephone.trim(),
    });`
    );
  }

  // Ajouter bloc formulaire client dans aside Paiement, avant critères actifs.
  if (!code.includes('Vos informations')) {
    const clientForm = `
              <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-[#e5d3b3]">
                <h4 className="font-black">Vos informations</h4>
                <p className="mt-1 text-xs text-[#7a6446]">Ces informations permettent de confirmer votre réservation.</p>
                <div className="mt-3 grid gap-3">
                  <input value={clientNom} onChange={(e) => setClientNom(e.target.value)} placeholder="Nom complet *" className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none" />
                  <input value={clientTelephone} onChange={(e) => setClientTelephone(e.target.value)} placeholder="Téléphone *" className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none" />
                  <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Email" className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none" />
                  <input value={heureArrivee} onChange={(e) => setHeureArrivee(e.target.value)} placeholder="Heure d’arrivée approximative" className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none" />
                  <textarea value={clientMessage} onChange={(e) => setClientMessage(e.target.value)} placeholder="Message optionnel" rows={3} className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none" />
                </div>
              </div>
`;
    code = code.replace(
      '<div className="mt-5 rounded-2xl bg-[#f4ead7] p-4 text-sm text-[#7a6446]"><b>Critères actifs</b>',
      clientForm + '              <div className="mt-5 rounded-2xl bg-[#f4ead7] p-4 text-sm text-[#7a6446]"><b>Critères actifs</b>'
    );
  }

  if (code !== before) {
    fs.writeFileSync(resultatsPath, code, 'utf8');
    console.log('OK /resultats: formulaire client ajouté avant réservation.');
  } else {
    console.log('INFO /resultats: aucune modification formulaire client détectée.');
  }
}

// 4) Mise à jour admin-reservations pour afficher client si page existe.
const adminResPath = path.join(root, 'app', 'admin-reservations', 'page.tsx');
if (fs.existsSync(adminResPath)) {
  backup(adminResPath, '.bak-client-fields');
  let admin = fs.readFileSync(adminResPath, 'utf8');
  const beforeAdmin = admin;
  if (!admin.includes('Client')) {
    admin = admin.replace('<th className="py-3">Logement</th>', '<th className="py-3">Client</th><th className="py-3">Logement</th>');
    admin = admin.replace('<td className="py-3 font-bold">{getText(r, ["logement_titre", "titre", "logement", "property_title", "nom_logement"])}</td>', '<td className="py-3"><b>{getText(r, ["client_nom", "nom_client", "nom"])}</b><br /><span className="text-xs text-[#7a6446]">{getText(r, ["client_telephone", "telephone", "phone"])}</span></td><td className="py-3 font-bold">{getText(r, ["logement_titre", "titre", "logement", "property_title", "nom_logement"])}</td>');
    admin = admin.replace('colSpan={8}', 'colSpan={9}');
  }
  if (admin !== beforeAdmin) {
    fs.writeFileSync(adminResPath, admin, 'utf8');
    console.log('OK admin-reservations: colonnes client ajoutées.');
  }
}

// 5) SQL colonnes client pour reservations.
const sql = `-- Colonnes client pour les réservations Mbnb
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
`;
fs.writeFileSync(path.join(root, 'supabase_add_client_reservation_columns.sql'), sql, 'utf8');
console.log('OK SQL créé: supabase_add_client_reservation_columns.sql');

console.log('\nTerminé ✅ Lance maintenant: npm run build');
