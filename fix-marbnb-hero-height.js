// fix-marbnb-hero-height.js
// Script JavaScript sécurisé pour remonter le contenu sur Accueil et Explorer/Résultats.
// À placer dans : C:\Users\SAGHOUGH\marbnb
// À lancer avec : node fix-marbnb-hero-height.js

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const homeFile = path.join(root, "app", "page.tsx");
const resultatsFile = path.join(root, "app", "resultats", "page.tsx");

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function backup(file) {
  if (!fs.existsSync(file)) return;
  const backupFile = `${file}.bak-js-hero-${timestamp()}`;
  fs.copyFileSync(file, backupFile);
  console.log(`[OK] Sauvegarde créée : ${backupFile}`);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

function replaceAll(content, from, to) {
  return content.split(from).join(to);
}

function patchHome() {
  if (!fs.existsSync(homeFile)) {
    console.log("[INFO] app/page.tsx introuvable, accueil ignoré.");
    return;
  }

  backup(homeFile);
  let content = read(homeFile);
  const before = content;

  // Correctifs ciblés uniquement : on évite de toucher à la structure JS/TSX.
  // Grande section hero d'accueil.
  content = replaceAll(
    content,
    'className="relative min-h-[720px] overflow-hidden border-b border-[#e5d3b3]"',
    'className="relative min-h-[520px] overflow-hidden border-b border-[#e5d3b3]"'
  );

  // Conteneur interne du hero accueil.
  content = replaceAll(
    content,
    'className="relative z-30 mx-auto flex min-h-[720px] max-w-7xl items-center px-4 pb-16 pt-[175px] md:py-16"',
    'className="relative z-30 mx-auto flex min-h-[520px] max-w-7xl items-center px-4 pb-8 pt-12 md:py-10"'
  );

  // Deuxième hero/section accueil si présent.
  content = replaceAll(
    content,
    'className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 md:pt-24"',
    'className="relative mx-auto max-w-7xl px-4 pb-8 pt-8 md:pt-10"'
  );

  // Barre de recherche moins basse.
  content = replaceAll(content, 'className="mt-10 max-w-6xl', 'className="mt-5 max-w-6xl');

  // Ne pas ajouter de commentaires au milieu du code minifié : cela peut casser ton fichier actuel.
  if (content !== before) {
    write(homeFile, content);
    console.log("[OK] Accueil corrigé : photo moins haute et contenu remonté.");
  } else {
    console.log("[INFO] Accueil : aucun modèle exact trouvé. Aucun changement appliqué.");
  }
}

function patchResultats() {
  if (!fs.existsSync(resultatsFile)) {
    console.log("[INFO] app/resultats/page.tsx introuvable, résultats ignoré.");
    return;
  }

  backup(resultatsFile);
  let content = read(resultatsFile);
  const before = content;

  // Hero résultats / explorer : réduction ciblée.
  content = replaceAll(
    content,
    'className="relative overflow-hidden border-b border-[#ead9ba]"',
    'className="relative max-h-[560px] overflow-hidden border-b border-[#ead9ba]"'
  );

  content = replaceAll(
    content,
    'className="relative overflow-hidden"',
    'className="relative max-h-[560px] overflow-hidden"'
  );

  content = replaceAll(
    content,
    'className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:pb-16 md:pt-16"',
    'className="relative mx-auto max-w-7xl px-4 pb-6 pt-8 md:pb-8 md:pt-10"'
  );

  content = replaceAll(
    content,
    'className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 md:pb-16 md:pt-20"',
    'className="relative mx-auto max-w-7xl px-4 pb-6 pt-8 md:pb-8 md:pt-10"'
  );

  content = replaceAll(content, 'className="mt-8 rounded-[2rem]', 'className="mt-5 rounded-[2rem]');
  content = replaceAll(content, 'className="mt-5 flex flex-wrap gap-3"', 'className="mt-3 flex flex-wrap gap-3"');

  // Taille titre moins énorme.
  content = replaceAll(
    content,
    'className="mt-5 text-4xl font-black tracking-tight text-white drop-shadow md:text-6xl"',
    'className="mt-4 text-3xl font-black tracking-tight text-white drop-shadow md:text-5xl"'
  );

  content = replaceAll(
    content,
    'className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-white drop-shadow md:text-7xl"',
    'className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-white drop-shadow md:text-5xl"'
  );

  // Sécurité si le patch est lancé plusieurs fois.
  content = replaceAll(content, 'relative max-h-[560px] max-h-[560px] overflow-hidden', 'relative max-h-[560px] overflow-hidden');

  if (content !== before) {
    write(resultatsFile, content);
    console.log("[OK] Explorer/Résultats corrigé : photo moins haute et contenu remonté.");
  } else {
    console.log("[INFO] Résultats : aucun modèle exact trouvé. Aucun changement appliqué.");
  }
}

console.log("=== Correction Marbnb hero height JS ===");
console.log(`Dossier courant : ${root}`);
patchHome();
patchResultats();
console.log("");
console.log("Terminé.");
console.log("Lance maintenant :");
console.log("  rmdir /s /q .next");
console.log("  npm run dev");
console.log("Puis teste : http://localhost:3000 et http://localhost:3000/resultats");
