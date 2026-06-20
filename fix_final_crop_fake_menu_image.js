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

// Le faux menu est imprimé dans l'image de fond. On le sort du cadre mobile
// en recadrant l'image plus bas + en ajoutant un masque haut beaucoup plus grand.

// 1) Corriger texte bouton dupliqué.
const fixes = [
  ['Trouver un séjourséjour', 'Trouver un séjour'],
  ['Trouver un séjour séjour', 'Trouver un séjour'],
  ['Trouver un séjourjour', 'Trouver un séjour'],
  ['Trouver un sejour', 'Trouver un séjour'],
  ['Mbnb ·  authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc'],
  ['Mbnb · authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc'],
  ['Mbnb · Séjours Séjours authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc'],
];
for (const [bad, good] of fixes) page = page.split(bad).join(good);

// 2) Donner une classe spécifique à l'image de fond si elle n'existe pas.
page = page.replace(
  'src="/porte-marocaine.png" alt="Porte traditionnelle marocaine" className="h-full w-full object-cover object-bottom md:object-center"',
  'src="/porte-marocaine.png" alt="Porte traditionnelle marocaine" className="mbnb-hero-bg h-full w-full object-cover object-bottom md:object-center"'
);
page = page.replace(
  'src="/porte-marocaine.png" alt="Porte traditionnelle marocaine" className="h-full w-full object-cover"',
  'src="/porte-marocaine.png" alt="Porte traditionnelle marocaine" className="mbnb-hero-bg h-full w-full object-cover object-bottom md:object-center"'
);

// 3) Remplacer / agrandir le masque précédent s'il existe.
page = page.replace(
  '<div className="absolute inset-x-0 top-0 h-32 bg-[#f4ead7]/95 md:hidden" />',
  '<div className="mbnb-fake-menu-mask absolute inset-x-0 top-0 h-[190px] bg-[#f4ead7] md:hidden" />'
);

// 4) Si aucun masque n'existe, l'ajouter après le gradient sombre.
if (!page.includes('mbnb-fake-menu-mask')) {
  const oldSnippet = '<div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />';
  const newSnippet = oldSnippet + '\n            <div className="mbnb-fake-menu-mask absolute inset-x-0 top-0 h-[190px] bg-[#f4ead7] md:hidden" />';
  page = page.replace(oldSnippet, newSnippet);
}

// 5) Descendre le contenu hero sur mobile pour passer sous le masque haut.
page = page.replace(
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-36 md:py-16"',
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-[220px] md:py-16"'
);
page = page.replace(
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-16"',
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-[220px] md:py-16"'
);

fs.writeFileSync(pagePath + '.bak-final-fake-menu-crop', before, 'utf8');
fs.writeFileSync(pagePath, page, 'utf8');

// 6) CSS global: recadrage beaucoup plus bas sur mobile + masque robuste.
if (!fs.existsSync(cssPath)) {
  console.error('ERREUR: app/globals.css introuvable.');
  process.exit(1);
}
let css = fs.readFileSync(cssPath, 'utf8');
const start = '/* MBNT_FINAL_FAKE_MENU_CROP_START */';
const end = '/* MBNT_FINAL_FAKE_MENU_CROP_END */';
let s = css.indexOf(start);
let e = css.indexOf(end);
if (s !== -1 && e !== -1 && e > s) css = css.slice(0, s) + css.slice(e + end.length);

const block = `

/* MBNT_FINAL_FAKE_MENU_CROP_START */
@media (max-width: 767px) {
  .mbnb-hero-bg {
    object-position: center 78% !important;
    transform: scale(1.18) translateY(80px) !important;
    transform-origin: center bottom !important;
  }

  .mbnb-fake-menu-mask {
    display: block !important;
    height: 210px !important;
    background: linear-gradient(to bottom, #fff8ec 0%, #fff8ec 72%, rgba(255,248,236,0.92) 100%) !important;
    z-index: 5 !important;
    pointer-events: none !important;
  }
}
/* MBNT_FINAL_FAKE_MENU_CROP_END */
`;
fs.writeFileSync(cssPath, css.trimEnd() + block, 'utf8');

console.log('OK: faux menu imprimé dans l’image recadré et masqué fortement sur mobile.');
console.log('OK: bouton corrigé: Trouver un séjour.');
console.log('Backup: app/page.tsx.bak-final-fake-menu-crop');
console.log('Lance: npm run build');
