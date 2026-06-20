const fs = require('fs');
const path = require('path');

const appDir = path.join(process.cwd(), 'app');
const homePath = path.join(appDir, 'page.tsx');

if (!fs.existsSync(appDir) || !fs.existsSync(homePath)) {
  console.error('ERREUR: lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

let code = fs.readFileSync(homePath, 'utf8');

// 1) Nettoyage des anciens caractères cassés les plus fréquents.
const corrections = {
  'SÃ©jours': 'Séjours',
  'sÃ©jours': 'séjours',
  'SÃ©jour': 'Séjour',
  'rÃ©servez': 'réservez',
  'rÃ©server': 'réserver',
  'rÃ©servation': 'réservation',
  'RÃ©servation': 'Réservation',
  'disponibilitÃ©': 'disponibilité',
  'identitÃ©': 'identité',
  'ArrivÃ©e': 'Arrivée',
  'arrivÃ©e': 'arrivée',
  'DÃ©part': 'Départ',
  'dÃ©part': 'départ',
  'Ã©': 'é',
  'Ã¨': 'è',
  'Ãª': 'ê',
  'Ã ': 'à',
  'Ã¢': 'â',
  'Ã´': 'ô',
  'Ã§': 'ç',
  'ï»¿': '',
  'ðŸ‡²ðŸ‡¦': '🇲🇦',
  'ðŸ¡': '🏡',
  'ðŸ¢': '🏢',
  'ðŸŒŠ': '🌊',
  'ðŸŠ': '🏊',
  'âœ“': '✓',
  'â†’': '→',
  'â‚¬': '€'
};
for (const bad of Object.keys(corrections)) {
  code = code.split(bad).join(corrections[bad]);
}

// 2) Nom du site : Mbnb partout.
code = code.split('Marbnb').join('Mbnb');
code = code.replace('>Mar</span><span', '>M</span><span');
code = code.replace('>Mar</span><span className="text-[#10271d]">bnb</span>', '>M</span><span className="text-[#10271d]">bnb</span>');

// 3) Supprime une ancienne section CTA si le script a déjà été lancé.
code = code.replace(/\n\s*\{\/\* MBNT_CTA_START \*\/\}[\s\S]*?\{\/\* MBNT_CTA_END \*\/\}\n?/g, '\n');

// 4) Bloc appel à l'action premium : porte marocaine + bienvenue en plusieurs langues.
const cta = `
      {/* MBNT_CTA_START */}
      {page === "accueil" && (
        <section className="relative overflow-hidden border-b border-[#e5d3b3] bg-[#0f2f22]">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#f7d08a 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f4ead7] to-transparent" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-[0.9fr_1.1fr] md:py-16">
            <div className="mx-auto w-full max-w-sm">
              <div className="relative mx-auto aspect-[3/4] overflow-hidden rounded-t-full border-[10px] border-[#c59b54] bg-[#7a231f] shadow-2xl">
                <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(45deg, #f7d08a 25%, transparent 25%), linear-gradient(-45deg, #f7d08a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f7d08a 75%), linear-gradient(-45deg, transparent 75%, #f7d08a 75%)", backgroundSize: "34px 34px", backgroundPosition: "0 0, 0 17px, 17px -17px, -17px 0px" }} />
                <div className="absolute inset-5 rounded-t-full border-2 border-[#f7d08a]/70" />
                <div className="absolute left-1/2 top-10 h-20 w-20 -translate-x-1/2 rounded-full border-4 border-[#f7d08a]/80 bg-[#0f2f22]/70" />
                <div className="absolute bottom-0 left-1/2 h-32 w-1 -translate-x-1/2 bg-[#f7d08a]/70" />
                <div className="absolute bottom-20 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full bg-[#f7d08a] text-xl shadow-lg">✦</div>
                <div className="absolute inset-x-0 bottom-8 px-7 text-center text-[#fff8ec]">
                  <p className="text-sm font-black tracking-[0.35em]">MOROCCO</p>
                  <p className="mt-2 text-3xl font-black">Mbnb</p>
                </div>
              </div>
            </div>
            <div className="text-center md:text-left">
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-[#f7d08a] backdrop-blur">🇲🇦 Mbnb · Séjours authentiques au Maroc</p>
              <h2 className="mt-6 text-5xl font-black leading-tight text-white md:text-7xl">Bienvenue chez vous, partout au Maroc.</h2>
              <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm font-bold text-white/90 md:justify-start">
                <span className="rounded-full bg-white/10 px-3 py-1">Bienvenue</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Welcome</span>
                <span className="rounded-full bg-white/10 px-3 py-1">مرحبا</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Bienvenido</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Willkommen</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Benvenuto</span>
              </div>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">Une expérience inspirée des portes marocaines traditionnelles : chaleur, confiance, hospitalité et réservation simple en quelques clics.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                <button onClick={() => { window.location.href = '/resultats?destination=' + encodeURIComponent(destination) + '&arrivee=' + encodeURIComponent(arrivee) + '&depart=' + encodeURIComponent(depart) + '&voyageurs=' + voyageurs; }} className="rounded-full bg-[#c1121f] px-8 py-4 font-black text-white shadow-xl hover:bg-[#a50f1a]">Commencer la recherche</button>
                <button onClick={() => setFormulaireOuvert(true)} className="rounded-full border border-white/30 bg-white/10 px-8 py-4 font-black text-white backdrop-blur hover:bg-white/20">Devenir hôte</button>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* MBNT_CTA_END */}
`;

// 5) Insérer la CTA juste après le header.
const headerEnd = '</header>';
const index = code.indexOf(headerEnd);
if (index === -1) {
  console.error('ERREUR: header introuvable dans app/page.tsx');
  process.exit(1);
}
code = code.slice(0, index + headerEnd.length) + cta + code.slice(index + headerEnd.length);

fs.writeFileSync(homePath, code, 'utf8');
console.log('OK: design amélioré avec porte marocaine + CTA multilingue.');
console.log('Fichier modifié: app/page.tsx');
