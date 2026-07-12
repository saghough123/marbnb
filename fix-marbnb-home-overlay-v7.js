// fix-marbnb-home-overlay-v7.js
// Corrige UNIQUEMENT la page d'accueil Marbnb.
// Objectif : remonter le bloc blanc au-dessus de la photo et rendre l'écriture lisible.
// Ne touche PAS à app/resultats/page.tsx.
// Utilisation : node fix-marbnb-home-overlay-v7.js

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

const backup = `${globalsPath}.bak-home-overlay-v7-${stamp()}`;
fs.copyFileSync(globalsPath, backup);
console.log(`[OK] Sauvegarde créée : ${backup}`);

let css = fs.readFileSync(globalsPath, "utf8");

// On enlève uniquement les anciens patchs CSS de layout/hero conflictuels.
const blocks = [
  ["/* MARBNB_LAYOUT_FIX_START */", "/* MARBNB_LAYOUT_FIX_END */"],
  ["/* MARBNB_LAYOUT_FIX_V2_START */", "/* MARBNB_LAYOUT_FIX_V2_END */"],
  ["/* MARBNB_HERO_COMPACT_V3_START */", "/* MARBNB_HERO_COMPACT_V3_END */"],
  ["/* MARBNB_HOME_EXPLORER_V4_START */", "/* MARBNB_HOME_EXPLORER_V4_END */"],
  ["/* MARBNB_HERO_RADICAL_V5_START */", "/* MARBNB_HERO_RADICAL_V5_END */"],
  ["/* MARBNB_HOME_FINAL_V6_START */", "/* MARBNB_HOME_FINAL_V6_END */"],
  ["/* MARBNB_HOME_OVERLAY_V7_START */", "/* MARBNB_HOME_OVERLAY_V7_END */"],
];
for (const [a, b] of blocks) css = removeBlock(css, a, b);

const patch = `

/* MARBNB_HOME_OVERLAY_V7_START */
/*
  Accueil Marbnb uniquement.
  Résultat voulu : le bloc texte/recherche passe au-dessus de l'image,
  avec une écriture noire lisible sur une carte blanche semi-transparente.
  La page /resultats n'est pas ciblée.
*/

/* Ne pas impacter /resultats : cette règle vise les pages qui contiennent le main d'accueil. */
body:has(main.marbnb-home-soft-gradient) {
  background: #f7efe2 !important;
}

/* Navbar propre au-dessus de l'image */
body:has(main.marbnb-home-soft-gradient) header,
body:has(main.marbnb-home-soft-gradient) nav,
body:has(main.marbnb-home-soft-gradient) .marbnb-navbar {
  position: sticky !important;
  top: 0 !important;
  z-index: 9999 !important;
}

/* Premier bandeau image : moins haut et uniquement décoratif */
body:has(main.marbnb-home-soft-gradient) > div > section:first-of-type:has(img[src="/marbnb-hero-mix.png"]) {
  min-height: 300px !important;
  height: 300px !important;
  max-height: 300px !important;
  overflow: hidden !important;
  border-bottom: 1px solid #ead9ba !important;
}

body:has(main.marbnb-home-soft-gradient) > div > section:first-of-type:has(img[src="/marbnb-hero-mix.png"]) img[src="/marbnb-hero-mix.png"] {
  height: 300px !important;
  max-height: 300px !important;
  width: 100% !important;
  object-fit: cover !important;
  object-position: center 42% !important;
}

/* On cache seulement le contenu du premier hero pour éviter le doublon. */
body:has(main.marbnb-home-soft-gradient) > div > section:first-of-type:has(img[src="/marbnb-hero-mix.png"]) > div[class*="z-30"],
body:has(main.marbnb-home-soft-gradient) > div > section:first-of-type:has(img[src="/marbnb-hero-mix.png"]) > div.relative[class*="mx-auto"] {
  display: none !important;
}

/* La vraie section d'accueil remonte par-dessus la photo */
body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient {
  margin-top: -190px !important;
  position: relative !important;
  z-index: 20 !important;
}

body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child {
  min-height: auto !important;
  overflow: visible !important;
  background: transparent !important;
}

/* On garde l'image secondaire en fond, mais moins dominante */
body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child > div.absolute {
  inset: 0 !important;
  height: 520px !important;
  opacity: 0.45 !important;
}

body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child img[src="/marbnb-hero-secondary.png"] {
  height: 520px !important;
  object-fit: cover !important;
  object-position: center 45% !important;
}

/* Conteneur principal : remonte et limite la hauteur */
body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child > div[class*="max-w-7xl"] {
  padding-top: 28px !important;
  padding-bottom: 34px !important;
  min-height: 420px !important;
}

/* Bloc texte : carte claire au-dessus de l'image */
body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child > div[class*="max-w-7xl"] > div:first-child {
  max-width: 760px !important;
  background: rgba(255, 248, 236, 0.92) !important;
  color: #1e1b18 !important;
  border: 1px solid #ead9ba !important;
  border-radius: 32px !important;
  padding: 28px !important;
  box-shadow: 0 24px 60px rgba(30, 27, 24, 0.16) !important;
  backdrop-filter: blur(10px) !important;
}

/* Écriture noire/lisible */
body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child h1,
body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child h2,
body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child p {
  color: #1e1b18 !important;
  text-shadow: none !important;
}

body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child h1,
body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child h2 {
  font-size: clamp(42px, 5vw, 72px) !important;
  line-height: 1.04 !important;
  letter-spacing: -0.04em !important;
}

body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child p {
  color: #5f4b32 !important;
}

/* Le badge en haut de carte devient lisible */
body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child p[class*="rounded-full"],
body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child .rounded-full {
  color: #7a3d14 !important;
}

/* Barre de recherche : plus proche du titre */
body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child div[class*="mt-10"] {
  margin-top: 20px !important;
}

/* Sections suivantes : elles remontent normalement */
body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child + section {
  padding-top: 26px !important;
}

@media (max-width: 768px) {
  body:has(main.marbnb-home-soft-gradient) > div > section:first-of-type:has(img[src="/marbnb-hero-mix.png"]),
  body:has(main.marbnb-home-soft-gradient) > div > section:first-of-type:has(img[src="/marbnb-hero-mix.png"]) img[src="/marbnb-hero-mix.png"] {
    height: 240px !important;
    min-height: 240px !important;
    max-height: 240px !important;
  }

  body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient {
    margin-top: -155px !important;
  }

  body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child > div[class*="max-w-7xl"] > div:first-child {
    padding: 20px !important;
    border-radius: 24px !important;
  }

  body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child h1,
  body:has(main.marbnb-home-soft-gradient) main.marbnb-home-soft-gradient > section:first-child h2 {
    font-size: clamp(34px, 10vw, 52px) !important;
  }
}
/* MARBNB_HOME_OVERLAY_V7_END */
`;

fs.writeFileSync(globalsPath, `${css}${patch}\n`, "utf8");
console.log("[OK] Patch accueil overlay V7 appliqué dans app/globals.css");
console.log("[OK] La page /resultats n'a pas été modifiée.");
console.log("");
console.log("Maintenant lance :");
console.log("  rmdir /s /q .next");
console.log("  npx next dev --webpack");
console.log("Puis recharge avec CTRL+F5 sur http://localhost:3000");
