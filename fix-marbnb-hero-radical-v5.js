// fix-marbnb-hero-radical-v5.js
// Marbnb V5 - correction RADICALE mais sûre :
// - supprime les anciens patchs CSS
// - réduit fortement la grande image d'accueil
// - cache uniquement la carte flottante du premier hero si elle crée un énorme espace
// - ne touche pas aux fichiers page.tsx
//
// Utilisation depuis C:\Users\SAGHOUGH\marbnb :
// node fix-marbnb-hero-radical-v5.js

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const globalsPath = path.join(root, "app", "globals.css");

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function removeBlock(content, start, end) {
  let out = content;
  while (out.includes(start) && out.includes(end)) {
    const s = out.indexOf(start);
    const e = out.indexOf(end, s);
    if (s === -1 || e === -1) break;
    out = out.slice(0, s) + out.slice(e + end.length);
  }
  return out.trimEnd();
}

if (!fs.existsSync(globalsPath)) {
  console.error("[ERREUR] app/globals.css introuvable. Lance le script depuis C:\\Users\\SAGHOUGH\\marbnb");
  process.exit(1);
}

const backup = `${globalsPath}.bak-radical-v5-${stamp()}`;
fs.copyFileSync(globalsPath, backup);
console.log(`[OK] Sauvegarde créée : ${backup}`);

let css = fs.readFileSync(globalsPath, "utf8");

const blocks = [
  ["/* MARBNB_LAYOUT_FIX_START */", "/* MARBNB_LAYOUT_FIX_END */"],
  ["/* MARBNB_LAYOUT_FIX_V2_START */", "/* MARBNB_LAYOUT_FIX_V2_END */"],
  ["/* MARBNB_HERO_COMPACT_V3_START */", "/* MARBNB_HERO_COMPACT_V3_END */"],
  ["/* MARBNB_HOME_EXPLORER_V4_START */", "/* MARBNB_HOME_EXPLORER_V4_END */"],
  ["/* MARBNB_HERO_RADICAL_V5_START */", "/* MARBNB_HERO_RADICAL_V5_END */"],
];

for (const [a,b] of blocks) css = removeBlock(css, a, b);

const patch = `

/* MARBNB_HERO_RADICAL_V5_START */
/*
  V5 radicale : le premier hero devient une bannière courte.
  Objectif : supprimer l'espace énorme avant les infos.
*/

/* 1) Navbar toujours visible */
header,
nav,
.marbnb-navbar {
  position: sticky !important;
  top: 0 !important;
  z-index: 9999 !important;
}

/* 2) Le premier hero de la page devient une bannière basse */
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type {
  height: 260px !important;
  min-height: 260px !important;
  max-height: 260px !important;
  overflow: hidden !important;
  border-bottom: 1px solid #ead9ba !important;
}

/* 3) L'image du premier hero prend seulement 260px */
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type img[src="/marbnb-hero-mix.png"] {
  height: 260px !important;
  min-height: 260px !important;
  max-height: 260px !important;
  width: 100% !important;
  object-fit: cover !important;
  object-position: center 43% !important;
}

/* 4) Supprimer la grande carte flottante du premier hero.
   Comme le contenu existe déjà dans la section suivante, on évite le doublon énorme. */
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div.relative,
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="z-30"],
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type div[class*="backdrop-blur"] {
  display: none !important;
}

/* 5) La deuxième section Accueil remonte immédiatement */
main.marbnb-home-soft-gradient,
main.marbnb-home-soft-gradient > section:first-child {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

main.marbnb-home-soft-gradient > section:first-child > div[class*="max-w-7xl"] {
  padding-top: 32px !important;
  padding-bottom: 36px !important;
}

main.marbnb-home-soft-gradient > section:first-child h1,
main.marbnb-home-soft-gradient > section:first-child h2 {
  font-size: clamp(38px, 5vw, 66px) !important;
  line-height: 1.05 !important;
}

main.marbnb-home-soft-gradient > section:first-child div[class*="mt-10"] {
  margin-top: 18px !important;
}

/* 6) Résultats / Explorer : hero compact aussi */
body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]),
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) {
  min-height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) > div[class*="max-w-7xl"],
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) > div[class*="max-w-7xl"] {
  padding-top: 28px !important;
  padding-bottom: 28px !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) h1,
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) h1 {
  font-size: clamp(32px, 4vw, 56px) !important;
  line-height: 1.08 !important;
}

@media (max-width: 768px) {
  section:has(img[src="/marbnb-hero-mix.png"]):first-of-type,
  section:has(img[src="/marbnb-hero-mix.png"]):first-of-type img[src="/marbnb-hero-mix.png"] {
    height: 210px !important;
    min-height: 210px !important;
    max-height: 210px !important;
  }
}
/* MARBNB_HERO_RADICAL_V5_END */
`;

fs.writeFileSync(globalsPath, `${css}${patch}\n`, "utf8");
console.log("[OK] Patch hero radical V5 ajouté dans app/globals.css");
console.log("Maintenant lance :");
console.log("  rmdir /s /q .next");
console.log("  npx next dev --webpack");
console.log("Puis CTRL+F5 dans Chrome.");
