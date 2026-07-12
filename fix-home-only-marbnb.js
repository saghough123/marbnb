// fix-home-only-marbnb.js
// Correction ACCUEIL uniquement.
// Ne touche PAS à app/resultats/page.tsx.
// Objectif : supprimer le double hero et remonter la vraie section d'accueil.
//
// Utilisation depuis C:\Users\SAGHOUGH\marbnb :
//   node fix-home-only-marbnb.js

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const homePath = path.join(root, "app", "page.tsx");
const globalsPath = path.join(root, "app", "globals.css");

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function backup(file, label) {
  if (!fs.existsSync(file)) return;
  const b = `${file}.bak-${label}-${stamp()}`;
  fs.copyFileSync(file, b);
  console.log(`[OK] Backup : ${b}`);
}

function removeBlock(content, startText, endText) {
  let output = content;
  let count = 0;
  while (output.includes(startText) && output.includes(endText)) {
    const start = output.indexOf(startText);
    const end = output.indexOf(endText, start);
    if (start === -1 || end === -1) break;
    output = output.slice(0, start) + output.slice(end + endText.length);
    count++;
  }
  return { output: output.trimEnd() + "\n", count };
}

if (!fs.existsSync(homePath)) {
  console.error("[ERREUR] app/page.tsx introuvable. Lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb");
  process.exit(1);
}

// 1) Nettoyage CSS : retirer tous les patchs hero/layout précédents
if (fs.existsSync(globalsPath)) {
  backup(globalsPath, "home-only-css");
  let css = fs.readFileSync(globalsPath, "utf8");
  let total = 0;
  const blocks = [
    ["/* MARBNB_LAYOUT_FIX_START */", "/* MARBNB_LAYOUT_FIX_END */"],
    ["/* MARBNB_LAYOUT_FIX_V2_START */", "/* MARBNB_LAYOUT_FIX_V2_END */"],
    ["/* MARBNB_HERO_COMPACT_V3_START */", "/* MARBNB_HERO_COMPACT_V3_END */"],
    ["/* MARBNB_HOME_EXPLORER_V4_START */", "/* MARBNB_HOME_EXPLORER_V4_END */"],
    ["/* MARBNB_HERO_RADICAL_V5_START */", "/* MARBNB_HERO_RADICAL_V5_END */"],
    ["/* MARBNB_HOME_FINAL_V6_START */", "/* MARBNB_HOME_FINAL_V6_END */"],
    ["/* MARBNB_HOME_OVERLAY_V7_START */", "/* MARBNB_HOME_OVERLAY_V7_END */"],
  ];
  for (const [a, b] of blocks) {
    const r = removeBlock(css, a, b);
    css = r.output;
    total += r.count;
  }
  fs.writeFileSync(globalsPath, css, "utf8");
  console.log(`[OK] ${total} bloc(s) CSS expérimental(aux) supprimé(s) de globals.css`);
}

// 2) Nettoyage de app/page.tsx : supprimer le premier hero redondant entre MBNT_CTA_START/END
backup(homePath, "home-only-page");
let home = fs.readFileSync(homePath, "utf8");
const original = home;

const startMarker = "{/* MBNT_CTA_START */}";
const endMarker = "{/* MBNT_CTA_END */}";
const start = home.indexOf(startMarker);
const end = home.indexOf(endMarker);

if (start !== -1 && end !== -1 && end > start) {
  home = home.slice(0, start) + " " + home.slice(end + endMarker.length);
  console.log("[OK] Premier hero redondant supprimé dans app/page.tsx");
} else {
  console.log("[INFO] Marqueurs MBNT_CTA_START/END introuvables : aucun bloc hero supprimé.");
}

// 3) Compacter la vraie section d'accueil sans toucher à /resultats
home = home.replace(/pb-16 pt-16 md:pt-24/g, "pb-8 pt-8 md:pt-10");
home = home.replace(/mt-10 max-w-6xl/g, "mt-5 max-w-6xl");
home = home.replace(/mt-7 flex max-w-6xl/g, "mt-4 flex max-w-6xl");
home = home.replace(/text-5xl font-black tracking-tight text-\[#28231d\]\s+md:text-7xl/g, "text-4xl font-black tracking-tight text-[#28231d] md:text-6xl");
home = home.replace(/text-5xl font-black tracking-tight text-white drop-shadow md:text-7xl/g, "text-4xl font-black tracking-tight text-white drop-shadow md:text-6xl");

// 4) Rendre les boutons rouges lisibles si le texte est noir par erreur
home = home.replace(/bg-\[#c1121f\]([^"`]*?)text-\[#28231d\]/g, "bg-[#c1121f]$1text-white");

if (home !== original) {
  fs.writeFileSync(homePath, home, "utf8");
  console.log("[OK] app/page.tsx corrigé pour l'accueil uniquement");
} else {
  console.log("[INFO] Aucun changement dans app/page.tsx");
}

console.log("\nTerminé. Lance maintenant :");
console.log("  rmdir /s /q .next");
console.log("  npx next dev --webpack");
console.log("Puis recharge http://localhost:3000 avec CTRL+F5.");
console.log("Important : /resultats n'a pas été modifié.");
