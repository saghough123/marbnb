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

// Remonter encore un peu le bloc hero mobile, jusqu'à la limite visuelle de la photo de la porte.
// On réduit le padding top mobile et le masque haut, sans refaire apparaître le faux menu imprimé.
const pageReplacements = [
  ['pt-[220px]', 'pt-[135px]'],
  ['pt-[190px]', 'pt-[135px]'],
  ['pt-[165px]', 'pt-[135px]'],
  ['pt-[150px]', 'pt-[135px]'],
  ['h-[210px]', 'h-[125px]'],
  ['h-[190px]', 'h-[125px]'],
  ['h-[150px]', 'h-[125px]'],
  ['Trouver un séjourséjour', 'Trouver un séjour'],
  ['Trouver un séjour séjour', 'Trouver un séjour'],
  ['Trouver un séjourjour', 'Trouver un séjour'],
  ['Mbnb ·  authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc'],
  ['Mbnb · authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc'],
  ['Mbnb · Séjours Séjours authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc'],
];

for (const [bad, good] of pageReplacements) {
  page = page.split(bad).join(good);
}

// Si le conteneur hero a encore une classe standard, la remplacer.
page = page.replace(
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-36 md:py-16"',
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-[135px] md:py-16"'
);
page = page.replace(
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-16"',
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-[135px] md:py-16"'
);

if (page !== beforePage) {
  fs.writeFileSync(pagePath + '.bak-hero-mobile-limit-porte', beforePage, 'utf8');
  fs.writeFileSync(pagePath, page, 'utf8');
  console.log('OK: carte hero mobile remontée plus haut dans app/page.tsx');
  console.log('Backup créé: app/page.tsx.bak-hero-mobile-limit-porte');
} else {
  console.log('Info: aucune modification détectée dans app/page.tsx');
}

if (!fs.existsSync(cssPath)) {
  console.error('ERREUR: app/globals.css introuvable.');
  process.exit(1);
}

let css = fs.readFileSync(cssPath, 'utf8');
const beforeCss = css;

// Ajuster le cadrage mobile pour conserver la porte visible et réduire l'espace haut.
const cssReplacements = [
  [/height:\s*210px\s*!important;/g, 'height: 130px !important;'],
  [/height:\s*190px\s*!important;/g, 'height: 130px !important;'],
  [/height:\s*155px\s*!important;/g, 'height: 130px !important;'],
  [/height:\s*150px\s*!important;/g, 'height: 130px !important;'],
  [/translateY\(80px\)/g, 'translateY(25px)'],
  [/translateY\(45px\)/g, 'translateY(25px)'],
  [/scale\(1\.18\)/g, 'scale(1.08)'],
  [/scale\(1\.12\)/g, 'scale(1.08)'],
  [/object-position:\s*center\s*78%\s*!important;/g, 'object-position: center 64% !important;'],
  [/object-position:\s*center\s*70%\s*!important;/g, 'object-position: center 64% !important;'],
];

for (const [regex, repl] of cssReplacements) {
  css = css.replace(regex, repl);
}

if (css !== beforeCss) {
  fs.writeFileSync(cssPath + '.bak-hero-mobile-limit-porte', beforeCss, 'utf8');
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('OK: cadrage mobile ajusté dans app/globals.css');
  console.log('Backup créé: app/globals.css.bak-hero-mobile-limit-porte');
} else {
  console.log('Info: aucune modification détectée dans app/globals.css');
}

console.log('Terminé. Lance maintenant: npm run build');
