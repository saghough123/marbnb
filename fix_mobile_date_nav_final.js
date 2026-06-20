const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pagePath = path.join(root, 'app', 'page.tsx');

if (!fs.existsSync(pagePath)) {
  console.error('ERREUR: app/page.tsx introuvable. Lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

let code = fs.readFileSync(pagePath, 'utf8');
const before = code;

// 1) Ajouter la fonction date du jour si elle n'existe pas.
if (!code.includes('function dateAujourdhuiISO()')) {
  const marker = 'export default function Home()';
  const idx = code.indexOf(marker);
  if (idx === -1) {
    console.error('ERREUR: impossible de trouver export default function Home()');
    process.exit(1);
  }
  const helper = `
function dateAujourdhuiISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function demainISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

`;
  code = code.slice(0, idx) + helper + code.slice(idx);
}

// 2) Forcer les dates par défaut de la page accueil / détail logement.
// Arrivée = jour J, Départ = lendemain pour éviter 0 nuit ou période inversée.
code = code.replace(/const\s+\[arrivee,\s*setArrivee\]\s*=\s*useState\([^;]*\);/g,
  'const [arrivee, setArrivee] = useState(dateAujourdhuiISO());');
code = code.replace(/const\s+\[depart,\s*setDepart\]\s*=\s*useState\([^;]*\);/g,
  'const [depart, setDepart] = useState(demainISO());');

// 3) Masquer définitivement le menu desktop sur mobile.
// On cible les textes visibles sur ta capture: Séjours, Expériences, Devenir hôte, À propos.
code = code.replace(/<div className="([^"]*)">\s*<button[^>]*>Séjours<\/button>\s*<button[^>]*>Expériences<\/button>\s*<button[^>]*>Devenir hôte<\/button>\s*<button[^>]*>À propos<\/button>\s*<\/div>/g,
  (match, classes) => match.replace(`className="${classes}"`, `className="hidden md:flex ${classes.replace('hidden','').replace('md:flex','').trim()}"`));

// Si le menu est codé en liens <a> ou partiellement différent, on masque la ligne parent la plus fréquente.
code = code.replaceAll('className="flex items-center gap-8 text-sm font-bold"', 'className="hidden items-center gap-8 text-sm font-bold md:flex"');
code = code.replaceAll('className="flex items-center gap-6 text-sm font-bold"', 'className="hidden items-center gap-6 text-sm font-bold md:flex"');
code = code.replaceAll('className="flex justify-center gap-8 text-sm font-bold"', 'className="hidden justify-center gap-8 text-sm font-bold md:flex"');
code = code.replaceAll('className="flex justify-center gap-6 text-sm font-bold"', 'className="hidden justify-center gap-6 text-sm font-bold md:flex"');
code = code.replaceAll('className="sticky top-16 z-20 border-b', 'className="hidden md:block sticky top-16 z-20 border-b');
code = code.replaceAll('className="border-b border-[#e5d3b3] bg-[#fff8ec]/80', 'className="hidden md:block border-b border-[#e5d3b3] bg-[#fff8ec]/80');

// 4) Corriger les libellés cassés de la fiche mobile.
const replacements = [
  ['ARRIV‰E', 'ARRIVÉE'], ['ARRIVÃ‰E', 'ARRIVÉE'], ['ARRIVÃ©E', 'ARRIVÉE'], ['ARRIV�E', 'ARRIVÉE'], ['ARRIV%E', 'ARRIVÉE'],
  ['DÃ‰PART', 'DÉPART'], ['DÃ©PART', 'DÉPART'], ['D‰PART', 'DÉPART'], ['D�PART', 'DÉPART'], ['D%PART', 'DÉPART'],
  ['Ã‰quipements', 'Équipements'], ['Ã©quipements', 'équipements'], ['Wiâ€‘Fi', 'Wi‑Fi'], ['Â·', '·'], ['â†’', '→']
];
for (const [bad, good] of replacements) code = code.split(bad).join(good);

// 5) Forcer les labels juste avant les inputs date.
code = code.replace(/<p className="text-xs font-black">[^<]*<\/p><input type="date" value=\{arrivee\}/g,
  '<p className="text-xs font-black">ARRIVÉE</p><input type="date" value={arrivee}');
code = code.replace(/<p className="text-xs font-black">[^<]*<\/p><input type="date" value=\{depart\}/g,
  '<p className="text-xs font-black">DÉPART</p><input type="date" value={depart}');

if (code !== before) {
  fs.writeFileSync(pagePath + '.bak-mobile-date-nav', before, 'utf8');
  fs.writeFileSync(pagePath, code, 'utf8');
  console.log('OK: date accueil/détail corrigée + menu mobile masqué + libellés date corrigés.');
  console.log('Arrivée = jour J, Départ = lendemain.');
  console.log('Backup: app/page.tsx.bak-mobile-date-nav');
} else {
  console.log('Aucune modification détectée. Envoie-moi app/page.tsx si le problème persiste.');
}
