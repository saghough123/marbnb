// fix-marbnb-resultats-hero-v3.js
// Correction CSS V3 ultra ciblée pour Marbnb :
// - enlève les anciens patchs CSS layout
// - réduit la grande image en haut de /resultats et de l'accueil
// - évite de couper les formulaires et boutons
// - ne touche PAS aux fichiers page.tsx
//
// Utilisation depuis C:\Users\SAGHOUGH\marbnb :
// node fix-marbnb-resultats-hero-v3.js

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const globalsPath = path.join(root, "app", "globals.css");

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function removeBlock(content, startText, endText) {
  let output = content;
  while (output.includes(startText) && output.includes(endText)) {
    const start = output.indexOf(startText);
    const end = output.indexOf(endText, start);
    if (start === -1 || end === -1) break;
    output = output.slice(0, start) + output.slice(end + endText.length);
  }
  return output.trimEnd();
}

if (!fs.existsSync(globalsPath)) {
  console.error("[ERREUR] app/globals.css introuvable. Lance ce script depuis le dossier racine Marbnb.");
  process.exit(1);
}

const backupPath = `${globalsPath}.bak-hero-v3-${timestamp()}`;
fs.copyFileSync(globalsPath, backupPath);
console.log(`[OK] Sauvegarde créée : ${backupPath}`);

let css = fs.readFileSync(globalsPath, "utf8");

// Retire les anciens patchs qui peuvent provoquer chevauchement ou coupe du contenu.
css = removeBlock(css, "/* MARBNB_LAYOUT_FIX_START */", "/* MARBNB_LAYOUT_FIX_END */");
css = removeBlock(css, "/* MARBNB_LAYOUT_FIX_V2_START */", "/* MARBNB_LAYOUT_FIX_V2_END */");
css = removeBlock(css, "/* MARBNB_HERO_COMPACT_V3_START */", "/* MARBNB_HERO_COMPACT_V3_END */");

const patch = `

/* MARBNB_HERO_COMPACT_V3_START */
/* Correction Marbnb V3 : grandes images d'accueil et résultats plus compactes. */

/* Navbar toujours visible */
header,
nav,
.marbnb-navbar {
  position: sticky !important;
  top: 0 !important;
  z-index: 9999 !important;
}

/* Cible toutes les sections qui utilisent la grande image Marbnb. */
section:has(img[src="/marbnb-hero-mix.png"]) {
  position: relative !important;
  overflow: hidden !important;
}

/* Si l'image est en flux normal, elle ne doit plus remplir tout l'écran. */
section:has(img[src="/marbnb-hero-mix.png"]) img[src="/marbnb-hero-mix.png"] {
  max-height: 460px !important;
  object-fit: cover !important;
  object-position: center 45% !important;
}

/* Résultats / Explorer : la section de recherche doit tenir dans le haut de page. */
body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]),
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) {
  min-height: 430px !important;
  max-height: none !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) > div[class*="max-w-7xl"],
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) > div[class*="max-w-7xl"] {
  min-height: auto !important;
  padding-top: 28px !important;
  padding-bottom: 28px !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) h1,
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) h1 {
  font-size: clamp(32px, 4vw, 56px) !important;
  line-height: 1.08 !important;
  margin-top: 14px !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) div[class*="mt-8"],
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) div[class*="mt-8"] {
  margin-top: 18px !important;
}

/* Accueil : première grande section plus courte, mais boutons visibles. */
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type {
  min-height: 560px !important;
}

section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="max-w-7xl"],
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="z-30"] {
  min-height: 560px !important;
  padding-top: 42px !important;
  padding-bottom: 42px !important;
}

section:has(img[src="/marbnb-hero-mix.png"]):first-of-type h1,
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type h2 {
  font-size: clamp(42px, 5vw, 72px) !important;
  line-height: 1.05 !important;
}

/* Deuxième section de l'accueil : moins d'espace avant les infos. */
main.marbnb-home-soft-gradient > section:first-child > div[class*="max-w-7xl"] {
  padding-top: 38px !important;
  padding-bottom: 38px !important;
}

main.marbnb-home-soft-gradient > section:first-child h2 {
  font-size: clamp(38px, 5vw, 68px) !important;
  line-height: 1.05 !important;
}

main.marbnb-home-soft-gradient > section:first-child div[class*="mt-10"] {
  margin-top: 22px !important;
}

/* Important : le contenu après le hero ne doit pas être poussé trop bas. */
section:has(img[src="/marbnb-hero-mix.png"]) + main,
section:has(img[src="/marbnb-hero-mix.png"]) + section {
  padding-top: 22px !important;
  margin-top: 0 !important;
}

/* Mobile : compacte davantage. */
@media (max-width: 768px) {
  section:has(img[src="/marbnb-hero-mix.png"]):first-of-type {
    min-height: 440px !important;
  }

  section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="max-w-7xl"],
  section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="z-30"] {
    min-height: 440px !important;
    padding-top: 24px !important;
    padding-bottom: 24px !important;
  }

  section:has(img[src="/marbnb-hero-mix.png"]) img[src="/marbnb-hero-mix.png"] {
    max-height: 420px !important;
  }
}
/* MARBNB_HERO_COMPACT_V3_END */
`;

fs.writeFileSync(globalsPath, `${css}${patch}\n`, "utf8");

console.log("[OK] Patch CSS V3 appliqué dans app/globals.css");
console.log("");
console.log("Maintenant lance :");
console.log("  rmdir /s /q .next");
console.log("  npx next dev --webpack");
console.log("");
console.log("Puis recharge avec CTRL+F5 :");
console.log("  http://localhost:3000");
console.log("  http://localhost:3000/resultats");
