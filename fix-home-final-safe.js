// fix-home-final-safe.js
// Correction finale et ciblée pour l'accueil Marbnb.
// Ne touche PAS à app/resultats/page.tsx.
// Objectif : supprimer le double hero, nettoyer les anciens patchs CSS, remonter le contenu,
// et mettre le texte dans une carte claire lisible au-dessus de l'image.
// Utilisation depuis C:\Users\SAGHOUGH\marbnb : node fix-home-final-safe.js

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const homePath = path.join(root, 'app', 'page.tsx');
const globalsPath = path.join(root, 'app', 'globals.css');

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function backup(file, label) {
  if (!fs.existsSync(file)) return;
  const backupFile = `${file}.bak-${label}-${stamp()}`;
  fs.copyFileSync(file, backupFile);
  console.log(`[OK] Backup : ${backupFile}`);
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
  return { output: output.trimEnd() + '\n', count };
}

function replaceAll(content, from, to) {
  return content.split(from).join(to);
}

if (!fs.existsSync(homePath)) {
  console.error('[ERREUR] app/page.tsx introuvable. Lance depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

// 1) Nettoyer les anciens patchs CSS conflictuels
if (fs.existsSync(globalsPath)) {
  backup(globalsPath, 'home-final-safe-css');
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
    const result = removeBlock(css, a, b);
    css = result.output;
    total += result.count;
  }
  fs.writeFileSync(globalsPath, css, 'utf8');
  console.log(`[OK] ${total} bloc(s) CSS expérimental(aux) supprimé(s).`);
}

// 2) Nettoyer l'accueil lui-même
backup(homePath, 'home-final-safe-page');
let home = fs.readFileSync(homePath, 'utf8');
const original = home;

// Supprimer le premier hero redondant entre les marqueurs.
const startMarker = '{/* MBNT_CTA_START */}';
const endMarker = '{/* MBNT_CTA_END */}';
const start = home.indexOf(startMarker);
const end = home.indexOf(endMarker);
if (start !== -1 && end !== -1 && end > start) {
  home = home.slice(0, start) + ' ' + home.slice(end + endMarker.length);
  console.log('[OK] Premier hero redondant supprimé entre MBNT_CTA_START et MBNT_CTA_END.');
} else {
  console.log('[INFO] Marqueurs MBNT_CTA_START/END non trouvés. Aucun bloc supprimé.');
}

// Supprimer les anciennes classes qui déclenchaient des styles contradictoires.
home = replaceAll(home, 'marbnb-home-readable marbnb-clean-hero relative overflow-hidden', 'relative overflow-hidden bg-[#f7efe2]');
home = replaceAll(home, 'marbnb-home-readable marbnb-clean-hero marbnb-premium-hero relative', 'relative');
home = replaceAll(home, 'marbnb-clean-hero-overlay', 'absolute inset-0 bg-gradient-to-b from-white/25 via-[#f7efe2]/35 to-[#f7efe2]/95');

// Rendre le fond image de la vraie section d'accueil moins haut.
home = replaceAll(
  home,
  '<div className="absolute inset-0"><img src="/marbnb-hero-secondary.png" alt="Décor marocain" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-white/25 via-[#f7efe2]/35 to-[#f7efe2]/95" /></div>',
  '<div className="absolute inset-x-0 top-0 h-[420px]"><img src="/marbnb-hero-secondary.png" alt="Décor marocain" className="h-full w-full object-cover opacity-70" /><div className="absolute inset-0 bg-gradient-to-b from-white/20 via-[#f7efe2]/40 to-[#f7efe2]" /></div>'
);

// Variante si le div overlay n'a pas été remplacé exactement.
home = replaceAll(
  home,
  '<div className="absolute inset-0"><img src="/marbnb-hero-secondary.png" alt="Décor marocain" className="h-full w-full object-cover" /><div className="marbnb-clean-hero-overlay" /></div>',
  '<div className="absolute inset-x-0 top-0 h-[420px]"><img src="/marbnb-hero-secondary.png" alt="Décor marocain" className="h-full w-full object-cover opacity-70" /><div className="absolute inset-0 bg-gradient-to-b from-white/20 via-[#f7efe2]/40 to-[#f7efe2]" /></div>'
);

// Compacter le conteneur de la vraie section d'accueil.
home = replaceAll(home, 'className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 md:pt-24"', 'className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:pt-12"');
home = replaceAll(home, 'className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:pt-12"', 'className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:pt-12"');

// Mettre le bloc titre dans une carte claire lisible.
home = replaceAll(
  home,
  '<div className="max-w-4xl"><p className="mb-4 marbnb-premium-signature rounded-full px-4 py-2 text-sm font-bold backdrop-blur">',
  '<div className="max-w-4xl rounded-[2rem] border border-[#ead9ba] bg-[#fff8ec]/92 p-6 shadow-2xl backdrop-blur-md md:p-8"><p className="mb-4 inline-flex rounded-full border border-[#ead9ba] bg-white/80 px-4 py-2 text-sm font-bold text-[#7a3d14] backdrop-blur">'
);

// Compacter le titre et retrouver des couleurs lisibles.
home = replaceAll(home, 'text-5xl font-black tracking-tight text-[#28231d]  md:text-7xl', 'text-4xl font-black tracking-tight text-[#1e1b18] md:text-6xl');
home = replaceAll(home, 'text-lg leading-8 text-[#5d513e] marbnb-hero-readable-text', 'text-base leading-7 text-[#5f4b32]');
home = replaceAll(home, 'mt-10 max-w-6xl', 'mt-6 max-w-6xl');
home = replaceAll(home, 'mt-7 flex max-w-6xl', 'mt-4 flex max-w-6xl');

// Les boutons rouges doivent rester lisibles.
home = replaceAll(home, 'bg-[#c1121f] px-8 py-4 font-black text-[#28231d]', 'bg-[#c1121f] px-8 py-4 font-black text-white');
home = replaceAll(home, 'bg-[#c1121f] py-3 font-black text-[#28231d]', 'bg-[#c1121f] py-3 font-black text-white');

if (home !== original) {
  fs.writeFileSync(homePath, home, 'utf8');
  console.log('[OK] app/page.tsx corrigé. /resultats n\'a pas été touché.');
} else {
  console.log('[INFO] app/page.tsx inchangé.');
}

console.log('\nTerminé. Lance maintenant :');
console.log('  rmdir /s /q .next');
console.log('  npx next dev --webpack');
console.log('Puis recharge http://localhost:3000 avec CTRL+F5.');
