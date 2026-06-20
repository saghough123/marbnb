const fs = require('fs');
const path = require('path');

const root = process.cwd();
const cssPath = path.join(root, 'app', 'globals.css');
const pagePath = path.join(root, 'app', 'page.tsx');

if (!fs.existsSync(cssPath)) {
  console.error('ERREUR: app/globals.css introuvable. Lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

// 1) Nettoyer les anciens blocs JSX qui pouvaient gêner.
if (fs.existsSync(pagePath)) {
  let page = fs.readFileSync(pagePath, 'utf8');
  const beforePage = page;
  function removeBetween(text, start, end) {
    let out = text;
    while (true) {
      const s = out.indexOf(start);
      const e = out.indexOf(end);
      if (s === -1 || e === -1 || e <= s) break;
      out = out.slice(0, s) + out.slice(e + end.length);
    }
    return out;
  }
  page = removeBetween(page, '{/* FORCE_REMOVE_MOBILE_NAV_START */}', '{/* FORCE_REMOVE_MOBILE_NAV_END */}');
  page = removeBetween(page, '{/* MBNT_REMOVE_MOBILE_MENU_START */}', '{/* MBNT_REMOVE_MOBILE_MENU_END */}');
  if (page !== beforePage) {
    fs.writeFileSync(pagePath + '.bak-clean-mobile-style', beforePage, 'utf8');
    fs.writeFileSync(pagePath, page, 'utf8');
    console.log('OK: anciens blocs style JSX supprimés de app/page.tsx');
  }
}

// 2) Ajouter une correction CSS globale propre. Cela ne casse pas le build.
let css = fs.readFileSync(cssPath, 'utf8');
const start = '/* MBNT_FORCE_HIDE_MOBILE_NAV_START */';
const end = '/* MBNT_FORCE_HIDE_MOBILE_NAV_END */';
let s = css.indexOf(start);
let e = css.indexOf(end);
if (s !== -1 && e !== -1 && e > s) {
  css = css.slice(0, s) + css.slice(e + end.length);
}

const block = `

/* MBNT_FORCE_HIDE_MOBILE_NAV_START */
@media (max-width: 767px) {
  /* Cache le menu dans le header: Séjours / Mettre mon logement */
  header > div > :nth-child(2) {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    width: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
  }

  /* Cache la barre juste après le header: Séjours / Expériences / Devenir hôte / À propos */
  header + nav,
  header + div[class*="border-b"],
  header + div[class*="sticky"],
  header + div[class*="backdrop"],
  header + div[class*="bg-[#fff8ec]"],
  header + div[class*="bg-white"] {
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
/* MBNT_FORCE_HIDE_MOBILE_NAV_END */
`;

fs.writeFileSync(cssPath, css.trimEnd() + block, 'utf8');
console.log('OK: correction CSS globale ajoutée dans app/globals.css');
console.log('Maintenant lance: npm run build');
