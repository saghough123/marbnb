const fs = require('fs');
const path = require('path');

const root = process.cwd();
function backup(file, suffix) {
  if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
}

// Corrige le problème où l'image hero /marbnb-hero-mix.png a été appliquée aux cartes logements.
// Objectif : garder /marbnb-hero-mix.png UNIQUEMENT pour le hero accueil/résultats,
// et remettre des images logements différentes + respecter image_url/photos venant de Supabase.

const defaultImages = [
  'https://images.unsplash.com/photo-1577147443647-81856d5151af?auto=format&fit=crop&w=1200&q=80', // appartement marocain / intérieur
  'https://images.unsplash.com/photo-1548019979-0d243fc2a803?auto=format&fit=crop&w=1200&q=80', // riad / architecture
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80', // villa / piscine
  'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1200&q=80', // Marrakech street/riad
  'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=80', // maison/voyage
];

// 1) Patch app/page.tsx : cartes logements statiques ne doivent jamais utiliser l'image hero.
const homePath = path.join(root, 'app', 'page.tsx');
if (fs.existsSync(homePath)) {
  backup(homePath, '.bak-fix-logement-images');
  let code = fs.readFileSync(homePath, 'utf8');
  const before = code;

  // Remplacer toutes les occurrences directes de l'image hero dans des tableaux/cartes par des images par défaut différentes.
  let i = 0;
  code = code.replace(/image:\s*["'`]\/marbnb-hero-mix\.png["'`]/g, () => {
    const img = defaultImages[i % defaultImages.length];
    i++;
    return `image: "${img}"`;
  });
  code = code.replace(/image_url:\s*["'`]\/marbnb-hero-mix\.png["'`]/g, () => {
    const img = defaultImages[i % defaultImages.length];
    i++;
    return `image_url: "${img}"`;
  });
  code = code.replace(/photo:\s*["'`]\/marbnb-hero-mix\.png["'`]/g, () => {
    const img = defaultImages[i % defaultImages.length];
    i++;
    return `photo: "${img}"`;
  });

  // Les backgrounds hero peuvent rester sur marbnb-hero-mix.png.

  if (code !== before) {
    fs.writeFileSync(homePath, code, 'utf8');
    console.log('OK: images logements accueil restaurées.');
  } else {
    console.log('INFO: aucune image logement statique à corriger dans app/page.tsx.');
  }
}

// 2) Patch app/resultats/page.tsx : fallback image carte logement != hero.
const resultatsPath = path.join(root, 'app', 'resultats', 'page.tsx');
if (fs.existsSync(resultatsPath)) {
  backup(resultatsPath, '.bak-fix-logement-images');
  let code = fs.readFileSync(resultatsPath, 'utf8');
  const before = code;

  // Ajouter une fonction image de fallback dédiée si absente.
  if (!code.includes('function getLogementFallbackImage')) {
    const helper = `
function getLogementFallbackImage(index: number) {
  const images = ${JSON.stringify(defaultImages, null, 2)};
  return images[index % images.length];
}
`;
    const lastImportMatch = [...code.matchAll(/^import .*;$/gm)].pop();
    if (lastImportMatch) {
      const insertAt = lastImportMatch.index + lastImportMatch[0].length;
      code = code.slice(0, insertAt) + '\n' + helper + code.slice(insertAt);
    } else {
      code = helper + '\n' + code;
    }
  }

  // Remplacer les fallbacks directs vers hero dans les cartes.
  code = code.replaceAll('|| "/marbnb-hero-mix.png"', '|| getLogementFallbackImage(index)');
  code = code.replaceAll('?? "/marbnb-hero-mix.png"', '?? getLogementFallbackImage(index)');
  code = code.replace(/src=\{\s*['"]\/marbnb-hero-mix\.png['"]\s*\}/g, 'src={getLogementFallbackImage(index)}');

  // Remplacer dans tableaux statiques si présents.
  let i = 0;
  code = code.replace(/image:\s*["'`]\/marbnb-hero-mix\.png["'`]/g, () => {
    const img = defaultImages[i % defaultImages.length];
    i++;
    return `image: "${img}"`;
  });
  code = code.replace(/image_url:\s*["'`]\/marbnb-hero-mix\.png["'`]/g, () => {
    const img = defaultImages[i % defaultImages.length];
    i++;
    return `image_url: "${img}"`;
  });

  // Si le map n'utilise pas index, corriger signature fréquente .map((l) => vers .map((l, index) =>
  code = code.replace(/\.map\(\(l\)\s*=>/g, '.map((l, index) =>');
  code = code.replace(/\.map\(\(logement\)\s*=>/g, '.map((logement, index) =>');

  // Attention : si image_url Supabase existe, on la conserve. On ne remplace que le fallback hero.

  if (code !== before) {
    fs.writeFileSync(resultatsPath, code, 'utf8');
    console.log('OK: images logements résultats restaurées avec fallback propre.');
  } else {
    console.log('INFO: aucune image logement à corriger dans /resultats.');
  }
}

// 3) Patch page détail pour fallback logement différent du hero si aucune photo.
const detailPath = path.join(root, 'app', 'logement', '[id]', 'page.tsx');
if (fs.existsSync(detailPath)) {
  backup(detailPath, '.bak-fix-logement-images');
  let code = fs.readFileSync(detailPath, 'utf8');
  const before = code;

  if (!code.includes('const detailFallbackImage')) {
    code = code.replace(
      'const imageUrl = getValue(logement, ["image_url", "photo", "image"], "");',
      `const detailFallbackImage = "${defaultImages[0]}";\n  const imageUrl = getValue(logement, ["image_url", "photo", "image"], detailFallbackImage);`
    );
  }
  code = code.replaceAll('/marbnb-hero-mix.png', defaultImages[0]);

  if (code !== before) {
    fs.writeFileSync(detailPath, code, 'utf8');
    console.log('OK: fallback image détail logement corrigé.');
  }
}

console.log('\nTerminé ✅');
console.log('Relance: npm run build puis npx next dev --webpack');
console.log('Important: l’image hero doit rester uniquement dans public/marbnb-hero-mix.png, pas comme image logement.');
