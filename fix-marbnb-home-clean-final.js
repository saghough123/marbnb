// fix-marbnb-home-clean-final.js
// FINAL SAFE CLEANUP for Marbnb home page
// 1) Removes all previous CSS hero/layout experiments from app/globals.css
// 2) Removes the old first CTA hero block in app/page.tsx between MBNT_CTA_START and MBNT_CTA_END
// This keeps /resultats untouched.
// Usage from C:\Users\SAGHOUGH\marbnb:
//   node fix-marbnb-home-clean-final.js

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const globalsPath = path.join(root, 'app', 'globals.css');
const homePath = path.join(root, 'app', 'page.tsx');

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function backup(file, tag) {
  if (!fs.existsSync(file)) return null;
  const b = `${file}.bak-${tag}-${stamp()}`;
  fs.copyFileSync(file, b);
  console.log(`[OK] Backup : ${b}`);
  return b;
}

function removeBlock(content, start, end) {
  let out = content;
  let count = 0;
  while (out.includes(start) && out.includes(end)) {
    const s = out.indexOf(start);
    const e = out.indexOf(end, s);
    if (s === -1 || e === -1) break;
    out = out.slice(0, s) + out.slice(e + end.length);
    count++;
  }
  return { out: out.trimEnd() + '\n', count };
}

if (!fs.existsSync(path.join(root, 'app'))) {
  console.error('[ERREUR] Lance ce script depuis le dossier racine Marbnb : C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

// 1) Clean CSS patches
if (fs.existsSync(globalsPath)) {
  backup(globalsPath, 'clean-final-css');
  let css = fs.readFileSync(globalsPath, 'utf8');
  let total = 0;
  const blocks = [
    ['/* MARBNB_LAYOUT_FIX_START */', '/* MARBNB_LAYOUT_FIX_END */'],
    ['/* MARBNB_LAYOUT_FIX_V2_START */', '/* MARBNB_LAYOUT_FIX_V2_END */'],
    ['/* MARBNB_HERO_COMPACT_V3_START */', '/* MARBNB_HERO_COMPACT_V3_END */'],
    ['/* MARBNB_HOME_EXPLORER_V4_START */', '/* MARBNB_HOME_EXPLORER_V4_END */'],
    ['/* MARBNB_HERO_RADICAL_V5_START */', '/* MARBNB_HERO_RADICAL_V5_END */'],
    ['/* MARBNB_HOME_FINAL_V6_START */', '/* MARBNB_HOME_FINAL_V6_END */'],
    ['/* MARBNB_HOME_OVERLAY_V7_START */', '/* MARBNB_HOME_OVERLAY_V7_END */'],
  ];
  for (const [a, b] of blocks) {
    const r = removeBlock(css, a, b);
    css = r.out;
    total += r.count;
  }
  fs.writeFileSync(globalsPath, css, 'utf8');
  console.log(`[OK] ${total} bloc(s) CSS expérimental(aux) supprimé(s).`);
} else {
  console.log('[INFO] app/globals.css introuvable, nettoyage CSS ignoré.');
}

// 2) Remove first duplicative CTA hero block from home page using markers
if (!fs.existsSync(homePath)) {
  console.error('[ERREUR] app/page.tsx introuvable.');
  process.exit(1);
}
backup(homePath, 'clean-final-home');
let home = fs.readFileSync(homePath, 'utf8');
const before = home;

const startMarker = '{/* MBNT_CTA_START */}';
const endMarker = '{/* MBNT_CTA_END */}';
const start = home.indexOf(startMarker);
const end = home.indexOf(endMarker);

if (start !== -1 && end !== -1 && end > start) {
  home = home.slice(0, start) + ' ' + home.slice(end + endMarker.length);
  console.log('[OK] Ancien premier hero CTA supprimé entre MBNT_CTA_START et MBNT_CTA_END.');
} else {
  console.log('[INFO] Marqueurs MBNT_CTA_START/END introuvables. Aucun bloc TSX supprimé.');
}

// Make the remaining home hero section more compact if common classes exist.
home = home.replace(/pb-16 pt-16 md:pt-24/g, 'pb-10 pt-10 md:pt-12');
home = home.replace(/mt-10 max-w-6xl/g, 'mt-6 max-w-6xl');
home = home.replace(/text-5xl font-black tracking-tight text-white drop-shadow md:text-7xl/g, 'text-4xl font-black tracking-tight text-white drop-shadow md:text-6xl');

if (home !== before) {
  fs.writeFileSync(homePath, home, 'utf8');
  console.log('[OK] app/page.tsx nettoyé et accueil compacté.');
} else {
  console.log('[INFO] app/page.tsx inchangé.');
}

console.log('\nTerminé. Lance maintenant :');
console.log('  rmdir /s /q .next');
console.log('  npx next dev --webpack');
console.log('\nPuis recharge http://localhost:3000 avec CTRL+F5.');
