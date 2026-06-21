const fs = require('fs');
const path = require('path');

const root = process.cwd();
const componentsDir = path.join(root, 'components');
const favoritePath = path.join(componentsDir, 'FavoriteButton.tsx');
const favorisDir = path.join(root, 'app', 'favoris');
const favorisPath = path.join(favorisDir, 'page.tsx');

fs.mkdirSync(componentsDir, { recursive: true });
fs.mkdirSync(favorisDir, { recursive: true });
if (fs.existsSync(favoritePath)) fs.writeFileSync(favoritePath + '.bak-favoris', fs.readFileSync(favoritePath, 'utf8'), 'utf8');
if (fs.existsSync(favorisPath)) fs.writeFileSync(favorisPath + '.bak-favoris', fs.readFileSync(favorisPath, 'utf8'), 'utf8');
fs.writeFileSync(favoritePath, "\"use client\";\n\nimport { useEffect, useState } from \"react\";\n\ntype FavoriteButtonProps = {\n  logementId: string | number;\n  titre?: string | null;\n  variant?: \"floating\" | \"inline\";\n};\n\nfunction getStoredFavorites(): string[] {\n  if (typeof window === \"undefined\") return [];\n  try {\n    const raw = localStorage.getItem(\"mbnb_favoris\");\n    const parsed = raw ? JSON.parse(raw) : [];\n    return Array.isArray(parsed) ? parsed.map(String) : [];\n  } catch {\n    return [];\n  }\n}\n\nfunction saveStoredFavorites(ids: string[]) {\n  localStorage.setItem(\"mbnb_favoris\", JSON.stringify(ids));\n  window.dispatchEvent(new Event(\"mbnb:favoris-changed\"));\n}\n\nexport default function FavoriteButton({ logementId, titre, variant = \"floating\" }: FavoriteButtonProps) {\n  const id = String(logementId);\n  const [active, setActive] = useState(false);\n\n  useEffect(() => {\n    const refresh = () => setActive(getStoredFavorites().includes(id));\n    refresh();\n    window.addEventListener(\"mbnb:favoris-changed\", refresh);\n    window.addEventListener(\"storage\", refresh);\n    return () => {\n      window.removeEventListener(\"mbnb:favoris-changed\", refresh);\n      window.removeEventListener(\"storage\", refresh);\n    };\n  }, [id]);\n\n  function toggle() {\n    const favorites = getStoredFavorites();\n    const next = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];\n    saveStoredFavorites(next);\n    setActive(next.includes(id));\n  }\n\n  const label = active ? \"Retirer des favoris\" : \"Ajouter aux favoris\";\n\n  if (variant === \"inline\") {\n    return (\n      <button\n        type=\"button\"\n        onClick={toggle}\n        aria-label={`${label}${titre ? ` : ${titre}` : \"\"}`}\n        className={`rounded-full px-5 py-2 text-sm font-black ring-1 transition ${active ? \"bg-[#c1121f] text-white ring-[#c1121f]\" : \"bg-white text-[#7a3d14] ring-[#e5d3b3]\"}`}\n      >\n        {active ? \"♥ Favori\" : \"♡ Favori\"}\n      </button>\n    );\n  }\n\n  return (\n    <button\n      type=\"button\"\n      onClick={toggle}\n      aria-label={`${label}${titre ? ` : ${titre}` : \"\"}`}\n      className={`absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full text-xl font-black shadow-sm ring-1 backdrop-blur-md transition ${active ? \"bg-[#c1121f] text-white ring-[#c1121f]\" : \"bg-white/90 text-[#7a3d14] ring-white/70\"}`}\n    >\n      {active ? \"♥\" : \"♡\"}\n    </button>\n  );\n}\n", 'utf8');
fs.writeFileSync(favorisPath, "\"use client\";\n\nimport { useEffect, useMemo, useState } from \"react\";\nimport { supabase } from \"@/lib/supabaseClient\";\nimport FavoriteButton from \"@/components/FavoriteButton\";\n\ntype Logement = Record<string, any>;\n\nfunction getStoredFavorites(): string[] {\n  if (typeof window === \"undefined\") return [];\n  try {\n    const raw = localStorage.getItem(\"mbnb_favoris\");\n    const parsed = raw ? JSON.parse(raw) : [];\n    return Array.isArray(parsed) ? parsed.map(String) : [];\n  } catch {\n    return [];\n  }\n}\n\nfunction parsePhotos(value: string | null | undefined, imageUrl?: string | null) {\n  if (value) {\n    try {\n      const parsed = JSON.parse(value);\n      if (Array.isArray(parsed)) return parsed.filter(Boolean);\n    } catch {\n      return [value];\n    }\n  }\n  return imageUrl ? [imageUrl] : [];\n}\n\nfunction formatMad(value: number) {\n  return new Intl.NumberFormat(\"fr-MA\", { maximumFractionDigits: 0 }).format(value) + \" MAD\";\n}\n\nexport default function FavorisPage() {\n  const [ids, setIds] = useState<string[]>([]);\n  const [logements, setLogements] = useState<Logement[]>([]);\n  const [loading, setLoading] = useState(true);\n  const [message, setMessage] = useState(\"\");\n\n  useEffect(() => {\n    const refreshIds = () => setIds(getStoredFavorites());\n    refreshIds();\n    window.addEventListener(\"mbnb:favoris-changed\", refreshIds);\n    window.addEventListener(\"storage\", refreshIds);\n    return () => {\n      window.removeEventListener(\"mbnb:favoris-changed\", refreshIds);\n      window.removeEventListener(\"storage\", refreshIds);\n    };\n  }, []);\n\n  useEffect(() => {\n    async function charger() {\n      setLoading(true);\n      setMessage(\"\");\n\n      if (ids.length === 0) {\n        setLogements([]);\n        setLoading(false);\n        return;\n      }\n\n      const numericIds = ids.map((id) => Number(id)).filter((id) => !Number.isNaN(id));\n      const { data, error } = await supabase\n        .from(\"logements\")\n        .select(\"*\")\n        .in(\"id\", numericIds.length > 0 ? numericIds : ids);\n\n      if (error) {\n        setMessage(\"Impossible de charger les favoris pour le moment.\");\n        setLogements([]);\n      } else {\n        setLogements(data || []);\n      }\n      setLoading(false);\n    }\n    charger();\n  }, [ids]);\n\n  const sorted = useMemo(() => {\n    return [...logements].sort((a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id)));\n  }, [logements, ids]);\n\n  return (\n    <main className=\"min-h-screen bg-[#f4ead7] px-4 py-8 text-[#1e1b18]\">\n      <section className=\"mx-auto max-w-7xl\">\n        <div className=\"flex flex-wrap items-center justify-between gap-3\">\n          <a href=\"/\" className=\"text-3xl font-black\"><span className=\"text-[#c1121f]\">M</span>bnb</a>\n          <a href=\"/resultats\" className=\"rounded-full bg-[#0f2f22] px-5 py-2 text-sm font-black text-white\">Voir les logements</a>\n        </div>\n\n        <div className=\"mt-8 rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3]\">\n          <p className=\"font-black text-[#c1121f]\">Mbnb</p>\n          <h1 className=\"mt-2 text-4xl font-black\">Mes favoris</h1>\n          <p className=\"mt-3 text-[#7a6446]\">Retrouvez ici les logements enregistrés sur cet appareil.</p>\n\n          {loading && <p className=\"mt-6 font-bold\">Chargement...</p>}\n          {message && <p className=\"mt-5 rounded-2xl bg-amber-50 p-4 font-bold text-amber-700\">{message}</p>}\n\n          {!loading && sorted.length === 0 && (\n            <div className=\"mt-6 rounded-[2rem] bg-white p-6 text-center ring-1 ring-[#e5d3b3]\">\n              <p className=\"text-2xl font-black\">Aucun favori pour le moment</p>\n              <p className=\"mt-2 text-[#7a6446]\">Cliquez sur le cœur d’un logement pour le retrouver ici.</p>\n              <a href=\"/resultats\" className=\"mt-5 inline-flex rounded-full bg-[#0f2f22] px-6 py-3 font-black text-white\">Explorer les logements</a>\n            </div>\n          )}\n\n          <div className=\"mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3\">\n            {sorted.map((l) => {\n              const photos = parsePhotos(l.photos, l.image_url);\n              const photo = photos[0];\n              return (\n                <article key={l.id} className=\"overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-[#e5d3b3]\">\n                  <div className=\"relative\">\n                    {photo ? <img src={photo} alt={l.titre || \"Logement\"} className=\"h-56 w-full object-cover\" /> : <div className=\"grid h-56 place-items-center bg-[#f4ead7] font-bold text-[#7a6446]\">Pas de photo</div>}\n                    <FavoriteButton logementId={l.id} titre={l.titre} />\n                  </div>\n                  <div className=\"p-5\">\n                    <h2 className=\"text-xl font-black\">{l.titre || \"Logement Mbnb\"}</h2>\n                    <p className=\"mt-1 text-sm text-[#7a6446]\">{l.quartier ? `${l.quartier}, ` : \"\"}{l.ville || \"Maroc\"}</p>\n                    <p className=\"mt-4 font-black\">{formatMad(Number(l.prix || 0))} <span className=\"text-sm font-normal\">/ nuit</span></p>\n                    <a href={`/logement/${l.id}`} className=\"mt-5 block rounded-2xl bg-[#0f2f22] py-3 text-center font-black text-white\">Voir détails</a>\n                  </div>\n                </article>\n              );\n            })}\n          </div>\n        </div>\n      </section>\n    </main>\n  );\n}\n", 'utf8');
console.log('OK: composant FavoriteButton créé.');
console.log('OK: page /favoris créée.');

// Injecter import + bouton favori dans /resultats si possible.
const resultatsPath = path.join(root, 'app', 'resultats', 'page.tsx');
if (fs.existsSync(resultatsPath)) {
  let code = fs.readFileSync(resultatsPath, 'utf8');
  const before = code;
  if (!code.includes('@/components/FavoriteButton')) {
    code = code.replace('import { supabase } from "@/lib/supabaseClient";', 'import { supabase } from "@/lib/supabaseClient";
import FavoriteButton from "@/components/FavoriteButton";');
    code = code.replace('import { supabase } from "@/lib/supabaseClient";', 'import { supabase } from "@/lib/supabaseClient";
import FavoriteButton from "@/components/FavoriteButton";');
    code = code.replace('import { supabase } from "@/lib/supabaseClient";', 'import { supabase } from "@/lib/supabaseClient";
import FavoriteButton from "@/components/FavoriteButton";');
    // fallback simple si import exact différent
    if (!code.includes('@/components/FavoriteButton')) {
      code = code.replace('"use client";', '"use client";

import FavoriteButton from "@/components/FavoriteButton";');
    }
  }
  if (!code.includes('<FavoriteButton logementId={l.id}')) {
    code = code.replace(
      '<div className="relative">',
      '<div className="relative">
                        <FavoriteButton logementId={l.id} titre={l.titre} />'
    );
  }
  // Ajouter lien favoris dans header si possible.
  if (!code.includes('/favoris')) {
    code = code.replace('href="/" className="rounded-full bg-[#0f2f22]', 'href="/favoris" className="rounded-full bg-[#7a3d14] px-5 py-2 text-sm font-black text-white">Favoris</a><a href="/" className="rounded-full bg-[#0f2f22]');
  }
  if (code !== before) {
    fs.writeFileSync(resultatsPath + '.bak-favoris', before, 'utf8');
    fs.writeFileSync(resultatsPath, code, 'utf8');
    console.log('OK: boutons favoris injectés dans /resultats si la structure correspond.');
  }
}

// Injecter bouton favori dans page détail.
const detailPath = path.join(root, 'app', 'logement', '[id]', 'page.tsx');
if (fs.existsSync(detailPath)) {
  let detail = fs.readFileSync(detailPath, 'utf8');
  const before = detail;
  if (!detail.includes('@/components/FavoriteButton')) {
    detail = detail.replace('import MbnbMap from "@/components/MbnbMap";', 'import MbnbMap from "@/components/MbnbMap";
import FavoriteButton from "@/components/FavoriteButton";');
    if (!detail.includes('@/components/FavoriteButton')) {
      detail = detail.replace('"use client";', '"use client";

import FavoriteButton from "@/components/FavoriteButton";');
    }
  }
  if (!detail.includes('variant="inline"')) {
    detail = detail.replace(
      '<a href="/resultats" className="text-sm font-black text-[#c1121f]">← Retour aux résultats</a>',
      '<div className="flex flex-wrap items-center justify-between gap-3"><a href="/resultats" className="text-sm font-black text-[#c1121f]">← Retour aux résultats</a><FavoriteButton logementId={logement.id} titre={titre} variant="inline" /></div>'
    );
  }
  if (detail !== before) {
    fs.writeFileSync(detailPath + '.bak-favoris', before, 'utf8');
    fs.writeFileSync(detailPath, detail, 'utf8');
    console.log('OK: bouton favori ajouté dans /logement/[id].');
  }
}

console.log('
Terminé ✅');
console.log('Lance: npm run build');
console.log('Teste: /resultats, /logement/[id], /favoris');
