/*
  Marbnb Clean Light Hero Fix V2
  Corrige les bandes/nuances blanches visibles sur le hero et applique une palette claire propre.

  Usage:
    node marbnb-clean-light-hero-v2.js
    npm run build
    git add . && git commit -m "Clean light hero design" && git push
*/

const fs = require("fs");
const path = require("path");
const root = process.cwd();

function full(p){ return path.join(root,p); }
function exists(p){ return fs.existsSync(full(p)); }
function read(p){ return fs.readFileSync(full(p), "utf8"); }
function write(p,c){ fs.mkdirSync(path.dirname(full(p)), {recursive:true}); fs.writeFileSync(full(p), c, "utf8"); console.log("[OK] " + p); }
function patch(p, cb){ if(!p || !exists(p)){ console.log("[INFO] absent: " + p); return; } const b=read(p); const a=cb(b); if(a!==b) write(p,a); else console.log("[OK] déjà traité: " + p); }
function first(list){ return list.find(exists) || null; }

const files = {
  globals: first(["app/globals.css", "src/app/globals.css"]),
  home: first(["app/page.tsx", "src/app/page.tsx"]),
  resultats: first(["app/resultats/page.tsx", "src/app/resultats/page.tsx", "app/sesultats/page.tsx"]),
  logement: first(["app/logement/[id]/page.tsx", "src/app/logement/[id]/page.tsx"]),
  hote: first(["app/hote/page.tsx", "src/app/hote/page.tsx"]),
};

if(!files.globals){ write("app/globals.css", "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"); files.globals="app/globals.css"; }

const cssPath = "app/marbnb-clean-light-hero.css";
const css = String.raw`/* MARBNB_CLEAN_LIGHT_HERO_V2
   But: supprimer les bandes/nuances blanches et sombres dans le hero.
   Style: clair, propre, Maroc premium, sans voile horizontal visible.
*/

:root{
  --mb-bg:#fffdf8;
  --mb-sand:#f7efe2;
  --mb-card:#ffffff;
  --mb-border:#eadcc2;
  --mb-gold:#c59b54;
  --mb-gold-soft:#f7e6ba;
  --mb-oasis:#4e754a;
  --mb-terracotta:#b85c38;
  --mb-text:#28231d;
  --mb-muted:#6f604d;
}

html{scroll-behavior:smooth;}

body{
  color:var(--mb-text)!important;
  background:linear-gradient(180deg,#fffdf8 0%,#f7efe2 100%)!important;
}

/* Motif discret, presque invisible pour ne pas fatiguer les yeux */
body::before{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  z-index:-1;
  opacity:.025;
  background-image:radial-gradient(circle at 1px 1px, rgba(197,155,84,.55) 1px, transparent 0);
  background-size:28px 28px;
}

/* IMPORTANT: neutralise les anciens overlays qui créaient les bandes encerclées */
.marbnb-premium-hero::after,
section:has(.marbnb-premium-signature)::after,
section:has(.marbnb-light-signature)::after{
  display:none!important;
  content:none!important;
  background:none!important;
}

/* Le hero ne doit plus avoir de voile horizontal au milieu */
.marbnb-clean-hero{
  position:relative!important;
  overflow:hidden!important;
  background:#fffdf8!important;
}

.marbnb-clean-hero > .absolute.inset-0::after,
.marbnb-clean-hero > .absolute.inset-0::before{
  display:none!important;
  content:none!important;
}

/* Image hero: claire, naturelle, sans couche blanche coupée */
.marbnb-clean-hero img,
.marbnb-premium-hero img,
img.marbnb-hero-bg{
  filter:brightness(1.08) saturate(1.04) contrast(.98)!important;
}

/* Supprime les anciens dégradés Tailwind visibles dans le hero */
.marbnb-clean-hero .bg-gradient-to-r,
.marbnb-clean-hero .bg-gradient-to-t,
.marbnb-clean-hero .bg-gradient-to-b{
  background:none!important;
}

/* Nouveau overlay doux: aucune bande, un dégradé continu vertical */
.marbnb-clean-hero-overlay{
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    linear-gradient(90deg, rgba(255,253,248,.78) 0%, rgba(255,253,248,.42) 38%, rgba(255,253,248,.08) 100%),
    linear-gradient(180deg, rgba(255,253,248,.10) 0%, rgba(255,253,248,.18) 55%, rgba(247,239,226,.92) 100%)!important;
}

/* Carte hero claire et lisible, sans gros bloc noir */
.marbnb-clean-hero-card{
  background:rgba(255,255,255,.72)!important;
  border:1px solid rgba(234,220,194,.85)!important;
  box-shadow:0 24px 70px rgba(126,93,45,.16)!important;
  backdrop-filter:blur(16px)!important;
  color:var(--mb-text)!important;
}

.marbnb-clean-hero-card h1,
.marbnb-clean-hero-card h2,
.marbnb-clean-hero-card p,
.marbnb-clean-hero-card span{
  color:var(--mb-text)!important;
  text-shadow:none!important;
}

.marbnb-clean-hero-card p,
.marbnb-clean-hero-card .text-white\/90,
.marbnb-clean-hero-card .text-white\/85,
.marbnb-clean-hero-card .text-white\/70{
  color:var(--mb-muted)!important;
}

.marbnb-premium-signature,
.marbnb-light-signature{
  color:#7b5520!important;
  background:rgba(255,255,255,.78)!important;
  border:1px solid rgba(197,155,84,.45)!important;
  box-shadow:0 10px 24px rgba(126,93,45,.10)!important;
}

/* Barres et sections */
.bg-\[\#f4ead7\],.bg-\[\#f7efe2\]{background-color:#fffdf8!important;}
.bg-\[\#fff8ec\]{background-color:rgba(255,255,255,.90)!important;}
.text-\[\#1e1b18\]{color:var(--mb-text)!important;}
.text-\[\#7a6446\]{color:var(--mb-muted)!important;}

/* Cartes propres */
article.rounded-\[2rem\],
.marbnb-card-premium,
.rounded-3xl.bg-white,
section[class*="bg-[#fff8ec]"],
section[class*="bg-\[\#fff8ec\]"]{
  background:rgba(255,255,255,.92)!important;
  border:1px solid rgba(234,220,194,.9)!important;
  box-shadow:0 16px 42px rgba(126,93,45,.09)!important;
}

article.rounded-\[2rem\]:hover,
.marbnb-card-premium:hover{
  transform:translateY(-4px);
  box-shadow:0 22px 58px rgba(126,93,45,.14)!important;
}

/* Boutons plus doux */
a[class*="bg-[#c1121f]"],button[class*="bg-[#c1121f]"],
a[class*="bg-\[\#c1121f\]"],button[class*="bg-\[\#c1121f\]"],
a[class*="bg-[#3F7D3B]"],button[class*="bg-[#3F7D3B]"],
a[class*="bg-\[\#3F7D3B\]"],button[class*="bg-\[\#3F7D3B\]"]{
  background:linear-gradient(135deg,#b85c38,#c59b54)!important;
  color:white!important;
  box-shadow:0 10px 26px rgba(197,155,84,.22)!important;
}

input,select,textarea{
  background:rgba(255,255,255,.96)!important;
  border-color:var(--mb-border)!important;
  color:var(--mb-text)!important;
}
input:focus,select:focus,textarea:focus{
  border-color:var(--mb-gold)!important;
  box-shadow:0 0 0 4px rgba(197,155,84,.13)!important;
}

/* Cache la fausse bande blanche qui pouvait venir des anciens masques mobile/classes */
.marbnb-fake-menu-mask{
  display:none!important;
}

@media(max-width:768px){
  .marbnb-clean-hero-card{background:rgba(255,255,255,.84)!important;}
  article.rounded-\[2rem\]:hover,.marbnb-card-premium:hover{transform:none;}
}
`;
write(cssPath, css);

patch(files.globals, (s)=>{
  let out=s;
  if(!out.includes('marbnb-clean-light-hero.css')) out = out.trimEnd() + '\n\n@import "./marbnb-clean-light-hero.css";\n';
  return out;
});

// Patch page accueil: ajoute classe hero + overlay clean + supprime overlays visibles et carte sombre.
patch(files.home, (s)=>{
  s=s.replaceAll("Le Maroc, réservé autrement.", "Découvrez le Maroc autrement.");
  s=s.replaceAll("Bienvenue au Maroc.", "Découvrez le Maroc autrement.");
  s=s.replaceAll("bg-black/35", "marbnb-clean-hero-card");
  s=s.replaceAll("text-white/90", "text-[#5d513e]");
  s=s.replaceAll("text-white/85", "text-[#5d513e]");
  s=s.replaceAll("text-white/70", "text-[#6f604d]");
  s=s.replaceAll("text-white", "text-[#28231d]");
  s=s.replaceAll("drop-shadow", "");
  s=s.replaceAll("border border-white/20", "border border-[#eadcc2]");
  s=s.replaceAll("border-white/40", "border-[#eadcc2]");
  s=s.replaceAll("bg-white/15", "bg-white/60");
  s=s.replaceAll("hover:bg-white/25", "hover:bg-white/80");

  // Ajoute la classe au premier et deuxième hero si présents.
  s=s.replaceAll('className="marbnb-premium-hero relative min-h-[720px]', 'className="marbnb-clean-hero marbnb-premium-hero relative min-h-[720px]');
  s=s.replaceAll('className="relative min-h-[720px]', 'className="marbnb-clean-hero relative min-h-[720px]');
  s=s.replaceAll('className="relative overflow-hidden"', 'className="marbnb-clean-hero relative overflow-hidden"');

  // Remplace les anciens div overlay gradient par un overlay propre quand possible.
  s=s.replaceAll('<div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />', '<div className="marbnb-clean-hero-overlay" />');
  s=s.replaceAll('<div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/55 to-white/10" />', '<div className="marbnb-clean-hero-overlay" />');
  s=s.replaceAll('<div className="absolute inset-0 bg-gradient-to-t from-[#f4ead7] via-transparent to-black/20" />', '');
  s=s.replaceAll('<div className="absolute inset-0 bg-gradient-to-t from-[#fffdf8] via-transparent to-white/10" />', '');
  s=s.replaceAll('<div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-[#f4ead7]" />', '<div className="marbnb-clean-hero-overlay" />');
  s=s.replaceAll('<div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/45 to-[#fffdf8]" />', '<div className="marbnb-clean-hero-overlay" />');

  // Si le remplacement a créé deux overlays dans la même zone, le CSS ne gêne pas, mais on réduit les doublons exacts.
  s=s.replaceAll('<div className="marbnb-clean-hero-overlay" /> <div className="marbnb-clean-hero-overlay" />', '<div className="marbnb-clean-hero-overlay" />');
  return s;
});

// Patch résultats aussi pour éviter un voile similaire.
patch(files.resultats, (s)=>{
  s=s.replaceAll("from-black/65 via-black/35 to-[#f7efe2]", "from-white/20 via-white/10 to-[#fffdf8]");
  s=s.replaceAll("text-white/90", "text-[#5d513e]");
  s=s.replaceAll("text-white", "text-[#28231d]");
  s=s.replaceAll("drop-shadow", "");
  s=s.replaceAll('className="relative overflow-hidden border-b', 'className="marbnb-clean-hero relative overflow-hidden border-b');
  s=s.replaceAll('<div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-[#f7efe2]" />', '<div className="marbnb-clean-hero-overlay" />');
  s=s.replaceAll('<div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/45 to-[#fffdf8]" />', '<div className="marbnb-clean-hero-overlay" />');
  return s;
});

patch(files.hote, (s)=>{
  s=s.replaceAll("bg-[#1e1b18]", "bg-[#fff8ec]");
  s=s.replaceAll("text-white/85", "text-[#5d513e]");
  s=s.replaceAll("text-white", "text-[#28231d]");
  s=s.replaceAll("bg-white/15", "bg-white/70");
  return s;
});

console.log("\n✅ Marbnb clean light hero V2 installé.");
console.log("Les grandes bandes/nuances horizontales autour du hero sont neutralisées.");
console.log("Étape suivante: npm run build");
