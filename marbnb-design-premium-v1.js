/*
  Marbnb Premium Design Script V1
  Objectif : donner à Marbnb une identité "Airbnb x Maroc Premium"
  sans casser la logique Supabase existante.

  Usage :
    1) Copier ce fichier à la racine du projet : C:\Users\SAGHOUGH\marbnb
    2) Lancer : node marbnb-design-premium-v1.js
    3) Tester : npm run build
    4) Publier : git add . && git commit -m "Premium Moroccan design" && git push
*/

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function write(p, content) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), content, "utf8");
  console.log("[OK] écrit : " + p);
}

function patch(p, callback) {
  if (!exists(p)) {
    console.log("[INFO] fichier absent, ignoré : " + p);
    return;
  }
  const before = read(p);
  const after = callback(before);
  if (after !== before) write(p, after);
  else console.log("[OK] déjà traité : " + p);
}

function firstExisting(candidates) {
  return candidates.find(exists) || null;
}

const files = {
  globals: firstExisting(["app/globals.css", "src/app/globals.css"]),
  home: firstExisting(["app/page.tsx", "src/app/page.tsx"]),
  resultats: firstExisting(["app/resultats/page.tsx", "src/app/resultats/page.tsx", "app/sesultats/page.tsx"]),
  logement: firstExisting(["app/logement/[id]/page.tsx", "src/app/logement/[id]/page.tsx"]),
  hote: firstExisting(["app/hote/page.tsx", "src/app/hote/page.tsx"]),
  dashboard: firstExisting(["app/admin-dashboard/page.tsx", "src/app/admin-dashboard/page.tsx"]),
  demandes: firstExisting(["app/admin-demandes/page.tsx", "src/app/admin-demandes/page.tsx"]),
};

if (!files.globals) {
  write("app/globals.css", "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");
  files.globals = "app/globals.css";
}

const premiumCssPath = "app/marbnb-premium.css";

const premiumCss = String.raw`/* MARBNB_PREMIUM_DESIGN_V1
   Identité : Airbnb moderne + Maroc premium.
   Palette : noir impérial, or marocain, sable, terracotta, vert oasis.
*/

:root {
  --marbnb-black: #14110f;
  --marbnb-black-soft: #1e1b18;
  --marbnb-gold: #c59b54;
  --marbnb-gold-light: #f2d79a;
  --marbnb-sand: #f4ead7;
  --marbnb-cream: #fff8ec;
  --marbnb-terracotta: #b85c38;
  --marbnb-oasis: #3f7d3b;
  --marbnb-oasis-dark: #2f6f34;
  --marbnb-red: #c1121f;
  --marbnb-ink-muted: #7a6446;
}

html {
  scroll-behavior: smooth;
}

body {
  background:
    radial-gradient(circle at 12% 10%, rgba(197, 155, 84, 0.18), transparent 28rem),
    radial-gradient(circle at 90% 16%, rgba(63, 125, 59, 0.11), transparent 24rem),
    linear-gradient(135deg, #fff8ec 0%, #f4ead7 42%, #ead7b5 100%) !important;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  opacity: 0.17;
  background-image:
    linear-gradient(30deg, rgba(197, 155, 84, 0.18) 12%, transparent 12.5%, transparent 87%, rgba(197, 155, 84, 0.18) 87.5%, rgba(197, 155, 84, 0.18)),
    linear-gradient(150deg, rgba(197, 155, 84, 0.18) 12%, transparent 12.5%, transparent 87%, rgba(197, 155, 84, 0.18) 87.5%, rgba(197, 155, 84, 0.18)),
    linear-gradient(30deg, rgba(197, 155, 84, 0.18) 12%, transparent 12.5%, transparent 87%, rgba(197, 155, 84, 0.18) 87.5%, rgba(197, 155, 84, 0.18)),
    linear-gradient(150deg, rgba(197, 155, 84, 0.18) 12%, transparent 12.5%, transparent 87%, rgba(197, 155, 84, 0.18) 87.5%, rgba(197, 155, 84, 0.18));
  background-size: 72px 126px;
  background-position: 0 0, 0 0, 36px 63px, 36px 63px;
}

/* Hero premium */
.marbnb-premium-hero,
section:has(.marbnb-premium-signature) {
  position: relative;
  overflow: hidden;
}

.marbnb-premium-hero::after,
section:has(.marbnb-premium-signature)::after {
  content: "";
  position: absolute;
  inset: auto -10% -45% -10%;
  height: 70%;
  background: radial-gradient(circle at center, rgba(197, 155, 84, 0.30), transparent 68%);
  pointer-events: none;
}

.marbnb-premium-signature {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.26);
  background: linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08));
  color: white;
  box-shadow: 0 18px 60px rgba(0,0,0,0.26);
  backdrop-filter: blur(16px);
}

.marbnb-premium-signature::before {
  content: "✦";
  color: var(--marbnb-gold-light);
}

/* Cartes façon riad moderne */
.marbnb-card-premium,
article.rounded-\[2rem\],
.rounded-\[2rem\].bg-\[\#fff8ec\],
.rounded-3xl.bg-white {
  border: 1px solid rgba(197, 155, 84, 0.28) !important;
  box-shadow: 0 18px 55px rgba(40, 26, 12, 0.09) !important;
  transition: transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease;
}

article.rounded-\[2rem\]:hover,
.marbnb-card-premium:hover {
  transform: translateY(-7px);
  border-color: rgba(197, 155, 84, 0.55) !important;
  box-shadow: 0 26px 80px rgba(40, 26, 12, 0.18) !important;
}

/* Images plus premium */
article img,
.marbnb-premium-image {
  filter: saturate(1.04) contrast(1.03);
}

article:hover img {
  transform: scale(1.035);
}

article img {
  transition: transform 550ms ease, filter 550ms ease;
}

/* Boutons */
a[class*="bg-[#c1121f]"],
button[class*="bg-[#c1121f]"],
a[class*="bg-\[\#c1121f\]"],
button[class*="bg-\[\#c1121f\]"],
a[class*="bg-[#3F7D3B]"],
button[class*="bg-[#3F7D3B]"],
a[class*="bg-\[\#3F7D3B\]"],
button[class*="bg-\[\#3F7D3B\]"] {
  background-image: linear-gradient(135deg, var(--marbnb-black), var(--marbnb-terracotta) 52%, var(--marbnb-gold)) !important;
  box-shadow: 0 14px 34px rgba(184, 92, 56, 0.26);
  transition: transform 220ms ease, box-shadow 220ms ease, filter 220ms ease;
}

a[class*="bg-[#c1121f]"]:hover,
button[class*="bg-[#c1121f]"]:hover,
a[class*="bg-\[\#c1121f\]"]:hover,
button[class*="bg-\[\#c1121f\]"]:hover,
a[class*="bg-[#3F7D3B]"]:hover,
button[class*="bg-[#3F7D3B]"]:hover,
a[class*="bg-\[\#3F7D3B\]"]:hover,
button[class*="bg-\[\#3F7D3B\]"]:hover {
  transform: translateY(-2px);
  filter: brightness(1.04);
  box-shadow: 0 20px 48px rgba(184, 92, 56, 0.32);
}

/* Champs de recherche façon Airbnb premium */
input,
select,
textarea {
  border-color: rgba(197, 155, 84, 0.38) !important;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--marbnb-gold) !important;
  box-shadow: 0 0 0 4px rgba(197, 155, 84, 0.15) !important;
}

/* Badges */
.marbnb-luxe-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 900;
  color: #3d2911;
  background: linear-gradient(135deg, #fff8ec, #f2d79a);
  border: 1px solid rgba(197, 155, 84, 0.55);
  box-shadow: 0 10px 28px rgba(197, 155, 84, 0.23);
}

.marbnb-luxe-badge::before {
  content: "◆";
  color: var(--marbnb-terracotta);
}

/* Ligne destinations */
.marbnb-city-pill {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.marbnb-city-pill::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.22), transparent 55%);
  z-index: -1;
}

/* Apparition élégante */
@keyframes marbnbFadeUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

main section,
article,
aside {
  animation: marbnbFadeUp 520ms ease both;
}

/* Mobile : garder fluide */
@media (max-width: 768px) {
  article.rounded-\[2rem\]:hover,
  .marbnb-card-premium:hover {
    transform: none;
  }

  body::before {
    opacity: 0.10;
    background-size: 56px 98px;
  }
}
`;

write(premiumCssPath, premiumCss);

// Import CSS premium tout en bas de globals pour qu'il domine Tailwind.
patch(files.globals, (s) => {
  if (!s.includes('marbnb-premium.css')) {
    return s.trimEnd() + '\n\n@import "./marbnb-premium.css";\n';
  }
  return s;
});

// HOME : signature + texte plus premium + classes spéciales si possible.
if (files.home) {
  patch(files.home, (s) => {
    s = s.replaceAll("Marbnb · Experience Maroc", "Marbnb · Expérience Maroc");
    s = s.replaceAll("Bienvenue au Maroc.", "Le Maroc, réservé autrement.");
    s = s.replaceAll(
      "Trouvez un riad, appartement, villa ou studio avec une expérience inspirée des portes marocaines traditionnelles.",
      "Riads d’exception, villas privées et appartements sélectionnés avec une identité marocaine premium."
    );
    s = s.replaceAll(
      "Vivez le Maroc, réservez votre logement autrement.",
      "Vivez le Maroc comme une expérience privée."
    );
    s = s.replaceAll(
      "Riads, appartements, villas et studios avec disponibilité claire, paiement flexible et identité marocaine chaleureuse.",
      "Une sélection de logements inspirée des riads, du zellige et de l’art de recevoir marocain, avec une réservation simple et moderne."
    );
    s = s.replaceAll("Marbnb · Séjours au Maroc", "Marbnb · Luxury Moroccan Stays");
    s = s.replaceAll(
      "inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-black text-white backdrop-blur",
      "marbnb-premium-signature rounded-full px-4 py-2 text-sm font-black backdrop-blur"
    );
    s = s.replaceAll(
      "inline-flex rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur",
      "marbnb-premium-signature rounded-full px-4 py-2 text-sm font-bold backdrop-blur"
    );
    s = s.replaceAll("className=\"relative min-h-[720px]", "className=\"marbnb-premium-hero relative min-h-[720px]");
    s = s.replaceAll("rounded-[2rem] bg-[#fff8ec] shadow-sm", "marbnb-card-premium rounded-[2rem] bg-[#fff8ec] shadow-sm");
    s = s.replaceAll("rounded-full bg-[#3F7D3B]", "marbnb-city-pill rounded-full bg-[#3F7D3B]");
    return s;
  });
}

// RESULTATS : wording + badges + image réelle déjà protégée.
if (files.resultats) {
  patch(files.resultats, (s) => {
    s = s.replaceAll("Trouver le logement idéal pour votre expérience au Maroc.", "Trouvez votre adresse d’exception au Maroc.");
    s = s.replaceAll(
      "Villas, riads, studios et appartements vérifiés, avec paiement flexible et réservation simple.",
      "Riads lumineux, villas privées, studios design et appartements vérifiés dans une atmosphère marocaine premium."
    );
    s = s.replaceAll("Marbnb · Séjours au Maroc", "Marbnb · Luxury Moroccan Stays");
    s = s.replaceAll("Meilleures options", "Sélection premium");
    s = s.replaceAll("Sélection personnalisée selon vos dates, voyageurs et budget.", "Des logements choisis pour leur confort, leur style et leur emplacement.");
    s = s.replaceAll("Coup de cœur", "Coup de cœur Marbnb");
    s = s.replaceAll("className=\"inline-flex rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-bold text-white shadow backdrop-blur\"", "className=\"marbnb-premium-signature rounded-full px-4 py-2 text-sm font-bold shadow backdrop-blur\"");
    s = s.replaceAll("className=\"group overflow-hidden rounded-[2rem]", "className=\"marbnb-card-premium group overflow-hidden rounded-[2rem]");
    s = s.replace(
      "const imagePrincipale = getLogementFallbackImage(index);",
      "const imagePrincipale = photosBase[0] || l.image_url || getLogementFallbackImage(index);"
    );
    return s;
  });
}

// DETAIL LOGEMENT : wording expérience + carte réservation premium.
if (files.logement) {
  patch(files.logement, (s) => {
    s = s.replaceAll("Marbnb vérifié", "Signature Marbnb");
    s = s.replaceAll("Séjour premium", "Expérience premium");
    s = s.replaceAll("À propos de ce logement", "Une expérience à vivre");
    s = s.replaceAll("Équipements populaires", "Confort & art de vivre");
    s = s.replaceAll("Support Marbnb", "Conciergerie Marbnb");
    s = s.replaceAll("Arrivée flexible", "Accueil flexible");
    s = s.replaceAll("className=\"h-fit rounded-[2rem] bg-[#fff8ec]", "className=\"marbnb-card-premium h-fit rounded-[2rem] bg-[#fff8ec]");
    s = s.replaceAll("className=\"rounded-[2rem] bg-[#fff8ec]", "className=\"marbnb-card-premium rounded-[2rem] bg-[#fff8ec]");
    return s;
  });
}

// HOTE : wording plus premium.
if (files.hote) {
  patch(files.hote, (s) => {
    s = s.replaceAll("Devenir hôte Marbnb", "Devenir hôte premium Marbnb");
    s = s.replaceAll("Publier mon logement", "Proposer mon adresse d’exception");
    s = s.replaceAll(
      "Ajoute les informations essentielles, sélectionne les équipements et envoie tes photos. La demande sera ensuite vérifiée dans l’espace Admin.",
      "Présente ton logement avec ses équipements, ses photos et son charme. Marbnb vérifie ensuite la demande avant publication."
    );
    s = s.replaceAll("Envoyer ma demande", "Envoyer pour validation premium");
    s = s.replaceAll("className=\"rounded-[2rem] bg-white", "className=\"marbnb-card-premium rounded-[2rem] bg-white");
    return s;
  });
}

// Admin : design plus propre sans changer logique.
for (const key of ["dashboard", "demandes"]) {
  if (files[key]) {
    patch(files[key], (s) => {
      s = s.replaceAll("Admin Marbnb", "Admin Marbnb Premium");
      s = s.replaceAll("className=\"rounded-3xl bg-white", "className=\"marbnb-card-premium rounded-3xl bg-white");
      s = s.replaceAll("className=\"mt-5 rounded-[2rem] bg-[#fff8ec]", "className=\"marbnb-card-premium mt-5 rounded-[2rem] bg-[#fff8ec]");
      return s;
    });
  }
}

console.log("\n✅ Design premium Marbnb installé.");
console.log("Ce script ajoute : palette luxe, motif zellige discret, cartes premium, animations, boutons dorés, wording plus marocain.");
console.log("Étape suivante : npm run build");
console.log("Si le build est OK : git add . && git commit -m \"Premium Moroccan design\" && git push");
