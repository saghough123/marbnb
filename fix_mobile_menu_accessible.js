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

// Objectif : rendre le menu mobile visible, cliquable et au-dessus du hero.
// Le menu concerné contient : Séjours / Expériences / Devenir hôte / À propos.

// 1) Si une ancienne correction a mis hidden sur le menu mobile, on annule pour ce menu.
code = code.replaceAll('hidden md:block sticky top-16 z-20 border-b', 'sticky top-[72px] z-40 border-b');
code = code.replaceAll('hidden md:block border-b border-[#e5d3b3] bg-[#fff8ec]/80', 'sticky top-[72px] z-40 border-b border-[#e5d3b3] bg-[#fff8ec]/95');
code = code.replaceAll('hidden justify-center gap-8 text-sm font-bold md:flex', 'flex justify-start gap-7 overflow-x-auto whitespace-nowrap px-4 text-sm font-bold md:justify-center');
code = code.replaceAll('hidden justify-center gap-6 text-sm font-bold md:flex', 'flex justify-start gap-7 overflow-x-auto whitespace-nowrap px-4 text-sm font-bold md:justify-center');
code = code.replaceAll('hidden items-center gap-8 text-sm font-bold md:flex', 'flex items-center gap-7 overflow-x-auto whitespace-nowrap px-4 text-sm font-bold md:px-0');
code = code.replaceAll('hidden items-center gap-6 text-sm font-bold md:flex', 'flex items-center gap-7 overflow-x-auto whitespace-nowrap px-4 text-sm font-bold md:px-0');

// 2) Renforcer le z-index et l'accessibilité de la barre si elle utilise une classe proche.
code = code.replaceAll('bg-[#fff8ec]/80 backdrop-blur', 'bg-[#fff8ec]/95 backdrop-blur-xl');
code = code.replaceAll('bg-[#fff8ec]/80', 'bg-[#fff8ec]/95');

// 3) Donner des zones cliquables plus grandes aux boutons du menu.
const menuLabels = ['Séjours', 'Expériences', 'Devenir hôte', 'À propos'];
for (const label of menuLabels) {
  // Button sans className
  code = code.replaceAll(`<button>${label}</button>`, `<button className="shrink-0 rounded-full px-4 py-3 hover:bg-[#f4ead7]">${label}</button>`);
  // Button avec className simple pas encore arrondi
  code = code.replaceAll(`>${label}</button>`, `>${label}</button>`);
}

// 4) Si les boutons existent déjà avec une classe, ajouter shrink-0 et padding si absent.
code = code.replace(/<button([^>]*className="(?![^"]*shrink-0)([^"]*)"[^>]*)>(Séjours|Expériences|Devenir hôte|À propos)<\/button>/g,
  (m, attrs, cls, label) => {
    const newAttrs = attrs.replace(`className="${cls}"`, `className="shrink-0 rounded-full px-4 py-3 ${cls}"`);
    return `<button${newAttrs}>${label}</button>`;
  }
);

// 5) Si c'est une nav, forcer son affichage mobile horizontal.
code = code.replace(/<nav className="([^"]*)"([^>]*)>([\s\S]*?Séjours[\s\S]*?À propos[\s\S]*?)<\/nav>/g,
  (m, cls, other, inner) => {
    return `<nav className="sticky top-[72px] z-40 flex w-full items-center gap-7 overflow-x-auto whitespace-nowrap border-b border-[#e5d3b3] bg-[#fff8ec]/95 px-4 text-sm font-bold backdrop-blur-xl md:justify-center"${other}>${inner}</nav>`;
  }
);

// 6) Si c'est un div parent complet, forcer une barre mobile cliquable.
code = code.replace(/<div className="([^"]*)"([^>]*)>([\s\S]*?<button[\s\S]*?>Séjours<\/button>[\s\S]*?<button[\s\S]*?>Expériences<\/button>[\s\S]*?<button[\s\S]*?>Devenir hôte<\/button>[\s\S]*?<button[\s\S]*?>À propos<\/button>[\s\S]*?)<\/div>/g,
  (m, cls, other, inner) => {
    if (m.includes('MBNT_CTA_START')) return m;
    return `<div className="sticky top-[72px] z-40 flex w-full items-center gap-7 overflow-x-auto whitespace-nowrap border-b border-[#e5d3b3] bg-[#fff8ec]/95 px-4 text-sm font-bold backdrop-blur-xl md:justify-center"${other}>${inner}</div>`;
  }
);

// 7) Empêcher le hero de passer au-dessus du menu.
code = code.replaceAll('z-30', 'z-50'); // header au-dessus
code = code.replaceAll('z-40 flex w-full', 'z-40 flex w-full');

if (code !== before) {
  fs.writeFileSync(pagePath + '.bak-mobile-menu-accessible', before, 'utf8');
  fs.writeFileSync(pagePath, code, 'utf8');
  console.log('OK: menu mobile rendu accessible et cliquable.');
  console.log('Backup créé: app/page.tsx.bak-mobile-menu-accessible');
} else {
  console.log('Aucune modification détectée. Le menu a une structure différente.');
  console.log('Dans ce cas, envoie-moi le contenu autour de Séjours / Expériences dans app/page.tsx.');
}
