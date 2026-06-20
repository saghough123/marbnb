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

// Remonter le bloc hero mobile : moins d'espace entre header et carte.
// Avant : pt-[220px] / masque 210px. Nouveau : pt-[165px] / masque 155px.
const replacements = [
  ['pt-[220px]', 'pt-[165px]'],
  ['pt-[210px]', 'pt-[165px]'],
  ['pt-[190px]', 'pt-[165px]'],
  ['h-[190px]', 'h-[150px]'],
  ['h-[210px]', 'h-[150px]'],
  ['h-32', 'h-[150px]'],
  ['Trouver un séjourséjour', 'Trouver un séjour'],
  ['Trouver un séjour séjour', 'Trouver un séjour'],
  ['Trouver un séjourjour', 'Trouver un séjour'],
  ['Mbnb ·  authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc'],
  ['Mbnb · authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc'],
  ['Mbnb · Séjours Séjours authentiques au Maroc', 'Mbnb · Séjours authentiques au Maroc'],
];

for (const [bad, good] of replacements) {
  page = page.split(bad).join(good);
}

// Si la classe exacte du conteneur n'existe pas, remplacer py-16 standard dans le hero CTA.
page = page.replace(
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-36 md:py-16"',
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-[165px] md:py-16"'
);
page = page.replace(
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-16"',
  'className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-[165px] md:py-16"'
);

if (page !== before) {
  fs.writeFileSync(pagePath + '.bak-remonter-hero-mobile', before, 'utf8');
  fs.writeFileSync(pagePath, page, 'utf8');
  console.log('OK: bloc hero mobile remonté dans app/page.tsx');
  console.log('Backup créé: app/page.tsx.bak-remonter-hero-mobile');
} else {
  console.log('Aucune modification détectée dans app/page.tsx.');
}

// Ajuster aussi le CSS global si le script précédent l'avait ajouté.
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  const beforeCss = css;

  css = css.replace(/height:\s*210px\s*!important;/g, 'height: 155px !important;');
  css = css.replace(/height:\s*190px\s*!important;/g, 'height: 155px !important;');
  css = css.replace(/translateY\(80px\)/g, 'translateY(45px)');
  css = css.replace(/scale\(1\.18\)/g, 'scale(1.12)');
  css = css.replace(/object-position:\s*center\s*78%\s*!important;/g, 'object-position: center 70% !important;');

  if (css !== beforeCss) {
    fs.writeFileSync(cssPath + '.bak-remonter-hero-mobile', beforeCss, 'utf8');
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('OK: cadrage mobile ajusté dans app/globals.css');
    console.log('Backup créé: app/globals.css.bak-remonter-hero-mobile');
  }
}

console.log('Terminé. Lance maintenant: npm run build');
