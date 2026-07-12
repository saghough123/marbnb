"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const types = ["Appartement", "Studio", "Villa", "Riad", "Maison", "Chambre privée", "Autre"];
const paysOptions = ["Maroc"];
const villesMaroc = ["Casablanca", "Marrakech", "Fès", "Tanger", "Agadir", "Rabat", "Essaouira", "Chefchaouen", "Merzouga", "Ouarzazate", "Ifrane", "Autre"];
const equipementsOptions = [
  "Wi‑Fi",
  "Climatisation",
  "Cuisine équipée",
  "Parking",
  "Piscine",
  "Vue mer",
  "Télévision",
  "Lave-linge",
  "Sécurité",
  "Petit-déjeuner",
  "Terrasse",
  "Jardin",
  "Ascenseur",
  "Espace de travail",
  "Chauffage",
  "Arrivée autonome",
];

const MAX_PHOTOS = 6;

type FormState = {
  nom: string;
  telephone: string;
  pays: string;
  ville: string;
  quartier: string;
  adresse: string;
  type_logement: string;
  titre: string;
  prix: string;
  chambres: string;
  voyageurs: string;
  description: string;
  equipements: string[];
  files: File[];
};

const initialForm: FormState = {
  nom: "",
  telephone: "",
  pays: "Maroc",
  ville: "Casablanca",
  quartier: "",
  adresse: "",
  type_logement: "Appartement",
  titre: "",
  prix: "",
  chambres: "1",
  voyageurs: "2",
  description: "",
  equipements: ["Wi‑Fi"],
  files: [],
};

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "photo"
  );
}

export default function HotePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);
  const [previews, setPreviews] = useState<string[]>([]);

  function updateField(name: keyof FormState, value: string | string[] | File[]) {
    setForm((old) => ({ ...old, [name]: value }));
  }

  function toggleEquipement(equipement: string) {
    setForm((old) => {
      const existe = old.equipements.includes(equipement);
      return {
        ...old,
        equipements: existe
          ? old.equipements.filter((item) => item !== equipement)
          : [...old.equipements, equipement],
      };
    });
  }

  function choisirPhotos(fileList: FileList | null) {
    previews.forEach((url) => URL.revokeObjectURL(url));

    const selected = Array.from(fileList || [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, MAX_PHOTOS);

    updateField("files", selected);
    setPreviews(selected.map((file) => URL.createObjectURL(file)));

    if ((fileList?.length || 0) > MAX_PHOTOS) {
      setMessage(`Maximum ${MAX_PHOTOS} photos. Les premières photos ont été gardées.`);
    } else {
      setMessage("");
    }
  }

  async function envoyerDemande(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!form.nom.trim() || !form.telephone.trim() || !form.ville.trim() || !form.titre.trim() || !form.prix.trim()) {
      setMessage("Merci de remplir au minimum : nom, téléphone, ville, titre et prix.");
      return;
    }

    setLoading(true);

    const imageUrls: string[] = [];

    for (let i = 0; i < form.files.length; i++) {
      const file = form.files[i];
      const extension = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${i + 1}-${slugify(form.titre)}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("logements")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        setLoading(false);
        setMessage("Erreur upload image : " + uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("logements").getPublicUrl(fileName);
      imageUrls.push(data.publicUrl);
    }

    // Important : on garde l'insertion compatible avec ta table actuelle "demandes_hotes".
    // Les nouveaux champs pays, adresse et équipements sont ajoutés dans la description
    // pour éviter une erreur si les colonnes n'existent pas encore dans Supabase.
    const descriptionComplete = [
      form.description.trim(),
      "",
      "--- Informations complémentaires Marbnb ---",
      `Pays : ${form.pays}`,
      `Adresse approximative : ${form.adresse || "Non renseignée"}`,
      `Équipements : ${form.equipements.length ? form.equipements.join(", ") : "Non renseignés"}`,
    ]
      .filter(Boolean)
      .join("\n");

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
      description: descriptionComplete,
      photos: JSON.stringify(imageUrls),
      statut: "En attente",
    });

    setLoading(false);

    if (error) {
      setMessage("Erreur technique : " + error.message);
      return;
    }

    setMessage("Demande envoyée avec succès ✅ Elle est maintenant visible dans l’espace Admin pour validation.");
    setForm(initialForm);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews([]);
  }

  return (
    <main className="min-h-screen bg-[#f7efe2] px-4 py-8 text-[#1e1b18]">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="inline-flex rounded-full border border-[#e5d3b3] bg-[#fff8ec] px-4 py-2 text-sm font-black text-[#7a6446] hover:bg-white">
          ← Retour accueil
        </a>

        <section className="mt-5 overflow-hidden rounded-[2rem] bg-[#fff8ec] shadow-sm ring-1 ring-[#e5d3b3]">
          <div className="relative bg-[#fff8ec] px-6 py-10 text-[#28231d] md:px-8">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(/marbnb-hero-mix.png)", backgroundSize: "cover", backgroundPosition: "center" }} />
            <div className="relative max-w-3xl">
              <p className="inline-flex rounded-full border border-white/30 bg-white/70 px-4 py-2 text-sm font-black backdrop-blur">Devenir hôte premium Marbnb</p>
              <h1 className="mt-5 text-4xl font-black md:text-6xl">Proposer mon adresse d’exception</h1>
              <p className="mt-4 max-w-2xl leading-7 text-[#5d513e]">
                Présente ton logement avec ses équipements, ses photos et son charme. Marbnb vérifie ensuite la demande avant publication.
              </p>
            </div>
          </div>

          <form onSubmit={envoyerDemande} className="grid gap-5 p-6 md:grid-cols-2 md:p-8">
            <div className="marbnb-card-premium rounded-[2rem] bg-white p-5 ring-1 ring-[#ead9ba] md:col-span-2">
              <h2 className="text-xl font-black">Coordonnées propriétaire</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label>
                  <span className="text-xs font-black text-[#7a3d14]">Nom complet *</span>
                  <input value={form.nom} onChange={(e) => updateField("nom", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-[#3F7D3B]" />
                </label>
                <label>
                  <span className="text-xs font-black text-[#7a3d14]">Téléphone *</span>
                  <input value={form.telephone} onChange={(e) => updateField("telephone", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-[#3F7D3B]" />
                </label>
              </div>
            </div>

            <div className="marbnb-card-premium rounded-[2rem] bg-white p-5 ring-1 ring-[#ead9ba] md:col-span-2">
              <h2 className="text-xl font-black">Localisation du logement</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label>
                  <span className="text-xs font-black text-[#7a3d14]">Pays *</span>
                  <select value={form.pays} onChange={(e) => updateField("pays", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-[#3F7D3B]">
                    {paysOptions.map((pays) => <option key={pays}>{pays}</option>)}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-black text-[#7a3d14]">Ville *</span>
                  <select value={form.ville} onChange={(e) => updateField("ville", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-[#3F7D3B]">
                    {villesMaroc.map((ville) => <option key={ville}>{ville}</option>)}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-black text-[#7a3d14]">Quartier</span>
                  <input value={form.quartier} onChange={(e) => updateField("quartier", e.target.value)} placeholder="Maarif, Gauthier, Palmeraie..." className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-[#3F7D3B]" />
                </label>
                <label>
                  <span className="text-xs font-black text-[#7a3d14]">Adresse approximative</span>
                  <input value={form.adresse} onChange={(e) => updateField("adresse", e.target.value)} placeholder="Rue, résidence ou repère proche" className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-[#3F7D3B]" />
                </label>
              </div>
            </div>

            <div className="marbnb-card-premium rounded-[2rem] bg-white p-5 ring-1 ring-[#ead9ba] md:col-span-2">
              <h2 className="text-xl font-black">Informations du logement</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label>
                  <span className="text-xs font-black text-[#7a3d14]">Type *</span>
                  <select value={form.type_logement} onChange={(e) => updateField("type_logement", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-[#3F7D3B]">
                    {types.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-black text-[#7a3d14]">Titre de l’annonce *</span>
                  <input value={form.titre} onChange={(e) => updateField("titre", e.target.value)} placeholder="Appartement moderne Maarif" className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-[#3F7D3B]" />
                </label>
                <label>
                  <span className="text-xs font-black text-[#7a3d14]">Prix / nuit MAD *</span>
                  <input type="number" value={form.prix} onChange={(e) => updateField("prix", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-[#3F7D3B]" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="text-xs font-black text-[#7a3d14]">Chambres</span>
                    <input type="number" min={1} value={form.chambres} onChange={(e) => updateField("chambres", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-[#3F7D3B]" />
                  </label>
                  <label>
                    <span className="text-xs font-black text-[#7a3d14]">Voyageurs</span>
                    <input type="number" min={1} value={form.voyageurs} onChange={(e) => updateField("voyageurs", e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-[#3F7D3B]" />
                  </label>
                </div>
              </div>
            </div>

            <div className="marbnb-card-premium rounded-[2rem] bg-white p-5 ring-1 ring-[#ead9ba] md:col-span-2">
              <h2 className="text-xl font-black">Équipements du logement</h2>
              <p className="mt-1 text-sm text-[#7a6446]">Sélectionne les équipements disponibles pour mieux valoriser ton logement.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {equipementsOptions.map((equipement) => {
                  const checked = form.equipements.includes(equipement);
                  return (
                    <button key={equipement} type="button" onClick={() => toggleEquipement(equipement)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${checked ? "border-[#3F7D3B] bg-[#EAF3E4] text-[#3F7D3B]" : "border-[#ead9ba] bg-white text-[#5f4b32] hover:bg-[#f7efe2]"}`}>
                      {checked ? "✓ " : "+ "}{equipement}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="marbnb-card-premium rounded-[2rem] bg-white p-5 ring-1 ring-[#ead9ba] md:col-span-2">
              <h2 className="text-xl font-black">Photos et description</h2>
              <div className="mt-4 grid gap-4">
                <label>
                  <span className="text-xs font-black text-[#7a3d14]">Photos du logement</span>
                  <input type="file" accept="image/*" multiple onChange={(e) => choisirPhotos(e.target.files)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                  <p className="mt-1 text-xs text-[#7a6446]">Tu peux choisir jusqu’à {MAX_PHOTOS} photos. La première photo deviendra la photo principale.</p>
                </label>

                {previews.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {previews.map((url, index) => (
                      <div key={url} className="relative overflow-hidden rounded-2xl ring-1 ring-[#e5d3b3]">
                        <img src={url} alt={`Aperçu photo ${index + 1}`} className="h-40 w-full object-cover" />
                        {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-[#fff8ec]/95 px-3 py-1 text-xs font-black text-[#7a3d14]">Principale</span>}
                      </div>
                    ))}
                  </div>
                )}

                <label>
                  <span className="text-xs font-black text-[#7a3d14]">Description</span>
                  <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={5} placeholder="Décris le logement, l’ambiance, la proximité, les avantages..." className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-[#3F7D3B]" />
                </label>
              </div>
            </div>

            <button disabled={loading} className="rounded-2xl bg-[#3F7D3B] px-6 py-4 font-black text-[#28231d] shadow-lg transition hover:bg-[#2f6f34] disabled:opacity-60 md:col-span-2">
              {loading ? "Envoi en cours..." : "Envoyer pour validation premium"}
            </button>
          </form>

          {message && <p className="mx-6 mb-6 rounded-2xl bg-[#EAF3E4] p-4 font-bold text-[#3F7D3B] md:mx-8">{message}</p>}
        </section>
      </div>
    </main>
  );
}
