const fs = require('fs');
const path = require('path');

const root = process.cwd();
const resultsPath = path.join(root, 'app', 'resultats', 'page.tsx');

if (!fs.existsSync(resultsPath)) {
  console.error('ERREUR: fichier introuvable : app/resultats/page.tsx');
  console.error('Lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

let code = fs.readFileSync(resultsPath, 'utf8');

// 1) changer le bouton Actualiser en Rechercher
code = code.split('>Actualiser<').join('>Rechercher<');

// 2) ajouter une fonction date du jour si elle n'existe pas déjà
if (!code.includes('function dateAujourdhuiISO()')) {
  const insertAfter = `function nuitsEntre(a: string, d: string) {
  const diff = Math.round((new Date(d).getTime() - new Date(a).getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}
`;
  const helper = `function nuitsEntre(a: string, d: string) {
  const diff = Math.round((new Date(d).getTime() - new Date(a).getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}

function dateAujourdhuiISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
`;
  code = code.replace(insertAfter, helper);
}

// 3) remplacer l'initialisation de la date départ par la date du jour à l'ouverture de la page
// Anciennes formes possibles
code = code.replace(
  `const [depart, setDepart] = useState(params.get("depart") || "2026-06-22");`,
  `const [depart, setDepart] = useState(dateAujourdhuiISO());`
);
code = code.replace(
  `const [depart, setDepart] = useState(departInitial);`,
  `const [depart, setDepart] = useState(dateAujourdhuiISO());`
);

// 4) si une variable departInitial existe encore et n'est plus utilisée, on la neutralise proprement
code = code.replace(
  `const departInitial = params.get("depart") || "2026-06-22";`,
  `// La date de départ affichée est toujours le jour d'ouverture de la page.`
);

// 5) Le bouton Rechercher doit vraiment relancer l'URL avec les critères actuels au lieu de juste vider le message.
code = code.replace(
  `onClick={() => setMessage("")} className="rounded-2xl bg-[#c1121f] px-6 py-3 font-black text-white md:self-end">Rechercher</button>`,
  `onClick={() => { window.location.href = '/resultats?destination=' + encodeURIComponent(destination) + '&arrivee=' + encodeURIComponent(arrivee) + '&depart=' + encodeURIComponent(depart) + '&voyageurs=' + voyageurs; }} className="rounded-2xl bg-[#c1121f] px-6 py-3 font-black text-white md:self-end">Rechercher</button>`
);

fs.writeFileSync(resultsPath, code, 'utf8');
console.log('OK: bouton Actualiser remplacé par Rechercher.');
console.log('OK: date de départ initialisée au jour J à chaque ouverture de /resultats.');
console.log('Fichier modifié: app/resultats/page.tsx');
