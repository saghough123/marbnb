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

// Retirer ancien style si déjà présent
const start = '{/* FORCE_REMOVE_MOBILE_NAV_START */}';
const end = '{/* FORCE_REMOVE_MOBILE_NAV_END */}';
let s = code.indexOf(start);
let e = code.indexOf(end);
if (s !== -1 && e !== -1 && e > s) {
  e += end.length;
  code = code.slice(0, s) + code.slice(e);
}

// Style global placé DANS le header pour ne pas devenir l'élément voisin du header.
// - Cache le 2e élément du header sur mobile : c'est le menu "Séjours / Mettre mon logement".
// - Cache l'élément juste après le header sur mobile : c'est la barre "Séjours / Expériences / Devenir hôte / À propos".
const styleBlock = `
          {/* FORCE_REMOVE_MOBILE_NAV_START */}
          <style jsx global>{` + '`' + `
            @media (max-width: 767px) {
              header > div > :nth-child(2) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                width: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
              }

              header + nav,
              header + div,
              header + section[class*="border-b"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                height: 0 !important;
                min-height: 0 !important;
                max-height: 0 !important;
                overflow: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
                border: 0 !important;
              }
            }
          ` + '`' + `}</style>
          {/* FORCE_REMOVE_MOBILE_NAV_END */}
`;

const headerClose = '</header>';
const idx = code.indexOf(headerClose);
if (idx === -1) {
  console.error('ERREUR: balise </header> introuvable dans app/page.tsx');
  process.exit(1);
}

code = code.slice(0, idx) + styleBlock + code.slice(idx);

fs.writeFileSync(pagePath + '.bak-force-remove-mobile-nav', before, 'utf8');
fs.writeFileSync(pagePath, code, 'utf8');

console.log('OK: suppression forcée des 2 menus sur mobile appliquée.');
console.log('- Menu haut: Séjours / Mettre mon logement masqué sur mobile');
console.log('- Menu sous-header: Séjours / Expériences / Devenir hôte / À propos masqué sur mobile');
console.log('Backup créé: app/page.tsx.bak-force-remove-mobile-nav');
