const fs = require('fs');
const path = require('path');

const root = process.cwd();
function backup(file, suffix) {
  if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
}

// 1) Corriger l'import MarbnbMap -> MbnbMap dans la page détail logement
const detailPath = path.join(root, 'app', 'logement', '[id]', 'page.tsx');
if (fs.existsSync(detailPath)) {
  backup(detailPath, '.bak-fix-marbnbmap-import');
  let code = fs.readFileSync(detailPath, 'utf8');
  const before = code;

  // Le composant existant est components/MbnbMap.tsx, donc on corrige l'import cassé.
  code = code.replaceAll('import MarbnbMap from "@/components/MarbnbMap";', 'import MbnbMap from "@/components/MbnbMap";');
  code = code.replaceAll('import MarbnbMap from "@/components/MbnbMap";', 'import MbnbMap from "@/components/MbnbMap";');
  code = code.replaceAll('<MarbnbMap', '<MbnbMap');
  code = code.replaceAll('</MarbnbMap>', '</MbnbMap>');

  if (code !== before) {
    fs.writeFileSync(detailPath, code, 'utf8');
    console.log('OK: import carte corrigé dans app/logement/[id]/page.tsx');
  } else {
    console.log('INFO: aucun import MarbnbMap cassé trouvé dans la page détail.');
  }
}

// 2) Créer aussi un alias components/MarbnbMap.tsx pour éviter toute future erreur d'import.
const componentsDir = path.join(root, 'components');
const mbnbMapPath = path.join(componentsDir, 'MbnbMap.tsx');
const marbnbMapPath = path.join(componentsDir, 'MarbnbMap.tsx');
if (fs.existsSync(mbnbMapPath)) {
  backup(marbnbMapPath, '.bak-alias-map');
  const alias = `export { default } from "./MbnbMap";\n`;
  fs.writeFileSync(marbnbMapPath, alias, 'utf8');
  console.log('OK: alias components/MarbnbMap.tsx créé.');
} else {
  console.log('ATTENTION: components/MbnbMap.tsx introuvable. Relance setup_interactive_map.js si besoin.');
}

// 3) Corriger les sélecteurs CSS qui déclenchent des warnings Turbopack.
// Ces warnings viennent des classes Tailwind échappées comme .rounded-\[2rem\], .bg-\[\#fff8ec\].
// On remplace ces sélecteurs fragiles par des sélecteurs attributaires compatibles.
const cssPath = path.join(root, 'app', 'globals.css');
if (fs.existsSync(cssPath)) {
  backup(cssPath, '.bak-fix-turbopack-css');
  let css = fs.readFileSync(cssPath, 'utf8');
  const before = css;

  css = css
    .replaceAll('.rounded-\\[2rem\\]', '[class~="rounded-[2rem]"]')
    .replaceAll('.bg-\\[\\#fff8ec\\]', '[class~="bg-[#fff8ec]"]')
    .replaceAll('.ring-\\[\\#e5d3b3\\]', '[class~="ring-[#e5d3b3]"]')
    .replaceAll('.border-\\[\\#e5d3b3\\]', '[class~="border-[#e5d3b3]"]');

  if (css !== before) {
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('OK: sélecteurs CSS compatibles Turbopack corrigés dans globals.css');
  } else {
    console.log('INFO: aucun sélecteur CSS Tailwind fragile trouvé.');
  }
}

console.log('\nTerminé ✅');
console.log('Relance maintenant: npm run build');
