const fs = require('fs');
const path = require('path');

const root = process.cwd();
function backup(file, suffix) {
  if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
}

// 1) Modifier le header global : garder seulement le logo du dessous via la version compacte sans gros carré M.
const headerPath = path.join(root, 'components', 'MbnbHeader.tsx');
if (fs.existsSync(headerPath)) {
  backup(headerPath, '.bak-single-logo-admin');
  let header = fs.readFileSync(headerPath, 'utf8');

  const newHeader = `"use client";

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
          <span className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-[#e5d3b3] shadow-sm">
            <span className="text-xl font-black text-[#c1121f]">M</span>
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

  fs.writeFileSync(headerPath, newHeader, 'utf8');
  console.log('OK: header global corrigé avec un seul logo et Admin dans le menu.');
}

// 2) Supprimer l'ancien header/logo local de la page d'accueil si présent.
const homePath = path.join(root, 'app', 'page.tsx');
if (fs.existsSync(homePath)) {
  backup(homePath, '.bak-remove-local-logo');
  let home = fs.readFileSync(homePath, 'utf8');
  const before = home;

  // Masquer/supprimer les anciens blocs de navigation locaux les plus fréquents.
  home = home.replace(/<header[\s\S]*?<\/header>/, '');
  home = home.replace(/<nav[\s\S]*?<\/nav>/, '');

  // Si un ancien bouton Admin isolé existe encore dans le hero, on le supprime car Admin est dans le header global.
  home = home.replace(/<a[^>]*href=["']\/admin-dashboard["'][\s\S]*?<\/a>/g, '');
  home = home.replace(/<a[^>]*href=["']\/admin-login["'][\s\S]*?<\/a>/g, '');

  if (home !== before) {
    fs.writeFileSync(homePath, home, 'utf8');
    console.log('OK: ancien logo/header local supprimé de app/page.tsx.');
  } else {
    console.log('INFO: aucun ancien header local détecté dans app/page.tsx.');
  }
}

// 3) Ajouter un petit style mobile pour que Admin reste bien aligné si le menu s'affiche.
const cssPath = path.join(root, 'app', 'globals.css');
if (fs.existsSync(cssPath)) {
  backup(cssPath, '.bak-single-logo-admin');
  let css = fs.readFileSync(cssPath, 'utf8');
  if (!css.includes('MBNB_HEADER_SINGLE_LOGO_FIX')) {
    css += `

/* MBNB_HEADER_SINGLE_LOGO_FIX */
header a[href="/admin-dashboard"] {
  white-space: nowrap;
}
@media (max-width: 767px) {
  header nav {
    display: none !important;
  }
}
`;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('OK: style header ajusté.');
  }
}

console.log('\nTerminé ✅ Lance: npm run build');
