/*
  Marbnb Home + Results Hero Readability V2
  - Rend la page accueil aussi claire que la page resultats
  - Corrige la couleur illisible du titre/paragraphe dans /resultats
  - Ajoute une plaque claire derriere les textes du hero
  - Evite les images trop orange/saturees derriere les titres

  Usage:
    node marbnb-home-results-readable-v2.js
    npm run build
    git add . && git commit -m "Improve home and results hero readability" && git push
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
  resultats:first(["app/resultats/page.tsx","src/app/resultats/page.tsx","app/sesultats/page.tsx"])
};
if(!files.globals){write("app/globals.css","@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");files.globals="app/globals.css"}

const cssPath="app/marbnb-hero-readable-v2.css";
const css=String.raw`/* MARBNB_HERO_READABLE_V2
   Objectif: page accueil claire + hero resultats lisible.
*/
:root{
  --mb-ink:#17130f;
  --mb-text:#211b15;
  --mb-muted:#332b22;
  --mb-cream:#fffdf8;
  --mb-card:rgba(255,255,255,.82);
  --mb-border:#eadcc2;
  --mb-gold:#c59b54;
  --mb-terra:#b85c38;
}

body{background:linear-gradient(180deg,#fffdf8 0%,#f7efe2 100%)!important;color:var(--mb-ink)!important;}

/* Heroes accueil + resultats: clair, sans voile sombre et sans texte perdu */
.marbnb-home-readable,
.marbnb-results-readable,
.marbnb-clean-hero,
.marbnb-premium-hero{
  background:#fffdf8!important;
  isolation:isolate;
}

.marbnb-home-readable img,
.marbnb-results-readable img,
.marbnb-clean-hero img,
.marbnb-premium-hero img{
  filter:brightness(1.03) saturate(.92) contrast(.95)!important;
}

/* Calme les zones orange/rouge pour eviter que le texte se perde */
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
    linear-gradient(90deg,rgba(255,253,248,.72) 0%,rgba(255,253,248,.50) 36%,rgba(255,253,248,.20) 66%,rgba(255,253,248,.08) 100%),
    linear-gradient(180deg,rgba(255,253,248,.10) 0%,rgba(255,253,248,.04) 48%,rgba(255,253,248,.55) 100%)!important;
}

/* Supprime tous les anciens overlays qui faisaient des bandes */
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

/* Tout le contenu du hero passe au-dessus du voile clair */
.marbnb-home-readable > *,
.marbnb-results-readable > *,
.marbnb-clean-hero > *,
.marbnb-premium-hero > *{position:relative;z-index:2;}

/* Bloc texte du hero */
.marbnb-hero-text-panel,
.marbnb-home-readable .max-w-4xl,
.marbnb-results-readable .max-w-3xl{
  width:fit-content;
  max-width:min(760px,100%);
  padding:1.35rem 1.55rem;
  border-radius:1.8rem;
  background:rgba(255,255,255,.74)!important;
  border:1px solid rgba(234,220,194,.82)!important;
  box-shadow:0 22px 70px rgba(126,93,45,.15)!important;
  backdrop-filter:blur(12px);
}

/* Titre et paragraphe tres lisibles */
.marbnb-home-readable h1,
.marbnb-home-readable h2,
.marbnb-results-readable h1,
.marbnb-results-readable h2,
.marbnb-clean-hero h1,
.marbnb-clean-hero h2,
.marbnb-premium-hero h1,
.marbnb-premium-hero h2{
  color:var(--mb-ink)!important;
  text-shadow:0 2px 0 rgba(255,255,255,.75),0 12px 28px rgba(255,255,255,.65)!important;
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

/* Le badge au-dessus du titre */
.marbnb-premium-signature,
.marbnb-light-signature,
.marbnb-home-readable p.inline-flex,
.marbnb-results-readable p.inline-flex{
  color:#714a16!important;
  background:rgba(255,255,255,.86)!important;
  border:1px solid rgba(197,155,84,.45)!important;
  box-shadow:0 10px 28px rgba(126,93,45,.10)!important;
}

/* Barre de recherche: bien blanche */
.marbnb-home-readable form,
.marbnb-results-readable form,
.marbnb-home-readable div[class*="bg-[#fff8ec]"],
.marbnb-results-readable div[class*="bg-[#fff8ec]"],
.marbnb-home-readable .bg-\[\#fff8ec\],
.marbnb-results-readable .bg-\[\#fff8ec\]{
  background:rgba(255,255,255,.93)!important;
  border-color:rgba(234,220,194,.96)!important;
}

/* Categories et petits boutons plus lisibles */
.marbnb-home-readable button,
.marbnb-results-readable button,
.marbnb-home-readable a,
.marbnb-results-readable a{font-weight:900!important;}

/* Cartes villes: texte Explorer visible */
.marbnb-city-pill p,
button.marbnb-city-pill p,
.marbnb-city-pill span,
button.marbnb-city-pill span{
  color:#fff!important;
  opacity:1!important;
  font-weight:900!important;
  text-shadow:0 1px 10px rgba(0,0,0,.18)!important;
}
button.marbnb-city-pill,
.marbnb-city-pill{
  background:linear-gradient(135deg,#b85c38,#c59b54)!important;
  color:#fff!important;
}

/* Textes gris globaux plus fonces */
.text-\[\#7a6446\],.text-\[\#5f4b32\],.text-\[\#5d513e\],.text-\[\#6f604d\]{color:var(--mb-muted)!important;}

@media(max-width:768px){
  .marbnb-hero-text-panel,
  .marbnb-home-readable .max-w-4xl,
  .marbnb-results-readable .max-w-3xl{padding:1rem;border-radius:1.4rem;}
  .marbnb-home-readable h1,.marbnb-home-readable h2,.marbnb-results-readable h1,.marbnb-results-readable h2{line-height:1.05!important;}
}
`;
write(cssPath,css);
patch(files.globals,(s)=>s.includes('marbnb-hero-readable-v2.css')?s:s.trimEnd()+'\n\n@import "./marbnb-hero-readable-v2.css";\n');

// Page accueil: ajoute classe au hero principal et au deuxieme hero pour qu'ils soient aussi clairs que resultats.
patch(files.home,(s)=>{
  s=s.replaceAll('className="marbnb-clean-hero marbnb-premium-hero relative min-h-[720px]', 'className="marbnb-home-readable marbnb-clean-hero marbnb-premium-hero relative min-h-[720px]');
  s=s.replaceAll('className="marbnb-premium-hero relative min-h-[720px]', 'className="marbnb-home-readable marbnb-premium-hero relative min-h-[720px]');
  s=s.replaceAll('className="relative min-h-[720px]', 'className="marbnb-home-readable relative min-h-[720px]');
  s=s.replaceAll('className="marbnb-clean-hero relative overflow-hidden"', 'className="marbnb-home-readable marbnb-clean-hero relative overflow-hidden"');
  s=s.replaceAll('className="relative overflow-hidden"', 'className="marbnb-home-readable relative overflow-hidden"');

  // Enleve couleurs blanches residuelles dans hero
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

  // Assure les villes visibles
  s=s.replaceAll('className="rounded-[2rem] bg-[#3F7D3B]', 'className="marbnb-city-pill rounded-[2rem] bg-[#3F7D3B]');
  s=s.replaceAll('className="rounded-[2rem] bg-[#c1121f]', 'className="marbnb-city-pill rounded-[2rem] bg-[#c1121f]');
  return s;
});

// Page resultats: classe hero + texte lisible.
patch(files.resultats,(s)=>{
  s=s.replaceAll('className="marbnb-clean-hero relative overflow-hidden border-b', 'className="marbnb-results-readable marbnb-clean-hero relative overflow-hidden border-b');
  s=s.replaceAll('className="relative overflow-hidden border-b', 'className="marbnb-results-readable relative overflow-hidden border-b');
  s=s.replaceAll('text-white/90','text-[#211b15]');
  s=s.replaceAll('text-white/85','text-[#211b15]');
  s=s.replaceAll('text-white/70','text-[#332b22]');
  s=s.replaceAll('text-white','text-[#17130f]');
  s=s.replaceAll('drop-shadow','');
  // rend le titre plus court si l'ancien est trop massif
  s=s.replaceAll('Trouvez le logement idéal pour votre expérience au Maroc.', 'Trouvez votre séjour idéal au Maroc.');
  s=s.replaceAll('Trouvez votre adresse d’exception au Maroc.', 'Trouvez votre séjour idéal au Maroc.');
  return s;
});

console.log("\n✅ Accueil + resultats rendus plus clairs et plus lisibles.");
console.log("Etape suivante: npm run build");
