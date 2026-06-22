"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Mode = "connexion" | "creation";
type Role = "locataire" | "hote";

export default function ComptePage() {
  const [mode, setMode] = useState<Mode>("connexion");
  const [role, setRole] = useState<Role>("locataire");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mbnb_account");
      if (raw) {
        const account = JSON.parse(raw);
        setNom(account.nom || "");
        setEmail(account.email || "");
        setTelephone(account.telephone || "");
        setRole(account.role || "locataire");
      }
    } catch {}
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!email.trim() || !password.trim()) { setMessage("Merci de renseigner votre email et votre mot de passe."); return; }
    if (mode === "creation" && !nom.trim()) { setMessage("Merci de renseigner votre nom complet."); return; }
    setLoading(true);

    if (mode === "creation") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { nom: nom.trim(), telephone: telephone.trim(), role } },
      });
      setLoading(false);
      if (error) { setMessage("Erreur création compte : " + error.message); return; }
      const account = { id: data.user?.id, nom: nom.trim(), email: email.trim(), telephone: telephone.trim(), role };
      localStorage.setItem("mbnb_account", JSON.stringify(account));
      window.dispatchEvent(new Event("mbnb:account-changed"));
      setMessage("Compte créé ✅ Vous pouvez maintenant utiliser Mbnb avec votre profil.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) { setMessage("Erreur connexion : " + error.message); return; }
    const user = data.user;
    const account = {
      id: user?.id,
      nom: user?.user_metadata?.nom || nom.trim(),
      email: user?.email || email.trim(),
      telephone: user?.user_metadata?.telephone || telephone.trim(),
      role: user?.user_metadata?.role || role,
    };
    localStorage.setItem("mbnb_account", JSON.stringify(account));
    window.dispatchEvent(new Event("mbnb:account-changed"));
    setMessage("Connexion réussie ✅");
  }

  function logout() {
    supabase.auth.signOut();
    localStorage.removeItem("mbnb_account");
    window.dispatchEvent(new Event("mbnb:account-changed"));
    setMessage("Déconnexion effectuée.");
  }

  return (
    <main className="min-h-screen bg-[#f4ead7] px-4 py-8 text-[#1e1b18]">
      <section className="mx-auto max-w-3xl rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3] md:p-8">
        <p className="font-black text-[#c1121f]">Compte Mbnb</p>
        <h1 className="mt-2 text-4xl font-black">Créer ou accéder à mon compte</h1>
        <p className="mt-3 text-[#7a6446]">Choisissez un profil locataire ou hôte pour utiliser les services Mbnb.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-[#f4ead7] p-2">
          <button onClick={() => setMode("connexion")} className={`rounded-xl px-4 py-3 font-black ${mode === "connexion" ? "bg-[#0f2f22] text-white" : "text-[#7a3d14]"}`}>Connexion</button>
          <button onClick={() => setMode("creation")} className={`rounded-xl px-4 py-3 font-black ${mode === "creation" ? "bg-[#0f2f22] text-white" : "text-[#7a3d14]"}`}>Créer un compte</button>
        </div>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          {mode === "creation" && (<>
            <div>
              <label className="text-xs font-black text-[#7a3d14]">Type de compte</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRole("locataire")} className={`rounded-2xl border px-4 py-3 font-black ${role === "locataire" ? "border-[#0f2f22] bg-green-50" : "bg-white"}`}>Locataire</button>
                <button type="button" onClick={() => setRole("hote")} className={`rounded-2xl border px-4 py-3 font-black ${role === "hote" ? "border-[#0f2f22] bg-green-50" : "bg-white"}`}>Hôte</button>
              </div>
            </div>
            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom complet" className="rounded-2xl border bg-white px-4 py-3 outline-none" />
            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Téléphone" className="rounded-2xl border bg-white px-4 py-3 outline-none" />
          </>)}
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="rounded-2xl border bg-white px-4 py-3 outline-none" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Mot de passe" className="rounded-2xl border bg-white px-4 py-3 outline-none" />
          <button disabled={loading} className="rounded-2xl bg-[#c1121f] px-6 py-4 font-black text-white disabled:opacity-60">{loading ? "Traitement..." : mode === "creation" ? "Créer mon compte" : "Me connecter"}</button>
        </form>
        {message && <p className="mt-5 rounded-2xl bg-green-50 p-4 font-bold text-green-800">{message}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/resultats" className="rounded-full bg-[#0f2f22] px-5 py-3 text-sm font-black text-white">Explorer</a>
          <a href="/hote" className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#7a3d14] ring-1 ring-[#e5d3b3]">Devenir hôte</a>
          <button onClick={logout} type="button" className="rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white">Déconnexion</button>
        </div>
      </section>
    </main>
  );
}
