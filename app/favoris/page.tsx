"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Logement = {
  id: string | number;
  titre: string;
  ville: string;
  quartier: string | null;
  type_logement: string | null;
  prix: number | null;
  chambres: number | null;
  voyageurs: number | null;
  image_url: string | null;
  photos: string | null;
  statut: string | null;
};

function parsePhotos(value: string | null | undefined, imageUrl?: string | null) {
  const list: string[] = [];
  if (imageUrl) list.push(imageUrl);
  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) list.push(...parsed.filter(Boolean).map(String));
      else if (parsed) list.push(String(parsed));
    } catch {
      list.push(value);
    }
  }
  return Array.from(new Set(list.filter(Boolean)));
}

export default function FavorisPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [logements, setLogements] = useState<Logement[]>([]);
  const [favoris, setFavoris] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("marbnb_favoris") || localStorage.getItem("mbnb_favoris") || "[]";
      const ids = JSON.parse(raw);
      setFavoris(Array.isArray(ids) ? ids.map(String) : []);
    } catch {
      setFavoris([]);
    }
    chargerLogements();
  }, []);

  async function chargerLogements() {
    setLoading(true);
    const { data, error } = await supabase
      .from("logements")
      .select("id,titre,ville,quartier,type_logement,prix,chambres,voyageurs,image_url,photos,statut")
      .eq("statut", "Actif")
      .order("id", { ascending: false });

    if (error) {
      setMessage("Erreur chargement favoris : " + error.message);
      setLogements([]);
    } else {
      setLogements(data || []);
    }
    setLoading(false);
  }

  function supprimerFavori(id: string | number) {
    const next = favoris.filter((x) => x !== String(id));
    setFavoris(next);
    localStorage.setItem("marbnb_favoris", JSON.stringify(next));
    localStorage.setItem("mbnb_favoris", JSON.stringify(next));
  }

  const visibles = useMemo(() => {
    if (favoris.length === 0) return [];
    return logements.filter((l) => favoris.includes(String(l.id)));
  }, [logements, favoris]);

  return (
    <main className="marbnb-favoris-page px-4 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-black text-[#b85c38]">Marbnb</p>
            <h1 className="mt-2 text-4xl font-black md:text-5xl">Mes favoris</h1>
            <p className="mt-3 max-w-2xl font-semibold text-[#332b22]">
              Retrouvez ici les logements sauvegardés pendant votre navigation.
            </p>
          </div>
          <a href="/resultats" className="rounded-full bg-[#c59b54] px-6 py-3 font-black text-white shadow">
            Explorer les logements
          </a>
        </div>

        {message && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{message}</p>}
        {loading && <p className="mt-8 rounded-3xl bg-white p-6 text-center font-black ring-1 ring-[#eadcc2]">Chargement des favoris...</p>}

        {!loading && visibles.length === 0 && (
          <div className="marbnb-favoris-card mt-8 rounded-[2rem] p-8 text-center">
            <p className="text-2xl font-black">Aucun favori pour le moment</p>
            <p className="mt-2 font-semibold text-[#332b22]">Cliquez sur le coeur d’un logement pour l’ajouter à cette page.</p>
            <a href="/resultats" className="mt-6 inline-flex rounded-full bg-[#b85c38] px-6 py-3 font-black text-white">Voir les logements</a>
          </div>
        )}

        {!loading && visibles.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibles.map((l) => {
              const photos = parsePhotos(l.photos, l.image_url);
              const img = photos[0] || "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80";
              return (
                <article key={String(l.id)} className="marbnb-favoris-card overflow-hidden rounded-[2rem]">
                  <img src={img} alt={l.titre} className="h-64 w-full object-cover" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="line-clamp-2 text-xl font-black">{l.titre}</h2>
                        <p className="mt-1 font-semibold text-[#332b22]">{l.quartier || "Centre"}, {l.ville}</p>
                      </div>
                      <button onClick={() => supprimerFavori(l.id)} className="rounded-full bg-red-50 px-3 py-2 font-black text-red-700">♥</button>
                    </div>
                    <p className="mt-3 font-semibold text-[#332b22]">{l.chambres || 1} chambre(s) · max {l.voyageurs || 1} voyageurs</p>
                    <p className="mt-3 text-lg font-black">{Number(l.prix || 0).toLocaleString("fr-FR")} MAD <span className="text-sm font-semibold text-[#332b22]">/ nuit</span></p>
                    <a href={"/logement/" + l.id} className="mt-4 block rounded-2xl bg-[#c59b54] py-3 text-center font-black text-white">Voir détails</a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
