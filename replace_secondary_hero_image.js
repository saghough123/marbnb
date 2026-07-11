const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pagePath = path.join(root, 'app', 'page.tsx');

function backup(file, suffix) {
  if (fs.existsSync(file)) {
    fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
  }
}

if (!fs.existsSync(pagePath)) {
  console.error('ERREUR: app/page.tsx introuvable');
  process.exit(1);
}

backup(pagePath, '.bak-secondary-hero');
let code = fs.readFileSync(pagePath, 'utf8');
const before = code;

// L'objectif est de changer UNIQUEMENT le 2ème grand hero / CTA,
// pas l'image principale du haut ni les images des logements.
// On cherche la zone qui contient les textes du hero secondaire.
const markers = [
  'Vivez le Maroc',
  'réservez votre',
  'logement autrement',
  'Plateforme marocaine',
  'Paiement flexible'
];

let markerIndex = -1;
for (const marker of markers) {
  const idx = code.indexOf(marker);
  if (idx !== -1 && (markerIndex === -1 || idx < markerIndex)) markerIndex = idx;
}

if (markerIndex === -1) {
  console.log('INFO: texte du hero secondaire non trouvé. Recherche alternative: deuxième occurrence marbnb-hero-mix.');
  const first = code.indexOf('/marbnb-hero-mix.png');
  const second = first === -1 ? -1 : code.indexOf('/marbnb-hero-mix.png', first + 1);
  if (second !== -1) {
    code = code.slice(0, second) + '/marbnb-hero-secondary.png' + code.slice(second + '/marbnb-hero-mix.png'.length);
  }
} else {
  // On prend une fenêtre autour du hero secondaire.
  const start = Math.max(0, markerIndex - 2500);
  const end = Math.min(code.length, markerIndex + 4500);
  const beforePart = code.slice(0, start);
  let block = code.slice(start, end);
  const afterPart = code.slice(end);

  const blockBefore = block;

  // Cas 1 : backgroundImage en style objet, quelle que soit la syntaxe.
  block = block.replace(/backgroundImage\s*:\s*[`"']url\([^`"']+\)[`"']/g, 'backgroundImage: "url(/marbnb-hero-secondary.png)"');

  // Cas 2 : simple chemin dans le bloc.
  block = block.replaceAll('/marbnb-hero-mix.png', '/marbnb-hero-secondary.png');

  // Cas 3 : image avec variable / constants.
  block = block.replaceAll('marbnb-hero-mix.png', 'marbnb-hero-secondary.png');

  if (block === blockBefore) {
    console.log('INFO: bloc trouvé mais aucune image à remplacer dans le bloc. Ajout classe fallback.');
    // On ajoute juste une classe data pour permettre fallback CSS si pas d'image inline détectée.
    block = block.replace(/<section([^>]*)>/, '<section$1 data-marbnb-secondary-hero="true">');
  }

  code = beforePart + block + afterPart;
}

// Fallback CSS: si le hero secondaire a l'attribut, forcer l'image de fond.
const cssPath = path.join(root, 'app', 'globals.css');
if (fs.existsSync(cssPath)) {
  backup(cssPath, '.bak-secondary-hero');
  let css = fs.readFileSync(cssPath, 'utf8');
  if (!css.includes('MARBNB_SECONDARY_HERO_IMAGE')) {
    css += `

/* MARBNB_SECONDARY_HERO_IMAGE */
[data-marbnb-secondary-hero="true"] {
  background-image: url('/marbnb-hero-secondary.png') !important;
  background-size: cover !important;
  background-position: center !important;
}
`;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('OK: fallback CSS hero secondaire ajouté.');
  }
}

if (code !== before) {
  fs.writeFileSync(pagePath, code, 'utf8');
  console.log('OK: hero secondaire modifié pour utiliser /marbnb-hero-secondary.png');
} else {
  console.log('ATTENTION: aucun changement dans app/page.tsx.');
  console.log('Copie-colle-moi la partie du fichier contenant: Vivez le Maroc');
}

console.log('\nTerminé ✅');
console.log('Vérifie que public/marbnb-hero-secondary.png existe.');
console.log('Puis lance: npm run build');
