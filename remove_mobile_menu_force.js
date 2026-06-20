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

// Cette correction masque/supprime le menu horizontal mobile qui reste inaccessible.
// Elle est volontairement plus agressive que les anciens scripts.

const styleBlock = `
      {/* MBNT_REMOVE_MOBILE_MENU_START */}
      <style jsx global>{` + '`' + `
        @media (max-width: 767px) {
          /* Cache la barre de navigation horizontale entre le header et le hero */
          header + nav,
          header + div[class*="border-b"],
          header + div[class*="sticky"],
          header + div[class*="backdrop"],
          nav:has(a),
          nav:has(button) {
            display: none !important;
            height: 0 !important;
            min-height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        }
      ` + '`' + `}</style>
      {/* MBNT_REMOVE_MOBILE_MENU_END */}
`;

// Retirer ancien bloc style si déjà présent.
const start = '{/* MBNT_REMOVE_MOBILE_MENU_START */}';
const end = '{/* MBNT_REMOVE_MOBILE_MENU_END */}';
let s = code.indexOf(start);
let e = code.indexOf(end);
if (s !== -1 && e !== -1 && e > s) {
  e += end.length;
  code = code.slice(0, s) + code.slice(e);
}

// Essayer aussi de supprimer physiquement les éléments qui contiennent les libellés.
const labels = ['Séjours', 'Sejours', 'Expériences', 'Experiences', 'Devenir hôte', 'Devenir hote', 'À propos', 'A propos'];
function hasMenuLabels(txt) {
  let count = 0;
  for (const l of labels) if (txt.includes(l)) count++;
  return count >= 2;
}

// Supprime nav contenant au moins deux libellés.
code = code.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g, (m) => hasMenuLabels(m) ? '' : m);

// Supprime un bloc court div contenant au moins deux libellés.
code = code.replace(/<div\b[^>]*>[\s\S]*?<\/div>/g, (m) => {
  if (m.length < 3500 && hasMenuLabels(m)) return '';
  return m;
});

// Supprime les boutons/liens isolés si le conteneur n'a pas été supprimé.
for (const label of labels) {
  const safe = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  code = code.replace(new RegExp(`<button[^>]*>\\s*${safe}\\s*<\\/button>`, 'g'), '');
  code = code.replace(new RegExp(`<a[^>]*>\\s*${safe}\\s*<\\/a>`, 'g'), '');
}

// Insérer le style juste après le header pour garantir que ça disparaît sur mobile même si un bout reste.
const headerEnd = '</header>';
const idx = code.indexOf(headerEnd);
if (idx === -1) {
  console.error('ERREUR: header introuvable.');
  process.exit(1);
}
code = code.slice(0, idx + headerEnd.length) + styleBlock + code.slice(idx + headerEnd.length);

// Sécurité nom.
code = code.split('Marbnb').join('Mbnb');
code = code.replace('>Mar</span><span', '>M</span><span');

fs.writeFileSync(pagePath + '.bak-remove-menu-force', before, 'utf8');
fs.writeFileSync(pagePath, code, 'utf8');

console.log('OK: menu horizontal mobile supprimé/masqué de façon forcée.');
console.log('Backup créé: app/page.tsx.bak-remove-menu-force');
console.log('Teste en local puis fais git add . / git commit / git push.');
