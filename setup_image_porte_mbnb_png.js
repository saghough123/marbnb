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
  console.warn('Mets ton image dans C:\\Users\\SAGHOUGH\\marbnb\\public et nomme-la porte-marocaine.png');
}

let code = fs.readFileSync(homePath, 'utf8');

const start = '{/* MBNT_CTA_START */}';
const end = '{/* MBNT_CTA_END */}';
let s = code.indexOf(start);
let e = code.indexOf(end);
if (s !== -1 && e !== -1 && e > s) {
  e = e + end.length;
  code = code.slice(0, s) + code.slice(e);
}

code = code.split('Marbnb').join('Mbnb');
code = code.replace('>Mar</span><span', '>M</span><span');

const cta = "\n      {/* MBNT_CTA_START */}\n      {page === \"accueil\" && (\n        <section className=\"relative overflow-hidden border-b border-[#e5d3b3] bg-[#f4ead7]\">\n          <div className=\"absolute inset-0 opacity-[0.08]\" style={{ backgroundImage: \"radial-gradient(#9b1c1c 1px, transparent 1px)\", backgroundSize: \"22px 22px\" }} />\n          <div className=\"relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-[0.9fr_1.1fr] md:py-16\">\n            <div className=\"rounded-[2rem] border border-[#e5d3b3] bg-[#fff8ec]/95 p-6 shadow-xl md:p-8\">\n              <p className=\"inline-flex rounded-full border border-[#c59b54]/40 bg-[#fff8ec] px-4 py-2 text-sm font-black text-[#7a3d14] shadow-sm\">🇲🇦 Mbnb · Séjours authentiques au Maroc</p>\n              <h2 className=\"mt-6 text-4xl font-black leading-tight text-[#10271d] md:text-6xl\">Bienvenue au Maroc.</h2>\n              <p className=\"mt-5 max-w-xl text-lg leading-8 text-[#5f4b32]\">Trouvez un riad, appartement, villa ou studio avec une expérience inspirée des portes marocaines traditionnelles.</p>\n              <div className=\"mt-5 flex flex-wrap gap-2 text-sm font-bold text-[#10271d]\">\n                <span className=\"rounded-full bg-[#f4ead7] px-3 py-1\">Bienvenue</span>\n                <span className=\"rounded-full bg-[#f4ead7] px-3 py-1\">Welcome</span>\n                <span className=\"rounded-full bg-[#f4ead7] px-3 py-1\">مرحبا</span>\n                <span className=\"rounded-full bg-[#f4ead7] px-3 py-1\">Bienvenido</span>\n                <span className=\"rounded-full bg-[#f4ead7] px-3 py-1\">Willkommen</span>\n                <span className=\"rounded-full bg-[#f4ead7] px-3 py-1\">Benvenuto</span>\n              </div>\n              <div className=\"mt-8 flex flex-col gap-3 sm:flex-row\">\n                <button onClick={() => { window.location.href = '/resultats?destination=' + encodeURIComponent(destination) + '&arrivee=' + encodeURIComponent(arrivee) + '&depart=' + encodeURIComponent(depart) + '&voyageurs=' + voyageurs; }} className=\"rounded-full bg-[#c1121f] px-8 py-4 font-black text-white shadow-xl hover:bg-[#a50f1a]\">Trouver un séjour</button>\n                <button onClick={() => setFormulaireOuvert(true)} className=\"rounded-full border border-[#0f2f22]/20 bg-white px-8 py-4 font-black text-[#0f2f22] hover:bg-[#f4ead7]\">Publier un logement</button>\n              </div>\n            </div>\n\n            <div className=\"relative overflow-hidden rounded-[2rem] border-[8px] border-[#0f2f22] bg-[#fff8ec] shadow-2xl\">\n              <img src=\"/porte-marocaine.png\" alt=\"Porte traditionnelle marocaine\" className=\"h-[420px] w-full object-cover md:h-[560px]\" />\n              <div className=\"pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20\" />\n            </div>\n          </div>\n        </section>\n      )}\n      {/* MBNT_CTA_END */}\n";
const headerEnd = '</header>';
const idx = code.indexOf(headerEnd);
if (idx === -1) {
  console.error('ERREUR: header introuvable dans app/page.tsx');
  process.exit(1);
}

code = code.slice(0, idx + headerEnd.length) + cta + code.slice(idx + headerEnd.length);
fs.writeFileSync(homePath, code, 'utf8');
console.log('OK: section avec image PNG porte marocaine installée.');
console.log('Image utilisée: public/porte-marocaine.png');
