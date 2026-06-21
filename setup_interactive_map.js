const fs = require('fs');
const path = require('path');

const root = process.cwd();
const componentDir = path.join(root, 'components');
const componentPath = path.join(componentDir, 'MbnbMap.tsx');
const detailPath = path.join(root, 'app', 'logement', '[id]', 'page.tsx');

fs.mkdirSync(componentDir, { recursive: true });
if (fs.existsSync(componentPath)) {
  fs.writeFileSync(componentPath + '.bak-map', fs.readFileSync(componentPath, 'utf8'), 'utf8');
}
fs.writeFileSync(componentPath, "\"use client\";\n\ntype MbnbMapProps = {\n  ville?: string | null;\n  quartier?: string | null;\n  titre?: string | null;\n  className?: string;\n};\n\nconst cityCoordinates: Record<string, { lat: number; lng: number; zoomLabel: string }> = {\n  casablanca: { lat: 33.5731, lng: -7.5898, zoomLabel: \"Casablanca\" },\n  marrakech: { lat: 31.6295, lng: -7.9811, zoomLabel: \"Marrakech\" },\n  marrakesh: { lat: 31.6295, lng: -7.9811, zoomLabel: \"Marrakech\" },\n  rabat: { lat: 34.0209, lng: -6.8416, zoomLabel: \"Rabat\" },\n  fes: { lat: 34.0181, lng: -5.0078, zoomLabel: \"Fès\" },\n  fès: { lat: 34.0181, lng: -5.0078, zoomLabel: \"Fès\" },\n  tanger: { lat: 35.7595, lng: -5.8340, zoomLabel: \"Tanger\" },\n  tangier: { lat: 35.7595, lng: -5.8340, zoomLabel: \"Tanger\" },\n  agadir: { lat: 30.4278, lng: -9.5981, zoomLabel: \"Agadir\" },\n  essaouira: { lat: 31.5085, lng: -9.7595, zoomLabel: \"Essaouira\" },\n  meknes: { lat: 33.8935, lng: -5.5473, zoomLabel: \"Meknès\" },\n  meknès: { lat: 33.8935, lng: -5.5473, zoomLabel: \"Meknès\" },\n  ouarzazate: { lat: 30.9335, lng: -6.9370, zoomLabel: \"Ouarzazate\" },\n  tetouan: { lat: 35.5785, lng: -5.3684, zoomLabel: \"Tétouan\" },\n  tétouan: { lat: 35.5785, lng: -5.3684, zoomLabel: \"Tétouan\" },\n};\n\nfunction normalize(value?: string | null) {\n  return (value || \"\")\n    .toLowerCase()\n    .normalize(\"NFD\")\n    .replace(/[\\u0300-\\u036f]/g, \"\")\n    .trim();\n}\n\nfunction getCoordinates(ville?: string | null) {\n  const key = normalize(ville);\n  return cityCoordinates[key] || cityCoordinates.casablanca;\n}\n\nexport default function MbnbMap({ ville, quartier, titre, className = \"\" }: MbnbMapProps) {\n  const coord = getCoordinates(ville);\n  const delta = 0.035;\n  const bbox = [\n    coord.lng - delta,\n    coord.lat - delta,\n    coord.lng + delta,\n    coord.lat + delta,\n  ].join(\"%2C\");\n\n  const marker = `${coord.lat}%2C${coord.lng}`;\n  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;\n  const openUrl = `https://www.openstreetmap.org/?mlat=${coord.lat}&mlon=${coord.lng}#map=14/${coord.lat}/${coord.lng}`;\n\n  return (\n    <section className={`rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm ring-1 ring-[#e5d3b3] ${className}`}>\n      <div className=\"flex flex-wrap items-start justify-between gap-3\">\n        <div>\n          <p className=\"font-black text-[#c1121f]\">Localisation</p>\n          <h2 className=\"mt-1 text-2xl font-black\">Autour du logement</h2>\n          <p className=\"mt-2 text-sm text-[#7a6446]\">\n            {quartier ? `${quartier}, ` : \"\"}{ville || coord.zoomLabel}\n          </p>\n        </div>\n        <a\n          href={openUrl}\n          target=\"_blank\"\n          rel=\"noreferrer\"\n          className=\"rounded-full bg-[#0f2f22] px-4 py-2 text-sm font-black text-white\"\n        >\n          Ouvrir la carte\n        </a>\n      </div>\n\n      <div className=\"mt-4 overflow-hidden rounded-[1.5rem] ring-1 ring-[#e5d3b3]\">\n        <iframe\n          title={`Carte ${titre || ville || \"Mbnb\"}`}\n          src={src}\n          className=\"h-[360px] w-full border-0\"\n          loading=\"lazy\"\n        />\n      </div>\n\n      <p className=\"mt-3 text-xs text-[#7a6446]\">\n        La position est approximative et permet de visualiser le secteur du logement.\n      </p>\n    </section>\n  );\n}\n", 'utf8');
console.log('OK: composant carte créé: components/MbnbMap.tsx');

if (!fs.existsSync(detailPath)) {
  console.log('INFO: app/logement/[id]/page.tsx introuvable. Le composant carte est prêt, mais pas encore injecté.');
  process.exit(0);
}

let page = fs.readFileSync(detailPath, 'utf8');
const before = page;

if (!page.includes('@/components/MbnbMap')) {
  page = page.replace(
    'import { supabase } from "@/lib/supabaseClient";',
    'import { supabase } from "@/lib/supabaseClient";\nimport MbnbMap from "@/components/MbnbMap";'
  );
}

if (!page.includes('<MbnbMap')) {
  const mapBlock = `

            <MbnbMap ville={ville} quartier={quartier} titre={titre} className="mt-6" />`;

  // Injection avant la fin de la colonne détail, juste avant aside.
  page = page.replace(
    '          </div>\n\n          <aside className="h-fit rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm ring-1 ring-[#e5d3b3]">',
    mapBlock + '\n          </div>\n\n          <aside className="h-fit rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm ring-1 ring-[#e5d3b3]">'
  );
}

if (page !== before) {
  fs.writeFileSync(detailPath + '.bak-map', before, 'utf8');
  fs.writeFileSync(detailPath, page, 'utf8');
  console.log('OK: carte interactive ajoutée dans /logement/[id].');
} else {
  console.log('INFO: la carte semblait déjà ajoutée ou structure différente.');
}

console.log('\nTerminé ✅');
console.log('Lance maintenant: npm run build');
console.log('Puis teste: /resultats -> Voir détails -> carte dans /logement/[id]');
