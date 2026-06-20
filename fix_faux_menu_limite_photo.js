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
const beforePage = page;

// 1) Nettoyage des anciens masques mal positionnés.
page = page.replace(/\s*\{\/\* MBNT_HIDE_FAKE_MENU_IN_IMAGE \*\/\}\s*\n\s*<div className="[^"]*mbnb-fake-menu-mask[^"]*"\s*\/>/g, '');
page = page.replace(/\s*<div className="[^"]*mbnb-fake-menu-mask[^"]*"\s*\/>/g, '');

// 2) Corriger textes utiles qui ont pu être abîmés.
const textFixes = [
  ['Trouver un séjourséjour', 'Trouver un séjour'],
  ['Trouver un séjour séjour', 'Trouver un séjour'],
  ['Trouver un séjourjour', 'Trouver un séjour'],
  ['Trouver un sejour', 'Trouver un séjour'],
  ['Mbnb ·  authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc'],
  ['Mbnb · authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc'],
  ['Mbnb · Séjours Séjours authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc'],
];
for (const [bad, good] of textFixes) page = page.split(bad).join(good);

// 3) S'assurer que l'image de fond a une classe dédiée.
page = page.replace(
  'src="/porte-marocaine.png" alt="Porte traditionnelle marocaine" className="h-full w-full object-cover object-bottom md:object-center"',
  'src="/porte-marocaine.png" alt="Porte traditionnelle marocaine" className="mbnb-hero-bg h-full w-full object-cover object-bottom md:object-center"'
);
page = page.replace(
  'src="/porte-marocaine.png" alt="Porte traditionnelle marocaine" className="h-full w-full object-cover"',
  'src="/porte-marocaine.png" alt="Porte traditionnelle marocaine" className="mbnb-hero-bg h-full w-full object-cover object-bottom md:object-center"'
);

// 4) Ajouter un masque au-dessus de l'image, APRES les gradients, avec un vrai z-index.
const gradientSnippet = '<div className="absolute inset-0 bg-gradient-to-t from-[#f4ead7] via-transparent to-black/20" />';
const maskSnippet = `${gradientSnippet}\n            {/* MBNT_HIDE_FAKE_MENU_IN_IMAGE */}\n            <div className="mbnb-fake-menu-mask absolute inset-x-0 top-0 z-20 h-[175px] bg-[#fff8ec] md:hidden" />`;
if (page.includes(gradientSnippet) && !page.includes('MBNT_HIDE_FAKE_MENU_IN_IMAGE')) {
  page = page.replace(gradientSnippet, maskSnippet);
}

// 5) Positionner la carte juste à la limite du masque, donc un peu plus haut mais sans réafficher le menu imprimé.
page = page.replace(/pt-\[\d+px\]/g, 'pt-[175px]');
page = page.replace(
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-16"',
  'className="relative z-30 mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-[175px] md:py-16"'
);
page = page.replace(
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-[175px] md:py-16"',
  'className="relative z-30 mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-[175px] md:py-16"'
);
page = page.replace(
  'className="relative z-30 z-30 mx-auto',
  'className="relative z-30 mx-auto'
);

fs.writeFileSync(pagePath + '.bak-mask-faux-menu-definitif', beforePage, 'utf8');
fs.writeFileSync(pagePath, page, 'utf8');
console.log('OK: masque du faux menu renforcé et carte placée à la limite de la photo.');
console.log('Backup: app/page.tsx.bak-mask-faux-menu-definitif');

// 6) CSS global robuste.
if (!fs.existsSync(cssPath)) {
  console.error('ERREUR: app/globals.css introuvable.');
  process.exit(1);
}
let css = fs.readFileSync(cssPath, 'utf8');
const start = '/* MBNT_FAKE_MENU_FINAL_POSITION_START */';
const end = '/* MBNT_FAKE_MENU_FINAL_POSITION_END */';
let s = css.indexOf(start);
let e = css.indexOf(end);
if (s !== -1 && e !== -1 && e > s) css = css.slice(0, s) + css.slice(e + end.length);

const block = `

/* MBNT_FAKE_MENU_FINAL_POSITION_START */
@media (max-width: 767px) {
  .mbnb-hero-bg {
    object-position: center 68% !important;
    transform: scale(1.10) translateY(35px) !important;
    transform-origin: center bottom !important;
  }

  .mbnb-fake-menu-mask {
    display: block !important;
    height: 175px !important;
    background: #fff8ec !important;
    z-index: 20 !important;
    pointer-events: none !important;
  }
}
/* MBNT_FAKE_MENU_FINAL_POSITION_END */
`;
fs.writeFileSync(cssPath, css.trimEnd() + block, 'utf8');
console.log('OK: CSS mobile final ajouté dans app/globals.css');
console.log('Lance maintenant: npm run build');
