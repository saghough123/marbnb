const fs = require('fs');
const path = require('path');

const root = process.cwd();
function backup(file, suffix) {
  if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
}

function ensureAddDaysISO(code) {
  if (code.includes('function addDaysISO(')) return code;

  const helper = `
function addDaysISO(dateISO: string, days: number) {
  const base = dateISO && dateISO.trim() ? dateISO : todayISO();
  const d = new Date(base);
  if (Number.isNaN(d.getTime())) return todayISO();
  d.setDate(d.getDate() + days);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
`;

  // Cas idéal : todayISO existe, on ajoute addDaysISO juste avant.
  if (code.includes('function todayISO()')) {
    return code.replace('function todayISO()', helper + '\nfunction todayISO()');
  }

  // Si todayISO n'existe pas ou a été déplacée, on ajoute les deux helpers après les imports.
  const helperWithToday = `
function todayISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function addDaysISO(dateISO: string, days: number) {
  const base = dateISO && dateISO.trim() ? dateISO : todayISO();
  const d = new Date(base);
  if (Number.isNaN(d.getTime())) return todayISO();
  d.setDate(d.getDate() + days);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
`;

  const lastImportMatch = [...code.matchAll(/^import .*;$/gm)].pop();
  if (lastImportMatch) {
    const insertAt = lastImportMatch.index + lastImportMatch[0].length;
    return code.slice(0, insertAt) + '\n' + helperWithToday + code.slice(insertAt);
  }

  return helperWithToday + '\n' + code;
}

function fixPage(file) {
  if (!fs.existsSync(file)) return;
  backup(file, '.bak-fix-adddaysiso');
  let code = fs.readFileSync(file, 'utf8');
  const before = code;
  code = ensureAddDaysISO(code);

  // Corriger les dates de départ encore initialisées au même jour.
  code = code.replaceAll(
    'const [depart, setDepart] = useState(todayISO());',
    'const [depart, setDepart] = useState(addDaysISO(todayISO(), 1));'
  );
  code = code.replaceAll(
    'const [depart, setDepart] = useState(search.get("depart") || todayISO());',
    'const [depart, setDepart] = useState(search.get("depart") || addDaysISO(search.get("arrivee") || todayISO(), 1));'
  );

  // Si l'effet J+1 utilise addDaysISO mais le state depart n'existe pas avant, on ne touche pas.
  if (code !== before) {
    fs.writeFileSync(file, code, 'utf8');
    console.log('OK: addDaysISO/date J+1 corrigé dans', path.relative(root, file));
  } else {
    console.log('INFO: aucun changement nécessaire dans', path.relative(root, file));
  }
}

fixPage(path.join(root, 'app', 'resultats', 'page.tsx'));
fixPage(path.join(root, 'app', 'logement', '[id]', 'page.tsx'));

// Nettoyage CSS warnings Turbo : retirer le bloc polish qui utilise classes Tailwind échappées si encore problématique.
const cssPath = path.join(root, 'app', 'globals.css');
if (fs.existsSync(cssPath)) {
  backup(cssPath, '.bak-fix-adddaysiso-css');
  let css = fs.readFileSync(cssPath, 'utf8');
  const beforeCss = css;

  // Remplacements robustes des sélecteurs problématiques restants.
  css = css
    .replace(/\.rounded-\\\[2rem\\\]/g, '[class~="rounded-[2rem]"]')
    .replace(/\.bg-\\\[\\\#fff8ec\\\]/g, '[class~="bg-[#fff8ec]"]')
    .replace(/\.ring-\\\[\\\#e5d3b3\\\]/g, '[class~="ring-[#e5d3b3]"]')
    .replace(/\.border-\\\[\\\#e5d3b3\\\]/g, '[class~="border-[#e5d3b3]"]')
    .replace(/\.rounded-\[2rem\]/g, '[class~="rounded-[2rem]"]')
    .replace(/\.bg-\[\#fff8ec\]/g, '[class~="bg-[#fff8ec]"]')
    .replace(/\.ring-\[\#e5d3b3\]/g, '[class~="ring-[#e5d3b3]"]')
    .replace(/\.border-\[\#e5d3b3\]/g, '[class~="border-[#e5d3b3]"]');

  if (css !== beforeCss) {
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('OK: warnings CSS Tailwind nettoyés dans app/globals.css');
  }
}

console.log('\nTerminé ✅ Relance maintenant: npm run build');
