const fs = require('fs');
const path = require('path');

const root = process.cwd();
function backup(file, suffix) {
  if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
}

const publicDir = path.join(root, 'public');
fs.mkdirSync(publicDir, { recursive: true });

// 1) Copier le logo uploadé vers public/mbnb-logo.png
const possibleLogos = [
  path.join(root, 'logo.png'),
  path.join(root, 'public', 'logo.png'),
  path.join(root, 'image.png'),
  path.join(root, 'public', 'image.png'),
];
const sourceLogo = possibleLogos.find((p) => fs.existsSync(p));
const targetLogo = path.join(publicDir, 'mbnb-logo.png');

if (sourceLogo) {
  fs.copyFileSync(sourceLogo, targetLogo);
  console.log('OK: logo copié vers public/mbnb-logo.png depuis ' + path.relative(root, sourceLogo));
} else {
  console.log('ATTENTION: logo.png introuvable dans le dossier projet. Mets ton logo sous C:\\Users\\SAGHOUGH\\marbnb\\logo.png puis relance ce script.');
}

// 2) Remplacer le header global pour utiliser le vrai logo image
const headerPath = path.join(root, 'components', 'MbnbHeader.tsx');
fs.mkdirSync(path.dirname(headerPath), { recursive: true });
backup(headerPath, '.bak-real-logo');

const header = `"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Account = { email?: string; nom?: string; role?: string };

function getAccount(): Account | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mbnb_account");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function MbnbHeader() {
  const pathname = usePathname();
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const refresh = () => setAccount(getAccount());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("mbnb:account-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("mbnb:account-changed", refresh);
    };
  }, []);

  if (pathname?.startsWith("/admin-login")) return null;

  function logout() {
    localStorage.removeItem("mbnb_account");
    window.dispatchEvent(new Event("mbnb:account-changed"));
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5d3b3] bg-[#fff8ec]/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <a href="/" className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-[#e5d3b3] shadow-sm">
            <img src="/mbnb-logo.png" alt="Logo Mbnb" className="h-12 w-12 object-contain" />
          </span>
          <span className="leading-tight">
            <span className="block text-2xl font-black tracking-tight text-[#0f2f22]"><span className="text-[#c1121f]">M</span>bnb</span>
            <span className="hidden text-xs font-bold text-[#7a6446] sm:block">Séjours authentiques au Maroc</span>
          </span>
        </a>

        <nav className="hidden items-center gap-2 md:flex">
          <a href="/resultats" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Explorer</a>
          <a href="/favoris" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Favoris</a>
          <a href="/hote" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Devenir hôte</a>
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
fs.writeFileSync(headerPath, header, 'utf8');
console.log('OK: header mis à jour avec le vrai logo image.');

// 3) Supprimer les anciens logos locaux qui doublonnent sur la homepage
const homePath = path.join(root, 'app', 'page.tsx');
if (fs.existsSync(homePath)) {
  backup(homePath, '.bak-real-logo-clean');
  let home = fs.readFileSync(homePath, 'utf8');
  const before = home;

  // Supprimer anciens headers/nav locaux pour éviter double logo.
  home = home.replace(/<header[\s\S]*?<\/header>/, '');
  home = home.replace(/<nav[\s\S]*?<\/nav>/, '');

  // Supprimer les anciens liens Admin/Connexion isolés si présents dans le hero.
  home = home.replace(/<a[^>]*href=["']\/admin-dashboard["'][\s\S]*?<\/a>/g, '');
  home = home.replace(/<a[^>]*href=["']\/admin-login["'][\s\S]*?<\/a>/g, '');
  home = home.replace(/<a[^>]*href=["']\/compte["'][\s\S]*?Connexion[\s\S]*?<\/a>/g, '');

  if (home !== before) {
    fs.writeFileSync(homePath, home, 'utf8');
    console.log('OK: ancien header local nettoyé sur la page accueil.');
  }
}

// 4) S'assurer que le titre navigateur est Mbnb
const layoutPath = path.join(root, 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  backup(layoutPath, '.bak-real-logo-title');
  let layout = fs.readFileSync(layoutPath, 'utf8');
  const before = layout;
  layout = layout.replace(/title:\s*["'`]Create Next App["'`]/g, 'title: "Mbnb"');
  layout = layout.replace(/description:\s*["'`]Generated by create next app["'`]/g, 'description: "Mbnb - Séjours authentiques au Maroc"');
  if (layout !== before) fs.writeFileSync(layoutPath, layout, 'utf8');
}

console.log('\nTerminé ✅ Lance maintenant: npm run build');
