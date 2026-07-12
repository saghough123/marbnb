/*
  Marbnb UI Full Fix V3
  Integre :
  1) Lisibilite des textes sur accueil et resultats
  2) Page /favoris complete pour supprimer le 404
  3) Correction de l'erreur SyntaxError causee par les templates ${...} dans le script precedent
  4) Accueil plus clair, proche de la page resultats, avec hero lisible

  Usage:
    node marbnb-ui-full-fix-v3.js
    npm run build
    git add . && git commit -m "Fix UI readability and favorites page" && git push
*/

const fs = require("fs");
const path = require("path");
const root = process.cwd();

function full(p){return path.join(root,p)}
function exists(p){return fs.existsSync(full(p))}
function read(p){return fs.readFileSync(full(p),"utf8")}
function write(p,c){fs.mkdirSync(path.dirname(full(p)),{recursive:true});fs.writeFileSync(full(p),c,"utf8");console.log("[OK] " + p)}
function patch(p,cb){
  if(!p || !exists(p)){console.log("[INFO] absent: " + p);return}
  const b=read(p);
  const a=cb(b);
  if(a!==b) write(p,a); else console.log("[OK] deja traite: " + p);
}
function first(list){return list.find(exists)||null}

const files={
  globals:first(["app/globals.css","src/app/globals.css"]),
  home:first(["app/page.tsx","src/app/page.tsx"]),
  resultats:first(["app/resultats/page.tsx","src/app/resultats/page.tsx","app/sesultats/page.tsx"]),
  favoris:first(["app/favoris/page.tsx","src/app/favoris/page.tsx"])
};

if(!files.globals){write("app/globals.css","@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");files.globals="app/globals.css"}

const cssPath="app/marbnb-ui-full-fix-v3.css";
const css=String.raw`/* MARBNB_UI_FULL_FIX_V3 */
:root{
  --mb-ink:#17130f;
  --mb-text:#211b15;
  --mb-muted:#332b22;
  --mb-cream:#fffdf8;
  --mb-sand:#f7efe2;
  --mb-card:rgba(255,255,255,.86);
  --mb-border:#eadcc2;
  --mb-gold:#c59b54;
  --mb-terra:#b85c38;
  --mb-green:#2f6f34;
}

body{
  background:linear-gradient(180deg,var(--mb-cream) 0%,var(--mb-sand) 100%)!important;
  color:var(--mb-ink)!important;
}

/* Hero accueil/resultats clair et lisible */
.marbnb-home-readable,
.marbnb-results-readable,
.marbnb-clean-hero,
.marbnb-premium-hero{
  background:#fffdf8!important;
  isolation:isolate;
  position:relative;
}

.marbnb-home-readable img,
.marbnb-results-readable img,
.marbnb-clean-hero img,
.marbnb-premium-hero img,
img.marbnb-hero-bg{
  filter:brightness(1.04) saturate(.90) contrast(.94)!important;
}

.marbnb-home-readable::before,
.marbnb-results-readable::before,
.marbnb-clean-hero::before,
.marbnb-premium-hero::before{
  content:"";
  position:absolute;
  inset:0;
  z-index:1;
  pointer-events:none;
  background:
    linear-gradient(90deg,rgba(255,253,248,.76) 0%,rgba(255,253,248,.54) 38%,rgba(255,253,248,.22) 70%,rgba(255,253,248,.08) 100%),
    linear-gradient(180deg,rgba(255,253,248,.08) 0%,rgba(255,253,248,.04) 48%,rgba(255,253,248,.62) 100%)!important;
}

.marbnb-home-readable .bg-gradient-to-r,
.marbnb-home-readable .bg-gradient-to-t,
.marbnb-home-readable .bg-gradient-to-b,
.marbnb-results-readable .bg-gradient-to-r,
.marbnb-results-readable .bg-gradient-to-t,
.marbnb-results-readable .bg-gradient-to-b,
.marbnb-clean-hero .bg-gradient-to-r,
.marbnb-clean-hero .bg-gradient-to-t,
.marbnb-clean-hero .bg-gradient-to-b{
  background:none!important;
}

.marbnb-home-readable > *,
.marbnb-results-readable > *,
.marbnb-clean-hero > *,
.marbnb-premium-hero > *{position:relative;z-index:2;}

.marbnb-home-readable .max-w-4xl,
.marbnb-home-readable .max-w-3xl,
.marbnb-results-readable .max-w-3xl,
.marbnb-hero-text-panel{
  max-width:min(780px,100%);
  padding:1.35rem 1.55rem;
  border-radius:1.8rem;
  background:rgba(255,255,255,.78)!important;
  border:1px solid rgba(234,220,194,.86)!important;
  box-shadow:0 22px 70px rgba(126,93,45,.15)!important;
  backdrop-filter:blur(12px);
}

.marbnb-home-readable h1,
.marbnb-home-readable h2,
.marbnb-results-readable h1,
.marbnb-results-readable h2,
.marbnb-clean-hero h1,
.marbnb-clean-hero h2,
.marbnb-premium-hero h1,
.marbnb-premium-hero h2{
  color:var(--mb-ink)!important;
  text-shadow:0 2px 0 rgba(255,255,255,.78),0 12px 28px rgba(255,255,255,.66)!important;
  line-height:.98!important;
}

.marbnb-home-readable p,
.marbnb-results-readable p,
.marbnb-clean-hero p,
.marbnb-premium-hero p{
  color:var(--mb-text)!important;
  font-weight:700!important;
  text-shadow:0 1px 0 rgba(255,255,255,.85)!important;
}

.marbnb-hero-readable-text{
  display:inline-block!important;
  max-width:760px;
  padding:.75rem 1rem;
  border-radius:1.25rem;
  background:rgba(255,255,255,.68)!important;
  border:1px solid rgba(234,220,194,.70)!important;
  backdrop-filter:blur(8px);
  color:var(--mb-text)!important;
  font-weight:750!important;
}

.marbnb-premium-signature,
.marbnb-light-signature,
.marbnb-home-readable p.inline-flex,
.marbnb-results-readable p.inline-flex{
  color:#714a16!important;
  background:rgba(255,255,255,.88)!important;
  border:1px solid rgba(197,155,84,.45)!important;
  box-shadow:0 10px 28px rgba(126,93,45,.10)!important;
}

/* Barre recherche et cartes */
.marbnb-home-readable div[class*="bg-[#fff8ec]"],
.marbnb-results-readable div[class*="bg-[#fff8ec]"],
.bg-\[\#fff8ec\]{
  background:rgba(255,255,255,.94)!important;
}

article.rounded-\[2rem\],
.marbnb-card-premium,
.rounded-3xl.bg-white,
section[class*="bg-[#fff8ec]"],
section[class*="bg-\[\#fff8ec\]"]{
  background:rgba(255,255,255,.94)!important;
  border:1px solid rgba(234,220,194,.90)!important;
  box-shadow:0 16px 42px rgba(126,93,45,.09)!important;
}

/* Boutons villes: Explorer visible */
.marbnb-city-pill p,
button.marbnb-city-pill p,
.marbnb-city-pill span,
button.marbnb-city-pill span{
  color:#fff!important;
  opacity:1!important;
  font-weight:900!important;
  text-shadow:0 1px 10px rgba(0,0,0,.20)!important;
}
button.marbnb-city-pill,
.marbnb-city-pill{
  background:linear-gradient(135deg,#b85c38,#c59b54)!important;
  color:#fff!important;
}

/* Textes gris plus fonces */
.text-\[\#7a6446\],.text-\[\#5f4b32\],.text-\[\#5d513e\],.text-\[\#6f604d\]{color:var(--mb-muted)!important;}

input,select,textarea{
  background:rgba(255,255,255,.98)!important;
  border-color:var(--mb-border)!important;
  color:var(--mb-ink)!important;
}

/* Page favoris */
.marbnb-favoris-page{
  min-height:calc(100vh - 92px);
  background:linear-gradient(180deg,#fffdf8 0%,#f7efe2 100%);
  color:var(--mb-ink);
}
.marbnb-favoris-card{
  background:rgba(255,255,255,.95);
  border:1px solid var(--mb-border);
  box-shadow:0 18px 46px rgba(126,93,45,.10);
}

@media(max-width:768px){
  .marbnb-home-readable .max-w-4xl,
  .marbnb-home-readable .max-w-3xl,
  .marbnb-results-readable .max-w-3xl,
  .marbnb-hero-text-panel{padding:1rem;border-radius:1.4rem;}
  .marbnb-home-readable h1,.marbnb-home-readable h2,.marbnb-results-readable h1,.marbnb-results-readable h2{line-height:1.05!important;}
}
`;
write(cssPath,css);
patch(files.globals,(s)=>s.includes('marbnb-ui-full-fix-v3.css')?s:s.trimEnd()+'\n\n@import "./marbnb-ui-full-fix-v3.css";\n');

// Patch accueil
patch(files.home,(s)=>{
  s=s.replaceAll('className="marbnb-home-readable marbnb-clean-hero marbnb-premium-hero relative min-h-[720px]', 'className="marbnb-home-readable marbnb-clean-hero marbnb-premium-hero relative min-h-[720px]');
  s=s.replaceAll('className="marbnb-clean-hero marbnb-premium-hero relative min-h-[720px]', 'className="marbnb-home-readable marbnb-clean-hero marbnb-premium-hero relative min-h-[720px]');
  s=s.replaceAll('className="marbnb-premium-hero relative min-h-[720px]', 'className="marbnb-home-readable marbnb-premium-hero relative min-h-[720px]');
  s=s.replaceAll('className="relative min-h-[720px]', 'className="marbnb-home-readable relative min-h-[720px]');
  s=s.replaceAll('className="marbnb-clean-hero relative overflow-hidden"', 'className="marbnb-home-readable marbnb-clean-hero relative overflow-hidden"');
  s=s.replaceAll('className="relative overflow-hidden"', 'className="marbnb-home-readable relative overflow-hidden"');

  s=s.replaceAll('text-white/90','text-[#211b15]');
  s=s.replaceAll('text-white/85','text-[#211b15]');
  s=s.replaceAll('text-white/70','text-[#332b22]');
  s=s.replaceAll('text-white','text-[#17130f]');
  s=s.replaceAll('drop-shadow','');
  s=s.replaceAll('bg-black/35','bg-white/75');
  s=s.replaceAll('border-white/20','border-[#eadcc2]');
  s=s.replaceAll('border-white/30','border-[#eadcc2]');
  s=s.replaceAll('border-white/40','border-[#eadcc2]');
  s=s.replaceAll('bg-white/15','bg-white/70');
  s=s.replaceAll('hover:bg-white/25','hover:bg-white/90');

  s=s.replaceAll('className="rounded-[2rem] bg-[#3F7D3B]', 'className="marbnb-city-pill rounded-[2rem] bg-[#3F7D3B]');
  s=s.replaceAll('className="rounded-[2rem] bg-[#c1121f]', 'className="marbnb-city-pill rounded-[2rem] bg-[#c1121f]');

  const target1='Une sélection de logements inspirée des riads, du zellige et de l’art de recevoir marocain, avec une réservation simple et moderne.';
  const target2='Riads d’exception, villas privées et appartements sélectionnés avec une identité marocaine premium.';
  for(const phrase of [target1,target2]){
    if(s.includes(phrase) && !s.includes('marbnb-hero-readable-text')){
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
  return s;
});

// Patch resultats
patch(files.resultats,(s)=>{
  s=s.replaceAll('className="marbnb-results-readable marbnb-clean-hero relative overflow-hidden border-b', 'className="marbnb-results-readable marbnb-clean-hero relative overflow-hidden border-b');
  s=s.replaceAll('className="marbnb-clean-hero relative overflow-hidden border-b', 'className="marbnb-results-readable marbnb-clean-hero relative overflow-hidden border-b');
  s=s.replaceAll('className="relative overflow-hidden border-b', 'className="marbnb-results-readable relative overflow-hidden border-b');
  s=s.replaceAll('text-white/90','text-[#211b15]');
  s=s.replaceAll('text-white/85','text-[#211b15]');
  s=s.replaceAll('text-white/70','text-[#332b22]');
  s=s.replaceAll('text-white','text-[#17130f]');
  s=s.replaceAll('drop-shadow','');
  s=s.replaceAll('Trouvez le logement idéal pour votre expérience au Maroc.', 'Trouvez votre séjour idéal au Maroc.');
  s=s.replaceAll('Trouvez votre adresse d’exception au Maroc.', 'Trouvez votre séjour idéal au Maroc.');
  if(!s.includes('marbnb-hero-readable-text')){
    s=s.replace('className="mt-4 max-w-2xl text-base leading-7', 'className="marbnb-hero-readable-text mt-4 max-w-2xl text-base leading-7');
  }
  return s;
});

// Page favoris sans template literal imbrique dans le script JS
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
            <p className="mt-2 font-semibold text-[#332b22]">Cliquez sur le coeur d’un logement pour l’ajouter à cette page.</p>
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
                    <a href={"/logement/" + l.id} className="mt-4 block rounded-2xl bg-[#c59b54] py-3 text-center font-black text-white">Voir détails</a>
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
write(favorisPath,favorisPage);

console.log("\n✅ Marbnb UI Full Fix V3 termine.");
console.log("Maintenant lance: npm run build");
