const fs = require('fs');
const path = require('path');

const appDir = path.join(process.cwd(), 'app');
const homePath = path.join(appDir, 'page.tsx');
const resultsDir = path.join(appDir, 'resultats');
const resultsPath = path.join(resultsDir, 'page.tsx');

if (!fs.existsSync(appDir)) {
  console.error('ERREUR: Lance ce fichier depuis C:\Users\SAGHOUGH\marbnb');
  process.exit(1);
}
if (!fs.existsSync(homePath)) {
  console.error('ERREUR: app/page.tsx introuvable');
  process.exit(1);
}

let home = fs.readFileSync(homePath, 'utf8');

const corrections = {
  'SÃ©jours': 'Séjours',
  'SÃ©jour': 'Séjour',
  'sÃ©jours': 'séjours',
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
  'ðŸŒµ': '🌵',
  'âœ“': '✓',
  'â†’': '→',
  'â‚¬': '€'
};
for (const bad of Object.keys(corrections)) {
  home = home.split(bad).join(corrections[bad]);
}

home = home.split('Marbnb').join('Mbnb');
home = home.replace('>Mar</span><span', '>M</span><span');

const redirect = " onClick={() => { window.location.href = '/resultats?destination=' + encodeURIComponent(destination) + '&arrivee=' + encodeURIComponent(arrivee) + '&depart=' + encodeURIComponent(depart) + '&voyageurs=' + voyageurs; }}";
let changed = false;
home = home.replace(/<button([^>]*?)>Rechercher<\/button>/, function(match, attrs) {
  changed = true;
  if (attrs.includes('onClick=')) return match;
  return '<button' + attrs + redirect + '>Rechercher</button>';
});

if (!changed) console.warn('ATTENTION: bouton Rechercher non trouvé. La page /resultats est quand même créée.');

fs.writeFileSync(homePath, home, 'utf8');
fs.mkdirSync(resultsDir, { recursive: true });
fs.writeFileSync(resultsPath, "\n\"use client\";\n\nimport { Suspense, useMemo, useState } from \"react\";\nimport { useSearchParams } from \"next/navigation\";\n\ntype Devise = \"MAD\" | \"EUR\" | \"USD\" | \"GBP\" | \"CAD\" | \"AED\";\ntype Paiement = \"espece\" | \"ligne\";\n\ntype Logement = {\n  id: number;\n  titre: string;\n  ville: string;\n  quartier: string;\n  prix: number;\n  note: number;\n  type: string;\n  voyageurs: number;\n  chambres: number;\n  image: string;\n  description: string;\n};\n\nconst tauxDevise: Record<Devise, number> = { MAD: 1, EUR: 0.092, USD: 0.1, GBP: 0.078, CAD: 0.137, AED: 0.367 };\nconst symbole: Record<Devise, string> = { MAD: \"MAD\", EUR: \"€\", USD: \"$\", GBP: \"£\", CAD: \"C$\", AED: \"AED\" };\n\nconst logements: Logement[] = [\n  { id: 1, titre: \"Appartement moderne Maarif\", ville: \"Casablanca\", quartier: \"Maarif\", prix: 650, note: 4.8, type: \"Appartement\", voyageurs: 4, chambres: 2, image: \"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80\", description: \"Appartement moderne au cœur du Maarif, proche des commerces.\" },\n  { id: 2, titre: \"Studio proche Corniche\", ville: \"Casablanca\", quartier: \"Ain Diab\", prix: 520, note: 4.6, type: \"Studio\", voyageurs: 2, chambres: 1, image: \"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop&q=80\", description: \"Studio cosy proche de la Corniche.\" },\n  { id: 3, titre: \"Villa familiale avec piscine\", ville: \"Marrakech\", quartier: \"Palmeraie\", prix: 1800, note: 4.9, type: \"Villa\", voyageurs: 8, chambres: 4, image: \"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&auto=format&fit=crop&q=80\", description: \"Villa familiale avec piscine privée.\" },\n  { id: 4, titre: \"Riad traditionnel au centre\", ville: \"Fès\", quartier: \"Médina\", prix: 780, note: 4.7, type: \"Riad\", voyageurs: 5, chambres: 3, image: \"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&auto=format&fit=crop&q=80\", description: \"Riad traditionnel dans la médina.\" }\n];\n\nfunction nuitsEntre(a: string, d: string) {\n  const diff = Math.round((new Date(d).getTime() - new Date(a).getTime()) / 86400000);\n  return diff > 0 ? diff : 0;\n}\n\nfunction prix(mad: number, devise: Devise) {\n  const v = Math.round(mad * tauxDevise[devise]);\n  return devise === \"MAD\" ? `${v} MAD` : `${symbole[devise]} ${v}`;\n}\n\nfunction ResultatsContent() {\n  const params = useSearchParams();\n  const destinationInitiale = params.get(\"destination\") || \"\";\n  const arriveeInitiale = params.get(\"arrivee\") || \"2026-06-18\";\n  const departInitial = params.get(\"depart\") || \"2026-06-22\";\n  const voyageursInitial = Number(params.get(\"voyageurs\") || 1);\n\n  const [destination, setDestination] = useState(destinationInitiale);\n  const [arrivee, setArrivee] = useState(arriveeInitiale);\n  const [depart, setDepart] = useState(departInitial);\n  const [voyageurs, setVoyageurs] = useState(Math.max(1, voyageursInitial));\n  const [paiement, setPaiement] = useState<Paiement>(\"ligne\");\n  const [devise, setDevise] = useState<Devise>(\"MAD\");\n  const [message, setMessage] = useState(\"\");\n\n  const nuits = nuitsEntre(arrivee, depart);\n  const resultats = useMemo(() => logements.filter((l) => (`${l.ville} ${l.quartier} ${l.titre}`).toLowerCase().includes(destination.toLowerCase()) && l.voyageurs >= voyageurs), [destination, voyageurs]);\n\n  return (\n    <div className=\"min-h-screen bg-[#f4ead7] text-[#1e1b18]\">\n      <header className=\"border-b border-[#e5d3b3] bg-[#fff8ec]\">\n        <div className=\"mx-auto flex max-w-7xl items-center justify-between px-4 py-4\">\n          <a href=\"/\" className=\"text-3xl font-black\"><span className=\"text-[#c1121f]\">M</span>bnb</a>\n          <a href=\"/\" className=\"rounded-full bg-[#0f2f22] px-5 py-2 text-sm font-black text-white\">Accueil</a>\n        </div>\n      </header>\n\n      <main className=\"mx-auto max-w-7xl px-4 py-8\">\n        <section className=\"rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm ring-1 ring-[#e5d3b3]\">\n          <p className=\"font-black text-[#c1121f]\">Résultats de recherche</p>\n          <h1 className=\"mt-2 text-4xl font-black\">Votre séjour au Maroc</h1>\n          <div className=\"mt-6 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]\">\n            <div><label className=\"text-xs font-black text-[#7a3d14]\">Destination</label><input value={destination} onChange={(e) => setDestination(e.target.value)} className=\"mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none\" /></div>\n            <div><label className=\"text-xs font-black text-[#7a3d14]\">Arrivée</label><input type=\"date\" value={arrivee} onChange={(e) => setArrivee(e.target.value)} className=\"mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none\" /></div>\n            <div><label className=\"text-xs font-black text-[#7a3d14]\">Départ</label><input type=\"date\" value={depart} onChange={(e) => setDepart(e.target.value)} className=\"mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none\" /></div>\n            <div><label className=\"text-xs font-black text-[#7a3d14]\">Voyageurs</label><input type=\"number\" min={1} value={voyageurs} onChange={(e) => setVoyageurs(Math.max(1, Number(e.target.value) || 1))} className=\"mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none\" /></div>\n            <button onClick={() => setMessage(\"\")} className=\"rounded-2xl bg-[#c1121f] px-6 py-3 font-black text-white md:self-end\">Actualiser</button>\n          </div>\n        </section>\n\n        <section className=\"mt-8 grid gap-6 lg:grid-cols-[1fr_360px]\">\n          <div className=\"grid gap-6 md:grid-cols-2\">\n            {resultats.map((l) => {\n              const prixSejour = l.prix * nuits;\n              const frais = paiement === \"espece\" ? Math.round(prixSejour * 0.05) : 0;\n              const total = prixSejour + frais;\n              return (\n                <div key={l.id} className=\"overflow-hidden rounded-[2rem] bg-[#fff8ec] shadow-sm ring-1 ring-[#e5d3b3]\">\n                  <img src={l.image} alt={l.titre} className=\"h-60 w-full object-cover\" />\n                  <div className=\"p-5\">\n                    <div className=\"flex justify-between gap-3\"><h2 className=\"font-black\">{l.titre}</h2><span className=\"font-bold\">⭐ {l.note}</span></div>\n                    <p className=\"mt-1 text-sm text-[#7a6446]\">{l.quartier}, {l.ville}</p>\n                    <p className=\"mt-3 text-sm text-[#7a6446]\">{l.chambres} chambre(s) · max {l.voyageurs} voyageurs</p>\n                    <p className=\"mt-3\"><span className=\"text-lg font-black\">{l.prix} MAD</span> / nuit</p>\n                    <div className=\"mt-4 rounded-2xl bg-white p-4 text-sm\">\n                      <div className=\"flex justify-between\"><span>{l.prix} MAD x {nuits} nuit(s)</span><span>{prixSejour} MAD</span></div>\n                      <div className=\"mt-2 flex justify-between\"><span>{paiement === \"espece\" ? \"Frais service 5%\" : \"Frais paiement en ligne\"}</span><span>{paiement === \"ligne\" ? \"0 MAD\" : `${frais} MAD`}</span></div>\n                      <div className=\"mt-3 flex justify-between border-t pt-3 text-base font-black\"><span>Total</span><span>{prix(total, paiement === \"ligne\" ? devise : \"MAD\")}</span></div>\n                    </div>\n                    <button onClick={() => setMessage(`Réservation simulée pour ${l.titre}. Total : ${prix(total, paiement === \"ligne\" ? devise : \"MAD\")}`)} className=\"mt-4 w-full rounded-2xl bg-green-700 py-3 font-black text-white\">Réserver</button>\n                  </div>\n                </div>\n              );\n            })}\n            {resultats.length === 0 && <div className=\"rounded-[2rem] bg-[#fff8ec] p-8 text-center ring-1 ring-[#e5d3b3] md:col-span-2\"><p className=\"text-xl font-black\">Aucun logement trouvé</p><p className=\"mt-2 text-[#7a6446]\">Essaie une autre ville ou réduis le nombre de voyageurs.</p></div>}\n          </div>\n\n          <aside className=\"h-fit rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm ring-1 ring-[#e5d3b3]\">\n            <h3 className=\"text-xl font-black\">Paiement</h3>\n            <button onClick={() => setPaiement(\"espece\")} className={`mt-4 w-full rounded-2xl border p-4 text-left ${paiement === \"espece\" ? \"border-[#0f2f22] bg-green-50\" : \"bg-white\"}`}><b>💵 Espèces sur place</b><p className=\"text-sm text-[#7a6446]\">Frais de service 5%.</p></button>\n            <button onClick={() => setPaiement(\"ligne\")} className={`mt-3 w-full rounded-2xl border p-4 text-left ${paiement === \"ligne\" ? \"border-[#0f2f22] bg-green-50\" : \"bg-white\"}`}><b>💳 Paiement en ligne</b><p className=\"text-sm text-[#7a6446]\">Sans frais supplémentaires.</p></button>\n            {paiement === \"ligne\" && <select value={devise} onChange={(e) => setDevise(e.target.value as Devise)} className=\"mt-3 w-full rounded-2xl border bg-white px-4 py-3\"><option value=\"MAD\">MAD</option><option value=\"EUR\">EUR</option><option value=\"USD\">USD</option><option value=\"GBP\">GBP</option><option value=\"CAD\">CAD</option><option value=\"AED\">AED</option></select>}\n            {message && <p className=\"mt-4 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700\">{message}</p>}\n          </aside>\n        </section>\n      </main>\n    </div>\n  );\n}\n\nexport default function ResultatsPage() {\n  return <Suspense fallback={<div className=\"p-8\">Chargement...</div>}><ResultatsContent /></Suspense>;\n}\n", 'utf8');

console.log('OK: site multipage activé.');
console.log('Page créée: app/resultats/page.tsx');
console.log('Accueil corrigé: app/page.tsx');
