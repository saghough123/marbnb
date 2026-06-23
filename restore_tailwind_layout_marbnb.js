const fs = require('fs');
const path = require('path');

const root = process.cwd();
function backup(file, suffix) {
  if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
}

// 1) Corriger app/layout.tsx : le site ressemble à du HTML brut quand globals.css/Tailwind n'est plus importé.
const layoutPath = path.join(root, 'app', 'layout.tsx');
if (!fs.existsSync(layoutPath)) {
  console.error('ERREUR: app/layout.tsx introuvable');
  process.exit(1);
}

backup(layoutPath, '.bak-restore-css-layout');
let layout = fs.readFileSync(layoutPath, 'utf8');
let beforeLayout = layout;

// Nettoyer les imports doublons éventuels
layout = layout.replace(/import\s+[A-Za-z0-9_]+\s+from\s+["']@\/components\/MbnbHeader["'];?\s*/g, '');
layout = layout.replace(/import\s+[A-Za-z0-9_]+\s+from\s+["']@\/components\/MarbnbHeader["'];?\s*/g, '');
layout = layout.replace(/import\s+ServiceWorkerRegister\s+from\s+["']@\/components\/ServiceWorkerRegister["'];?\s*/g, '');
layout = layout.replace(/import\s+PwaInstallPrompt\s+from\s+["']@\/components\/PwaInstallPrompt["'];?\s*/g, '');

// S'assurer que globals.css est bien importé UNE FOIS et AVANT les autres imports CSS/typo.
layout = layout.replace(/import\s+["']\.\/globals\.css["'];?\s*/g, '');
layout = `import './globals.css';\nimport MarbnbHeader from "@/components/MarbnbHeader";\nimport ServiceWorkerRegister from "@/components/ServiceWorkerRegister";\nimport PwaInstallPrompt from "@/components/PwaInstallPrompt";\n` + layout.trimStart();

// Metadata propre
layout = layout.replace(/title:\s*["'`][^"'`]*["'`]/, 'title: "Marbnb – Experience Maroc"');
layout = layout.replace(/description:\s*["'`][^"'`]*["'`]/, 'description: "Marbnb – Experience Maroc, séjours authentiques au Maroc"');

// S'assurer que le header/pwa existe une seule fois dans le body.
layout = layout.replace(/<MbnbHeader\s*\/\>\s*/g, '');
layout = layout.replace(/<MarbnbHeader\s*\/\>\s*/g, '');
layout = layout.replace(/<ServiceWorkerRegister\s*\/\>\s*/g, '');
layout = layout.replace(/<PwaInstallPrompt\s*\/\>\s*/g, '');

layout = layout.replace('{children}', '<ServiceWorkerRegister />\n        <MarbnbHeader />\n        {children}\n        <PwaInstallPrompt />');

if (layout !== beforeLayout) {
  fs.writeFileSync(layoutPath, layout, 'utf8');
  console.log('OK: app/layout.tsx corrigé, globals.css réimporté et header remis proprement.');
} else {
  console.log('INFO: layout déjà correct.');
}

// 2) Vérifier app/globals.css : si Tailwind directives absentes, les restaurer.
const cssPath = path.join(root, 'app', 'globals.css');
if (!fs.existsSync(cssPath)) {
  fs.writeFileSync(cssPath, '@import "tailwindcss";\n', 'utf8');
  console.log('OK: app/globals.css recréé avec Tailwind.');
} else {
  backup(cssPath, '.bak-restore-css-layout');
  let css = fs.readFileSync(cssPath, 'utf8');
  const beforeCss = css;

  const hasTailwind4 = css.includes('@import "tailwindcss"') || css.includes("@import 'tailwindcss'");
  const hasTailwind3 = css.includes('@tailwind base') || css.includes('@tailwind components') || css.includes('@tailwind utilities');

  if (!hasTailwind4 && !hasTailwind3) {
    css = '@import "tailwindcss";\n\n' + css;
  }

  // Neutraliser les sélecteurs CSS qui cassent/alertent Turbopack, sans retirer les styles globaux.
  css = css
    .replace(/\.rounded-\\\[2rem\\\]/g, '[class~="rounded-[2rem]"]')
    .replace(/\.rounded-\[2rem\]/g, '[class~="rounded-[2rem]"]')
    .replace(/\.bg-\\\[\\\#fff8ec\\\]/g, '[class~="bg-[#fff8ec]"]')
    .replace(/\.bg-\[\#fff8ec\]/g, '[class~="bg-[#fff8ec]"]')
    .replace(/\.ring-\\\[\\\#e5d3b3\\\]/g, '[class~="ring-[#e5d3b3]"]')
    .replace(/\.ring-\[\#e5d3b3\]/g, '[class~="ring-[#e5d3b3]"]')
    .replace(/\.border-\\\[\\\#e5d3b3\\\]/g, '[class~="border-[#e5d3b3]"]')
    .replace(/\.border-\[\#e5d3b3\]/g, '[class~="border-[#e5d3b3]"]');

  if (css !== beforeCss) {
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('OK: app/globals.css corrigé/restauré.');
  } else {
    console.log('INFO: globals.css déjà correct.');
  }
}

// 3) Supprimer les sous-headers locaux qui peuvent encore apparaître sous header global, sans toucher hero/form.
const pages = [
  path.join(root, 'app', 'page.tsx'),
  path.join(root, 'app', 'resultats', 'page.tsx'),
  path.join(root, 'app', 'favoris', 'page.tsx'),
  path.join(root, 'app', 'hote', 'page.tsx'),
  path.join(root, 'app', 'compte', 'page.tsx'),
  path.join(root, 'app', 'installation', 'page.tsx'),
];

for (const p of pages) {
  if (!fs.existsSync(p)) continue;
  backup(p, '.bak-restore-css-layout');
  let code = fs.readFileSync(p, 'utf8');
  const before = code;

  // Supprime seulement les headers locaux explicites, pas les sections hero.
  code = code.replace(/<header[\s\S]*?<\/header>/g, '');
  code = code.replace(/<nav[\s\S]*?<\/nav>/g, '');

  // Supprime ancien logo texte isolé si exact.
  code = code.replace(/<a href="\/" className="text-3xl font-black">[\s\S]*?<\/a>/g, '');

  if (code !== before) {
    fs.writeFileSync(p, code, 'utf8');
    console.log('OK: header local nettoyé dans ' + path.relative(root, p));
  }
}

console.log('\nTerminé ✅');
console.log('Relance maintenant: npm run build');
console.log('Puis: npx next dev --webpack');
