"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Account = { email?: string; nom?: string; role?: string };

function getAccount(): Account | null {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem("mbnb_account"); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export default function MbnbHeader() {
  const pathname = usePathname();
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const refresh = () => setAccount(getAccount());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("mbnb:account-changed", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("mbnb:account-changed", refresh); };
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
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#c1121f] text-xl font-black text-white shadow-sm">M</span>
          <span className="leading-tight">
            <span className="block text-2xl font-black tracking-tight text-[#0f2f22]">Mbnb</span>
            <span className="hidden text-xs font-bold text-[#7a6446] sm:block">Séjours authentiques au Maroc</span>
          </span>
        </a>
        <nav className="hidden items-center gap-2 md:flex">
          <a href="/resultats" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Explorer</a>
          <a href="/favoris" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Favoris</a>
          <a href="/hote" className="rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]">Devenir hôte</a>
        </nav>
        <div className="flex items-center gap-2">
          {account ? (
            <>
              <a href="/compte" className="hidden rounded-full bg-white px-4 py-2 text-sm font-black text-[#7a3d14] ring-1 ring-[#e5d3b3] sm:inline-flex">{account.nom || account.email || "Mon compte"}</a>
              <button onClick={logout} className="rounded-full bg-[#0f2f22] px-4 py-2 text-sm font-black text-white">Sortir</button>
            </>
          ) : <a href="/compte" className="rounded-full bg-[#0f2f22] px-5 py-2 text-sm font-black text-white">Connexion</a>}
        </div>
      </div>
    </header>
  );
}
