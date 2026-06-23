const fs = require('fs');
const path = require('path');

const root = process.cwd();
function backup(file, suffix) {
  if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
}

// 1) Correction globale des caractères cassés type â† Retour, ðŸ“ etc.
const dirs = ['app', 'components'];
const extensions = new Set(['.tsx', '.ts', '.jsx', '.js']);

function fixBadChars(txt) {
  return txt
    .replaceAll('â† Retour', '← Retour')
    .replaceAll('â†’', '→')
    .replaceAll('â†', '←')
    .replaceAll('âœ…', '✅')
    .replaceAll('âœ“', '✓')
    .replaceAll('â€”', '—')
    .replaceAll('â€“', '–')
    .replaceAll('â€™', '’')
    .replaceAll('â€œ', '“')
    .replaceAll('â€', '”')
    .replaceAll('ðŸ“', '')
    .replaceAll('ðŸ ', '')
    .replaceAll('ðŸ¡', '')
    .replaceAll('ðŸ¢', '')
    .replaceAll('ðŸŒŠ', '')
    .replaceAll('ðŸŠ', '')
    .replaceAll('ðŸ’Ž', '')
    .replaceAll('ðŸ‘¥', '')
    .replaceAll('ðŸ”', '')
    .replaceAll('ðŸ”', '')
    .replaceAll('  ,', ',')
    .replaceAll(' ,', ',');
}

for (const dirName of dirs) {
  const dir = path.join(root, dirName);
  if (!fs.existsSync(dir)) continue;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.next', '.git'].includes(entry.name)) stack.push(full);
        continue;
      }
      if (!extensions.has(path.extname(entry.name))) continue;
      backup(full, '.bak-fix-chars-gallery');
      const before = fs.readFileSync(full, 'utf8');
      const after = fixBadChars(before);
      if (after !== before) {
        fs.writeFileSync(full, after, 'utf8');
        console.log('OK caractères corrigés:', path.relative(root, full));
      }
    }
  }
}

// 2) Correction spécifique page détail logement : galerie propre, pas de thumbnails cassés/pixélisés.
const detailPath = path.join(root, 'app', 'logement', '[id]', 'page.tsx');
if (fs.existsSync(detailPath)) {
  backup(detailPath, '.bak-clean-detail-gallery');
  let code = fs.readFileSync(detailPath, 'utf8');
  const before = code;

  // Remplacer parsePhotos par une version robuste.
  const parseRegex = /function parsePhotos\([\s\S]*?\n}\n\nfunction /;
  const newParse = `function parsePhotos(value: string | null | undefined, imageUrl?: string | null) {
  const raw: string[] = [];

  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) raw.push(...parsed.filter(Boolean).map(String));
      else if (typeof parsed === "string") raw.push(parsed);
    } catch {
      raw.push(value);
    }
  }

  if (imageUrl) raw.unshift(imageUrl);

  const clean = raw
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    // éviter que l'image hero, le logo ou une icône app deviennent des photos de logement
    .filter((url) => !url.includes("marbnb-hero-mix"))
    .filter((url) => !url.includes("mbnb-logo"))
    .filter((url) => !url.includes("marbnb-logo"))
    .filter((url) => !url.includes("apple-touch-icon"))
    .filter((url) => !url.includes("favicon"))
    // on garde les vraies URLs web, les chemins /storage et /uploads
    .filter((url) => /^https?:\/\//i.test(url) || url.startsWith("/storage") || url.startsWith("/uploads") || url.startsWith("/logements"))
    .filter((url, index, arr) => arr.indexOf(url) === index);

  return clean;
}

function `;

  if (parseRegex.test(code)) {
    code = code.replace(parseRegex, newParse);
  }

  // Ajouter une image de secours propre si aucune photo valide.
  if (!code.includes('const detailFallbackImages = [')) {
    code = code.replace(
      'const imageUrl = getValue(logement, ["image_url", "photo", "image"], "");',
      `const detailFallbackImages = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  ];
  const imageUrl = getValue(logement, ["image_url", "photo", "image"], detailFallbackImages[0]);`
    );
  }

  // Si la variable photos existe, créer une version affichable qui retombe sur fallback.
  if (!code.includes('const photosAffichees = photos.length > 0 ? photos : detailFallbackImages;')) {
    code = code.replace(
      'const photos = useMemo(() => parsePhotos(getValue(logement, ["photos"], ""), imageUrl), [logement, imageUrl]);',
      'const photos = useMemo(() => parsePhotos(getValue(logement, ["photos"], ""), imageUrl), [logement, imageUrl]);\n  const photosAffichees = photos.length > 0 ? photos : detailFallbackImages;'
    );
  }

  // Remplacer l'affichage galerie pour utiliser photosAffichees et éviter miniatures si pas au moins 2 vraies photos.
  code = code.replaceAll('photos.length > 0 ? <img src={photos[photoActive] || photos[0]} alt={titre} className="h-[420px] w-full object-cover" />', 'photosAffichees.length > 0 ? <img src={photosAffichees[photoActive] || photosAffichees[0]} alt={titre} className="h-[420px] w-full object-cover" />');
  code = code.replaceAll('{photos.length > 1 && (', '{photos.length > 1 && (');
  code = code.replaceAll('photos.slice(0, 10).map((photo, index) => (', 'photos.slice(0, 10).map((photo, index) => (');

  // Corriger le bouton retour si un caractère cassé reste.
  code = code.replaceAll('â† Retour', '← Retour');
  code = code.replaceAll('â† Retour aux résultats', '← Retour aux résultats');

  if (code !== before) {
    fs.writeFileSync(detailPath, code, 'utf8');
    console.log('OK: galerie détail logement nettoyée.');
  } else {
    console.log('INFO: aucun changement galerie détail nécessaire.');
  }
}

// 3) Correction service worker/cache : changer version cache pour forcer refresh côté navigateur.
const swPath = path.join(root, 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  backup(swPath, '.bak-fix-chars-gallery');
  let sw = fs.readFileSync(swPath, 'utf8');
  const before = sw;
  sw = sw.replace(/marbnb-cache-v\d+/g, 'marbnb-cache-v9');
  sw = sw.replace(/mbnb-cache-v\d+/g, 'marbnb-cache-v9');
  if (sw !== before) {
    fs.writeFileSync(swPath, sw, 'utf8');
    console.log('OK: cache PWA versionné pour forcer actualisation.');
  }
}

console.log('\nTerminé ✅');
console.log('Relance: npm run build puis npx next dev --webpack');
console.log('Important: fais Ctrl+F5, ou vide le cache/service worker si l’ancien affichage persiste.');
