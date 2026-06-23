const fs = require('fs');
const path = require('path');

const root = process.cwd();
function backup(file, suffix) {
  if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
}

const oldGreens = [
  '#0f2f22',
  '#003c2f',
  '#043f2e',
  '#064e3b',
  'green-700',
  'green-800',
  'green-900'
];

const newGreen = '#3F7D3B';       // vert maroc plus clair
const newGreenDark = '#2F5F2C';   // hover / contraste
const newGreenSoft = '#EAF3E4';   // fond doux

function replaceBrandGreen(text) {
  let out = text;
  for (const c of oldGreens) out = out.split(c).join(newGreen);
  out = out
    .replaceAll('bg-green-700', 'bg-[#3F7D3B]')
    .replaceAll('bg-green-800', 'bg-[#3F7D3B]')
    .replaceAll('bg-green-900', 'bg-[#2F5F2C]')
    .replaceAll('text-green-800', 'text-[#2F5F2C]')
    .replaceAll('border-green-700', 'border-[#3F7D3B]')
    .replaceAll('bg-green-50', 'bg-[#EAF3E4]');
  return out;
}

// 1) Copier la nouvelle image hero si elle existe dans le projet
const publicDir = path.join(root, 'public');
fs.mkdirSync(publicDir, { recursive: true });
const candidates = [
  path.join(root, 'marbnb-hero-mix.png'),
  path.join(root, 'hero-mix-maroc.png'),
  path.join(root, 'hero.png'),
  path.join(publicDir, 'marbnb-hero-mix.png'),
  path.join(publicDir, 'hero-mix-maroc.png'),
];
const foundHero = candidates.find((p) => fs.existsSync(p));
const targetHero = path.join(publicDir, 'marbnb-hero-mix.png');
if (foundHero) {
  fs.copyFileSync(foundHero, targetHero);
  console.log('OK: nouvelle image hero copiée vers public/marbnb-hero-mix.png');
} else {
  console.log('INFO: aucune image hero locale trouvée. Mets ton image sous marbnb-hero-mix.png à la racine ou dans public.');
}

// 2) Remplacer les verts et l'image hero dans les fichiers principaux
const scanDirs = ['app', 'components'];
const exts = new Set(['.tsx', '.ts', '.jsx', '.js', '.css']);
for (const dirName of scanDirs) {
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
      if (!exts.has(path.extname(entry.name))) continue;
      backup(full, '.bak-moroccan-green-hero');
      let txt = fs.readFileSync(full, 'utf8');
      const before = txt;
      txt = replaceBrandGreen(txt);

      // remplacer anciennes images mosquée / Marrakech fréquentes par la nouvelle image
      txt = txt
        .replace(/src=\{[^}]*mosquee[^}]*\}/gi, 'src="/marbnb-hero-mix.png"')
        .replace(/src=\{[^}]*mosque[^}]*\}/gi, 'src="/marbnb-hero-mix.png"')
        .replace(/src=\{[^}]*marrakech[^}]*\}/gi, 'src="/marbnb-hero-mix.png"')
        .replace(/src="[^"]*(mosquee|mosque|marrakech|koutoubia)[^"]*"/gi, 'src="/marbnb-hero-mix.png"')
        .replace(/backgroundImage:\s*`url\([^`]+\)`/g, 'backgroundImage: `url(/marbnb-hero-mix.png)`')
        .replace(/backgroundImage:\s*"url\([^"]+\)"/g, 'backgroundImage: "url(/marbnb-hero-mix.png)"')
        .replace(/backgroundImage:\s*'url\([^']+\)'/g, "backgroundImage: 'url(/marbnb-hero-mix.png)'");

      // si la page résultats contient une image hero via img actuelle, forcer la première grande image locale
      if (full.endsWith(path.join('app', 'resultats', 'page.tsx')) || full.endsWith(path.join('app', 'page.tsx'))) {
        txt = txt.replace(/<img([^>]+)className="([^"]*h-\[[^\]]+\][^"]*object-cover[^"]*)"([^>]*)>/, '<img src="/marbnb-hero-mix.png" alt="Marbnb Experience Maroc" className="$2"$3>');
      }

      if (txt !== before) {
        fs.writeFileSync(full, txt, 'utf8');
        console.log('OK:', path.relative(root, full));
      }
    }
  }
}

// 3) Ajouter variables CSS globales et fallback hero si besoin
const cssPath = path.join(root, 'app', 'globals.css');
if (fs.existsSync(cssPath)) {
  backup(cssPath, '.bak-moroccan-green-hero');
  let css = fs.readFileSync(cssPath, 'utf8');
  if (!css.includes('MARBNB_MOROCCAN_GREEN_THEME')) {
    css += `

/* MARBNB_MOROCCAN_GREEN_THEME */
:root {
  --marbnb-green: ${newGreen};
  --marbnb-green-dark: ${newGreenDark};
  --marbnb-green-soft: ${newGreenSoft};
}

button[class*="bg-[#3F7D3B]"]:hover,
a[class*="bg-[#3F7D3B]"]:hover {
  background-color: ${newGreenDark} !important;
}
`;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('OK: thème vert maroc ajouté dans globals.css');
  }
}

console.log('\nTerminé ✅');
console.log('Si tu as une nouvelle image: nomme-la marbnb-hero-mix.png et place-la dans public/ ou à la racine, puis relance ce script.');
console.log('Ensuite lance: npm run build');
