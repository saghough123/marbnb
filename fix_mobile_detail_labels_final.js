const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pagePath = path.join(root, 'app', 'page.tsx');

if (!fs.existsSync(pagePath)) {
  console.error('ERREUR: app/page.tsx introuvable. Lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

let code = fs.readFileSync(pagePath, 'utf8');
const before = code;

// Correction ciblée des libellés visibles sur mobile dans la fiche logement.
// On évite les regex trop larges et on force les textes dans les blocs date.
const replacements = [
  ['ARRIV‰E', 'ARRIVÉE'],
  ['ARRIVÃ‰E', 'ARRIVÉE'],
  ['ARRIVÃ©E', 'ARRIVÉE'],
  ['ARRIV�E', 'ARRIVÉE'],
  ['ARRIV%E', 'ARRIVÉE'],
  ['ARRIVÃ% E', 'ARRIVÉE'],
  ['DÃ‰PART', 'DÉPART'],
  ['DÃ©PART', 'DÉPART'],
  ['D‰PART', 'DÉPART'],
  ['D�PART', 'DÉPART'],
  ['D%PART', 'DÉPART'],
  ['DÃ%PART', 'DÉPART'],
  ['Ã‰quipements', 'Équipements'],
  ['Ã©quipements', 'équipements'],
  ['Wiâ€‘Fi', 'Wi‑Fi'],
  ['Wiâ€“Fi', 'Wi‑Fi'],
  ['Wiâ€”Fi', 'Wi‑Fi'],
  ['Coup de cÅ“ur', 'Coup de cœur'],
  ['cÅ“ur', 'cœur'],
  ['Å“', 'œ'],
  ['Â·', '·'],
  ['â€¹', '‹'],
  ['â€º', '›'],
  ['â†’', '→'],
  ['âœ“', '✓'],
  ['â‚¬', '€'],
];

for (const [bad, good] of replacements) {
  code = code.split(bad).join(good);
}

// Force les labels juste avant les champs date, peu importe l'ancien texte.
code = code.replace(/<p className="text-xs font-black">[^<]*<\/p><input type="date" value=\{arrivee\}/g,
  '<p className="text-xs font-black">ARRIVÉE</p><input type="date" value={arrivee}');

code = code.replace(/<p className="text-xs font-black">[^<]*<\/p><input type="date" value=\{depart\}/g,
  '<p className="text-xs font-black">DÉPART</p><input type="date" value={depart}');

// Cache le menu desktop sur mobile si présent.
code = code.replaceAll('className="flex items-center gap-6 text-sm font-bold md:flex"', 'className="hidden items-center gap-6 text-sm font-bold md:flex"');
code = code.replaceAll('className="flex items-center gap-6 text-sm font-bold"', 'className="hidden items-center gap-6 text-sm font-bold md:flex"');
code = code.replaceAll('<nav className="flex', '<nav className="hidden md:flex');

if (code !== before) {
  fs.writeFileSync(pagePath + '.bak-mobile-final', before, 'utf8');
  fs.writeFileSync(pagePath, code, 'utf8');
  console.log('OK: correction mobile finale appliquée dans app/page.tsx');
  console.log('Backup créé: app/page.tsx.bak-mobile-final');
} else {
  console.log('Aucune modification détectée. Si le problème persiste, il faut ouvrir app/page.tsx et chercher ARRIV ou D');
}
