const fs = require("fs");
const path = require("path");

const root = process.cwd();

function backup(file, suffix) {
  if (fs.existsSync(file)) {
    fs.writeFileSync(file + suffix, fs.readFileSync(file, "utf8"), "utf8");
  }
}

const pagePath = path.join(root, "app", "page.tsx");
const cssPath = path.join(root, "app", "globals.css");

// 1) Ajouter une classe au main de la page accueil
if (fs.existsSync(pagePath)) {
  backup(pagePath, ".bak-soft-gradient-bg");

  let code = fs.readFileSync(pagePath, "utf8");
  const before = code;

  if (!code.includes("marbnb-home-soft-gradient")) {
    code = code.replace(
      /<main\s+className="([^"]*)"/,
      '<main className="$1 marbnb-home-soft-gradient"'
    );

    code = code.replace(
      /<main>/,
      '<main className="marbnb-home-soft-gradient">'
    );
  }

  if (code !== before) {
    fs.writeFileSync(pagePath, code, "utf8");
    console.log("OK: app/page.tsx préparé pour le fond dégradé.");
  } else {
    console.log("INFO: app/page.tsx déjà prêt.");
  }
}

// 2) Ajouter le dégradé dans globals.css
if (fs.existsSync(cssPath)) {
  backup(cssPath, ".bak-soft-gradient-bg");

  let css = fs.readFileSync(cssPath, "utf8");

  if (!css.includes("MARBNB_HOME_SOFT_GRADIENT_BG")) {
    css += `

/* MARBNB_HOME_SOFT_GRADIENT_BG */
.marbnb-home-soft-gradient {
  background:
    linear-gradient(
      180deg,
      rgba(255, 248, 236, 0.25) 0%,
      rgba(255, 244, 225, 0.75) 18%,
      rgba(252, 234, 205, 0.95) 42%,
      rgba(250, 225, 188, 0.98) 70%,
      rgba(246, 214, 165, 1) 100%
    ) !important;
  min-height: 100vh;
}

/* Transition douce entre l'image du haut et le contenu */
.marbnb-home-soft-gradient::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 360px;
  height: 280px;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 248, 236, 0) 0%,
    rgba(255, 248, 236, 0.55) 45%,
    rgba(255, 244, 225, 0.96) 100%
  );
  z-index: 0;
}

.marbnb-home-soft-gradient > * {
  position: relative;
  z-index: 1;
}

/* Adoucit les cartes sur le nouveau fond */
.marbnb-home-soft-gradient [class*="bg-white"],
.marbnb-home-soft-gradient [class*="bg-[#fff8ec]"],
.marbnb-home-soft-gradient [class*="bg-[#fffaf2]"] {
  box-shadow: 0 18px 50px rgba(122, 61, 20, 0.08);
}
`;

    fs.writeFileSync(cssPath, css, "utf8");
    console.log("OK: dégradé clair ajouté dans app/globals.css.");
  } else {
    console.log("INFO: le dégradé existe déjà dans globals.css.");
  }
} else {
  console.log("ERREUR: app/globals.css introuvable.");
}

console.log("");
console.log("Terminé ✅");
console.log("Relance maintenant : npm run build");