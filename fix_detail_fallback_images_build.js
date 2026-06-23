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

backup(detailPath, '.bak-fix-detailfallbackimages');
let code = fs.readFileSync(detailPath, 'utf8');
const before = code;

// Le build indique : detailFallbackImages introuvable, mais detailFallbackImage existe.
// On standardise tout en detailFallbackImages (tableau) pour la galerie.

// 1) Si un fallback singulier existe, le transformer en tableau.
code = code.replace(
  /const\s+detailFallbackImage\s*=\s*(["'`][\s\S]*?["'`]);/,
  `const detailFallbackImages = [
    $1,
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  ];`
);

// 2) Corriger les usages du fallback singulier.
code = code.replaceAll('detailFallbackImage)', 'detailFallbackImages[0])');
code = code.replaceAll('detailFallbackImage;', 'detailFallbackImages[0];');
code = code.replaceAll('detailFallbackImage,', 'detailFallbackImages[0],');

// 3) Si aucun tableau n'existe encore, l'ajouter avant imageUrl.
if (!code.includes('const detailFallbackImages = [')) {
  code = code.replace(
    'const imageUrl = getValue(logement, ["image_url", "photo", "image"], "");',
    `const detailFallbackImages = [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  ];
  const imageUrl = getValue(logement, ["image_url", "photo", "image"], detailFallbackImages[0]);`
  );
}

// 4) Si imageUrl utilise encore une valeur vide comme fallback, remplacer par première image du tableau.
code = code.replace(
  'const imageUrl = getValue(logement, ["image_url", "photo", "image"], "");',
  'const imageUrl = getValue(logement, ["image_url", "photo", "image"], detailFallbackImages[0]);'
);

// 5) S'assurer que photosAffichees et photosUniquesAffichees existent et sont cohérents.
if (!code.includes('const photosAffichees = photos.length > 0 ? photos : detailFallbackImages;')) {
  code = code.replace(
    'const photos = useMemo(() => parsePhotos(getValue(logement, ["photos"], ""), imageUrl), [logement, imageUrl]);',
    'const photos = useMemo(() => parsePhotos(getValue(logement, ["photos"], ""), imageUrl), [logement, imageUrl]);\n  const photosAffichees = photos.length > 0 ? photos : detailFallbackImages;'
  );
}

if (!code.includes('const photosUniquesAffichees =')) {
  code = code.replace(
    'const photosAffichees = photos.length > 0 ? photos : detailFallbackImages;',
    'const photosAffichees = photos.length > 0 ? photos : detailFallbackImages;\n  const photosUniquesAffichees = photosAffichees.filter((p, i, arr) => arr.indexOf(p) === i);'
  );
}

// 6) Corriger usages éventuels.
code = code.replaceAll('photosAffichees[photoActive] || photosAffichees[0]', 'photosUniquesAffichees[photoActive] || photosUniquesAffichees[0]');
code = code.replaceAll('photos.length > 1 && (', 'photosUniquesAffichees.length > 1 && (');
code = code.replaceAll('photos.slice(0, 10).map((photo, index) => (', 'photosUniquesAffichees.slice(0, 10).map((photo, index) => (');

// 7) Nettoyage caractères cassés sécurité.
code = code.replaceAll('â† Retour', '← Retour').replaceAll('â†', '←').replaceAll('ðŸ“', '');

if (code !== before) {
  fs.writeFileSync(detailPath, code, 'utf8');
  console.log('OK: detailFallbackImages corrigé dans app/logement/[id]/page.tsx');
} else {
  console.log('INFO: aucun changement fait. Voici les lignes 185-198 pour diagnostic:');
  const lines = code.split('\n');
  for (let i = 185; i <= 198 && i <= lines.length; i++) {
    console.log(String(i).padStart(3, ' ') + ': ' + lines[i - 1]);
  }
}

console.log('\nTerminé ✅ Relance: npm run build');
