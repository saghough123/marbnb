const fs = require('fs');
const path = require('path');

const root = process.cwd();
const adminPath = path.join(root, 'app', 'admin-demandes', 'page.tsx');
const resultatsPath = path.join(root, 'app', 'resultats', 'page.tsx');

function backup(file, suffix) {
  if (fs.existsSync(file)) {
    fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
  }
}

function ensureParsePhotos(code) {
  if (code.includes('function parsePhotos(')) return code;
  return code.replace(
    'export default function',
    `function parsePhotos(value: string | null | undefined) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
  } catch {
    return value ? [value] : [];
  }
}

export default function`
  );
}

if (!fs.existsSync(adminPath)) {
  console.error('ERREUR: app/admin-demandes/page.tsx introuvable');
  process.exit(1);
}

if (!fs.existsSync(resultatsPath)) {
  console.error('ERREUR: app/resultats/page.tsx introuvable');
  process.exit(1);
}

// 1) Admin: publier toutes les photos vers logements.photos + première photo vers image_url.
backup(adminPath, '.bak-gallery-logements');
let admin = fs.readFileSync(adminPath, 'utf8');
admin = ensureParsePhotos(admin);
admin = admin.replace(
  'image_url: parsePhotos(d.photos)[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80",',
  'image_url: parsePhotos(d.photos)[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80",\n      photos: JSON.stringify(parsePhotos(d.photos)),'
);
admin = admin.replace(
  'image_url: d.photos || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80",',
  'image_url: parsePhotos(d.photos)[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80",\n      photos: JSON.stringify(parsePhotos(d.photos)),'
);
fs.writeFileSync(adminPath, admin, 'utf8');
console.log('OK: admin publie maintenant toutes les photos dans logements.photos.');

// 2) Resultats: lecture de logements.photos + galerie thumbnails.
backup(resultatsPath, '.bak-gallery-logements');
let res = fs.readFileSync(resultatsPath, 'utf8');
res = ensureParsePhotos(res);

// Type Logement: ajouter photos si absent.
if (!res.includes('photos: string | null;')) {
  res = res.replace('image_url: string | null;', 'image_url: string | null;\n  photos: string | null;');
}

// Select Supabase: ajouter photos.
res = res.replace(
  'id,titre,ville,quartier,type_logement,prix,chambres,voyageurs,description,image_url,statut',
  'id,titre,ville,quartier,type_logement,prix,chambres,voyageurs,description,image_url,photos,statut'
);

// Dans map resultats: ajouter photosLogement juste après total.
if (!res.includes('const photosLogement =')) {
  res = res.replace(
    'const total = prixSejour + frais;',
    'const total = prixSejour + frais;\n                  const photosLogement = parsePhotos(l.photos).length > 0 ? parsePhotos(l.photos) : (l.image_url ? [l.image_url] : []);'
  );
}

// Remplacer affichage image unique par galerie compacte.
res = res.replace(
  '{l.image_url && <img src={l.image_url} alt={l.titre} className="h-64 w-full object-cover" />}',
  `{photosLogement.length > 0 && (
                          <div>
                            <img src={photosLogement[0]} alt={l.titre} className="h-64 w-full object-cover" />
                            {photosLogement.length > 1 && (
                              <div className="absolute bottom-3 left-3 right-3 grid grid-cols-4 gap-2">
                                {photosLogement.slice(1, 5).map((photo) => (
                                  <img key={photo} src={photo} alt="Photo logement" className="h-14 w-full rounded-xl object-cover ring-2 ring-white/80" />
                                ))}
                              </div>
                            )}
                          </div>
                        )}`
);

fs.writeFileSync(resultatsPath, res, 'utf8');
console.log('OK: /resultats lit logements.photos et affiche une mini galerie.');

// 3) SQL pour ajouter colonne photos dans logements.
const sql = `-- Ajouter la colonne galerie photos aux logements publiés
alter table logements
add column if not exists photos text;
`;
fs.writeFileSync(path.join(root, 'supabase_add_logements_photos.sql'), sql, 'utf8');
console.log('OK: SQL créé: supabase_add_logements_photos.sql');
console.log('Étape: exécute ce SQL dans Supabase SQL Editor, puis npm run build.');
