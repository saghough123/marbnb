"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const types = ["Appartement", "Studio", "Villa", "Riad", "Maison", "Autre"];

export default function HotePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    ville: "",
    quartier: "",
    type_logement: "Appartement",
    titre: "",
    prix: "",
    chambres: "1",
    voyageurs: "2",
    description: "",
    photos: "",
  });

  function updateField(name: string, value: string) {
    setForm((old) => ({ ...old, [name]: value }));
  }

  async function envoyerDemande(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!form.nom.trim() || !form.ville.trim() || !form.titre.trim() || !form.prix.trim()) {
      setMessage("Merci de remplir au minimum : nom, ville, titre et prix.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("demandes_hotes").insert({
      nom: form.nom.trim(),
      telephone: form.telephone.trim(),
      ville: form.ville.trim(),
      quartier: form.quartier.trim(),
      type_logement: form.type_logement,
      titre: form.titre.trim(),
      prix: Number(form.prix) || 0,
      chambres: Number(form.chambres) || 1,
      voyageurs: Number(form.voyageurs) || 1,
      description: form.description.trim(),
      photos: form.photos.trim(),
      statut: "En attente",
    });

    setLoading(false);

    if (error) {
      setMessage("Erreur Supabase : " + error.message);
      return;
    }

    setMessage("Demande envoyée avec succès ✅ Elle est maintenant visible dans l’espace Admin.");
    setForm({
      nom: "",
      telephone: "",
      ville: "",
      quartier: "",
      type_logement: "Appartement",
      titre: "",
      prix: "",
      chambres: "1",
      voyageurs: "2",
      description: "",
      photos: "",
    });
  }

  return (
    <main className="min-h-screen bg-[#f4ead7] px-4 py-8 text-[#1e1b18]">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm font-black text-[#c1121f]">← Retour accueil</a>
        <section className="mt-5 rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3] md:p-8">
          <p className="font-black text-[#c1121f]">Devenir hôte Mbnb</p>
          <h1 className="mt-2 text-4xl font-black">Mettre mon logement</h1>
          <p className="mt-3 text-[#7a6446]">Remplis les informations du logement. La demande sera enregistrée dans Supabase avec le statut “En attente”.</p>

          <form onSubmit={envoyerDemande} className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-black text-[#7a3d14]">Nom</label>
              <input value={form.nom} onChange={(e) => updateField("nom", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="text-xs font-black text-[#7a3d14]">Téléphone</label>
              <input value={form.telephone} onChange={(e) => updateField("telephone", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="text-xs font-black text-[#7a3d14]">Ville</label>
              <input value={form.ville} onChange={(e) => updateField("ville", e.target.value)} placeholder="Casablanca, Marrakech..." className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="text-xs font-black text-[#7a3d14]">Quartier</label>
              <input value={form.quartier} onChange={(e) => updateField("quartier", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="text-xs font-black text-[#7a3d14]">Type</label>
              <select value={form.type_logement} onChange={(e) => updateField("type_logement", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none">
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-[#7a3d14]">Titre de l’annonce</label>
              <input value={form.titre} onChange={(e) => updateField("titre", e.target.value)} placeholder="Appartement moderne Maarif" className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="text-xs font-black text-[#7a3d14]">Prix / nuit MAD</label>
              <input type="number" value={form.prix} onChange={(e) => updateField("prix", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-[#7a3d14]">Chambres</label>
                <input type="number" min={1} value={form.chambres} onChange={(e) => updateField("chambres", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
              </div>
              <div>
                <label className="text-xs font-black text-[#7a3d14]">Voyageurs</label>
                <input type="number" min={1} value={form.voyageurs} onChange={(e) => updateField("voyageurs", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-black text-[#7a3d14]">Lien photo principale</label>
              <input value={form.photos} onChange={(e) => updateField("photos", e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
              <p className="mt-1 text-xs text-[#7a6446]">Pour cette étape, colle un lien image. L’upload photo réel viendra juste après.</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-black text-[#7a3d14]">Description</label>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={5} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
            </div>

            <button disabled={loading} className="rounded-2xl bg-[#0f2f22] px-6 py-4 font-black text-white disabled:opacity-60 md:col-span-2">
              {loading ? "Envoi en cours..." : "Envoyer ma demande"}
            </button>
          </form>

          {message && <p className="mt-5 rounded-2xl bg-green-50 p-4 font-bold text-green-800">{message}</p>}
        </section>
      </div>
    </main>
  );
}
