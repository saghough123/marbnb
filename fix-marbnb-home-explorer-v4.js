// fix-marbnb-home-explorer-v4.js
// Script JavaScript SAFE pour Marbnb
// Objectif : remonter les infos sous la grande image sur Accueil et Explorer/Résultats
// Sans casser le TSX : on modifie seulement app/globals.css
//
// Utilisation :
// 1) Mets ce fichier dans C:\Users\SAGHOUGH\marbnb
// 2) Lance : node fix-marbnb-home-explorer-v4.js
// 3) Puis : rmdir /s /q .next
// 4) Puis : npx next dev --webpack

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
  console.error("[ERREUR] app/globals.css introuvable. Lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb");
  process.exit(1);
}

const backupPath = `${globalsPath}.bak-home-explorer-v4-${timestamp()}`;
fs.copyFileSync(globalsPath, backupPath);
console.log(`[OK] Sauvegarde créée : ${backupPath}`);

let css = fs.readFileSync(globalsPath, "utf8");

// Supprimer tous les anciens patchs pour éviter conflits/chevauchements.
css = removeBlock(css, "/* MARBNB_LAYOUT_FIX_START */", "/* MARBNB_LAYOUT_FIX_END */");
css = removeBlock(css, "/* MARBNB_LAYOUT_FIX_V2_START */", "/* MARBNB_LAYOUT_FIX_V2_END */");
css = removeBlock(css, "/* MARBNB_HERO_COMPACT_V3_START */", "/* MARBNB_HERO_COMPACT_V3_END */");
css = removeBlock(css, "/* MARBNB_HOME_EXPLORER_V4_START */", "/* MARBNB_HOME_EXPLORER_V4_END */");

const patch = `

/* MARBNB_HOME_EXPLORER_V4_START */
/*
  Patch Marbnb V4
  But : réduire la grande image en haut et remonter les informations.
  Méthode : CSS uniquement, sans toucher aux fichiers page.tsx.
*/

/* Navbar au-dessus des images */
header,
nav,
.marbnb-navbar {
  position: sticky !important;
  top: 0 !important;
  z-index: 9999 !important;
}

/* ACCUEIL : première image hero plus courte */
body:not(:has(input[placeholder="Ville, quartier ou logement"])) section:has(img[src="/marbnb-hero-mix.png"]):first-of-type {
  min-height: 540px !important;
  height: 540px !important;
  max-height: 540px !important;
  overflow: hidden !important;
}

body:not(:has(input[placeholder="Ville, quartier ou logement"])) section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="max-w-7xl"],
body:not(:has(input[placeholder="Ville, quartier ou logement"])) section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="z-30"] {
  min-height: 540px !important;
  height: 540px !important;
  padding-top: 30px !important;
  padding-bottom: 30px !important;
  align-items: center !important;
}

body:not(:has(input[placeholder="Ville, quartier ou logement"])) section:has(img[src="/marbnb-hero-mix.png"]):first-of-type img[src="/marbnb-hero-mix.png"] {
  height: 540px !important;
  max-height: 540px !important;
  object-fit: cover !important;
  object-position: center 42% !important;
}

/* Carte texte accueil : taille plus raisonnable */
body:not(:has(input[placeholder="Ville, quartier ou logement"])) section:has(img[src="/marbnb-hero-mix.png"]):first-of-type div[class*="backdrop-blur"] {
  max-width: 620px !important;
  padding: 24px !important;
}

body:not(:has(input[placeholder="Ville, quartier ou logement"])) section:has(img[src="/marbnb-hero-mix.png"]):first-of-type h1,
body:not(:has(input[placeholder="Ville, quartier ou logement"])) section:has(img[src="/marbnb-hero-mix.png"]):first-of-type h2 {
  font-size: clamp(40px, 5vw, 70px) !important;
  line-height: 1.05 !important;
}

/* ACCUEIL : deuxième section, réduire le haut */
main.marbnb-home-soft-gradient > section:first-child > div[class*="max-w-7xl"] {
  padding-top: 30px !important;
  padding-bottom: 38px !important;
}

main.marbnb-home-soft-gradient > section:first-child h1,
main.marbnb-home-soft-gradient > section:first-child h2 {
  font-size: clamp(38px, 5vw, 66px) !important;
  line-height: 1.05 !important;
}

main.marbnb-home-soft-gradient > section:first-child div[class*="mt-10"] {
  margin-top: 18px !important;
}

/* EXPLORER / RESULTATS : image du haut compacte */
body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]),
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) {
  min-height: 430px !important;
  height: auto !important;
  max-height: none !important;
  overflow: hidden !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) img[src="/marbnb-hero-mix.png"],
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) img[src="/marbnb-hero-mix.png"] {
  height: 430px !important;
  max-height: 430px !important;
  object-fit: cover !important;
  object-position: center 45% !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) > div[class*="max-w-7xl"],
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) > div[class*="max-w-7xl"] {
  padding-top: 26px !important;
  padding-bottom: 26px !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) h1,
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) h1 {
  font-size: clamp(32px, 4vw, 56px) !important;
  line-height: 1.08 !important;
  margin-top: 12px !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) div[class*="mt-8"],
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) div[class*="mt-8"] {
  margin-top: 16px !important;
}

/* Remonter le contenu après le hero */
section:has(img[src="/marbnb-hero-mix.png"]) + main,
section:has(img[src="/marbnb-hero-mix.png"]) + section {
  padding-top: 20px !important;
  margin-top: 0 !important;
}

/* PWA popup : éviter de masquer trop de contenu */
@media (min-width: 769px) {
  .marbnb-install-card,
  .marbnb-pwa-install,
  div:has(> button):has(img) {
    max-width: 430px !important;
  }
}

/* Mobile */
@media (max-width: 768px) {
  body:not(:has(input[placeholder="Ville, quartier ou logement"])) section:has(img[src="/marbnb-hero-mix.png"]):first-of-type {
    min-height: 420px !important;
    height: 420px !important;
    max-height: 420px !important;
  }

  body:not(:has(input[placeholder="Ville, quartier ou logement"])) section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="max-w-7xl"],
  body:not(:has(input[placeholder="Ville, quartier ou logement"])) section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="z-30"] {
    min-height: 420px !important;
    height: 420px !important;
    padding-top: 22px !important;
    padding-bottom: 22px !important;
  }

  body:not(:has(input[placeholder="Ville, quartier ou logement"])) section:has(img[src="/marbnb-hero-mix.png"]):first-of-type img[src="/marbnb-hero-mix.png"] {
    height: 420px !important;
    max-height: 420px !important;
  }
}
/* MARBNB_HOME_EXPLORER_V4_END */
`;

fs.writeFileSync(globalsPath, `${css}${patch}\n`, "utf8");

console.log("[OK] Patch V4 ajouté dans app/globals.css");
console.log("[OK] Les anciens patchs layout ont été supprimés.");
console.log("");
console.log("Maintenant lance :");
console.log("  rmdir /s /q .next");
console.log("  npx next dev --webpack");
console.log("");
console.log("Puis recharge avec CTRL+F5");
