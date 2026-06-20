const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pagePath = path.join(root, 'app', 'page.tsx');
const cssPath = path.join(root, 'app', 'globals.css');

if (!fs.existsSync(pagePath)) {
  console.error('ERREUR: app/page.tsx introuvable. Lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

let page = fs.readFileSync(pagePath, 'utf8');
const before = page;

// Suppression brute des textes de menu qui restent visibles et non fonctionnels.
// On enlève uniquement les libellés exacts du menu, puis on restaure les textes utiles si besoin.
const labelsToRemove = [
  'Expériences',
  'Experiences',
  'Devenir hôte',
  'Devenir hote',
  'À propos',
  'A propos',
  'Mettre mon logement',
  // Séjours est aussi dans le menu. On le retire puis on restaure le badge utile plus bas.
  'Séjours',
  'Sejours'
];

for (const label of labelsToRemove) {
  page = page.split(label).join('');
}

// Restaurer les textes utiles qui ne sont PAS le menu.
page = page.replaceAll('Mbnb ·  authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc');
page = page.replaceAll('Mbnb ·  authentiques', 'Mbnb · Séjours authentiques');
page = page.replaceAll(' authenticues', ' authentiques');
page = page.replaceAll('Trouver un ', 'Trouver un séjour');
page = page.replaceAll('Trouvez votre ', 'Trouvez votre séjour');
page = page.replaceAll('Votre  au Maroc', 'Votre séjour au Maroc');

// Nettoyer les doubles espaces visuels dans les className/textes.
page = page.replaceAll('  ', ' ');

fs.writeFileSync(pagePath + '.bak-remove-visible-menu-text', before, 'utf8');
fs.writeFileSync(pagePath, page, 'utf8');

// CSS global pour cacher les boutons/liens vides laissés par la suppression sur mobile.
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  const start = '/* MBNT_HIDE_EMPTY_MOBILE_MENU_START */';
  const end = '/* MBNT_HIDE_EMPTY_MOBILE_MENU_END */';
  let s = css.indexOf(start);
  let e = css.indexOf(end);
  if (s !== -1 && e !== -1 && e > s) {
    css = css.slice(0, s) + css.slice(e + end.length);
  }
  const block = `

/* MBNT_HIDE_EMPTY_MOBILE_MENU_START */
@media (max-width: 767px) {
  button:empty,
  a:empty {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    border: 0 !important;
    pointer-events: none !important;
  }

  /* Si une barre se retrouve vide après suppression des libellés */
  nav:empty,
  div:empty {
    display: none !important;
  }
}
/* MBNT_HIDE_EMPTY_MOBILE_MENU_END */
`;
  fs.writeFileSync(cssPath, css.trimEnd() + block, 'utf8');
}

console.log('OK: textes du menu non fonctionnel supprimés.');
console.log('OK: boutons/liens vides masqués sur mobile.');
console.log('Backup créé: app/page.tsx.bak-remove-visible-menu-text');
console.log('Lance maintenant: npm run build');
