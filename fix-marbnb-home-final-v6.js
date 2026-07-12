// fix-marbnb-home-final-v6.js
// Correction finale Accueil Marbnb : supprime les anciens patchs CSS et remplace le double hero par une seule section propre.
// Utilisation depuis C:\Users\SAGHOUGH\marbnb : node fix-marbnb-home-final-v6.js

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const globalsPath = path.join(root, "app", "globals.css");

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
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
  console.error("[ERREUR] app/globals.css introuvable. Lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb");
  process.exit(1);
}

const backup = `${globalsPath}.bak-home-final-v6-${stamp()}`;
fs.copyFileSync(globalsPath, backup);
console.log(`[OK] Sauvegarde créée : ${backup}`);

let css = fs.readFileSync(globalsPath, "utf8");

// Supprimer tous les anciens patchs qui se contredisent.
const blocks = [
  ["/* MARBNB_LAYOUT_FIX_START */", "/* MARBNB_LAYOUT_FIX_END */"],
  ["/* MARBNB_LAYOUT_FIX_V2_START */", "/* MARBNB_LAYOUT_FIX_V2_END */"],
  ["/* MARBNB_HERO_COMPACT_V3_START */", "/* MARBNB_HERO_COMPACT_V3_END */"],
  ["/* MARBNB_HOME_EXPLORER_V4_START */", "/* MARBNB_HOME_EXPLORER_V4_END */"],
  ["/* MARBNB_HERO_RADICAL_V5_START */", "/* MARBNB_HERO_RADICAL_V5_END */"],
  ["/* MARBNB_HOME_FINAL_V6_START */", "/* MARBNB_HOME_FINAL_V6_END */"],
];
for (const [a, b] of blocks) css = removeBlock(css, a, b);

const patch = `

/* MARBNB_HOME_FINAL_V6_START */
/*
  Correction finale accueil Marbnb.
  Le problème venait du double hero : une image en haut + une deuxième grande image juste après.
  On garde Explorer/Résultats comme actuellement, et on rend l'accueil propre.
*/

/* Navbar stable */
header,
nav,
.marbnb-navbar {
  position: sticky !important;
  top: 0 !important;
  z-index: 9999 !important;
}

/* ACCUEIL uniquement : cacher le premier hero redondant au-dessus de la vraie section d'accueil. */
body:has(main.marbnb-home-soft-gradient) > div > section:first-of-type:has(img[src="/marbnb-hero-mix.png"]) {
  display: none !important;
}

/* La vraie section accueil devient compacte et lisible. */
main.marbnb-home-soft-gradient > section:first-child {
  min-height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  border-bottom: 1px solid #ead9ba !important;
}

main.marbnb-home-soft-gradient > section:first-child > div.absolute,
main.marbnb-home-soft-gradient > section:first-child > div.absolute img,
main.marbnb-home-soft-gradient > section:first-child img[src="/marbnb-hero-secondary.png"] {
  height: 520px !important;
  max-height: 520px !important;
  object-fit: cover !important;
  object-position: center 45% !important;
}

main.marbnb-home-soft-gradient > section:first-child > div.relative[class*="max-w-7xl"],
main.marbnb-home-soft-gradient > section:first-child > div[class*="max-w-7xl"] {
  min-height: 520px !important;
  padding-top: 42px !important;
  padding-bottom: 42px !important;
}

main.marbnb-home-soft-gradient > section:first-child h1,
main.marbnb-home-soft-gradient > section:first-child h2 {
  font-size: clamp(42px, 5vw, 70px) !important;
  line-height: 1.05 !important;
}

main.marbnb-home-soft-gradient > section:first-child p {
  max-width: 720px !important;
}

main.marbnb-home-soft-gradient > section:first-child div[class*="mt-10"] {
  margin-top: 24px !important;
}

/* Les sections après le hero remontent normalement. */
main.marbnb-home-soft-gradient > section:first-child + section,
main.marbnb-home-soft-gradient > section:nth-child(2) {
  padding-top: 28px !important;
}

/* Popup installation : ne doit pas masquer tout le bas. */
.marbnb-pwa-install,
.marbnb-install-card {
  max-width: 430px !important;
}

@media (max-width: 768px) {
  main.marbnb-home-soft-gradient > section:first-child > div.absolute,
  main.marbnb-home-soft-gradient > section:first-child > div.absolute img,
  main.marbnb-home-soft-gradient > section:first-child img[src="/marbnb-hero-secondary.png"] {
    height: 460px !important;
    max-height: 460px !important;
  }

  main.marbnb-home-soft-gradient > section:first-child > div.relative[class*="max-w-7xl"],
  main.marbnb-home-soft-gradient > section:first-child > div[class*="max-w-7xl"] {
    min-height: 460px !important;
    padding-top: 28px !important;
    padding-bottom: 28px !important;
  }
}
/* MARBNB_HOME_FINAL_V6_END */
`;

fs.writeFileSync(globalsPath, `${css}${patch}\n`, "utf8");
console.log("[OK] Patch accueil final V6 appliqué dans app/globals.css");
console.log("");
console.log("Maintenant lance :");
console.log("  rmdir /s /q .next");
console.log("  npx next dev --webpack");
console.log("Puis CTRL+F5 dans Chrome.");
