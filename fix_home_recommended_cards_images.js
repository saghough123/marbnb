const fs = require('fs');
const path = require('path');
const root = process.cwd();
function backup(file, suffix){ if(fs.existsSync(file)) fs.writeFileSync(file+suffix, fs.readFileSync(file,'utf8'),'utf8'); }

// Ce correctif retire l'image HERO des cartes logements statiques de la page accueil.
// Les cartes logements auront chacune une image logement différente, jamais /marbnb-hero-mix.png.

const logementImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
];

const homePath = path.join(root, 'app', 'page.tsx');
if (!fs.existsSync(homePath)) {
  console.error('ERREUR: app/page.tsx introuvable');
  process.exit(1);
}

backup(homePath, '.bak-force-card-images-not-hero');
let code = fs.readFileSync(homePath, 'utf8');
const before = code;

// 1) Remplacer les objets logements statiques portant les titres visibles dans ta capture.
const replacements = [
  { title: 'Appartement moderne Maarif', img: logementImages[0] },
  { title: 'Studio proche Corniche', img: logementImages[1] },
  { title: 'Villa familiale avec piscine', img: logementImages[2] },
  { title: 'Riad traditionnel au centre', img: logementImages[3] },
];

for (const item of replacements) {
  const escapedTitle = item.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Cas image avant/après le titre dans le même objet.
  const objectRegex = new RegExp('(\\{[\\s\\S]*?titre\\s*:\\s*["\']' + escapedTitle + '["\'][\\s\\S]*?\\})', 'g');
  code = code.replace(objectRegex, (obj) => {
    let o = obj;
    if (/image\s*:/.test(o)) {
      o = o.replace(/image\s*:\s*["'`][^"'`]+["'`]/, `image: "${item.img}"`);
    } else if (/image_url\s*:/.test(o)) {
      o = o.replace(/image_url\s*:\s*["'`][^"'`]+["'`]/, `image_url: "${item.img}"`);
    } else if (/photo\s*:/.test(o)) {
      o = o.replace(/photo\s*:\s*["'`][^"'`]+["'`]/, `photo: "${item.img}"`);
    } else {
      o = o.replace(/titre\s*:\s*["'][^"']+["']/, (m) => `${m},\n    image: "${item.img}"`);
    }
    return o;
  });
}

// 2) Remplacer tout fallback direct vers hero dans les cards statiques par image par index si possible.
let idx = 0;
code = code.replace(/(image|image_url|photo)\s*:\s*["'`]\/marbnb-hero-mix\.png["'`]/g, (m, prop) => {
  const img = logementImages[idx % logementImages.length];
  idx++;
  return `${prop}: "${img}"`;
});

// 3) Si les cartes utilisent une image hardcodée directement dans <img src="/marbnb-hero-mix.png">,
// on remplace seulement dans la section Logements recommandés.
const marker = 'Logements recommandés';
const pos = code.indexOf(marker);
if (pos !== -1) {
  const beforeSection = code.slice(0, pos);
  let section = code.slice(pos);
  let imgIndex = 0;
  section = section.replace(/src=["']\/marbnb-hero-mix\.png["']/g, () => {
    const img = logementImages[imgIndex % logementImages.length];
    imgIndex++;
    return `src="${img}"`;
  });
  section = section.replace(/src=\{["']\/marbnb-hero-mix\.png["']\}/g, () => {
    const img = logementImages[imgIndex % logementImages.length];
    imgIndex++;
    return `src="${img}"`;
  });
  code = beforeSection + section;
}

// 4) Protéger le hero : si la page n'a plus l'image hero en background, on ne l'ajoute pas ici pour éviter de casser.
// Le script ne touche plus jamais aux références hero hors section cartes.

if (code !== before) {
  fs.writeFileSync(homePath, code, 'utf8');
  console.log('OK: les images des logements recommandés ne pointent plus vers le hero.');
} else {
  console.log('INFO: aucune référence à /marbnb-hero-mix.png trouvée dans les cartes statiques.');
  console.log('Si le problème persiste, les cartes utilisent probablement une variable image globale. Envoie app/page.tsx.');
}

console.log('\nTerminé ✅');
console.log('Relance: npm run build puis npx next dev --webpack');
console.log('Recharge ensuite avec Ctrl+F5.');
