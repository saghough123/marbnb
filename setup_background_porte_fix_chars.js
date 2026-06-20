const fs = require('fs');
const path = require('path');

const root = process.cwd();
const homePath = path.join(root, 'app', 'page.tsx');
const imagePath = path.join(root, 'public', 'porte-marocaine.png');

if (!fs.existsSync(homePath)) {
  console.error('ERREUR: lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}
if (!fs.existsSync(imagePath)) {
  console.warn('ATTENTION: image non trouvée : public/porte-marocaine.png');
}

let code = fs.readFileSync(homePath, 'utf8');

const fixes = {"Coup de cÅ“ur": "Coup de cœur", "cÅ“ur": "cœur", "Å“": "œ", "Ã©": "é", "Ã¨": "è", "Ãª": "ê", "Ã ": "à", "Ã¢": "â", "Ã´": "ô", "Ã§": "ç", "Ã»": "û", "Ã®": "î", "SÃ©jours": "Séjours", "sÃ©jours": "séjours", "SÃ©lection": "Sélection", "SÃ©jour": "Séjour", "rÃ©servez": "réservez", "rÃ©server": "réserver", "rÃ©servation": "réservation", "RÃ©servation": "Réservation", "disponibilitÃ©": "disponibilité", "identitÃ©": "identité", "ArrivÃ©e": "Arrivée", "arrivÃ©e": "arrivée", "DÃ©part": "Départ", "dÃ©part": "départ", "chambre(s) Â·": "chambre(s) ·", "Â·": "·", "â†’": "→", "âœ“": "✓", "â‚¬": "€", "ðŸ‡²ðŸ‡¦": "🇲🇦", "ðŸ¡": "🏡", "ðŸ¢": "🏢", "ðŸŒŠ": "🌊", "ðŸŠ": "🏊", "ðŸ¤": "🤍", "ðŸ’µ": "💵", "ðŸ’³": "💳", "â­": "⭐", "ï»¿": ""};
for (const bad of Object.keys(fixes)) {
  code = code.split(bad).join(fixes[bad]);
}

// Supprimer ancienne CTA entre marqueurs, sans regex.
const start = '{/* MBNT_CTA_START */}';
const end = '{/* MBNT_CTA_END */}';
let s = code.indexOf(start);
let e = code.indexOf(end);
if (s !== -1 && e !== -1 && e > s) {
  e = e + end.length;
  code = code.slice(0, s) + code.slice(e);
}

// Mbnb partout.
code = code.split('Marbnb').join('Mbnb');
code = code.replace('>Mar</span><span', '>M</span><span');

const cta = "\n      {/* MBNT_CTA_START */}\n      {page === \"accueil\" && (\n        <section className=\"relative min-h-[720px] overflow-hidden border-b border-[#e5d3b3]\">\n          <div className=\"absolute inset-0\">\n            <img src=\"/porte-marocaine.png\" alt=\"Porte traditionnelle marocaine\" className=\"h-full w-full object-cover\" />\n            <div className=\"absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10\" />\n            <div className=\"absolute inset-0 bg-gradient-to-t from-[#f4ead7] via-transparent to-black/20\" />\n          </div>\n          <div className=\"relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-16\">\n            <div className=\"max-w-2xl rounded-[2rem] border border-white/20 bg-black/35 p-6 text-white shadow-2xl backdrop-blur-sm md:p-8\">\n              <p className=\"inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-black text-white backdrop-blur\">🇲🇦 Mbnb · Séjours authentiques au Maroc</p>\n              <h2 className=\"mt-6 text-5xl font-black leading-tight drop-shadow md:text-7xl\">Bienvenue au Maroc.</h2>\n              <p className=\"mt-5 max-w-xl text-lg leading-8 text-white/90\">Trouvez un riad, appartement, villa ou studio avec une expérience inspirée des portes marocaines traditionnelles.</p>\n              <div className=\"mt-5 flex flex-wrap gap-2 text-sm font-bold text-white\">\n                <span className=\"rounded-full bg-white/15 px-3 py-1 backdrop-blur\">Bienvenue</span>\n                <span className=\"rounded-full bg-white/15 px-3 py-1 backdrop-blur\">Welcome</span>\n                <span className=\"rounded-full bg-white/15 px-3 py-1 backdrop-blur\">مرحبا</span>\n                <span className=\"rounded-full bg-white/15 px-3 py-1 backdrop-blur\">Bienvenido</span>\n                <span className=\"rounded-full bg-white/15 px-3 py-1 backdrop-blur\">Willkommen</span>\n                <span className=\"rounded-full bg-white/15 px-3 py-1 backdrop-blur\">Benvenuto</span>\n              </div>\n              <div className=\"mt-8 flex flex-col gap-3 sm:flex-row\">\n                <button onClick={() => { window.location.href = '/resultats?destination=' + encodeURIComponent(destination) + '&arrivee=' + encodeURIComponent(arrivee) + '&depart=' + encodeURIComponent(depart) + '&voyageurs=' + voyageurs; }} className=\"rounded-full bg-[#c1121f] px-8 py-4 font-black text-white shadow-xl hover:bg-[#a50f1a]\">Trouver un séjour</button>\n                <button onClick={() => setFormulaireOuvert(true)} className=\"rounded-full border border-white/40 bg-white/15 px-8 py-4 font-black text-white backdrop-blur hover:bg-white/25\">Publier un logement</button>\n              </div>\n            </div>\n          </div>\n        </section>\n      )}\n      {/* MBNT_CTA_END */}\n";
const headerEnd = '</header>';
const idx = code.indexOf(headerEnd);
if (idx === -1) {
  console.error('ERREUR: header introuvable dans app/page.tsx');
  process.exit(1);
}
code = code.slice(0, idx + headerEnd.length) + cta + code.slice(idx + headerEnd.length);

fs.writeFileSync(homePath, code, 'utf8');
console.log('OK: image PNG mise en arrière-plan + caractères corrigés.');
console.log('Image utilisée: public/porte-marocaine.png');
