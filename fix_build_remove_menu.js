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

// 1) Retirer le bloc <style jsx global> qui casse le build Vercel.
function removeBetweenMarkers(text, startMarker, endMarker) {
  let out = text;
  while (true) {
    const s = out.indexOf(startMarker);
    const e = out.indexOf(endMarker);
    if (s === -1 || e === -1 || e <= s) break;
    out = out.slice(0, s) + out.slice(e + endMarker.length);
  }
  return out;
}

code = removeBetweenMarkers(code, '{/* FORCE_REMOVE_MOBILE_NAV_START */}', '{/* FORCE_REMOVE_MOBILE_NAV_END */}');
code = removeBetweenMarkers(code, '{/* MBNT_REMOVE_MOBILE_MENU_START */}', '{/* MBNT_REMOVE_MOBILE_MENU_END */}');

// 2) Supprimer physiquement les boutons/liens du menu problématique.
const labels = ['Séjours', 'Sejours', 'Expériences', 'Experiences', 'Devenir hôte', 'Devenir hote', 'À propos', 'A propos', 'Mettre mon logement'];
for (const label of labels) {
  const safe = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  code = code.replace(new RegExp(`<button[^>]*>\\s*${safe}\\s*<\\/button>`, 'g'), '');
  code = code.replace(new RegExp(`<a[^>]*>\\s*${safe}\\s*<\\/a>`, 'g'), '');
}

// 3) Supprimer les conteneurs vides laissés par la suppression.
code = code.replace(/<div className="[^"]*">\s*<\/div>/g, '');
code = code.replace(/<nav className="[^"]*">\s*<\/nav>/g, '');

// 4) Sécurité : garder le bon nom.
code = code.split('Marbnb').join('Mbnb');
code = code.replace('>Mar</span><span', '>M</span><span');

// 5) Corriger les libellés date cassés si présents.
const fixes = [
  ['ARRIV‰E', 'ARRIVÉE'], ['ARRIVÃ‰E', 'ARRIVÉE'], ['ARRIVÃ©E', 'ARRIVÉE'],
  ['DÃ‰PART', 'DÉPART'], ['DÃ©PART', 'DÉPART'], ['D‰PART', 'DÉPART'],
  ['Ã‰quipements', 'Équipements'], ['Wiâ€‘Fi', 'Wi‑Fi'], ['Â·', '·'], ['â†’', '→']
];
for (const [bad, good] of fixes) code = code.split(bad).join(good);

fs.writeFileSync(pagePath + '.bak-fix-build-menu', before, 'utf8');
fs.writeFileSync(pagePath, code, 'utf8');

console.log('OK: bloc CSS qui cassait le build supprimé.');
console.log('OK: menus problématiques supprimés physiquement.');
console.log('Backup créé: app/page.tsx.bak-fix-build-menu');
console.log('Maintenant lance npm run build en local pour vérifier.');
