const fs = require('fs');
const path = require('path');
const root = process.cwd();
function backup(file, suffix){ if(fs.existsSync(file)) fs.writeFileSync(file+suffix, fs.readFileSync(file,'utf8'),'utf8'); }

// 1) Header global: ajouter Accueil juste avant Explorer
const headerPaths = [path.join(root,'components','MarbnbHeader.tsx'), path.join(root,'components','MbnbHeader.tsx')];
for (const headerPath of headerPaths) {
  if (!fs.existsSync(headerPath)) continue;
  backup(headerPath,'.bak-accueil-menu');
  let h = fs.readFileSync(headerPath,'utf8');
  const before = h;
  if (!h.includes('href="/" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Accueil</a>')) {
    h = h.replace(
      '<a href="/resultats" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Explorer</a>',
      '<a href="/" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Accueil</a>\n          <a href="/resultats" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Explorer</a>'
    );
  }
  if (h !== before) { fs.writeFileSync(headerPath,h,'utf8'); console.log('OK: Accueil ajouté au menu:', path.relative(root,headerPath)); }
}

// 2) Supprimer les anciens sous-headers/lignes locales sur plusieurs pages publiques
const pages = [
  path.join(root,'app','page.tsx'),
  path.join(root,'app','resultats','page.tsx'),
  path.join(root,'app','favoris','page.tsx'),
  path.join(root,'app','hote','page.tsx'),
  path.join(root,'app','compte','page.tsx'),
  path.join(root,'app','installation','page.tsx'),
  path.join(root,'app','reservation-confirmation','page.tsx'),
];

for (const p of pages) {
  if (!fs.existsSync(p)) continue;
  backup(p,'.bak-remove-local-brand-line');
  let code = fs.readFileSync(p,'utf8');
  const before = code;

  // Supprimer les headers/nav locaux en trop sous le header global.
  code = code.replace(/<header[\s\S]*?<\/header>/g, '');
  code = code.replace(/<nav[\s\S]*?<\/nav>/g, '');

  // Supprimer les blocs logo locaux fréquents: liens vers / avec Marbnb/Mbnb et petit sous-texte.
  code = code.replace(/<a href="\/" className="text-3xl font-black">[\s\S]*?<\/a>/g, '');
  code = code.replace(/<a href="\/" className="group flex[\s\S]*?<\/a>/g, '');
  code = code.replace(/<a href="\/" className="flex items-center gap-3">[\s\S]*?<\/a>/g, '');

  // Cas spécifique: ancienne barre contenant juste un logo textuel + bouton Accueil/Admin
  code = code.replace(/<div className="mx-auto flex max-w-7xl items-center justify-between[\s\S]*?<\/div>\s*<\/section>/g, (m) => {
    if (m.includes('Marbnb') || m.includes('Mbnb') || m.includes('Accueil')) return '</section>';
    return m;
  });

  // Supprimer boutons Accueil isolés dans la ligne locale, car Accueil est dans le header global maintenant.
  code = code.replace(/<a[^>]*href="\/"[^>]*>Accueil<\/a>/g, '');

  // Retirer restes de texte isolé Marbnb/Mbnb dans une barre avant hero si présent.
  code = code.replace(/<div[^>]*>\s*<span[^>]*>\s*<span[^>]*>Mar<\/span>bnb\s*<\/span>\s*<\/div>/g, '');
  code = code.replace(/<div[^>]*>\s*<span[^>]*>\s*<span[^>]*>M<\/span>bnb\s*<\/span>\s*<\/div>/g, '');

  // Nettoyer lignes vides excessives
  code = code.replace(/\n{4,}/g,'\n\n');

  if (code !== before) { fs.writeFileSync(p,code,'utf8'); console.log('OK: ligne locale supprimée:', path.relative(root,p)); }
}

// 3) CSS: au cas où une barre locale persiste avec classe spécifique, masquer les sections vides juste après header
const cssPath = path.join(root,'app','globals.css');
if (fs.existsSync(cssPath)) {
  backup(cssPath,'.bak-remove-local-brand-line');
  let css = fs.readFileSync(cssPath,'utf8');
  if (!css.includes('MARBNB_REMOVE_DUPLICATE_LOCAL_HEADER')) {
    css += `

/* MARBNB_REMOVE_DUPLICATE_LOCAL_HEADER */
body > section:empty,
main > section:empty {
  display: none !important;
}
`;
    fs.writeFileSync(cssPath,css,'utf8');
    console.log('OK: CSS nettoyage doublon ajouté.');
  }
}

console.log('\nTerminé ✅ Relance: npm run build');
