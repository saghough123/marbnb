"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Devise = "MAD" | "EUR" | "USD" | "GBP" | "CAD" | "AED";
type Paiement = "espece" | "ligne";

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
  photos: string | null;
  statut: string | null;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
];

const tauxDevise: Record<Devise, number> = {
  MAD: 1,
  EUR: 0.092,
  USD: 0.1,
  GBP: 0.078,
  CAD: 0.137,
  AED: 0.367,
};

const symbole: Record<Devise, string> = {
  MAD: "MAD",
  EUR: "€",
  USD: "$",
  GBP: "£",
  CAD: "C$",
  AED: "AED",
};

function parsePhotos(value: string | null | undefined) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    return parsed ? [String(parsed)] : [];
  } catch {
    return value ? [value] : [];
  }
}

function todayISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function addDaysISO(dateISO: string, days: number) {
  const base = dateISO && dateISO.trim() ? dateISO : todayISO();
  const d = new Date(base);
  if (Number.isNaN(d.getTime())) return todayISO();
  d.setDate(d.getDate() + days);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function nuitsEntre(a: string, d: string) {
  const diff = Math.round((new Date(d).getTime() - new Date(a).getTime()) / 86400000);
  return diff > 0 ? diff : 1;
}

function formatPrix(mad: number, devise: Devise) {
  const v = Math.round(mad * tauxDevise[devise]);
  return devise === "MAD" ? `${v.toLocaleString("fr-FR")} MAD` : `${symbole[devise]} ${v.toLocaleString("fr-FR")}`;
}

function DetailLogementContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const logementId = Number(params.id);

  const [logement, setLogement] = useState<Logement | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [arrivee, setArrivee] = useState(searchParams.get("arrivee") || todayISO());
  const [depart, setDepart] = useState(searchParams.get("depart") || addDaysISO(searchParams.get("arrivee") || todayISO(), 1));
  const [voyageurs, setVoyageurs] = useState(Math.max(1, Number(searchParams.get("voyageurs") || 1)));
  const [paiement, setPaiement] = useState<Paiement>("ligne");
  const [devise, setDevise] = useState<Devise>("MAD");
  const [clientNom, setClientNom] = useState("");
  const [clientTelephone, setClientTelephone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientMessage, setClientMessage] = useState("");
  const [heureArrivee, setHeureArrivee] = useState("");
  const [message, setMessage] = useState("");
  const [photoActive, setPhotoActive] = useState(0);

  useEffect(() => {
    const start = new Date(arrivee).getTime();
    const end = new Date(depart).getTime();
    if (!Number.isNaN(start) && (Number.isNaN(end) || end <= start)) {
      setDepart(addDaysISO(arrivee, 1));
    }
  }, [arrivee, depart]);

  useEffect(() => {
    async function chargerLogement() {
      setLoading(true);
      setErreur("");
      const { data, error } = await supabase
        .from("logements")
        .select("id,titre,ville,quartier,type_logement,prix,chambres,voyageurs,description,image_url,photos,statut")
        .eq("id", logementId)
        .single();

      if (error) {
        setErreur(error.message);
        setLogement(null);
      } else {
        setLogement(data as Logement);
      }
      setLoading(false);
    }

    if (Number.isFinite(logementId)) chargerLogement();
    else {
      setErreur("Identifiant logement invalide.");
      setLoading(false);
    }
  }, [logementId]);

  const nuits = nuitsEntre(arrivee, depart);
  const prixNuit = Number(logement?.prix || 0);
  const prixSejour = prixNuit * nuits;
  const frais = paiement === "espece" ? Math.round(prixSejour * 0.05) : 0;
  const total = prixSejour + frais;
  const maxVoyageurs = Number(logement?.voyageurs || 1);

  const photos = useMemo(() => {
    if (!logement) return fallbackImages;
    const photosBase = parsePhotos(logement.photos);
    const list = [logement.image_url, ...photosBase].filter(Boolean) as string[];
    const unique = Array.from(new Set(list));
    return unique.length > 0 ? unique : fallbackImages;
  }, [logement]);

  async function confirmerReservation() {
    if (!logement) return;
    setMessage("");

    if (!clientNom.trim() || !clientTelephone.trim()) {
      setMessage("Merci de renseigner au minimum votre nom et votre téléphone.");
      return;
    }

    const { error } = await supabase.from("reservations").insert({
      logement_id: logement.id,
      logement_titre: logement.titre,
      ville: logement.ville,
      arrivee,
      depart,
      voyageurs,
      paiement,
      devise,
      total,
      statut: paiement === "ligne" ? "Payée en ligne" : "Pré-confirmée",
      client_nom: clientNom.trim(),
      client_telephone: clientTelephone.trim(),
      client_email: clientEmail.trim(),
      client_message: clientMessage.trim(),
      heure_arrivee: heureArrivee,
    });

    if (error) {
      setMessage(`Erreur réservation : ${error.message}`);
      return;
    }

    const confirmParams = new URLSearchParams({
      titre: logement.titre || "Logement Marbnb",
      ville: logement.ville || "Maroc",
      arrivee,
      depart,
      voyageurs: String(voyageurs),
      total: String(total),
      paiement,
      devise: paiement === "ligne" ? devise : "MAD",
      statut: paiement === "ligne" ? "Payée en ligne" : "Pré-confirmée",
    });
    window.location.href = "/reservation-confirmation?" + confirmParams.toString();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7efe2] px-4 py-16 text-[#1e1b18]">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-[#fff8ec] p-8 text-center shadow-sm ring-1 ring-[#e5d3b3]">
          <p className="font-black">Chargement du logement...</p>
        </div>
      </div>
    );
  }

  if (erreur || !logement) {
    return (
      <div className="min-h-screen bg-[#f7efe2] px-4 py-16 text-[#1e1b18]">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-red-50 p-8 text-center shadow-sm ring-1 ring-red-100">
          <p className="text-xl font-black text-red-700">Logement introuvable</p>
          <p className="mt-2 text-red-700">{erreur || "Aucune donnée disponible."}</p>
          <a href="/resultats" className="mt-5 inline-flex rounded-2xl bg-[#3F7D3B] px-6 py-3 font-black text-white">Retour aux résultats</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7efe2] text-[#1e1b18]">
      <main className="mx-auto max-w-7xl px-4 py-8 md:py-10">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <a href="/resultats" className="inline-flex rounded-full border border-[#e5d3b3] bg-[#fff8ec] px-4 py-2 text-sm font-black text-[#7a6446] hover:bg-white">
              ← Retour aux résultats
            </a>
            <p className="mt-5 inline-flex rounded-full bg-[#EAF3E4] px-4 py-2 text-sm font-black text-[#3F7D3B]">
              {logement.type_logement || "Logement"} · Signature Marbnb
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">{logement.titre}</h1>
            <p className="mt-3 text-[#7a6446]">{logement.quartier || "Centre"}, {logement.ville} · ⭐ 4.8 · Expérience premium</p>
          </div>
          <div className="marbnb-card-premium rounded-[2rem] bg-[#fff8ec] px-5 py-4 text-sm shadow-sm ring-1 ring-[#e5d3b3]">
            <p className="text-[#7a6446]">À partir de</p>
            <p className="text-2xl font-black">{prixNuit.toLocaleString("fr-FR")} MAD <span className="text-sm font-medium text-[#7a6446]">/ nuit</span></p>
          </div>
        </div>

        <section className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="overflow-hidden rounded-[2rem] bg-[#fff8ec] shadow-sm ring-1 ring-[#e5d3b3]">
            <img src={photos[photoActive] || fallbackImages[0]} alt={logement.titre} className="h-[460px] w-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {photos.slice(0, 4).map((photo, index) => (
              <button key={`${photo}-${index}`} onClick={() => setPhotoActive(index)} className={`overflow-hidden rounded-[1.5rem] ring-2 transition ${photoActive === index ? "ring-[#3F7D3B]" : "ring-transparent hover:ring-[#e5d3b3]"}`}>
                <img src={photo} alt={`Photo ${index + 1}`} className="h-[222px] w-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px]">
          <div>
            <div className="marbnb-card-premium rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3]">
              <h2 className="text-2xl font-black">Une expérience à vivre</h2>
              <p className="mt-4 leading-8 text-[#5f4b32]">
                {logement.description || "Logement sélectionné par Marbnb pour offrir une expérience confortable, pratique et authentique au Maroc."}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="marbnb-card-premium rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm ring-1 ring-[#e5d3b3]"><p className="text-sm text-[#7a6446]">Voyageurs</p><p className="mt-1 text-2xl font-black">{maxVoyageurs}</p></div>
              <div className="marbnb-card-premium rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm ring-1 ring-[#e5d3b3]"><p className="text-sm text-[#7a6446]">Chambres</p><p className="mt-1 text-2xl font-black">{logement.chambres || 1}</p></div>
              <div className="marbnb-card-premium rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm ring-1 ring-[#e5d3b3]"><p className="text-sm text-[#7a6446]">Ville</p><p className="mt-1 text-2xl font-black">{logement.ville}</p></div>
            </div>

            <div className="mt-6 rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3]">
              <h2 className="text-2xl font-black">Confort & art de vivre</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {["Wi‑Fi", "Climatisation", "Cuisine équipée", "Sécurité", "Accueil flexible", "Conciergerie Marbnb"].map((item) => (
                  <div key={item} className="rounded-2xl border border-[#ead9ba] bg-white p-4 font-bold">✓ {item}</div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3]">
              <h2 className="text-2xl font-black">Avis voyageurs</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 ring-1 ring-[#ead9ba]"><p className="font-black">⭐ 4.8 / 5</p><p className="mt-2 text-sm leading-6 text-[#7a6446]">Logement bien situé, propre et conforme à la description.</p></div>
                <div className="rounded-2xl bg-white p-5 ring-1 ring-[#ead9ba]"><p className="font-black">Service Marbnb</p><p className="mt-2 text-sm leading-6 text-[#7a6446]">Réservation simple, informations claires et suivi pratique.</p></div>
              </div>
            </div>
          </div>

          <aside className="marbnb-card-premium h-fit rounded-[2rem] bg-[#fff8ec] p-5 shadow-xl ring-1 ring-[#e5d3b3] lg:sticky lg:top-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-[#7a6446]">Prix par nuit</p>
                <p className="text-3xl font-black">{prixNuit.toLocaleString("fr-FR")} MAD</p>
              </div>
              <p className="rounded-full bg-[#EAF3E4] px-3 py-1 text-sm font-black text-[#3F7D3B]">⭐ 4.8</p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-[#e5d3b3] bg-white">
              <div className="grid grid-cols-2 border-b border-[#e5d3b3]">
                <label className="p-3"><span className="text-xs font-black">ARRIVÉE</span><input type="date" value={arrivee} onChange={(e) => setArrivee(e.target.value)} className="mt-1 w-full bg-transparent outline-none" /></label>
                <label className="border-l border-[#e5d3b3] p-3"><span className="text-xs font-black">DÉPART</span><input type="date" value={depart} onChange={(e) => setDepart(e.target.value)} className="mt-1 w-full bg-transparent outline-none" /></label>
              </div>
              <label className="block p-3"><span className="text-xs font-black">VOYAGEURS</span><input type="number" min={1} max={maxVoyageurs} value={voyageurs} onChange={(e) => setVoyageurs(Math.max(1, Math.min(maxVoyageurs, Number(e.target.value) || 1)))} className="mt-1 w-full bg-transparent outline-none" /></label>
            </div>

            <div className="mt-4 grid gap-3">
              <button onClick={() => setPaiement("ligne")} className={`rounded-2xl border p-4 text-left ${paiement === "ligne" ? "border-[#3F7D3B] bg-[#EAF3E4]" : "bg-white"}`}><b>💳 Paiement flexible</b><p className="text-sm text-[#7a6446]">Sans frais supplémentaires.</p></button>
              <button onClick={() => setPaiement("espece")} className={`rounded-2xl border p-4 text-left ${paiement === "espece" ? "border-[#3F7D3B] bg-[#EAF3E4]" : "bg-white"}`}><b>💵 Paiement sur place</b><p className="text-sm text-[#7a6446]">Frais de service Marbnb : 5%.</p></button>
              {paiement === "ligne" && <select value={devise} onChange={(e) => setDevise(e.target.value as Devise)} className="rounded-2xl border bg-white px-4 py-3"><option value="MAD">MAD</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option><option value="CAD">CAD</option><option value="AED">AED</option></select>}
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><span>{prixNuit.toLocaleString("fr-FR")} MAD x {nuits} nuit(s)</span><span>{prixSejour.toLocaleString("fr-FR")} MAD</span></div>
              <div className="flex justify-between"><span>{paiement === "espece" ? "Frais service 5%" : "Frais paiement en ligne"}</span><span>{paiement === "ligne" ? "0 MAD" : `${frais.toLocaleString("fr-FR")} MAD`}</span></div>
              <div className="flex justify-between border-t border-[#e5d3b3] pt-3 text-lg font-black"><span>Total</span><span>{formatPrix(total, paiement === "ligne" ? devise : "MAD")}</span></div>
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#ead9ba]">
              <input value={clientNom} onChange={(e) => setClientNom(e.target.value)} placeholder="Nom complet *" className="rounded-2xl border px-4 py-3 outline-none focus:border-[#3F7D3B]" />
              <input value={clientTelephone} onChange={(e) => setClientTelephone(e.target.value)} placeholder="Téléphone *" className="rounded-2xl border px-4 py-3 outline-none focus:border-[#3F7D3B]" />
              <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Email" className="rounded-2xl border px-4 py-3 outline-none focus:border-[#3F7D3B]" />
              <input value={heureArrivee} onChange={(e) => setHeureArrivee(e.target.value)} placeholder="Heure d’arrivée" className="rounded-2xl border px-4 py-3 outline-none focus:border-[#3F7D3B]" />
              <textarea value={clientMessage} onChange={(e) => setClientMessage(e.target.value)} placeholder="Message optionnel" rows={3} className="rounded-2xl border px-4 py-3 outline-none focus:border-[#3F7D3B]" />
            </div>

            <button onClick={confirmerReservation} className="mt-5 w-full rounded-2xl bg-[#c1121f] py-4 font-black text-white shadow-lg transition hover:bg-[#a50f1a]">
              {paiement === "ligne" ? "Réserver maintenant" : "Pré-confirmer la réservation"}
            </button>
            {message && <p className="mt-4 rounded-2xl bg-[#EAF3E4] p-3 text-sm font-bold text-[#3F7D3B]">{message}</p>}
          </aside>
        </section>
      </main>
    </div>
  );
}

export default function DetailLogementPage() {
  return (
    <Suspense fallback={<div className="p-8">Chargement...</div>}>
      <DetailLogementContent />
    </Suspense>
  );
}
