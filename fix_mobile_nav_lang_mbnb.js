const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pagePath = path.join(root, 'app', 'page.tsx');

if (!fs.existsSync(pagePath)) {
  console.error('ERREUR: app/page.tsx introuvable. Lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

let code = fs.readFileSync(pagePath, 'utf8');
let before = code;

// 1) Correction : le menu horizontal ne doit pas apparaître sur mobile.
// On force les menus contenant Séjours / Expériences / Devenir hôte / À propos à être masqués sur mobile.
code = code.replaceAll(
  'className="flex items-center gap-6 text-sm font-bold"',
  'className="hidden items-center gap-6 text-sm font-bold md:flex"'
);
code = code.replaceAll(
  'className="items-center gap-6 text-sm font-bold md:flex"',
  'className="hidden items-center gap-6 text-sm font-bold md:flex"'
);
code = code.replaceAll(
  'className="flex gap-8 text-sm font-bold"',
  'className="hidden gap-8 text-sm font-bold md:flex"'
);
code = code.replaceAll(
  'className="flex justify-center gap-8 text-sm font-bold"',
  'className="hidden justify-center gap-8 text-sm font-bold md:flex"'
);

// 2) Si le menu est dans une balise nav, on masque sur mobile.
code = code.replaceAll(
  '<nav className="flex',
  '<nav className="hidden md:flex'
);
code = code.replaceAll(
  '<nav className="items-center',
  '<nav className="hidden md:flex items-center'
);

// 3) Ajouter un petit message propre pour éviter de croire que "Welcome" est un bouton de langue.
// Les mots Bienvenue / Welcome / مرحبا sont décoratifs. On rend ça clair sans casser le design.
if (!code.includes('Langues affichées à titre décoratif')) {
  code = code.replace(
    '<span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">Benvenuto</span>',
    '<span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">Benvenuto</span>\n                <span className="w-full text-xs font-medium text-white/70">Langues affichées à titre décoratif — traduction complète bientôt.</span>'
  );
}

// 4) Renommer proprement le site au cas où.
code = code.split('Marbnb').join('Mbnb');
code = code.replace('>Mar</span><span', '>M</span><span');

if (code === before) {
  console.log('Aucune modification automatique détectée. Le menu a peut-être une structure différente.');
} else {
  fs.writeFileSync(pagePath + '.bak-mobile-nav', before, 'utf8');
  fs.writeFileSync(pagePath, code, 'utf8');
  console.log('OK: menu desktop masqué sur mobile + note langues décoratives ajoutée.');
  console.log('Backup créé: app/page.tsx.bak-mobile-nav');
}
