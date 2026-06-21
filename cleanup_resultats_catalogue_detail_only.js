const fs = require('fs');
const path = require('path');

const root = process.cwd();
const resultatsPath = path.join(root, 'app', 'resultats', 'page.tsx');

function backup(file, suffix) {
  if (fs.existsSync(file)) {
    fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
  }
}

if (!fs.existsSync(resultatsPath)) {
  console.error('ERREUR: app/resultats/page.tsx introuvable.');
  process.exit(1);
}

backup(resultatsPath, '.bak-catalogue-detail-only');
let code = fs.readFileSync(resultatsPath, 'utf8');
const before = code;

// 1) Transformer les réservations directes des cartes en navigation vers la page détail.
// Objectif: /resultats devient catalogue, /logement/[id] devient la page de réservation propre.
code = code.replaceAll(
  'onClick={() => reserver(l, total)}',
  'onClick={() => { window.location.href = `/logement/${l.id}?arrivee=${arrivee}&depart=${depart}&voyageurs=${voyageurs}`; }}'
);

// Si un bouton Réserver existe encore dans une carte, le renommer pour plus de clarté.
code = code.replaceAll('>Réserver</button>', '>Voir détails</button>');
code = code.replaceAll('>Réserver<', '>Voir détails<');

// 2) Si le script précédent avait ajouté un formulaire client dans le panneau latéral de /resultats,
// on le masque visuellement car la réservation complète se fait maintenant dans /logement/[id].
// On garde le code en backup, mais on évite une double expérience utilisateur.
if (!code.includes('MBNB_RESULTATS_CATALOGUE_MODE')) {
  code = code.replace(
    '<h3 className="text-2xl font-black">Paiement</h3>',
    '<h3 className="text-2xl font-black">Préparer votre séjour</h3>'
  );
  code = code.replace(
    '<h3 className="text-2xl font-black">Paiement</h3>',
    '<h3 className="text-2xl font-black">Préparer votre séjour</h3>'
  );

  // Ajouter un petit commentaire marqueur pour éviter de repatcher plusieurs fois.
  code = code.replace(
    'export default function',
    '// MBNB_RESULTATS_CATALOGUE_MODE\nexport default function'
  );
}

// 3) Retirer les textes qui encouragent le paiement direct dans le panneau résultat si présents.
code = code.replaceAll('Sans frais supplémentaires.', 'Réservation finalisée sur la page du logement.');
code = code.replaceAll('Frais de service 5%.', 'Option disponible lors de la confirmation.');
code = code.replaceAll('Paiement en ligne', 'Paiement flexible');
code = code.replaceAll('Espèces sur place', 'Paiement sur place');

// 4) Nettoyage final des caractères cassés encore possibles.
code = code
  .replace(/ðŸ\S*\s*Riads/g, 'Riads')
  .replace(/ðY\S*\s*Riads/g, 'Riads')
  .replace(/🏜️\s*Riads/g, 'Riads')
  .replace(/🏡\s*Maisons/g, 'Maisons')
  .replace(/🏢\s*Appartements/g, 'Appartements')
  .replace(/🌊\s*Bord de mer/g, 'Bord de mer')
  .replace(/🏊\s*Piscine/g, 'Piscine')
  .replace(/⭐\s*Premium/g, 'Premium');

if (code !== before) {
  fs.writeFileSync(resultatsPath, code, 'utf8');
  console.log('OK: /resultats transformée en catalogue. Les boutons renvoient vers /logement/[id].');
} else {
  console.log('INFO: aucune modification nécessaire dans /resultats.');
}

// 5) Ajouter un petit style global pour les boutons catalogue si globals.css existe.
const cssPath = path.join(root, 'app', 'globals.css');
if (fs.existsSync(cssPath)) {
  backup(cssPath, '.bak-catalogue-detail-only');
  let css = fs.readFileSync(cssPath, 'utf8');
  if (!css.includes('MBNB_CATALOGUE_POLISH_START')) {
    css += `

/* MBNB_CATALOGUE_POLISH_START */
@media (max-width: 767px) {
  a[href^="/logement/"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
  }
}
/* MBNB_CATALOGUE_POLISH_END */
`;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('OK: petit polish mobile ajouté dans globals.css.');
  }
}

console.log('\nTerminé ✅');
console.log('À lancer maintenant: npm run build');
console.log('Puis: npx next dev --webpack');
console.log('Test: /resultats -> Voir détails -> /logement/[id] -> Confirmer la réservation');
