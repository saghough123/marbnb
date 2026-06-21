const fs = require('fs');
const path = require('path');

const root = process.cwd();

function backup(file, suffix) {
  if (fs.existsSync(file)) {
    fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
  }
}

function replaceAllSafe(text, replacements) {
  let out = text;
  for (const [from, to] of replacements) out = out.split(from).join(to);
  return out;
}

const globalReplacements = [
  ['Les logements affichés viennent maintenant de la vraie base de données Supabase.', 'Découvrez une sélection de logements vérifiés pour votre séjour au Maroc.'],
  ['Résultats Mbnb · Données Supabase', 'Résultats Mbnb'],
  ['Données Supabase', 'Séjours sélectionnés'],
  ['La demande sera enregistrée dans Supabase avec le statut “En attente”.', 'Votre demande sera étudiée rapidement par notre équipe avant publication.'],
  ['Les photos seront uploadées dans Supabase Storage.', 'Ajoutez de belles photos pour valoriser votre logement.'],
  ['Elle sera envoyée automatiquement dans Supabase Storage.', 'Elle sera ajoutée automatiquement à votre demande.'],
  ['Un administrateur Mbnb pourra la suivre depuis l’espace Admin.', 'Notre équipe prendra le relais pour confirmer les prochaines étapes.'],
  ['Admin réservations', 'Suivi réservation'],
  ['Erreur Supabase : ', 'Erreur technique : '],
  ['Supabase', ''],
];

const filesToClean = [
  'app/page.tsx',
  'app/resultats/page.tsx',
  'app/hote/page.tsx',
  'app/reservation-confirmation/page.tsx',
  'app/admin-dashboard/page.tsx',
  'app/admin-demandes/page.tsx',
  'app/admin-logements/page.tsx',
  'app/admin-reservations/page.tsx',
];

for (const rel of filesToClean) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  backup(file, '.bak-polish-copy-design');
  let text = fs.readFileSync(file, 'utf8');
  text = replaceAllSafe(text, globalReplacements);
  fs.writeFileSync(file, text, 'utf8');
  console.log('OK copy nettoyée:', rel);
}

// Amélioration visuelle globale douce : cartes premium, boutons, typo, fond.
const cssPath = path.join(root, 'app', 'globals.css');
if (fs.existsSync(cssPath)) {
  backup(cssPath, '.bak-polish-design');
  let css = fs.readFileSync(cssPath, 'utf8');
  const start = '/* MBNB_POLISH_DESIGN_START */';
  const end = '/* MBNB_POLISH_DESIGN_END */';
  const s = css.indexOf(start);
  const e = css.indexOf(end);
  if (s !== -1 && e !== -1 && e > s) css = css.slice(0, s) + css.slice(e + end.length);

  const block = `

${start}
:root {
  --mbnb-cream: #f4ead7;
  --mbnb-paper: #fff8ec;
  --mbnb-green: #0f2f22;
  --mbnb-red: #c1121f;
  --mbnb-brown: #7a3d14;
  --mbnb-border: #e5d3b3;
}

html {
  scroll-behavior: smooth;
}

body {
  background:
    radial-gradient(circle at 12% 8%, rgba(193, 18, 31, 0.07), transparent 26rem),
    radial-gradient(circle at 88% 18%, rgba(15, 47, 34, 0.08), transparent 28rem),
    linear-gradient(180deg, #f8efdf 0%, var(--mbnb-cream) 48%, #efe0c7 100%);
}

button, a {
  transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

button:hover, a:hover {
  transform: translateY(-1px);
}

input, select, textarea {
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

input:focus, select:focus, textarea:focus {
  border-color: rgba(193, 18, 31, 0.45) !important;
  box-shadow: 0 0 0 4px rgba(193, 18, 31, 0.08) !important;
}

.rounded-\[2rem\] {
  box-shadow: 0 18px 45px rgba(87, 55, 24, 0.06);
}

.bg-\[\#fff8ec\] {
  background-color: rgba(255, 248, 236, 0.96) !important;
}

.ring-\[\#e5d3b3\], .border-\[\#e5d3b3\] {
  border-color: rgba(210, 176, 122, 0.72) !important;
}

@media (max-width: 767px) {
  .text-5xl { font-size: 2.45rem !important; line-height: 1.05 !important; }
  .text-4xl { font-size: 2rem !important; line-height: 1.08 !important; }
  .rounded-\[2rem\] { border-radius: 1.45rem !important; }
}
${end}
`;
  fs.writeFileSync(cssPath, css.trimEnd() + block, 'utf8');
  console.log('OK design global amélioré: app/globals.css');
}

// Amélioration ciblée de la page confirmation : texte plus client-friendly et suppression lien admin public.
const confirmPath = path.join(root, 'app', 'reservation-confirmation', 'page.tsx');
if (fs.existsSync(confirmPath)) {
  let confirm = fs.readFileSync(confirmPath, 'utf8');
  backup(confirmPath, '.bak-polish-confirmation');
  confirm = replaceAllSafe(confirm, [
    ['Demande enregistrée ✅', 'Réservation enregistrée ✅'],
    ['Votre réservation a bien été enregistrée. Notre équipe prendra le relais pour confirmer les prochaines étapes.', 'Votre demande de réservation a bien été reçue. Notre équipe vous contactera rapidement pour finaliser les prochaines étapes.'],
    ['<a href="/admin-reservations" className="rounded-full bg-[#7a3d14] px-6 py-3 text-sm font-black text-white">Suivi réservation</a>', ''],
    ['<a href="/admin-reservations" className="rounded-full bg-[#7a3d14] px-6 py-3 text-sm font-black text-white">Admin réservations</a>', ''],
    ['Total estimé', 'Total du séjour'],
    ['Réservation confirmée', 'Confirmation Mbnb'],
  ]);
  fs.writeFileSync(confirmPath, confirm, 'utf8');
  console.log('OK page confirmation rendue plus client-friendly.');
}

// Corriger total à 0 nuit : si depart <= arrivee, forcer 1 nuit dans resultats.
const resultatsPath = path.join(root, 'app', 'resultats', 'page.tsx');
if (fs.existsSync(resultatsPath)) {
  let res = fs.readFileSync(resultatsPath, 'utf8');
  backup(resultatsPath, '.bak-polish-nuits');
  res = res.replace(
    'return diff > 0 ? diff : 0;',
    'return diff > 0 ? diff : 1;'
  );
  fs.writeFileSync(resultatsPath, res, 'utf8');
  console.log('OK nuits minimum corrigé à 1 dans /resultats.');
}

console.log('\nTerminé ✅');
console.log('Ensuite lance: npm run build');
console.log('Puis teste: npx next dev --webpack');
