
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Logement = {
  id: number;
  titre: string;
  ville: string;
  quartier: string | null;
  type_logement: string | null;
  prix: number | null;
  chambres: number | null;
  voyageurs: number | null;
  description: string | null;
  image_url: string | null;
  photos?: string | null;
  statut: string | null;
};

function parsePhotos(value: string | null | undefined, imageUrl?: string | null) {
  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return [value];
    }
  }
  return imageUrl ? [imageUrl] : [];
}

export default function AdminLogementsPage() {
  const [autorise, setAutorise] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logements, setLogements] = useState<Logement[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const ok = localStorage.getItem("marbnb_admin_ok") === "true";
    if (!ok) {
      window.location.href = "/admin-login";
      return;
    }
    setAutorise(true);
    chargerLogements();
  }, []);

  async function chargerLogements() {
    setLoading(true);
    const { data, error } = await supabase
      .from("logements")
      .select("id,titre,ville,quartier,type_logement,prix,chambres,voyageurs,description,image_url,photos,statut")
      .order("id", { ascending: false });

    if (error) {
      setMessage("Erreur technique : " + error.message);
      setLogements([]);
    } else {
      setMessage("");
      setLogements(data || []);
    }
    setLoading(false);
  }

  async function updateLogement(id: number, updates: Partial<Logement>) {
    const { error } = await supabase.from("logements").update(updates).eq("id", id);
    if (error) {
      setMessage("Erreur modification : " + error.message);
      return;
    }
    setLogements((old) => old.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    setMessage("Modification enregistrée ✅");
  }

  async function supprimerLogement(id: number) {
    const ok = window.confirm("Supprimer définitivement ce logement ?");
    if (!ok) return;

    const { error } = await supabase.from("logements").delete().eq("id", id);
    if (error) {
      setMessage("Erreur suppression : " + error.message);
      return;
    }
    setLogements((old) => old.filter((l) => l.id !== id));
    setMessage("Logement supprimé ✅");
  }

  function deconnexion() {
    localStorage.removeItem("marbnb_admin_ok");
    window.location.href = "/admin-login";
  }

  if (!autorise) {
    return <main className="min-h-screen bg-[#f4ead7] p-8 font-black">Vérification accès admin...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f4ead7] px-4 py-8 text-[#1e1b18]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><a href="/admin-demandes" className="text-sm font-black text-[#c1121f]">← Demandes hôtes</a><a href="/admin-dashboard" className="ml-3 text-sm font-black text-[#7a3d14]">Dashboard</a></div>
          <div className="flex flex-wrap gap-2">
            <a href="/resultats" className="rounded-full bg-[#3F7D3B] px-5 py-2 text-sm font-black text-white">Voir résultats</a>
            <button onClick={deconnexion} className="rounded-full bg-red-700 px-5 py-2 text-sm font-black text-white">Déconnexion</button>
          </div>
        </div>

        <section className="mt-5 rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3]">
          <p className="font-black text-[#c1121f]">Admin Marbnb</p>
          <h1 className="mt-2 text-4xl font-black">Gestion des logements</h1>
          <p className="mt-3 text-[#7a6446]">Modifier le prix, changer le statut ou supprimer un logement publié.</p>

          {message && <p className="mt-4 rounded-2xl bg-[#EAF3E4] p-4 font-bold text-#3F7D3B">{message}</p>}
          {loading && <p className="mt-6 font-bold">Chargement...</p>}

          <div className="mt-6 grid gap-5">
            {logements.map((l) => {
              const photos = parsePhotos(l.photos, l.image_url);
              return (
                <article key={l.id} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-[#e5d3b3] md:grid-cols-[240px_1fr]">
                  <div>
                    {photos.length > 0 ? (
                      <div className="grid gap-2">
                        <img src={photos[0]} alt={l.titre} className="h-44 w-full rounded-2xl object-cover" />
                        {photos.length > 1 && (
                          <div className="grid grid-cols-3 gap-2">
                            {photos.slice(1, 4).map((p) => <img key={p} src={p} alt="Photo logement" className="h-16 w-full rounded-xl object-cover" />)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid h-44 place-items-center rounded-2xl bg-[#f4ead7] text-sm font-bold text-[#7a6446]">Pas de photo</div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black">{l.titre}</h2>
                        <p className="text-sm text-[#7a6446]">{l.type_logement} · {l.quartier}, {l.ville}</p>
                      </div>
                      <span className="rounded-full bg-[#f4ead7] px-4 py-2 text-sm font-black text-[#7a3d14]">{l.statut || "Actif"}</span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <div>
                        <label className="text-xs font-black text-[#7a3d14]">Prix MAD</label>
                        <input type="number" defaultValue={l.prix || 0} onBlur={(e) => updateLogement(l.id, { prix: Number(e.target.value) || 0 })} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-black text-[#7a3d14]">Chambres</label>
                        <input type="number" defaultValue={l.chambres || 1} onBlur={(e) => updateLogement(l.id, { chambres: Number(e.target.value) || 1 })} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-black text-[#7a3d14]">Voyageurs</label>
                        <input type="number" defaultValue={l.voyageurs || 1} onBlur={(e) => updateLogement(l.id, { voyageurs: Number(e.target.value) || 1 })} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-black text-[#7a3d14]">Statut</label>
                        <select value={l.statut || "Actif"} onChange={(e) => updateLogement(l.id, { statut: e.target.value })} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none">
                          <option>Actif</option>
                          <option>Masqué</option>
                          <option>Archivé</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button onClick={() => updateLogement(l.id, { statut: "Actif" })} className="rounded-full bg-#3F7D3B px-5 py-3 text-sm font-black text-white">Activer</button>
                      <button onClick={() => updateLogement(l.id, { statut: "Masqué" })} className="rounded-full bg-amber-600 px-5 py-3 text-sm font-black text-white">Masquer</button>
                      <button onClick={() => supprimerLogement(l.id)} className="rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white">Supprimer</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
