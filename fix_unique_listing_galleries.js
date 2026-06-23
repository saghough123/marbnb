const fs = require('fs');
const path = require('path');

const root = process.cwd();
function backup(file, suffix) {
  if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
}

const galleries = {
  "Appartement moderne Maarif": [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
  ],
  "Studio proche Corniche": [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
  ],
  "Villa familiale avec piscine": [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  ],
  "Riad traditionnel au centre": [
    "https://images.unsplash.com/photo-1548019979-0d243fc2a803?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80"
  ]
};

function galleryForTitle(title) {
  return galleries[title] || galleries["Appartement moderne Maarif"];
}

function injectGalleryIntoObject(obj, title) {
  const photos = galleryForTitle(title);
  let out = obj;
  const photosLiteral = JSON.stringify(photos, null, 4);

  if (/photos\s*:/.test(out)) {
    out = out.replace(/photos\s*:\s*\[[\s\S]*?\]/, `photos: ${photosLiteral}`);
  } else {
    out = out.replace(/titre\s*:\s*["'][^"']+["']/, (m) => `${m},\n    photos: ${photosLiteral}`);
  }

  if (/image\s*:/.test(out)) out = out.replace(/image\s*:\s*["'`][^"'`]+["'`]/, `image: "${photos[0]}"`);
  else out = out.replace(/titre\s*:\s*["'][^"']+["']/, (m) => `${m},\n    image: "${photos[0]}"`);

  if (/image_url\s*:/.test(out)) out = out.replace(/image_url\s*:\s*["'`][^"'`]+["'`]/, `image_url: "${photos[0]}"`);
  if (/photo\s*:/.test(out)) out = out.replace(/photo\s*:\s*["'`][^"'`]+["'`]/, `photo: "${photos[0]}"`);

  return out;
}

// 1) Patch app/page.tsx static recommended listings.
const homePath = path.join(root, 'app', 'page.tsx');
if (fs.existsSync(homePath)) {
  backup(homePath, '.bak-gallery-unique-listings');
  let code = fs.readFileSync(homePath, 'utf8');
  const before = code;

  for (const title of Object.keys(galleries)) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const objectRegex = new RegExp('(\\{[\\s\\S]*?titre\\s*:\\s*["\']' + escaped + '["\'][\\s\\S]*?\\})', 'g');
    code = code.replace(objectRegex, (obj) => injectGalleryIntoObject(obj, title));
  }

  // If card image is computed from l.image only, it will now be unique.
  if (code !== before) {
    fs.writeFileSync(homePath, code, 'utf8');
    console.log('OK: app/page.tsx logements recommandés avec images/galeries uniques.');
  } else {
    console.log('INFO: titres logements statiques non trouvés dans app/page.tsx.');
  }
}

// 2) Patch detail page: use logement.photos if present; if static query params/title only, match title gallery.
const detailPath = path.join(root, 'app', 'logement', '[id]', 'page.tsx');
if (fs.existsSync(detailPath)) {
  backup(detailPath, '.bak-gallery-unique-detail');
  let code = fs.readFileSync(detailPath, 'utf8');
  const before = code;

  // Add title based fallback function if missing.
  if (!code.includes('function getFallbackGalleryByTitle')) {
    const helper = `
function getFallbackGalleryByTitle(title: string) {
  const galleries: Record<string, string[]> = ${JSON.stringify(galleries, null, 2)};
  const found = Object.keys(galleries).find((key) => title.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(title.toLowerCase()));
  return found ? galleries[found] : galleries["Appartement moderne Maarif"];
}
`;
    const pos = code.indexOf('export default function');
    code = code.slice(0, pos) + helper + '\n' + code.slice(pos);
  }

  // Ensure photosAffichees fallback uses title-specific gallery, not the same repeated fallback.
  code = code.replace(/const detailFallbackImages\s*=\s*\[[\s\S]*?\];/, 'const detailFallbackImages = getFallbackGalleryByTitle(titre);');
  code = code.replace(/const photosAffichees\s*=\s*photos\.length > 0 \? photos : detailFallbackImages;/, 'const photosAffichees = photos.length > 0 ? photos : detailFallbackImages;');

  // If thumbnails are based on photos only and photos has only 1 or duplicates, use photosAffichees but unique.
  if (!code.includes('const photosUniquesAffichees')) {
    code = code.replace(
      'const photosAffichees = photos.length > 0 ? photos : detailFallbackImages;',
      'const photosAffichees = photos.length > 0 ? photos : detailFallbackImages;\n  const photosUniquesAffichees = photosAffichees.filter((p, i, arr) => arr.indexOf(p) === i);'
    );
  }

  code = code.replaceAll('photosAffichees[photoActive] || photosAffichees[0]', 'photosUniquesAffichees[photoActive] || photosUniquesAffichees[0]');
  code = code.replaceAll('photos.length > 1 && (', 'photosUniquesAffichees.length > 1 && (');
  code = code.replaceAll('photos.slice(0, 10).map((photo, index) => (', 'photosUniquesAffichees.slice(0, 10).map((photo, index) => (');

  // Fix broken chars again.
  code = code.replaceAll('â† Retour', '← Retour').replaceAll('ðŸ“', '');

  if (code !== before) {
    fs.writeFileSync(detailPath, code, 'utf8');
    console.log('OK: page détail avec galerie cohérente et miniatures uniques.');
  }
}

console.log('\nTerminé ✅');
console.log('Relance: npm run build puis npx next dev --webpack');
console.log('Recharge avec Ctrl+F5.');
