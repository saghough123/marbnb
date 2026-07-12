// fix-marbnb-hero-smart.js
// Script intelligent : corrige la grande image Accueil + Explorer sans chercher une classe exacte.
// Il nettoie aussi les anciens patchs CSS qui ont empiré le rendu.
// Utilisation depuis C:\Users\SAGHOUGH\marbnb : node fix-marbnb-hero-smart.js

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const homePath = path.join(root, "app", "page.tsx");
const resultatsPath = path.join(root, "app", "resultats", "page.tsx");
const globalsPath = path.join(root, "app", "globals.css");

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function backup(file) {
  if (!fs.existsSync(file)) return;
  const backupFile = `${file}.bak-smart-hero-${stamp()}`;
  fs.copyFileSync(file, backupFile);
  console.log(`[OK] Backup : ${backupFile}`);
}

function removeCssBlock(content, startText, endText) {
  let out = content;
  while (out.includes(startText) && out.includes(endText)) {
    const s = out.indexOf(startText);
    const e = out.indexOf(endText, s);
    if (s === -1 || e === -1) break;
    out = out.slice(0, s) + out.slice(e + endText.length);
  }
  return out;
}

function cleanGlobalCss() {
  if (!fs.existsSync(globalsPath)) {
    console.log("[INFO] app/globals.css introuvable, nettoyage CSS ignore.");
    return;
  }
  backup(globalsPath);
  let css = fs.readFileSync(globalsPath, "utf8");
  const before = css;
  const blocks = [
    ["/* MARBNB_LAYOUT_FIX_START */", "/* MARBNB_LAYOUT_FIX_END */"],
    ["/* MARBNB_LAYOUT_FIX_V2_START */", "/* MARBNB_LAYOUT_FIX_V2_END */"],
    ["/* MARBNB_HERO_COMPACT_V3_START */", "/* MARBNB_HERO_COMPACT_V3_END */"],
    ["/* MARBNB_HOME_EXPLORER_V4_START */", "/* MARBNB_HOME_EXPLORER_V4_END */"],
  ];
  for (const [a,b] of blocks) css = removeCssBlock(css, a, b);
  if (css !== before) {
    fs.writeFileSync(globalsPath, css.trimEnd() + "\n", "utf8");
    console.log("[OK] Anciens patchs CSS supprimés dans globals.css");
  } else {
    console.log("[INFO] Aucun ancien patch CSS trouvé.");
  }
}

function patchClassNamesInHome() {
  if (!fs.existsSync(homePath)) {
    console.log("[ERREUR] app/page.tsx introuvable.");
    return;
  }
  backup(homePath);
  let s = fs.readFileSync(homePath, "utf8");
  const before = s;

  // Corrige toutes les hauteurs hero courantes, même si le texte exact a changé.
  s = s.replace(/min-h-\[(720|700|680|650|620)px\]/g, "min-h-[560px]");
  s = s.replace(/h-\[(720|700|680|650|620)px\]/g, "h-[560px]");

  // Remonte le contenu quand l'ancien masque mobile / padding existe.
  s = s.replace(/pt-\[175px\]/g, "pt-10");
  s = s.replace(/pb-16 pt-16 md:pt-24/g, "pb-10 pt-10 md:pt-12");
  s = s.replace(/pb-16 pt-16/g, "pb-10 pt-10");
  s = s.replace(/pb-16 pt-\[175px\]/g, "pb-8 pt-10");
  s = s.replace(/md:py-16/g, "md:py-10");

  // Si une section a encore fake mask trop haut, on réduit.
  s = s.replace(/h-\[175px\]/g, "h-[72px]");

  // Vérifie les classes invalides possibles.
  s = s.replace(/bg-#3F7D3B/g, "bg-[#3F7D3B]");
  s = s.replace(/text-#3F7D3B/g, "text-[#3F7D3B]");

  if (s !== before) {
    fs.writeFileSync(homePath, s, "utf8");
    console.log("[OK] app/page.tsx : grande image accueil réduite et contenu remonté.");
  } else {
    console.log("[INFO] app/page.tsx : aucune classe connue à modifier.");
  }
}

function patchClassNamesInResultats() {
  if (!fs.existsSync(resultatsPath)) {
    console.log("[INFO] app/resultats/page.tsx introuvable, étape ignorée.");
    return;
  }
  backup(resultatsPath);
  let s = fs.readFileSync(resultatsPath, "utf8");
  const before = s;

  s = s.replace(/pb-10 pt-10 md:pb-16 md:pt-16/g, "pb-6 pt-8 md:pb-8 md:pt-10");
  s = s.replace(/pb-10 pt-12 md:pb-16 md:pt-20/g, "pb-6 pt-8 md:pb-8 md:pt-10");
  s = s.replace(/pb-16 pt-16 md:pt-24/g, "pb-8 pt-8 md:pt-10");
  s = s.replace(/md:text-7xl/g, "md:text-5xl");
  s = s.replace(/md:text-6xl/g, "md:text-5xl");
  s = s.replace(/mt-8 rounded-\[2rem\]/g, "mt-5 rounded-[2rem]");
  s = s.replace(/bg-#3F7D3B/g, "bg-[#3F7D3B]");
  s = s.replace(/text-#3F7D3B/g, "text-[#3F7D3B]");

  if (s !== before) {
    fs.writeFileSync(resultatsPath, s, "utf8");
    console.log("[OK] app/resultats/page.tsx : hero Explorer/Résultats compacté.");
  } else {
    console.log("[INFO] app/resultats/page.tsx : aucune classe connue à modifier.");
  }
}

console.log("=== MARBNB HERO SMART FIX ===");
console.log(`Dossier : ${root}`);
cleanGlobalCss();
patchClassNamesInHome();
patchClassNamesInResultats();
console.log("\nTerminé. Lance maintenant :");
console.log("  rmdir /s /q .next");
console.log("  npx next dev --webpack");
console.log("Puis CTRL+F5 dans le navigateur.");
