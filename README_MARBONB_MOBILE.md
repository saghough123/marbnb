# Application mobile Marbnb

## Principe choisi

L'application mobile charge le site officiel :

https://marbnb-alpha.vercel.app

Donc tu continues à modifier le site comme avant :

- code dans le projet Next.js
- données dans Supabase
- admin Marbnb
- déploiement Vercel

Quand le site est mis à jour sur Vercel, l'application mobile affiche la version mise à jour automatiquement.

## Commandes à lancer

### 1. Installer Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
```

### 2. Ajouter Android

```bash
npx cap add android
npx cap sync android
npx cap open android
```

Ensuite Android Studio s'ouvre.
Pour créer un APK :

```text
Android Studio → Build → Generate Signed Bundle / APK
```

### 3. Ajouter iPhone / iOS

Important : iOS nécessite un Mac avec Xcode.

Sur Mac :

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

Ensuite Xcode s'ouvre.
Pour envoyer sur App Store, il faut un compte Apple Developer.

## Commandes rapides ajoutées

```bash
npm run mobile:sync
npm run mobile:android
npm run mobile:ios
npm run mobile:doctor
```

## Notes importantes

- Android peut être préparé sur Windows.
- iPhone nécessite un Mac.
- Le site reste modifiable avec ton lien Vercel/Admin.
- Le nom de l'application est : Marbnb.
- L'identifiant de l'application est : com.marbnb.app.
