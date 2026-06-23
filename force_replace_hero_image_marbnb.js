const fs = require('fs');
const path = require('path');

const root = process.cwd();
function backup(file, suffix) {
  if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
}

// Objectif : forcer l'image hero de la page d'accueil et resultats vers /marbnb-hero-mix.png
// Le problème venait du fait que l'image affichée est utilisée en background CSS/classe inline,
// pas forcément en balise <img>, donc le script précédent n'a pas touché la bonne référence.

const HERO = '/marbnb-hero-mix.png';
const publicHero = path.join(root, 'public', 'marbnb-hero-mix.png');

if (!fs.existsSync(publicHero)) {
  console.log('ATTENTION: public/marbnb-hero-mix.png introuvable.');
  console.log('Mets la nouvelle image dans: public/marbnb-hero-mix.png');
  console.log('Le script va quand même forcer le code à pointer vers cette image.');
}

function forceHeroInFile(file) {
  if (!fs.existsSync(file)) return;
  backup(file, '.bak-force-new-hero');
  let code = fs.readFileSync(file, 'utf8');
  const before = code;

  // Remplacer toutes les anciennes références probables vers les images de mosquée / porte / Marrakech / hero.
  code = code
    .replace(/\/[^"'`\s)]*(mosquee|mosque|koutoubia|marrakech|porte|hero|atlas)[^"'`\s)]*\.(png|jpg|jpeg|webp)/gi, HERO)
    .replace(/url\((['"]?)\/[^)'"`]*(mosquee|mosque|koutoubia|marrakech|porte|hero|atlas)[^)'"`]*\.(png|jpg|jpeg|webp)\1\)/gi, `url(${HERO})`)
    .replace(/backgroundImage:\s*`url\([^`]+\)`/g, `backgroundImage: \`url(${HERO})\``)
    .replace(/backgroundImage:\s*["']url\([^"']+\)["']/g, `backgroundImage: "url(${HERO})"`);

  // Forcer spécifiquement les grands blocs hero qui ont style backgroundImage.
  code = code.replace(/style=\{\{\s*backgroundImage:\s*[^}]+\}\}/g, `style={{ backgroundImage: "url(${HERO})" }}`);

  // Si une image hero est en <img> dans les grandes sections, forcer également.
  code = code.replace(/<img([^>]+)(src=\{?[^\s>]+\}?)([^>]+className="[^"]*(h-\[|min-h|object-cover)[^"]*"[^>]*)>/gi, `<img$1src="${HERO}"$3>`);
  code = code.replace(/<img([^>]+className="[^"]*(h-\[|min-h|object-cover)[^"]*"[^>]*)(src=\{?[^\s>]+\}?)([^>]*)>/gi, `<img$1src="${HERO}"$4>`);

  // Ajouter un marqueur/fallback sur la page accueil si aucune référence n'a été trouvée.
  if ((file.endsWith(path.join('app', 'page.tsx')) || file.endsWith(path.join('app', 'resultats', 'page.tsx'))) && !code.includes(HERO)) {
    console.log('INFO: aucune référence hero trouvée dans ' + path.relative(root, file) + ', aucune injection risquée faite.');
  }

  if (code !== before) {
    fs.writeFileSync(file, code, 'utf8');
    console.log('OK: nouvelle image hero forcée dans ' + path.relative(root, file));
  } else {
    console.log('INFO: aucun changement dans ' + path.relative(root, file));
  }
}

forceHeroInFile(path.join(root, 'app', 'page.tsx'));
forceHeroInFile(path.join(root, 'app', 'resultats', 'page.tsx'));
forceHeroInFile(path.join(root, 'components', 'MarbnbHeader.tsx'));

// Fallback CSS très ciblé : si une ancienne classe hero utilise encore un background via CSS,
// on force uniquement les sections qui contiennent une image de fond inline.
const cssPath = path.join(root, 'app', 'globals.css');
if (fs.existsSync(cssPath)) {
  backup(cssPath, '.bak-force-new-hero');
  let css = fs.readFileSync(cssPath, 'utf8');
  if (!css.includes('MARBNB_FORCE_HERO_IMAGE')) {
    css += `

/* MARBNB_FORCE_HERO_IMAGE */
.marbnb-hero-bg,
[data-marbnb-hero="true"] {
  background-image: url('/marbnb-hero-mix.png') !important;
  background-size: cover !important;
  background-position: center !important;
}
`;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('OK: fallback CSS hero ajouté.');
  }
}

console.log('\nTerminé ✅');
console.log('Important : vérifie que la nouvelle image est bien dans public/marbnb-hero-mix.png');
console.log('Puis lance : npm run build');
console.log('Ensuite vide le cache navigateur avec Ctrl + F5.');
