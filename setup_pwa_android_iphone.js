const fs = require('fs');
const path = require('path');
const root = process.cwd();
function backup(file, suffix) { if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8'); }

const publicDir = path.join(root, 'public');
const componentsDir = path.join(root, 'components');
fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(componentsDir, { recursive: true });

// Logo app: utiliser le logo existant si présent.
const possibleLogos = [path.join(publicDir, 'mbnb-logo.png'), path.join(root, 'logo.png'), path.join(publicDir, 'logo.png'), path.join(root, 'image.png')];
const logo = possibleLogos.find((p) => fs.existsSync(p));
if (logo) {
  fs.copyFileSync(logo, path.join(publicDir, 'mbnb-logo.png'));
  fs.copyFileSync(logo, path.join(publicDir, 'apple-touch-icon.png'));
  console.log('OK: icônes application préparées.');
} else {
  console.log('ATTENTION: aucun logo trouvé. Mets logo.png dans le projet pour une icône app propre.');
}

fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), "{\n  \"name\": \"Mbnb - S\u00e9jours authentiques au Maroc\",\n  \"short_name\": \"Mbnb\",\n  \"description\": \"R\u00e9servez des logements authentiques au Maroc.\",\n  \"start_url\": \"/\",\n  \"scope\": \"/\",\n  \"display\": \"standalone\",\n  \"orientation\": \"portrait\",\n  \"background_color\": \"#fff8ec\",\n  \"theme_color\": \"#0f2f22\",\n  \"categories\": [\n    \"travel\",\n    \"lifestyle\"\n  ],\n  \"icons\": [\n    {\n      \"src\": \"/mbnb-logo.png\",\n      \"sizes\": \"192x192\",\n      \"type\": \"image/png\",\n      \"purpose\": \"any maskable\"\n    },\n    {\n      \"src\": \"/mbnb-logo.png\",\n      \"sizes\": \"512x512\",\n      \"type\": \"image/png\",\n      \"purpose\": \"any maskable\"\n    }\n  ]\n}", 'utf8');
fs.writeFileSync(path.join(publicDir, 'sw.js'), "const CACHE_NAME = \"mbnb-cache-v1\";\nconst STATIC_ASSETS = [\n  \"/\",\n  \"/resultats\",\n  \"/favoris\",\n  \"/compte\",\n  \"/manifest.webmanifest\",\n  \"/mbnb-logo.png\"\n];\n\nself.addEventListener(\"install\", (event) => {\n  event.waitUntil(\n    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => undefined))\n  );\n  self.skipWaiting();\n});\n\nself.addEventListener(\"activate\", (event) => {\n  event.waitUntil(\n    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))\n  );\n  self.clients.claim();\n});\n\nself.addEventListener(\"fetch\", (event) => {\n  const request = event.request;\n  if (request.method !== \"GET\") return;\n\n  const url = new URL(request.url);\n  if (url.origin !== self.location.origin) return;\n\n  // Pages: network first, cache fallback.\n  if (request.mode === \"navigate\") {\n    event.respondWith(\n      fetch(request)\n        .then((response) => {\n          const copy = response.clone();\n          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));\n          return response;\n        })\n        .catch(() => caches.match(request).then((cached) => cached || caches.match(\"/\")))\n    );\n    return;\n  }\n\n  // Assets: cache first, network fallback.\n  event.respondWith(\n    caches.match(request).then((cached) => {\n      if (cached) return cached;\n      return fetch(request).then((response) => {\n        const copy = response.clone();\n        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));\n        return response;\n      });\n    })\n  );\n});\n", 'utf8');
console.log('OK: manifest.webmanifest et sw.js créés.');

fs.writeFileSync(path.join(componentsDir, 'ServiceWorkerRegister.tsx'), "\"use client\";\n\nimport { useEffect } from \"react\";\n\nexport default function ServiceWorkerRegister() {\n  useEffect(() => {\n    if (typeof window === \"undefined\") return;\n    if (!(\"serviceWorker\" in navigator)) return;\n\n    window.addEventListener(\"load\", () => {\n      navigator.serviceWorker.register(\"/sw.js\").catch(() => undefined);\n    });\n  }, []);\n\n  return null;\n}\n", 'utf8');
fs.writeFileSync(path.join(componentsDir, 'PwaInstallPrompt.tsx'), "\"use client\";\n\nimport { useEffect, useState } from \"react\";\n\ntype BeforeInstallPromptEvent = Event & {\n  prompt: () => Promise<void>;\n  userChoice: Promise<{ outcome: \"accepted\" | \"dismissed\" }>;\n};\n\nfunction isStandalone() {\n  if (typeof window === \"undefined\") return false;\n  return window.matchMedia(\"(display-mode: standalone)\").matches || (navigator as any).standalone === true;\n}\n\nexport default function PwaInstallPrompt() {\n  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);\n  const [visible, setVisible] = useState(false);\n  const [isIos, setIsIos] = useState(false);\n\n  useEffect(() => {\n    const userAgent = window.navigator.userAgent.toLowerCase();\n    const ios = /iphone|ipad|ipod/.test(userAgent);\n    setIsIos(ios);\n\n    if (isStandalone()) return;\n\n    const dismissed = localStorage.getItem(\"mbnb_pwa_dismissed\") === \"true\";\n    if (!dismissed) setVisible(true);\n\n    const handler = (event: Event) => {\n      event.preventDefault();\n      setDeferredPrompt(event as BeforeInstallPromptEvent);\n      setVisible(true);\n    };\n\n    window.addEventListener(\"beforeinstallprompt\", handler);\n    return () => window.removeEventListener(\"beforeinstallprompt\", handler);\n  }, []);\n\n  async function install() {\n    if (!deferredPrompt) return;\n    await deferredPrompt.prompt();\n    await deferredPrompt.userChoice;\n    setDeferredPrompt(null);\n    setVisible(false);\n  }\n\n  function close() {\n    localStorage.setItem(\"mbnb_pwa_dismissed\", \"true\");\n    setVisible(false);\n  }\n\n  if (!visible || isStandalone()) return null;\n\n  return (\n    <div className=\"fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-xl rounded-[1.5rem] bg-[#fff8ec] p-4 shadow-2xl ring-1 ring-[#e5d3b3] md:left-auto md:right-5 md:w-[420px]\">\n      <div className=\"flex gap-3\">\n        <img src=\"/mbnb-logo.png\" alt=\"Logo Mbnb\" className=\"h-12 w-12 rounded-xl object-contain\" />\n        <div className=\"flex-1\">\n          <p className=\"font-black text-[#0f2f22]\">Installer l’application Mbnb</p>\n          {isIos ? (\n            <p className=\"mt-1 text-sm text-[#7a6446]\">Sur iPhone : touchez Partager puis “Ajouter à l’écran d’accueil”.</p>\n          ) : (\n            <p className=\"mt-1 text-sm text-[#7a6446]\">Ajoutez Mbnb sur votre écran d’accueil comme une application.</p>\n          )}\n          <div className=\"mt-3 flex flex-wrap gap-2\">\n            {!isIos && deferredPrompt && <button onClick={install} className=\"rounded-full bg-[#0f2f22] px-4 py-2 text-sm font-black text-white\">Installer</button>}\n            <a href=\"/installation\" className=\"rounded-full bg-white px-4 py-2 text-sm font-black text-[#7a3d14] ring-1 ring-[#e5d3b3]\">Guide</a>\n            <button onClick={close} className=\"rounded-full px-4 py-2 text-sm font-black text-[#7a6446]\">Plus tard</button>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}\n", 'utf8');
console.log('OK: composants PWA créés.');

// Page installation
const installDir = path.join(root, 'app', 'installation');
fs.mkdirSync(installDir, { recursive: true });
fs.writeFileSync(path.join(installDir, 'page.tsx'), "\"use client\";\n\nexport default function InstallationPage() {\n  return (\n    <main className=\"min-h-screen bg-[#f4ead7] px-4 py-8 text-[#1e1b18]\">\n      <section className=\"mx-auto max-w-4xl rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3] md:p-8\">\n        <p className=\"font-black text-[#c1121f]\">Application Mbnb</p>\n        <h1 className=\"mt-2 text-4xl font-black\">Installer Mbnb sur Android et iPhone</h1>\n        <p className=\"mt-3 text-[#7a6446]\">\n          Cette version transforme le site en application installable. Le site reste le même : quand vous modifiez le site ou l’admin, l’application se met à jour automatiquement.\n        </p>\n\n        <div className=\"mt-8 grid gap-5 md:grid-cols-2\">\n          <div className=\"rounded-[2rem] bg-white p-5 ring-1 ring-[#e5d3b3]\">\n            <h2 className=\"text-2xl font-black\">Android</h2>\n            <ol className=\"mt-4 list-decimal space-y-2 pl-5 text-[#5f4b32]\">\n              <li>Ouvrir Mbnb dans Chrome.</li>\n              <li>Appuyer sur le bouton “Installer” si le message apparaît.</li>\n              <li>Sinon : menu ⋮ puis “Ajouter à l’écran d’accueil”.</li>\n            </ol>\n          </div>\n\n          <div className=\"rounded-[2rem] bg-white p-5 ring-1 ring-[#e5d3b3]\">\n            <h2 className=\"text-2xl font-black\">iPhone</h2>\n            <ol className=\"mt-4 list-decimal space-y-2 pl-5 text-[#5f4b32]\">\n              <li>Ouvrir Mbnb dans Safari.</li>\n              <li>Appuyer sur le bouton Partager.</li>\n              <li>Choisir “Ajouter à l’écran d’accueil”.</li>\n              <li>Valider avec le nom “Mbnb”.</li>\n            </ol>\n          </div>\n        </div>\n\n        <div className=\"mt-8 rounded-[2rem] bg-[#f4ead7] p-5\">\n          <h2 className=\"text-2xl font-black\">Modifier le site</h2>\n          <p className=\"mt-2 text-[#7a6446]\">\n            Les modifications restent centralisées sur le site web. Pour modifier les logements, réservations et demandes, utilisez l’espace Admin.\n          </p>\n          <div className=\"mt-4 flex flex-wrap gap-3\">\n            <a href=\"/admin-dashboard\" className=\"rounded-full bg-[#0f2f22] px-6 py-3 font-black text-white\">Ouvrir Admin</a>\n            <a href=\"/resultats\" className=\"rounded-full bg-white px-6 py-3 font-black text-[#7a3d14] ring-1 ring-[#e5d3b3]\">Explorer</a>\n          </div>\n        </div>\n      </section>\n    </main>\n  );\n}\n", 'utf8');
console.log('OK: page /installation créée.');

// Patch layout
const layoutPath = path.join(root, 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  backup(layoutPath, '.bak-pwa');
  let layout = fs.readFileSync(layoutPath, 'utf8');
  const before = layout;

  if (!layout.includes('@/components/ServiceWorkerRegister')) {
    layout = 'import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";\nimport PwaInstallPrompt from "@/components/PwaInstallPrompt";\n' + layout;
  }

  layout = layout.replace(/title:\s*["'`]Create Next App["'`]/g, 'title: "Mbnb"');
  layout = layout.replace(/title:\s*["'`]Mbnb["'`]/g, 'title: "Mbnb"');
  layout = layout.replace(/description:\s*["'`]Generated by create next app["'`]/g, 'description: "Mbnb - Séjours authentiques au Maroc"');

  if (!layout.includes('manifest:')) {
    layout = layout.replace('description: "Mbnb - Séjours authentiques au Maroc",', 'description: "Mbnb - Séjours authentiques au Maroc",\n  manifest: "/manifest.webmanifest",\n  themeColor: "#0f2f22",\n  appleWebApp: { capable: true, title: "Mbnb", statusBarStyle: "default" },');
  }

  if (!layout.includes('<ServiceWorkerRegister />')) {
    layout = layout.replace('{children}', '<ServiceWorkerRegister />\n        {children}\n        <PwaInstallPrompt />');
  }

  if (layout !== before) {
    fs.writeFileSync(layoutPath, layout, 'utf8');
    console.log('OK: layout configuré pour PWA.');
  }
}

// Ajouter Installation dans le header
const headerPath = path.join(root, 'components', 'MbnbHeader.tsx');
if (fs.existsSync(headerPath)) {
  backup(headerPath, '.bak-pwa-link');
  let header = fs.readFileSync(headerPath, 'utf8');
  if (!header.includes('/installation')) {
    header = header.replace('<a href="/admin-dashboard"', '<a href="/installation" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Application</a>\n          <a href="/admin-dashboard"');
    fs.writeFileSync(headerPath, header, 'utf8');
    console.log('OK: lien Application ajouté au header.');
  }
}

console.log('\nTerminé ✅');
console.log('Lance: npm run build');
console.log('Après publication Vercel, teste /installation sur Android/iPhone.');
