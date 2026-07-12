// revert-marbnb-layout-patches.js
// Supprime TOUS les patchs CSS ajoutés pour la hauteur hero.
// Ne touche pas aux fichiers page.tsx.
// Utilisation : node revert-marbnb-layout-patches.js

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const globalsPath = path.join(root, "app", "globals.css");

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
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

if (!fs.existsSync(globalsPath)) {
  console.error("[ERREUR] app/globals.css introuvable. Lance depuis C:\\Users\\SAGHOUGH\\marbnb");
  process.exit(1);
}

const backup = `${globalsPath}.bak-revert-layout-${timestamp()}`;
fs.copyFileSync(globalsPath, backup);
console.log(`[OK] Sauvegarde creee : ${backup}`);

let css = fs.readFileSync(globalsPath, "utf8");
let total = 0;

const blocks = [
  ["/* MARBNB_LAYOUT_FIX_START */", "/* MARBNB_LAYOUT_FIX_END */"],
  ["/* MARBNB_LAYOUT_FIX_V2_START */", "/* MARBNB_LAYOUT_FIX_V2_END */"],
  ["/* MARBNB_HERO_COMPACT_V3_START */", "/* MARBNB_HERO_COMPACT_V3_END */"],
  ["/* MARBNB_HOME_EXPLORER_V4_START */", "/* MARBNB_HOME_EXPLORER_V4_END */"],
];

for (const [start, end] of blocks) {
  const result = removeBlock(css, start, end);
  css = result.output;
  total += result.count;
}

fs.writeFileSync(globalsPath, css, "utf8");
console.log(`[OK] ${total} bloc(s) CSS de correction hero supprime(s).`);
console.log("");
console.log("Maintenant lance :");
console.log("  rmdir /s /q .next");
console.log("  npx next dev --webpack");
console.log("");
console.log("Ensuite on fera la correction propre directement dans page.tsx avec 2 remplacements seulement.");
