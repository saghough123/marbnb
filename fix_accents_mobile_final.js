const fs = require('fs');
const path = require('path');

const root = process.cwd();
const targets = [
  path.join(root, 'app', 'page.tsx'),
  path.join(root, 'app', 'resultats', 'page.tsx'),
];

const replacements = [
  // Corrections ultra ciblées vues sur mobile
  ['ARRIVÃ‰E', 'ARRIVÉE'],
  ['ARRIV‰E', 'ARRIVÉE'],
  ['ARRIV�E', 'ARRIVÉE'],
  ['ARRIV%E', 'ARRIVÉE'],
  ['ARRIVÃ% E', 'ARRIVÉE'],
  ['ARRIVÃ‰', 'ARRIVÉE'],
  ['ARRIVÃ©E', 'ARRIVÉE'],
  ['DÃ‰PART', 'DÉPART'],
  ['D‰PART', 'DÉPART'],
  ['D�PART', 'DÉPART'],
  ['DÃ%PART', 'DÉPART'],
  ['D%PART', 'DÉPART'],
  ['DÃ©PART', 'DÉPART'],

  // Autres accents / symboles cassés fréquents
  ['Ã‰', 'É'], ['Ãˆ', 'È'], ['ÃŠ', 'Ê'], ['Ã€', 'À'], ['Ã‡', 'Ç'],
  ['Ã©', 'é'], ['Ã¨', 'è'], ['Ãª', 'ê'], ['Ã«', 'ë'],
  ['Ã ', 'à'], ['Ã¢', 'â'], ['Ã¤', 'ä'],
  ['Ã´', 'ô'], ['Ã¶', 'ö'], ['Ã¹', 'ù'], ['Ã»', 'û'], ['Ã¼', 'ü'],
  ['Ã®', 'î'], ['Ã¯', 'ï'], ['Ã§', 'ç'],
  ['Å“', 'œ'], ['cÅ“ur', 'cœur'],
  ['Â·', '·'], ['Â ', ' '], ['â†’', '→'], ['â€¹', '‹'], ['â€º', '›'],
  ['âœ“', '✓'], ['â‚¬', '€'], ['ï»¿', ''],

  // Emojis cassés si présents
  ['ðŸ‡²ðŸ‡¦', '🇲🇦'], ['ðŸ¡', '🏡'], ['ðŸ¢', '🏢'], ['ðŸŒŠ', '🌊'],
  ['ðŸŠ', '🏊'], ['ðŸ¤', '🤍'], ['ðŸ’µ', '💵'], ['ðŸ’³', '💳'],
];

let changed = 0;
for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  let txt = fs.readFileSync(file, 'utf8');
  const before = txt;

  for (const [bad, good] of replacements) {
    txt = txt.split(bad).join(good);
  }

  // Corrections par regex au cas où le caractère du milieu varie selon le navigateur.
  txt = txt.replace(/ARRIV.{0,4}E/g, (m) => {
    if (m.includes('ARRIV') && m !== 'ARRIVÉE') return 'ARRIVÉE';
    return m;
  });
  txt = txt.replace(/D.{0,4}PART/g, (m) => {
    if (m.includes('PART') && m !== 'DÉPART') return 'DÉPART';
    return m;
  });

  // Forcer les libellés exacts dans les blocs de réservation si l'ancien texte persiste.
  txt = txt.replace(/<p className="text-xs font-black">[^<]*<\/p><input type="date" value=\{arrivee\}/g,
    '<p className="text-xs font-black">ARRIVÉE</p><input type="date" value={arrivee}');
  txt = txt.replace(/<p className="text-xs font-black">[^<]*<\/p><input type="date" value=\{depart\}/g,
    '<p className="text-xs font-black">DÉPART</p><input type="date" value={depart}');

  if (txt !== before) {
    fs.writeFileSync(file + '.bak-encoding-2', before, 'utf8');
    fs.writeFileSync(file, txt, 'utf8');
    console.log('Corrigé:', path.relative(root, file));
    changed++;
  }
}

console.log('Terminé. Fichiers modifiés:', changed);
console.log('Teste en local, puis fais git add . / git commit / git push.');
