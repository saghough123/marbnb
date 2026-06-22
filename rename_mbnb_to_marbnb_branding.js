const fs = require('fs');
const path = require('path');

const root = process.cwd();

function backup(file, suffix) {
  if (fs.existsSync(file)) {
    fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
  }
}

function replaceAllText(text) {
  return text
    // Nom public principal
    .replaceAll('Mbnb – Experience Maroc', 'Marbnb – Experience Maroc')
    .replaceAll('Mbnb - Experience Maroc', 'Marbnb – Experience Maroc')
    .replaceAll('Mbnb - Séjours authentiques au Maroc', 'Marbnb – Experience Maroc')
    .replaceAll('Mbnb – Séjours authentiques au Maroc', 'Marbnb – Experience Maroc')
    .replaceAll('Mbnb - Séjours authentiques au Maroc', 'Marbnb – Experience Maroc')
    .replaceAll('Mbnb – Experience Morocco', 'Marbnb – Experience Maroc')
    .replaceAll('Mbnb', 'Marbnb')
    .replaceAll('mbnb', 'marbnb')
    // Conserver quelques clés techniques anciennes pour éviter de déconnecter l’utilisateur ?
    // Non: on assume nouveau branding. Les localStorage peuvent repartir proprement.
    .replaceAll('Séjours authentiques au Maroc', 'Experience Maroc')
    .replaceAll('séjours authentiques au Maroc', 'Experience Maroc')
    .replaceAll('Compte Marbnb', 'Compte Marbnb')
    .replaceAll('Application Marbnb', 'Application Marbnb');
}

// 1) Remplacement global dans fichiers app/components/lib pertinents.
const rootsToScan = ['app', 'components', 'lib'];
const extensions = new Set(['.tsx', '.ts', '.jsx', '.js', '.css', '.json', '.webmanifest']);
let changedCount = 0;
for (const dirName of rootsToScan) {
  const dir = path.join(root, dirName);
  if (!fs.existsSync(dir)) continue;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
        stack.push(full);
      } else if (extensions.has(path.extname(entry.name))) {
        backup(full, '.bak-marbnb-rename');
        const before = fs.readFileSync(full, 'utf8');
        const after = replaceAllText(before);
        if (after !== before) {
          fs.writeFileSync(full, after, 'utf8');
          changedCount++;
          console.log('OK renommé:', path.relative(root, full));
        }
      }
    }
  }
}

// 2) Logo: créer alias public/marbnb-logo.png depuis mbnb-logo.png si disponible.
const publicDir = path.join(root, 'public');
fs.mkdirSync(publicDir, { recursive: true });
const mbnbLogo = path.join(publicDir, 'mbnb-logo.png');
const marbnbLogo = path.join(publicDir, 'marbnb-logo.png');
const logoPng = path.join(root, 'logo.png');
if (fs.existsSync(mbnbLogo)) {
  fs.copyFileSync(mbnbLogo, marbnbLogo);
  console.log('OK: public/marbnb-logo.png créé depuis public/mbnb-logo.png');
} else if (fs.existsSync(logoPng)) {
  fs.copyFileSync(logoPng, marbnbLogo);
  fs.copyFileSync(logoPng, path.join(publicDir, 'mbnb-logo.png')); // compatibilité ancienne référence
  console.log('OK: public/marbnb-logo.png créé depuis logo.png');
}

// 3) Header: forcer un header propre avec Marbnb + logo image.
const headerPath = path.join(root, 'components', 'MarbnbHeader.tsx');
const oldHeaderPath = path.join(root, 'components', 'MbnbHeader.tsx');
const headerCode = `"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Account = { email?: string; nom?: string; role?: string };

function getAccount(): Account | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("marbnb_account") || localStorage.getItem("mbnb_account");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function MarbnbHeader() {
  const pathname = usePathname();
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const refresh = () => setAccount(getAccount());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("marbnb:account-changed", refresh);
    window.addEventListener("mbnb:account-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("marbnb:account-changed", refresh);
      window.removeEventListener("mbnb:account-changed", refresh);
    };
  }, []);

  if (pathname?.startsWith("/admin-login")) return null;

  function logout() {
    localStorage.removeItem("marbnb_account");
    localStorage.removeItem("mbnb_account");
    window.dispatchEvent(new Event("marbnb:account-changed"));
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5d3b3] bg-[#fff8ec]/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <a href="/" className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-[#e5d3b3] shadow-sm">
            <img src="/marbnb-logo.png" alt="Logo Marbnb" className="h-12 w-12 object-contain" />
          </span>
          <span className="leading-tight">
            <span className="block text-2xl font-black tracking-tight text-[#0f2f22]"><span className="text-[#c1121f]">Mar</span>bnb</span>
            <span className="hidden text-xs font-bold text-[#7a6446] sm:block">Experience Maroc</span>
          </span>
        </a>

        <nav className="hidden items-center gap-2 md:flex">
          <a href="/resultats" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Explorer</a>
          <a href="/favoris" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Favoris</a>
          <a href="/hote" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Devenir hôte</a>
          <a href="/installation" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Application</a>
          <a href="/admin-dashboard" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Admin</a>
        </nav>

        <div className="flex items-center gap-2">
          {account ? (
            <>
              <a href="/compte" className="hidden rounded-full bg-white px-4 py-2 text-sm font-black text-[#7a3d14] ring-1 ring-[#e5d3b3] sm:inline-flex">
                {account.nom || account.email || "Mon compte"}
              </a>
              <button onClick={logout} className="rounded-full bg-[#0f2f22] px-4 py-2 text-sm font-black text-white">Sortir</button>
            </>
          ) : (
            <a href="/compte" className="rounded-full bg-[#0f2f22] px-5 py-2 text-sm font-black text-white">Connexion</a>
          )}
        </div>
      </div>
    </header>
  );
}
`;
fs.writeFileSync(headerPath, headerCode, 'utf8');
fs.writeFileSync(oldHeaderPath, headerCode.replaceAll('MarbnbHeader', 'MbnbHeader').replace('export default function MbnbHeader()', 'export default function MbnbHeader()'), 'utf8');
console.log('OK: headers Marbnb mis à jour.');

// 4) Layout: utiliser MarbnbHeader, metadata, manifest.
const layoutPath = path.join(root, 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  backup(layoutPath, '.bak-marbnb-layout');
  let layout = fs.readFileSync(layoutPath, 'utf8');

  layout = layout.replace(/import\s+MbnbHeader\s+from\s+["']@\/components\/MbnbHeader["'];?/g, 'import MarbnbHeader from "@/components/MarbnbHeader";');
  if (!layout.includes('@/components/MarbnbHeader')) {
    layout = 'import MarbnbHeader from "@/components/MarbnbHeader";\n' + layout;
  }
  layout = layout.replaceAll('<MbnbHeader />', '<MarbnbHeader />');
  if (!layout.includes('<MarbnbHeader />')) {
    layout = layout.replace('{children}', '<MarbnbHeader />\n        {children}');
  }

  layout = layout.replace(/title:\s*["'`][^"'`]*["'`]/, 'title: "Marbnb – Experience Maroc"');
  layout = layout.replace(/description:\s*["'`][^"'`]*["'`]/, 'description: "Marbnb – Experience Maroc, séjours authentiques au Maroc"');
  layout = layout.replace(/themeColor:\s*["'`][^"'`]*["'`]/, 'themeColor: "#0f2f22"');
  layout = layout.replace(/appleWebApp:\s*\{[^}]*\}/s, 'appleWebApp: { capable: true, title: "Marbnb", statusBarStyle: "default" }');

  fs.writeFileSync(layoutPath, layout, 'utf8');
  console.log('OK: layout renommé Marbnb.');
}

// 5) Manifest PWA.
const manifestPath = path.join(publicDir, 'manifest.webmanifest');
const manifest = {
  name: 'Marbnb – Experience Maroc',
  short_name: 'Marbnb',
  description: 'Marbnb – Experience Maroc, séjours authentiques au Maroc.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#fff8ec',
  theme_color: '#0f2f22',
  categories: ['travel', 'lifestyle'],
  icons: [
    { src: '/marbnb-logo.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/marbnb-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
  ]
};
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('OK: manifest PWA renommé Marbnb.');

// 6) Service worker cache references.
const swPath = path.join(publicDir, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replaceAll('mbnb-cache', 'marbnb-cache').replaceAll('/mbnb-logo.png', '/marbnb-logo.png');
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('OK: service worker renommé Marbnb.');
}

// 7) Page installation wording.
const installPath = path.join(root, 'app', 'installation', 'page.tsx');
if (fs.existsSync(installPath)) {
  let install = fs.readFileSync(installPath, 'utf8');
  install = replaceAllText(install);
  fs.writeFileSync(installPath, install, 'utf8');
}

console.log('\nTerminé ✅');
console.log('Nouveau branding: Marbnb – Experience Maroc');
console.log('Lance maintenant: npm run build');
