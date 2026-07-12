/*
  Marbnb fix detail logement UUID
  Corrige l'erreur "Identifiant logement invalide" quand l'id logement est un UUID.

  Usage:
    node marbnb-fix-logement-uuid.js
    npm run build
    git add . && git commit -m "Fix logement detail UUID" && git push
*/
const fs = require("fs");
const path = require("path");
const root = process.cwd();

function exists(p){ return fs.existsSync(path.join(root,p)); }
function read(p){ return fs.readFileSync(path.join(root,p), "utf8"); }
function write(p,c){ fs.writeFileSync(path.join(root,p), c, "utf8"); console.log("[OK] corrigé : " + p); }
function first(candidates){ return candidates.find(exists); }

const file = first([
  "app/logement/[id]/page.tsx",
  "src/app/logement/[id]/page.tsx",
  "app/logement/[id].tsx",
]);

if (!file) {
  console.error("[ERREUR] Fichier détail logement introuvable. Vérifie le chemin app/logement/[id]/page.tsx");
  process.exit(1);
}

let s = read(file);

// 1) Type id compatible number ou UUID/string
s = s.replace(/id:\s*number;/g, "id: number | string;");

// 2) Ne plus convertir params.id en Number, car Supabase peut utiliser un UUID.
s = s.replace(
  "const logementId = Number(params.id);",
  "const logementId = params.id;"
);

// 3) Si le code contient encore une validation Number.isFinite(logementId), on la remplace par une validation string.
s = s.replace(
  /if \(Number\.isFinite\(logementId\)\) chargerLogement\(\);\s*else \{\s*setErreur\("Identifiant logement invalide\."\);\s*setLoading\(false\);\s*\}/s,
  "if (logementId && String(logementId).trim()) chargerLogement();\n    else {\n      setErreur(\"Identifiant logement invalide.\");\n      setLoading(false);\n    }"
);

// 4) Sécurité : si le replacement regex n'a pas trouvé, corrige un bloc courant manuellement.
s = s.replace(
  "if (Number.isFinite(logementId)) chargerLogement();\n    else {\n      setErreur(\"Identifiant logement invalide.\");\n      setLoading(false);\n    }",
  "if (logementId && String(logementId).trim()) chargerLogement();\n    else {\n      setErreur(\"Identifiant logement invalide.\");\n      setLoading(false);\n    }"
);

// 5) Corriger aussi des éventuelles comparaisons ou URL qui supposeraient un number.
s = s.replace(/Number\.isFinite\(logementId\)/g, "Boolean(logementId && String(logementId).trim())");

write(file, s);
console.log("\n✅ Correction terminée : les détails logement acceptent maintenant les ID UUID comme 57405435-00b7-4ee2-b4b5-add7cddc174a.");
console.log("Étape suivante : npm run build");
