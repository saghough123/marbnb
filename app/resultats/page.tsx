
"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Devise = "MAD" | "EUR" | "USD" | "GBP" | "CAD" | "AED";
type Paiement = "espece" | "ligne";

type Logement = {
  id: number;
  titre: string;
  ville: string;
  quartier: string;
  prix: number;
  note: number;
  type: string;
  voyageurs: number;
  chambres: number;
  image: string;
  description: string;
};

const tauxDevise: Record<Devise, number> = { MAD: 1, EUR: 0.092, USD: 0.1, GBP: 0.078, CAD: 0.137, AED: 0.367 };
const symbole: Record<Devise, string> = { MAD: "MAD", EUR: "€", USD: "$", GBP: "£", CAD: "C$", AED: "AED" };

const logements: Logement[] = [
  { id: 1, titre: "Appartement moderne Maarif", ville: "Casablanca", quartier: "Maarif", prix: 650, note: 4.8, type: "Appartement", voyageurs: 4, chambres: 2, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80", description: "Appartement moderne au cœur du Maarif, proche des commerces." },
  { id: 2, titre: "Studio proche Corniche", ville: "Casablanca", quartier: "Ain Diab", prix: 520, note: 4.6, type: "Studio", voyageurs: 2, chambres: 1, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop&q=80", description: "Studio cosy proche de la Corniche." },
  { id: 3, titre: "Villa familiale avec piscine", ville: "Marrakech", quartier: "Palmeraie", prix: 1800, note: 4.9, type: "Villa", voyageurs: 8, chambres: 4, image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&auto=format&fit=crop&q=80", description: "Villa familiale avec piscine privée." },
  { id: 4, titre: "Riad traditionnel au centre", ville: "Fès", quartier: "Médina", prix: 780, note: 4.7, type: "Riad", voyageurs: 5, chambres: 3, image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&auto=format&fit=crop&q=80", description: "Riad traditionnel dans la médina." }
];

function nuitsEntre(a: string, d: string) {
  const diff = Math.round((new Date(d).getTime() - new Date(a).getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}

function dateAujourdhuiISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function prix(mad: number, devise: Devise) {
  const v = Math.round(mad * tauxDevise[devise]);
  return devise === "MAD" ? `${v} MAD` : `${symbole[devise]} ${v}`;
}

function ResultatsContent() {
  const params = useSearchParams();
  const destinationInitiale = params.get("destination") || "";
  const arriveeInitiale = params.get("arrivee") || "2026-06-18";
  // La date de départ affichée est toujours le jour d'ouverture de la page.
  const voyageursInitial = Number(params.get("voyageurs") || 1);

  const [destination, setDestination] = useState(destinationInitiale);
  const [arrivee, setArrivee] = useState(arriveeInitiale);
  const [depart, setDepart] = useState(dateAujourdhuiISO());
  const [voyageurs, setVoyageurs] = useState(Math.max(1, voyageursInitial));
  const [paiement, setPaiement] = useState<Paiement>("ligne");
  const [devise, setDevise] = useState<Devise>("MAD");
  const [message, setMessage] = useState("");

  const nuits = nuitsEntre(arrivee, depart);
  const resultats = useMemo(() => logements.filter((l) => (`${l.ville} ${l.quartier} ${l.titre}`).toLowerCase().includes(destination.toLowerCase()) && l.voyageurs >= voyageurs), [destination, voyageurs]);

  return (
    <div className="min-h-screen bg-[#f4ead7] text-[#1e1b18]">
      <header className="border-b border-[#e5d3b3] bg-[#fff8ec]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <a href="/" className="text-3xl font-black"><span className="text-[#c1121f]">M</span>bnb</a>
          <a href="/" className="rounded-full bg-[#0f2f22] px-5 py-2 text-sm font-black text-white">Accueil</a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm ring-1 ring-[#e5d3b3]">
          <p className="font-black text-[#c1121f]">Résultats de recherche</p>
          <h1 className="mt-2 text-4xl font-black">Votre séjour au Maroc</h1>
          <div className="mt-6 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]">
            <div><label className="text-xs font-black text-[#7a3d14]">Destination</label><input value={destination} onChange={(e) => setDestination(e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" /></div>
            <div><label className="text-xs font-black text-[#7a3d14]">Arrivée</label><input type="date" value={arrivee} onChange={(e) => setArrivee(e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" /></div>
            <div><label className="text-xs font-black text-[#7a3d14]">Départ</label><input type="date" value={depart} onChange={(e) => setDepart(e.target.value)} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" /></div>
            <div><label className="text-xs font-black text-[#7a3d14]">Voyageurs</label><input type="number" min={1} value={voyageurs} onChange={(e) => setVoyageurs(Math.max(1, Number(e.target.value) || 1))} className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 outline-none" /></div>
            <button onClick={() => { window.location.href = '/resultats?destination=' + encodeURIComponent(destination) + '&arrivee=' + encodeURIComponent(arrivee) + '&depart=' + encodeURIComponent(depart) + '&voyageurs=' + voyageurs; }} className="rounded-2xl bg-[#c1121f] px-6 py-3 font-black text-white md:self-end">Rechercher</button>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6 md:grid-cols-2">
            {resultats.map((l) => {
              const prixSejour = l.prix * nuits;
              const frais = paiement === "espece" ? Math.round(prixSejour * 0.05) : 0;
              const total = prixSejour + frais;
              return (
                <div key={l.id} className="overflow-hidden rounded-[2rem] bg-[#fff8ec] shadow-sm ring-1 ring-[#e5d3b3]">
                  <img src={l.image} alt={l.titre} className="h-60 w-full object-cover" />
                  <div className="p-5">
                    <div className="flex justify-between gap-3"><h2 className="font-black">{l.titre}</h2><span className="font-bold">⭐ {l.note}</span></div>
                    <p className="mt-1 text-sm text-[#7a6446]">{l.quartier}, {l.ville}</p>
                    <p className="mt-3 text-sm text-[#7a6446]">{l.chambres} chambre(s) · max {l.voyageurs} voyageurs</p>
                    <p className="mt-3"><span className="text-lg font-black">{l.prix} MAD</span> / nuit</p>
                    <div className="mt-4 rounded-2xl bg-white p-4 text-sm">
                      <div className="flex justify-between"><span>{l.prix} MAD x {nuits} nuit(s)</span><span>{prixSejour} MAD</span></div>
                      <div className="mt-2 flex justify-between"><span>{paiement === "espece" ? "Frais service 5%" : "Frais paiement en ligne"}</span><span>{paiement === "ligne" ? "0 MAD" : `${frais} MAD`}</span></div>
                      <div className="mt-3 flex justify-between border-t pt-3 text-base font-black"><span>Total</span><span>{prix(total, paiement === "ligne" ? devise : "MAD")}</span></div>
                    </div>
                    <button onClick={() => setMessage(`Réservation simulée pour ${l.titre}. Total : ${prix(total, paiement === "ligne" ? devise : "MAD")}`)} className="mt-4 w-full rounded-2xl bg-green-700 py-3 font-black text-white">Réserver</button>
                  </div>
                </div>
              );
            })}
            {resultats.length === 0 && <div className="rounded-[2rem] bg-[#fff8ec] p-8 text-center ring-1 ring-[#e5d3b3] md:col-span-2"><p className="text-xl font-black">Aucun logement trouvé</p><p className="mt-2 text-[#7a6446]">Essaie une autre ville ou réduis le nombre de voyageurs.</p></div>}
          </div>

          <aside className="h-fit rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm ring-1 ring-[#e5d3b3]">
            <h3 className="text-xl font-black">Paiement</h3>
            <button onClick={() => setPaiement("espece")} className={`mt-4 w-full rounded-2xl border p-4 text-left ${paiement === "espece" ? "border-[#0f2f22] bg-green-50" : "bg-white"}`}><b>💵 Espèces sur place</b><p className="text-sm text-[#7a6446]">Frais de service 5%.</p></button>
            <button onClick={() => setPaiement("ligne")} className={`mt-3 w-full rounded-2xl border p-4 text-left ${paiement === "ligne" ? "border-[#0f2f22] bg-green-50" : "bg-white"}`}><b>💳 Paiement en ligne</b><p className="text-sm text-[#7a6446]">Sans frais supplémentaires.</p></button>
            {paiement === "ligne" && <select value={devise} onChange={(e) => setDevise(e.target.value as Devise)} className="mt-3 w-full rounded-2xl border bg-white px-4 py-3"><option value="MAD">MAD</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option><option value="CAD">CAD</option><option value="AED">AED</option></select>}
            {message && <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">{message}</p>}
          </aside>
        </section>
      </main>
    </div>
  );
}

export default function ResultatsPage() {
  return <Suspense fallback={<div className="p-8">Chargement...</div>}><ResultatsContent /></Suspense>;
}
