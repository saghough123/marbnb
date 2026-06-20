const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pagePath = path.join(root, 'app', 'page.tsx');

if (!fs.existsSync(pagePath)) {
  console.error('ERREUR: app/page.tsx introuvable. Lance ce script depuis C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

let code = fs.readFileSync(pagePath, 'utf8');
const before = code;

// Objectif : supprimer complètement la barre/menu mobile-desktop qui contient :
// Séjours / Expériences / Devenir hôte / À propos
// On remplace la barre par rien pour éviter qu'elle soit inaccessible sur mobile.

const labels = ['Séjours', 'Expériences', 'Devenir hôte', 'À propos'];

function containsAllLabels(txt) {
  return labels.every(label => txt.includes(label));
}

// 1) Suppression des balises nav complètes contenant les quatre libellés.
let changed = true;
while (changed) {
  changed = false;
  code = code.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g, (match) => {
    if (containsAllLabels(match)) {
      changed = true;
      return '';
    }
    return match;
  });
}

// 2) Suppression des div complètes contenant les quatre libellés.
changed = true;
while (changed) {
  changed = false;
  code = code.replace(/<div\b[^>]*>[\s\S]*?<\/div>/g, (match) => {
    if (containsAllLabels(match) && match.length < 5000) {
      changed = true;
      return '';
    }
    return match;
  });
}

// 3) Suppression ciblée des boutons/liens seuls si le conteneur n'a pas été supprimé.
for (const label of labels) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const buttonRegex = new RegExp(`<button[^>]*>\\s*${escaped}\\s*<\\/button>`, 'g');
  const linkRegex = new RegExp(`<a[^>]*>\\s*${escaped}\\s*<\\/a>`, 'g');
  code = code.replace(buttonRegex, '');
  code = code.replace(linkRegex, '');
}

// 4) Nettoyage des barres vides possibles créées par la suppression.
code = code.replace(/<div className="[^"]*(?:border-b|sticky|backdrop)[^"]*">\s*<\/div>/g, '');
code = code.replace(/<nav className="[^"]*">\s*<\/nav>/g, '');

// 5) Sécurité : garder Mbnb au lieu de Marbnb si des anciens textes reviennent.
code = code.split('Marbnb').join('Mbnb');
code = code.replace('>Mar</span><span', '>M</span><span');

if (code !== before) {
  fs.writeFileSync(pagePath + '.bak-menu-supprime', before, 'utf8');
  fs.writeFileSync(pagePath, code, 'utf8');
  console.log('OK: menu Séjours / Expériences / Devenir hôte / À propos supprimé.');
  console.log('Backup créé: app/page.tsx.bak-menu-supprime');
} else {
  console.log('Aucune modification détectée. Le menu a peut-être une structure très différente.');
  console.log('Solution manuelle: cherche "Séjours" dans app/page.tsx et supprime le bloc qui contient aussi Expériences, Devenir hôte, À propos.');
}
