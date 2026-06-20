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
  image_url: string | null;
  statut: string | null;
};

export default function TestSupabasePage() {
  const [logements, setLogements] = useState<Logement[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function charger() {
      setLoading(true);
      const { data, error } = await supabase
        .from("logements")
        .select("id,titre,ville,quartier,type_logement,prix,chambres,voyageurs,image_url,statut")
        .order("id", { ascending: true });

      if (error) {
        setErreur(error.message);
        setLogements([]);
      } else {
        setErreur("");
        setLogements(data || []);
      }

      setLoading(false);
    }

    charger();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4ead7] p-6 text-[#1e1b18]">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3]">
        <a href="/" className="text-sm font-black text-[#c1121f]">← Retour accueil</a>
        <h1 className="mt-4 text-4xl font-black">Test connexion Supabase</h1>
        <p className="mt-2 text-[#7a6446]">
          Cette page vérifie si Mbnb arrive à lire les logements depuis la vraie base Supabase.
        </p>

        {loading && <p className="mt-6 font-bold">Chargement...</p>}
        {erreur && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">Erreur Supabase : {erreur}</p>}

        {!loading && !erreur && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {logements.map((logement) => (
              <div key={logement.id} className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-[#e5d3b3]">
                {logement.image_url && <img src={logement.image_url} alt={logement.titre} className="h-44 w-full object-cover" />}
                <div className="p-4">
                  <h2 className="text-xl font-black">{logement.titre}</h2>
                  <p className="mt-1 text-sm text-[#7a6446]">{logement.quartier}, {logement.ville}</p>
                  <p className="mt-2 text-sm text-[#7a6446]">{logement.type_logement} · {logement.chambres} chambre(s) · max {logement.voyageurs} voyageurs</p>
                  <p className="mt-3 font-black">{logement.prix} MAD / nuit</p>
                  <p className="mt-1 text-xs text-[#7a6446]">Statut : {logement.statut}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !erreur && logements.length === 0 && (
          <p className="mt-6 rounded-2xl bg-amber-50 p-4 font-bold text-amber-700">
            Connexion OK, mais aucun logement trouvé. Vérifie que les 4 logements ont bien été insérés dans Supabase.
          </p>
        )}
      </div>
    </main>
  );
}
