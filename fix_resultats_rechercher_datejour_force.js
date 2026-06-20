const fs = require('fs');
const path = require('path');

const root = process.cwd();
const file = path.join(root, 'app', 'resultats', 'page.tsx');

if (!fs.existsSync(file)) {
  console.error('ERREUR: app/resultats/page.tsx introuvable. Lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

let code = fs.readFileSync(file, 'utf8');

// 1) Remplacer tous les textes du bouton
code = code.split('Actualiser').join('Rechercher');

// 2) Ajouter une fonction robuste pour récupérer la date locale du jour
if (!code.includes('function dateAujourdhuiISO()')) {
  const helper = `
function dateAujourdhuiISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
`;

  const marker = 'function ResultatsContent()';
  const idx = code.indexOf(marker);
  if (idx !== -1) {
    code = code.slice(0, idx) + helper + '\n' + code.slice(idx);
  } else {
    console.error('ERREUR: impossible de trouver function ResultatsContent() dans app/resultats/page.tsx');
    process.exit(1);
  }
}

// 3) Supprimer ou neutraliser les anciens calculs de departInitial
code = code.replace(/\s*const\s+departInitial\s*=\s*params\.get\("depart"\)\s*\|\|\s*"[^"]*";\n/g, '\n');
code = code.replace(/\s*const\s+departInitial\s*=\s*params\.get\('depart'\)\s*\|\|\s*'[^']*';\n/g, '\n');

// 4) Forcer la date de départ affichée à la date du jour à l'ouverture de la page
code = code.replace(
  /const\s+\[depart,\s*setDepart\]\s*=\s*useState\([^;]*\);/g,
  'const [depart, setDepart] = useState(dateAujourdhuiISO());'
);

// 5) Transformer le clic du bouton en vraie recherche avec les critères actuels
const searchClick = `onClick={() => { window.location.href = '/resultats?destination=' + encodeURIComponent(destination) + '&arrivee=' + encodeURIComponent(arrivee) + '&depart=' + encodeURIComponent(depart) + '&voyageurs=' + voyageurs; }}`;
code = code.replace(/onClick=\{\(\) => setMessage\(""\)\}/g, searchClick);
code = code.replace(/onClick=\{\(\) => setMessage\(''\)\}/g, searchClick);

// 6) Petite correction si l'ancien bouton contient encore Rechercher sans action utile
// On laisse intact si le bouton a déjà window.location.href.

fs.writeFileSync(file, code, 'utf8');
console.log('OK: app/resultats/page.tsx corrigé.');
console.log('- Bouton: Rechercher');
console.log('- Date départ: jour J à chaque ouverture de la page');
console.log('- Le bouton relance la recherche avec les critères actuels');
