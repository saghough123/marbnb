const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pagePath = path.join(root, 'app', 'page.tsx');
const cssPath = path.join(root, 'app', 'globals.css');

if (!fs.existsSync(pagePath)) {
  console.error('ERREUR: app/page.tsx introuvable. Lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

let code = fs.readFileSync(pagePath, 'utf8');
const before = code;

// 1) Corriger le bouton dupliqué causé par l'ancien script radical.
const buttonFixes = [
  ['Trouver un séjourséjour', 'Trouver un séjour'],
  ['Trouver un séjour séjour', 'Trouver un séjour'],
  ['Trouver un séjourjour', 'Trouver un séjour'],
  ['Trouver un séjoursséjour', 'Trouver un séjour'],
  ['Trouver un séjour séjour', 'Trouver un séjour'],
  ['Trouver un séjouréjour', 'Trouver un séjour'],
  ['Trouver un séjoursejour', 'Trouver un séjour'],
  ['Trouver un sejoursejour', 'Trouver un séjour'],
  ['Trouver un sejour', 'Trouver un séjour'],
];
for (const [bad, good] of buttonFixes) code = code.split(bad).join(good);

// 2) Le menu encore visible est dans l'image PNG de fond, pas un vrai menu HTML.
// On masque donc la partie haute de l'image dans le hero avec une bande propre.
// On insère une seule fois le cache visuel dans la section CTA.
if (!code.includes('MBNT_HIDE_FAKE_MENU_IN_IMAGE')) {
  const oldSnippet = `<div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />`;
  const newSnippet = `<div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
            {/* MBNT_HIDE_FAKE_MENU_IN_IMAGE */}
            <div className="absolute inset-x-0 top-0 h-32 bg-[#f4ead7]/95 md:hidden" />`;
  code = code.replace(oldSnippet, newSnippet);
}

// 3) Sur mobile, descendre légèrement le contenu pour ne pas toucher la zone masquée.
code = code.replace(
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-16"',
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-36 md:py-16"'
);

// 4) Si l'image utilise object-cover, on force le cadrage vers le bas sur mobile pour éviter la zone du faux menu.
code = code.replace(
  'className="h-full w-full object-cover"',
  'className="h-full w-full object-cover object-bottom md:object-center"'
);

// 5) Ne plus supprimer le mot Séjours dans les textes utiles.
code = code.replaceAll('Mbnb ·  authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc');
code = code.replaceAll('Mbnb · authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc');
code = code.replaceAll('Mbnb · Séjours Séjours authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc');

fs.writeFileSync(pagePath + '.bak-fake-menu-image-fix', before, 'utf8');
fs.writeFileSync(pagePath, code, 'utf8');

// 6) Ajouter une sécurité CSS globale pour que les liens/boutons vides ne prennent plus de place.
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  const start = '/* MBNT_FINAL_MOBILE_CLEAN_START */';
  const end = '/* MBNT_FINAL_MOBILE_CLEAN_END */';
  let s = css.indexOf(start);
  let e = css.indexOf(end);
  if (s !== -1 && e !== -1 && e > s) {
    css = css.slice(0, s) + css.slice(e + end.length);
  }
  const block = `

/* MBNT_FINAL_MOBILE_CLEAN_START */
@media (max-width: 767px) {
  button:empty,
  a:empty,
  nav:empty {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    border: 0 !important;
    pointer-events: none !important;
  }
}
/* MBNT_FINAL_MOBILE_CLEAN_END */
`;
  fs.writeFileSync(cssPath, css.trimEnd() + block, 'utf8');
}

console.log('OK: le faux menu dans l’image est masqué sur mobile.');
console.log('OK: bouton corrigé en "Trouver un séjour".');
console.log('Backup créé: app/page.tsx.bak-fake-menu-image-fix');
console.log('Lance maintenant: npm run build');
