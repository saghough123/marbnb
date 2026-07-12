// fix-marbnb-layout-css.js
// Correction SAFE : ne modifie PAS la structure TSX.
// Ajoute seulement des règles CSS globales pour réduire les grandes images/hero
// et remonter les blocs d'informations sur Accueil et Explorer.
//
// Utilisation :
// 1) Mettre ce fichier dans C:\Users\SAGHOUGH\marbnb
// 2) Lancer : node fix-marbnb-layout-css.js
// 3) Puis : rmdir /s /q .next && npm run dev

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const globalsPath = path.join(root, "app", "globals.css");

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

if (!fs.existsSync(globalsPath)) {
  console.error("[ERREUR] app/globals.css introuvable. Vérifie que tu es bien dans C:\\Users\\SAGHOUGH\\marbnb");
  process.exit(1);
}

const backupPath = `${globalsPath}.bak-layout-${timestamp()}`;
fs.copyFileSync(globalsPath, backupPath);
console.log(`[OK] Sauvegarde créée : ${backupPath}`);

let css = fs.readFileSync(globalsPath, "utf8");

const start = "/* MARBNB_LAYOUT_FIX_START */";
const end = "/* MARBNB_LAYOUT_FIX_END */";

// Si le patch existe déjà, on le remplace proprement.
const regex = new RegExp(`${start}[\\s\\S]*?${end}`, "m");
css = css.replace(regex, "").trimEnd();

const patch = `

${start}
/*
  Correction Marbnb : remonter le contenu Accueil + Explorer.
  Cette correction est volontairement faite en CSS pour éviter de casser les fichiers TSX.
*/

/* 1) Limiter la hauteur des grands visuels en haut des pages */
body:has(img[src="/marbnb-hero-mix.png"]) main,
body:has(img[src="/marbnb-hero-mix.png"]) section {
  scroll-margin-top: 96px;
}

/* Accueil : premier grand hero */
body:has(a[href="/admin-dashboard"]) section:has(img[src="/marbnb-hero-mix.png"]),
body:has(a[href="/resultats"]) section:has(img[src="/marbnb-hero-mix.png"]),
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type {
  min-height: 480px !important;
  max-height: 560px !important;
}

section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div,
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div.relative,
section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="max-w-7xl"] {
  min-height: 480px !important;
  padding-top: 40px !important;
  padding-bottom: 32px !important;
}

section:has(img[src="/marbnb-hero-mix.png"]):first-of-type img[src="/marbnb-hero-mix.png"] {
  height: 100% !important;
  max-height: 560px !important;
  object-fit: cover !important;
  object-position: center 42% !important;
}

/* 2) Explorer / résultats : hero plus compact */
body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]),
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) {
  min-height: 420px !important;
  max-height: 520px !important;
}

body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]) > div[class*="max-w-7xl"],
body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) > div[class*="max-w-7xl"] {
  min-height: auto !important;
  padding-top: 32px !important;
  padding-bottom: 24px !important;
}

/* 3) Remonter les cartes/blocs qui se trouvent juste après la grande image */
section:has(img[src="/marbnb-hero-mix.png"]) + main,
section:has(img[src="/marbnb-hero-mix.png"]) + section,
section:has(img[src="/marbnb-hero-secondary.png"]) + section {
  margin-top: 0 !important;
  padding-top: 24px !important;
}

/* 4) Réduire l'effet voile blanc trop grand si présent */
.marbnb-clean-hero,
.marbnb-premium-hero,
.marbnb-home-readable {
  min-height: 480px !important;
  max-height: 560px !important;
}

.marbnb-clean-hero-overlay {
  opacity: 0.45 !important;
}

/* 5) Navbar toujours visible et au-dessus des images */
header,
nav,
.marbnb-navbar {
  position: sticky !important;
  top: 0 !important;
  z-index: 9999 !important;
}

/* 6) Mobile : encore plus compact */
@media (max-width: 768px) {
  section:has(img[src="/marbnb-hero-mix.png"]):first-of-type {
    min-height: 380px !important;
    max-height: 460px !important;
  }

  section:has(img[src="/marbnb-hero-mix.png"]):first-of-type > div[class*="max-w-7xl"] {
    min-height: 380px !important;
    padding-top: 24px !important;
    padding-bottom: 20px !important;
  }

  body:has(input[placeholder="Ville, quartier ou logement"]) section:has(img[src="/marbnb-hero-mix.png"]),
  body:has(input[placeholder="Ville ou quartier"]) section:has(img[src="/marbnb-hero-mix.png"]) {
    min-height: 360px !important;
    max-height: 440px !important;
  }
}
${end}
`;

fs.writeFileSync(globalsPath, `${css}${patch}\n`, "utf8");
console.log("[OK] Patch CSS ajouté dans app/globals.css");
console.log("");
console.log("Maintenant lance :");
console.log("  rmdir /s /q .next");
console.log("  npm run dev");
console.log("");
console.log("Teste ensuite :");
console.log("  http://localhost:3000");
console.log("  http://localhost:3000/resultats");
