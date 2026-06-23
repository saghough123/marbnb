const fs = require('fs');
const path = require('path');

const root = process.cwd();
const detailPath = path.join(root, 'app', 'logement', '[id]', 'page.tsx');

function backup(file, suffix) {
  if (fs.existsSync(file)) {
    fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
  }
}

if (!fs.existsSync(detailPath)) {
  console.error('ERREUR: app/logement/[id]/page.tsx introuvable');
  process.exit(1);
}

backup(detailPath, '.bak-fix-regex-url-build');
let code = fs.readFileSync(detailPath, 'utf8');
const before = code;

// Corrige la ligne qui casse le build : regex /^https?:\/\//i dans le TSX.
// On remplace par des startsWith simples, beaucoup plus sûrs pour Turbopack/TSX.
code = code.replace(
  /\.filter\(\(url\)\s*=>\s*\/\^https\?[:]?\\?\/\\?\/i\.test\(url\)\s*\|\|\s*url\.startsWith\("\/storage"\)\s*\|\|\s*url\.startsWith\("\/uploads"\)\s*\|\|\s*url\.startsWith\("\/logements"\)\)/g,
  '.filter((url) => url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/storage") || url.startsWith("/uploads") || url.startsWith("/logements"))'
);

// Variante exacte la plus probable créée par le script précédent.
code = code.replace(
  '.filter((url) => /^https?:\\/\\//i.test(url) || url.startsWith("/storage") || url.startsWith("/uploads") || url.startsWith("/logements"))',
  '.filter((url) => url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/storage") || url.startsWith("/uploads") || url.startsWith("/logements"))'
);

// Variante si le slash de fin a sauté et donne /^https?:\\/\\/i.test
code = code.replace(
  '.filter((url) => /^https?:\\/\\/i.test(url) || url.startsWith("/storage") || url.startsWith("/uploads") || url.startsWith("/logements"))',
  '.filter((url) => url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/storage") || url.startsWith("/uploads") || url.startsWith("/logements"))'
);

// Variante visuelle si le fichier contient directement /^https?:\/\//i ou une version corrompue.
code = code.replace(
  /\.filter\(\(url\) => \/\^https\?:.*?url\.startsWith\("\/logements"\)\)/g,
  '.filter((url) => url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/storage") || url.startsWith("/uploads") || url.startsWith("/logements"))'
);

// Sécurité : corriger aussi les caractères cassés visibles.
code = code
  .replaceAll('â† Retour', '← Retour')
  .replaceAll('â†', '←')
  .replaceAll('ðŸ“', '');

if (code !== before) {
  fs.writeFileSync(detailPath, code, 'utf8');
  console.log('OK: erreur regex URL corrigée dans app/logement/[id]/page.tsx');
} else {
  console.log('INFO: remplacement automatique non trouvé. Affichage autour de la ligne 37 pour correction manuelle:');
  const lines = code.split('\n');
  for (let i = 30; i <= 42 && i <= lines.length; i++) {
    console.log(String(i).padStart(3, ' ') + ': ' + lines[i - 1]);
  }
}

console.log('\nTerminé ✅ Relance: npm run build');
