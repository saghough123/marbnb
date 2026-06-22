const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const root = process.cwd();
const SITE_URL = 'https://marbnb-alpha.vercel.app';
const APP_ID = 'com.marbnb.app';
const APP_NAME = 'Marbnb';

function backup(file, suffix) {
  if (fs.existsSync(file)) {
    fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
  }
}

function run(command) {
  console.log('\n> ' + command);
  child_process.execSync(command, { stdio: 'inherit', cwd: root, shell: true });
}

console.log('Préparation application mobile Marbnb Android/iPhone...');
console.log('Site utilisé dans l’application : ' + SITE_URL);

// 1) package.json scripts
const packagePath = path.join(root, 'package.json');
if (!fs.existsSync(packagePath)) {
  console.error('ERREUR: package.json introuvable. Lance ce script dans C:\\Users\\SAGHOUGH\\marbnb');
  process.exit(1);
}

backup(packagePath, '.bak-capacitor-mobile');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mobile:sync'] = 'npx cap sync';
pkg.scripts['mobile:android'] = 'npx cap open android';
pkg.scripts['mobile:ios'] = 'npx cap open ios';
pkg.scripts['mobile:doctor'] = 'npx cap doctor';
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2), 'utf8');
console.log('OK: scripts mobile ajoutés dans package.json');

// 2) Capacitor config
const configPath = path.join(root, 'capacitor.config.ts');
backup(configPath, '.bak-capacitor-mobile');
const config = `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${APP_ID}',
  appName: '${APP_NAME}',
  webDir: 'out',
  server: {
    url: '${SITE_URL}',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#fff8ec',
      showSpinner: false,
    },
  },
};

export default config;
`;
fs.writeFileSync(configPath, config, 'utf8');
console.log('OK: capacitor.config.ts créé');

// 3) Fichier explicatif important
const guide = `# Application mobile Marbnb

## Principe choisi

L'application mobile charge le site officiel :

${SITE_URL}

Donc tu continues à modifier le site comme avant :

- code dans le projet Next.js
- données dans Supabase
- admin Marbnb
- déploiement Vercel

Quand le site est mis à jour sur Vercel, l'application mobile affiche la version mise à jour automatiquement.

## Commandes à lancer

### 1. Installer Capacitor

\`\`\`bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
\`\`\`

### 2. Ajouter Android

\`\`\`bash
npx cap add android
npx cap sync android
npx cap open android
\`\`\`

Ensuite Android Studio s'ouvre.
Pour créer un APK :

\`\`\`text
Android Studio → Build → Generate Signed Bundle / APK
\`\`\`

### 3. Ajouter iPhone / iOS

Important : iOS nécessite un Mac avec Xcode.

Sur Mac :

\`\`\`bash
npx cap add ios
npx cap sync ios
npx cap open ios
\`\`\`

Ensuite Xcode s'ouvre.
Pour envoyer sur App Store, il faut un compte Apple Developer.

## Commandes rapides ajoutées

\`\`\`bash
npm run mobile:sync
npm run mobile:android
npm run mobile:ios
npm run mobile:doctor
\`\`\`

## Notes importantes

- Android peut être préparé sur Windows.
- iPhone nécessite un Mac.
- Le site reste modifiable avec ton lien Vercel/Admin.
- Le nom de l'application est : Marbnb.
- L'identifiant de l'application est : ${APP_ID}.
`;
fs.writeFileSync(path.join(root, 'README_MARBONB_MOBILE.md'), guide, 'utf8');
fs.writeFileSync(path.join(root, 'README_MARBNB_MOBILE.md'), guide, 'utf8');
console.log('OK: guide README_MARBNB_MOBILE.md créé');

// 4) Installation optionnelle automatiquement si l’utilisateur accepte via argument --install.
if (process.argv.includes('--install')) {
  run('npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios');
  console.log('OK: Capacitor installé.');
  console.log('Tu peux maintenant lancer: npx cap add android');
} else {
  console.log('\nInstallation non lancée automatiquement.');
  console.log('Pour installer Capacitor, lance:');
  console.log('npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios');
}

console.log('\nTerminé ✅');
console.log('Prochaine étape recommandée:');
console.log('1) npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios');
console.log('2) npx cap add android');
console.log('3) npx cap sync android');
console.log('4) npx cap open android');
