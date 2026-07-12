// fix-marbnb-layout-css-v2.js
// Correction SAFE V2 : supprime l'ancien patch CSS qui coupait le contenu,
// puis ajoute une correction plus douce : on réduit la hauteur sans cacher les boutons.
// Utilisation : node fix-marbnb-layout-css-v2.js

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const globalsPath = path.join(root, 'app', 'globals.css');

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

if (!fs.existsSync(globalsPath)) {
  console.error('[ERREUR] app/globals.css introuvable. Lance le script depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

const backupPath = `${globalsPath}.bak-layout-v2-${timestamp()}`;
fs.copyFileSync(globalsPath, backupPath);
console.log(`[OK] Sauvegarde créée : ${backupPath}`);

let css = fs.readFileSync(globalsPath, 'utf8');

function removeBlock(content, startText, endText) {
  const start = content.indexOf(startText);
  if (start === -1) return content;
  const end = content.indexOf(endText, start);
  if (end === -1) return content;
  return (content.slice(0, start) + content.slice(end + endText.length)).trimEnd();
}

css = removeBlock(css, '/* MARBNB_LAYOUT_FIX_START */', '/* MARBNB_LAYOUT_FIX_END */');
css = removeBlock(css, '/* MARBNB_LAYOUT_FIX_V2_START */', '/* MARBNB_LAYOUT_FIX_V2_END */');

const patch = `

/* MARBNB_LAYOUT_FIX_V2_START */
/*
  Marbnb layout fix V2
  Objectif : remonter le contenu sans couper les boutons.
  Important : on évite max-height + overflow hidden sur les sections,
  car cela coupe les cartes et donne un effet de chevauchement.
*/

header,
nav,
.marbnb-navbar {
  position: sticky !important;
  top: 0 !important;
  z-index: 9999 !important;
}

section:has(img[src="/marbnb-hero-mix.png"]):first-of-type {
  min-height: 520px !important;
  overflow: visible !important;
}

section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="max-w-7xl"],
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div.relative[class*="z-30"] {
  min-height: 520px !important;
  padding-top: 40px !important;
  padding-bottom: 40px !important;
  align-items: center !important;
}

section:has(img[src="/marbnb-hero-mix.png"]):first-of-type img[src="/marbnb-hero-mix.png"] {
  height: 100% !important;
  object-fit: cover !important;
  object-position: center 45% !important;
}

section:has(img[src="/marbnb-hero-mix.png"]):first-of-type div[class*="rounded-[2rem]"][class*="backdrop-blur"] {
  max-width: 620px !important;
  padding: 28px !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

section:has(img[src="/marbnb-hero-mix.png"]):first-of-type h1,
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type h2 {
  font-size: clamp(42px, 5vw, 72px) !important;
  line-height: 1.05 !important;
}

main.marbnb-home-soft-gradient > section:first-child {
  min-height: auto !important;
  overflow: visible !important;
}

main.marbnb-home-soft-gradient > section:first-child > div[class*="max-w-7xl"] {
  padding-top: 42px !important;
  padding-bottom: 42px !important;
}

main.marbnb-home-soft-gradient > section:first-child h2 {
  font-size: clamp(38px, 5vw, 68px) !important;
  line-height: 1.05 !important;
}

main.marbnb-home-soft-gradient > section:first-child div[class*="mt-10"] {
  margin-top: 24px !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]),
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) {
  min-height: auto !important;
  overflow: visible !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) > div[class*="max-w-7xl"],
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) > div[class*="max-w-7xl"] {
  padding-top: 34px !important;
  padding-bottom: 34px !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) h1,
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) h1 {
  font-size: clamp(34px, 4vw, 58px) !important;
  line-height: 1.08 !important;
  margin-top: 16px !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) div[class*="mt-8"],
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) div[class*="mt-8"] {
  margin-top: 22px !important;
}

section:has(img[src="/marbnb-hero-mix.png"]) + main,
section:has(img[src="/marbnb-hero-mix.png"]) + section {
  padding-top: 24px !important;
  margin-top: 0 !important;
}

@media (max-width: 768px) {
  section:has(img[src="/marbnb-hero-mix.png"]):first-of-type {
    min-height: 420px !important;
  }

  section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="max-w-7xl"],
  section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div.relative[class*="z-30"] {
    min-height: 420px !important;
    padding-top: 24px !important;
    padding-bottom: 24px !important;
  }

  section:has(img[src="/marbnb-hero-mix.png"]):first-of-type div[class*="rounded-[2rem]"][class*="backdrop-blur"] {
    padding: 20px !important;
  }

  main.marbnb-home-soft-gradient > section:first-child > div[class*="max-w-7xl"] {
    padding-top: 28px !important;
    padding-bottom: 28px !important;
  }
}
/* MARBNB_LAYOUT_FIX_V2_END */
`;

fs.writeFileSync(globalsPath, `${css}${patch}\n`, 'utf8');
console.log('[OK] Ancien patch supprimé, patch CSS V2 ajouté dans app/globals.css');
console.log('');
console.log('Maintenant lance :');
console.log('  taskkill /F /IM node.exe');
console.log('  rmdir /s /q .next');
console.log('  npm run dev');
console.log('');
console.log('Si Turbopack bug encore :');
console.log('  npx next dev --webpack');
