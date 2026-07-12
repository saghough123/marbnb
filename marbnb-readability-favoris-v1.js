/*
  Marbnb readability + favoris fix V1
  - Renforce la lisibilite des textes sur les images claires
  - Cree / corrige la page /favoris pour eviter le 404

  Usage:
    node marbnb-readability-favoris-v1.js
    npm run build
    git add . && git commit -m "Fix readability and favorites page" && git push
*/
const fs = require("fs");
const path = require("path");
const root = process.cwd();
function full(p){return path.join(root,p)}
function exists(p){return fs.existsSync(full(p))}
function read(p){return fs.readFileSync(full(p),"utf8")}
function write(p,c){fs.mkdirSync(path.dirname(full(p)),{recursive:true});fs.writeFileSync(full(p),c,"utf8");console.log("[OK] "+p)}
function patch(p,cb){if(!p||!exists(p)){console.log("[INFO] absent: "+p);return}const b=read(p);const a=cb(b);if(a!==b)write(p,a);else console.log("[OK] deja traite: "+p)}
function first(list){return list.find(exists)||null}
const files={
  globals:first(["app/globals.css","src/app/globals.css"]),
  home:first(["app/page.tsx","src/app/page.tsx"]),
  resultats:first(["app/resultats/page.tsx","src/app/resultats/page.tsx","app/sesultats/page.tsx"]),
  logement:first(["app/logement/[id]/page.tsx","src/app/logement/[id]/page.tsx"]),
  favoris:first(["app/favoris/page.tsx","src/app/favoris/page.tsx"])
};
if(!files.globals){write("app/globals.css","@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");files.globals="app/globals.css"}

const cssPath="app/marbnb-readability-favoris.css";
const css=String.raw`/* MARBNB_READABILITY_FAVORIS_V1 */
:root{
  --mb-readable-title:#17130f;
  --mb-readable-text:#241f19;
  --mb-readable-muted:#332b22;
  --mb-readable-brown:#7b3f24;
  --mb-gold:#c59b54;
  --mb-sand:#fff8ec;
  --mb-border:#eadcc2;
}

/* Hero: texte toujours lisible sur image claire */
.marbnb-clean-hero h1,
.marbnb-clean-hero h2,
.marbnb-premium-hero h1,
.marbnb-premium-hero h2{
  color:var(--mb-readable-title)!important;
  text-shadow:0 2px 0 rgba(255,255,255,.45),0 12px 35px rgba(255,255,255,.55)!important;
  letter-spacing:-.045em;
}

.marbnb-clean-hero p,
.marbnb-premium-hero p,
.marbnb-clean-hero .text-\[\#5d513e\],
.marbnb-clean-hero .text-\[\#6f604d\],
.marbnb-premium-hero .text-\[\#5d513e\],
.marbnb-premium-hero .text-\[\#6f604d\]{
  color:var(--mb-readable-text)!important;
  font-weight:650!important;
  text-shadow:0 1px 0 rgba(255,255,255,.75),0 8px 22px rgba(255,255,255,.55)!important;
}

/* Ajoute une plaque douce derriere le paragraphe du hero pour lisibilite */
.marbnb-hero-readable-text{
  display:inline-block!important;
  max-width:760px;
  padding:.75rem 1rem;
  border-radius:1.25rem;
  background:rgba(255,255,255,.62)!important;
  border:1px solid rgba(234,220,194,.65)!important;
  backdrop-filter:blur(8px);
  color:var(--mb-readable-text)!important;
  font-weight:700!important;
}

/* Boutons categories et petites infos: contraste */
.marbnb-clean-hero button,
.marbnb-clean-hero a,
.marbnb-premium-hero button,
.marbnb-premium-hero a{
  font-weight:900!important;
}

/* Cartes villes: le mot Explorer devient visible */
.marbnb-city-pill p,
button.marbnb-city-pill p,
.marbnb-city-pill span,
button.marbnb-city-pill span{
  color:#ffffff!important;
  opacity:1!important;
  text-shadow:0 1px 12px rgba(0,0,0,.18)!important;
}

.marbnb-city-pill,
button.marbnb-city-pill{
  background:linear-gradient(135deg,#b85c38,#c59b54)!important;
  border:1px solid rgba(255,255,255,.35)!important;
}

/* Si les villes ne portent pas la classe city-pill, cibler les boutons verts/terracotta dans cette zone */
section button[class*="bg-[#3F7D3B]"] p,
section button[class*="bg-\[\#3F7D3B\]"] p,
section button[class*="bg-[#c1121f]"] p,
section button[class*="bg-\[\#c1121f\]"] p{
  color:#fff!important;
  opacity:1!important;
  font-weight:900!important;
}

/* Textes gris globaux un peu plus fonces */
.text-\[\#7a6446\],
.text-\[\#5f4b32\],
.text-\[\#5d513e\],
.text-\[\#6f604d\]{
  color:var(--mb-readable-muted)!important;
}

/* Page favoris */
.marbnb-favoris-page{
  min-height:calc(100vh - 92px);
  background:linear-gradient(180deg,#fffdf8 0%,#f7efe2 100%);
  color:var(--mb-readable-title);
}
.marbnb-favoris-card{
  background:rgba(255,255,255,.94);
  border:1px solid var(--mb-border);
  box-shadow:0 18px 46px rgba(126,93,45,.10);
}
`;
write(cssPath,css);
patch(files.globals,(s)=> s.includes('marbnb-readability-favoris.css')?s:s.trimEnd()+'\n\n@import "./marbnb-readability-favoris.css";\n');

// Ajoute classe de lisibilite au paragraphe hero s'il trouve les phrases connues.
patch(files.home,(s)=>{
  const phrases=[
    "Une sélection de logements inspirée des riads, du zellige et de l’art de recevoir marocain, avec une réservation simple et moderne.",
    "Riads d’exception, villas privées et appartements sélectionnés avec une identité marocaine premium.",
    "Une sélection de logements inspirée des riads, du zellige et de l'art de recevoir marocain, avec une réservation simple et moderne."
  ];
  for(const phrase of phrases){
    if(s.includes(phrase) && !s.includes("marbnb-hero-readable-text")){
      // remplace la classe du p contenant cette phrase le plus simplement possible
      const idx=s.indexOf(phrase);
      const start=s.lastIndexOf('<p',idx);
      const end=s.indexOf('>',start);
      if(start!==-1 && end!==-1){
        const tag=s.slice(start,end+1);
        if(tag.includes('className=')){
          const newTag=tag.replace(/className="([^"]*)"/, 'className="$1 marbnb-hero-readable-text"');
          s=s.slice(0,start)+newTag+s.slice(end+1);
        }
      }
    }
  }
  // Assure la classe city-pill sur les boutons villes principaux si possible
  s=s.replaceAll('className="rounded-[2rem] bg-[#3F7D3B]', 'className="marbnb-city-pill rounded-[2rem] bg-[#3F7D3B]');
  s=s.replaceAll('className="rounded-[2rem] bg-[#c1121f]', 'className="marbnb-city-pill rounded-[2rem] bg-[#c1121f]');
  return s;
});

patch(files.resultats,(s)=>{
  if(!s.includes("marbnb-hero-readable-text")){
    s=s.replace('className="mt-4 max-w-2xl text-base leading-7', 'className="marbnb-hero-readable-text mt-4 max-w-2xl text-base leading-7');
  }
  return s;
});

// Cree /favoris
const favorisPath=files.favoris || "app/favoris/page.tsx";
const favorisPage=String.raw`"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Logement = {
  id: string | number;
  titre: string;
  ville: string;
  quartier: string | null;
  type_logement: string | null;
  prix: number | null;
  chambres: number | null;
  voyageurs: number | null;
  image_url: string | null;
  photos: string | null;
  statut: string | null;
};

function parsePhotos(value: string | null | undefined, imageUrl?: string | null) {
  const list: string[] = [];
  if (imageUrl) list.push(imageUrl);
  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) list.push(...parsed.filter(Boolean).map(String));
      else if (parsed) list.push(String(parsed));
    } catch {
      list.push(value);
    }
  }
  return Array.from(new Set(list.filter(Boolean)));
}

export default function FavorisPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [logements, setLogements] = useState<Logement[]>([]);
  const [favoris, setFavoris] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("marbnb_favoris") || localStorage.getItem("mbnb_favoris") || "[]";
      const ids = JSON.parse(raw);
      setFavoris(Array.isArray(ids) ? ids.map(String) : []);
    } catch {
      setFavoris([]);
    }
    chargerLogements();
  }, []);

  async function chargerLogements() {
    setLoading(true);
    const { data, error } = await supabase
      .from("logements")
      .select("id,titre,ville,quartier,type_logement,prix,chambres,voyageurs,image_url,photos,statut")
      .eq("statut", "Actif")
      .order("id", { ascending: false });

    if (error) {
      setMessage("Erreur chargement favoris : " + error.message);
      setLogements([]);
    } else {
      setLogements(data || []);
    }
    setLoading(false);
  }

  function supprimerFavori(id: string | number) {
    const next = favoris.filter((x) => x !== String(id));
    setFavoris(next);
    localStorage.setItem("marbnb_favoris", JSON.stringify(next));
    localStorage.setItem("mbnb_favoris", JSON.stringify(next));
  }

  const visibles = useMemo(() => {
    if (favoris.length === 0) return [];
    return logements.filter((l) => favoris.includes(String(l.id)));
  }, [logements, favoris]);

  return (
    <main className="marbnb-favoris-page px-4 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-black text-[#b85c38]">Marbnb</p>
            <h1 className="mt-2 text-4xl font-black md:text-5xl">Mes favoris</h1>
            <p className="mt-3 max-w-2xl font-semibold text-[#332b22]">
              Retrouvez ici les logements sauvegardés pendant votre navigation.
            </p>
          </div>
          <a href="/resultats" className="rounded-full bg-[#c59b54] px-6 py-3 font-black text-white shadow">
            Explorer les logements
          </a>
        </div>

        {message && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{message}</p>}
        {loading && <p className="mt-8 rounded-3xl bg-white p-6 text-center font-black ring-1 ring-[#eadcc2]">Chargement des favoris...</p>}

        {!loading && visibles.length === 0 && (
          <div className="marbnb-favoris-card mt-8 rounded-[2rem] p-8 text-center">
            <p className="text-2xl font-black">Aucun favori pour le moment</p>
            <p className="mt-2 font-semibold text-[#332b22]">Cliquez sur le cœur d’un logement pour l’ajouter à cette page.</p>
            <a href="/resultats" className="mt-6 inline-flex rounded-full bg-[#b85c38] px-6 py-3 font-black text-white">Voir les logements</a>
          </div>
        )}

        {!loading && visibles.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibles.map((l) => {
              const photos = parsePhotos(l.photos, l.image_url);
              const img = photos[0] || "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80";
              return (
                <article key={String(l.id)} className="marbnb-favoris-card overflow-hidden rounded-[2rem]">
                  <img src={img} alt={l.titre} className="h-64 w-full object-cover" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="line-clamp-2 text-xl font-black">{l.titre}</h2>
                        <p className="mt-1 font-semibold text-[#332b22]">{l.quartier || "Centre"}, {l.ville}</p>
                      </div>
                      <button onClick={() => supprimerFavori(l.id)} className="rounded-full bg-red-50 px-3 py-2 font-black text-red-700">♥</button>
                    </div>
                    <p className="mt-3 font-semibold text-[#332b22]">{l.chambres || 1} chambre(s) · max {l.voyageurs || 1} voyageurs</p>
                    <p className="mt-3 text-lg font-black">{Number(l.prix || 0).toLocaleString("fr-FR")} MAD <span className="text-sm font-semibold text-[#332b22]">/ nuit</span></p>
                    <a href={`/logement/${l.id}`} className="mt-4 block rounded-2xl bg-[#c59b54] py-3 text-center font-black text-white">Voir détails</a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
`;
write(favorisPath, favorisPage);

console.log("\n✅ Lisibilite renforcee + page /favoris creee.");
console.log("Etape suivante: npm run build");
