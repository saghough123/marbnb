"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function connexion(e: React.FormEvent) {
    e.preventDefault();
    const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "MarbnbAdmin2026";
    if (password === expected) {
      localStorage.setItem("marbnb_admin_ok", "true");
      window.location.href = "/admin-demandes";
      return;
    }
    setMessage("Mot de passe incorrect.");
  }

  return (
    <main className="min-h-screen bg-[#f4ead7] px-4 py-10 text-[#1e1b18]">
      <section className="mx-auto max-w-md rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3] md:p-8">
        <a href="/" className="text-sm font-black text-[#c1121f]">← Retour accueil</a>
        <p className="mt-6 font-black text-[#c1121f]">Admin Marbnb</p>
        <h1 className="mt-2 text-4xl font-black">Connexion</h1>
        <p className="mt-3 text-sm text-[#7a6446]">Entre le mot de passe admin pour accéder aux demandes hôtes.</p>
        <form onSubmit={connexion} className="mt-6">
          <label className="text-xs font-black text-[#7a3d14]">Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" autoFocus />
          <button className="mt-5 w-full rounded-2xl bg-[#3F7D3B] px-6 py-4 font-black text-white">Se connecter</button>
        </form>
        {message && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{message}</p>}
        <div className="mt-5 rounded-2xl bg-[#f4ead7] p-4 text-xs text-[#7a6446]">
          <b>Info :</b> mot de passe par défaut : <b>MarbnbAdmin2026</b>. Tu peux le changer dans <b>.env.local</b> et dans Vercel avec <b>NEXT_PUBLIC_ADMIN_PASSWORD</b>.
        </div>
      </section>
    </main>
  );
}
