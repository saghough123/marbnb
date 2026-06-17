
"use client";

import { useMemo, useState } from "react";

const numeroWhatsApp = "212675229836";
const ADMIN_PASSWORD = "admin123";

type Statut = "En attente" | "Acceptée" | "Refusée";
type Page = "accueil" | "admin" | "detail";
type PhotoLocale = { name: string; url: string };

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
  badge: string;
  description: string;
  indisponibles: string[];
  equipements: string[];
  galerie?: string[];
};

type DemandeHote = {
  id: number;
  date: string;
  statut: Statut;
  nom: string;
  telephone: string;
  ville: string;
  quartier: string;
  typeLogement: string;
  titre: string;
  prix: string;
  chambres: string;
  voyageurs: string;
  description: string;
  photos: string;
  photoPreviews?: string[];
};

const photosDemo = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&auto=format&fit=crop&q=80",
];

const logementsBase: Logement[] = [
  {
    id: 1,
    titre: "Appartement moderne Maarif",
    ville: "Casablanca",
    quartier: "Maarif",
    prix: 650,
    note: 4.8,
    type: "Appartement",
    voyageurs: 4,
    chambres: 2,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80",
    badge: "Coup de cœur",
    description: "Appartement moderne au cœur du Maarif, proche des cafés, restaurants et commerces. Idéal pour un séjour professionnel ou familial.",
    indisponibles: ["2026-06-20", "2026-06-21", "2026-06-27", "2026-07-03"],
    equipements: ["Wi-Fi", "Climatisation", "Parking", "Cuisine équipée"],
    galerie: photosDemo,
  },
  {
    id: 2,
    titre: "Studio proche Corniche",
    ville: "Casablanca",
    quartier: "Ain Diab",
    prix: 520,
    note: 4.6,
    type: "Studio",
    voyageurs: 2,
    chambres: 1,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop&q=80",
    badge: "Vue mer",
    description: "Studio cosy proche de la Corniche et des plages d'Ain Diab. Parfait pour un couple ou un voyageur seul.",
    indisponibles: ["2026-06-18", "2026-06-19", "2026-06-25", "2026-07-10"],
    equipements: ["Wi-Fi", "Vue mer", "Climatisation", "Sécurité"],
    galerie: photosDemo,
  },
  {
    id: 3,
    titre: "Villa familiale avec piscine",
    ville: "Marrakech",
    quartier: "Palmeraie",
    prix: 1800,
    note: 4.9,
    type: "Villa",
    voyageurs: 8,
    chambres: 4,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&auto=format&fit=crop&q=80",
    badge: "Premium",
    description: "Grande villa familiale avec piscine privée dans la Palmeraie. Cadre calme, idéal pour vacances en groupe.",
    indisponibles: ["2026-06-22", "2026-06-23", "2026-06-24", "2026-07-01", "2026-07-02"],
    equipements: ["Piscine", "Jardin", "Parking", "Wi-Fi"],
    galerie: photosDemo,
  },
  {
    id: 4,
    titre: "Riad traditionnel au centre",
    ville: "Fès",
    quartier: "Médina",
    prix: 780,
    note: 4.7,
    type: "Riad",
    voyageurs: 5,
    chambres: 3,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&auto=format&fit=crop&q=80",
    badge: "Authentique",
    description: "Riad traditionnel dans la médina de Fès avec décoration marocaine, patio et accès facile aux sites historiques.",
    indisponibles: ["2026-06-28", "2026-06-29", "2026-07-05"],
    equipements: ["Patio", "Wi-Fi", "Petit-déjeuner", "Climatisation"],
    galerie: photosDemo,
  },
];

const demandesInitiales: DemandeHote[] = [
  { id: 101, date: "17/06/2026", statut: "En attente", nom: "Yassine B.", telephone: "+212 6 12 34 56 78", ville: "Casablanca", quartier: "Gauthier", typeLogement: "Appartement", titre: "Appartement premium proche Twin Center", prix: "850", chambres: "2", voyageurs: "4", description: "Appartement moderne, bien équipé, proche restaurants et tramway.", photos: "Photos à envoyer sur WhatsApp", photoPreviews: [] },
  { id: 102, date: "16/06/2026", statut: "Acceptée", nom: "Salma R.", telephone: "+212 6 98 76 54 32", ville: "Marrakech", quartier: "Guéliz", typeLogement: "Studio", titre: "Studio cosy Guéliz", prix: "480", chambres: "1", voyageurs: "2", description: "Studio propre et calme au centre de Marrakech.", photos: "Lien Google Drive", photoPreviews: [] },
];

const moisNoms = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const joursNoms = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
const destinations = ["Casablanca", "Marrakech", "Fès", "Tanger", "Agadir"];
const categories = ["🏡 Maisons", "🏢 Appartements", "🌊 Bord de mer", "🏊 Piscine", "🏜️ Riads", "⭐ Premium"];

function dateISO(date: Date) { return date.toISOString().slice(0, 10); }

function joursDuCalendrier(annee: number, mois: number) {
  const premierJour = new Date(annee, mois, 1);
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  const decalage = (premierJour.getDay() + 6) % 7;
  const cases: Array<{ jour: number | null; iso: string | null }> = [];
  for (let i = 0; i < decalage; i++) cases.push({ jour: null, iso: null });
  for (let jour = 1; jour <= nbJours; jour++) cases.push({ jour, iso: dateISO(new Date(annee, mois, jour)) });
  while (cases.length % 7 !== 0) cases.push({ jour: null, iso: null });
  return cases;
}

function nightsBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function datesEntre(start: string, end: string) {
  const result: string[] = [];
  if (!start || !end) return result;
  const d = new Date(start);
  const fin = new Date(end);
  while (d < fin) { result.push(dateISO(d)); d.setDate(d.getDate() + 1); }
  return result;
}

export default function Home() {
  const [page, setPage] = useState<Page>("accueil");
  const [destination, setDestination] = useState("");
  const [type, setType] = useState("Tous");
  const [voyageurs, setVoyageurs] = useState(2);
  const [arrivee, setArrivee] = useState("2026-06-18");
  const [depart, setDepart] = useState("2026-06-22");
  const [favoris, setFavoris] = useState<number[]>([]);
  const [logementSelectionne, setLogementSelectionne] = useState<Logement | null>(null);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [demandes, setDemandes] = useState<DemandeHote[]>(demandesInitiales);
  const [filtreAdmin, setFiltreAdmin] = useState("Toutes");
  const [demandeSelectionnee, setDemandeSelectionnee] = useState<DemandeHote | null>(null);
  const [moisCalendrier, setMoisCalendrier] = useState(5);
  const [anneeCalendrier, setAnneeCalendrier] = useState(2026);
  const [selectionMode, setSelectionMode] = useState<"arrivee" | "depart">("arrivee");
  const [adminConnecte, setAdminConnecte] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");
  const [erreurAdmin, setErreurAdmin] = useState("");
  const [photosUpload, setPhotosUpload] = useState<PhotoLocale[]>([]);
  const [formHote, setFormHote] = useState({ nom: "", telephone: "", ville: "", quartier: "", typeLogement: "Appartement", titre: "", prix: "", chambres: "", voyageurs: "", description: "", photos: "" });

  const types = ["Tous", "Appartement", "Studio", "Villa", "Riad"];
  const statuts = ["Toutes", "En attente", "Acceptée", "Refusée"];

  const logementsAcceptes: Logement[] = demandes.filter((d) => d.statut === "Acceptée").map((d) => {
    const imageAnnonceur = d.photoPreviews && d.photoPreviews.length > 0 ? d.photoPreviews[0] : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&auto=format&fit=crop&q=80";
    return { id: d.id, titre: d.titre, ville: d.ville, quartier: d.quartier, prix: Number(d.prix) || 0, note: 4.5, type: d.typeLogement, voyageurs: Number(d.voyageurs) || 1, chambres: Number(d.chambres) || 1, image: imageAnnonceur, badge: "Nouveau", description: d.description, indisponibles: ["2026-06-26", "2026-06-30"], equipements: ["Wi-Fi", "Climatisation", "Cuisine équipée"], galerie: d.photoPreviews && d.photoPreviews.length > 0 ? d.photoPreviews : photosDemo };
  });

  const tousLesLogements = [...logementsBase, ...logementsAcceptes];
  const resultats = useMemo(() => tousLesLogements.filter((l) => `${l.ville} ${l.quartier} ${l.titre}`.toLowerCase().includes(destination.toLowerCase()) && (type === "Tous" || l.type === type) && l.voyageurs >= voyageurs), [destination, type, voyageurs, demandes]);
  const demandesFiltrees = filtreAdmin === "Toutes" ? demandes : demandes.filter((d) => d.statut === filtreAdmin);
  const nuits = nightsBetween(arrivee, depart);
  const prixTotal = logementSelectionne ? nuits * logementSelectionne.prix : 0;
  const fraisService = Math.round(prixTotal * 0.08);
  const totalAvecFrais = prixTotal + fraisService;
  const periodeBloquee = logementSelectionne ? datesEntre(arrivee, depart).some((d) => logementSelectionne.indisponibles.includes(d)) : false;
  const stats = { total: demandes.length, attente: demandes.filter((d) => d.statut === "En attente").length, acceptees: demandes.filter((d) => d.statut === "Acceptée").length, refusees: demandes.filter((d) => d.statut === "Refusée").length };

  const ouvrirDetail = (logement: Logement) => { setLogementSelectionne(logement); setPage("detail"); const date = new Date(arrivee || "2026-06-18"); setMoisCalendrier(date.getMonth()); setAnneeCalendrier(date.getFullYear()); };
  const gererUploadPhotos = (files: FileList | null) => {
    if (!files) return;
    const nouvellesPhotos = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, 10 - photosUpload.length).map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setPhotosUpload((prev) => [...prev, ...nouvellesPhotos].slice(0, 10));
    setFormHote((prev) => ({ ...prev, photos: [...photosUpload.map((p) => p.name), ...nouvellesPhotos.map((p) => p.name)].join(", ") }));
  };
  const supprimerPhotoUpload = (index: number) => { setPhotosUpload((prev) => { const next = prev.filter((_, i) => i !== index); setFormHote((ancien) => ({ ...ancien, photos: next.map((p) => p.name).join(", ") })); return next; }); };
  const choisirDateCalendrier = (iso: string) => { if (selectionMode === "arrivee") { setArrivee(iso); if (depart && new Date(iso) >= new Date(depart)) { const next = new Date(iso); next.setDate(next.getDate() + 1); setDepart(dateISO(next)); } setSelectionMode("depart"); } else { if (new Date(iso) <= new Date(arrivee)) { setArrivee(iso); setSelectionMode("depart"); } else { setDepart(iso); setSelectionMode("arrivee"); } } };
  const toggleFavori = (id: number) => setFavoris((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const changerStatut = (id: number, statut: Statut) => { setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, statut } : d))); setDemandeSelectionnee((prev) => (prev && prev.id === id ? { ...prev, statut } : prev)); };
  const supprimerDemande = (id: number) => { setDemandes((prev) => prev.filter((d) => d.id !== id)); setDemandeSelectionnee(null); };
  const connecterAdmin = () => { if (motDePasse === ADMIN_PASSWORD) { setAdminConnecte(true); setErreurAdmin(""); } else setErreurAdmin("Mot de passe incorrect"); };
  const lienWhatsAppClient = (logement: Logement) => `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(`Bonjour Marbnb, je suis intéressé par ce logement : ${logement.titre} à ${logement.quartier}, ${logement.ville}. Arrivée : ${arrivee}. Départ : ${depart}. Voyageurs : ${voyageurs}. Total estimé : ${totalAvecFrais} MAD pour ${nuits} nuit(s). Est-il disponible ?`)}`;
  const lienWhatsAppHote = () => `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(`Bonjour Marbnb, je souhaite publier mon logement.\n\nNom : ${formHote.nom}\nTéléphone : ${formHote.telephone}\nVille : ${formHote.ville}\nQuartier : ${formHote.quartier}\nType : ${formHote.typeLogement}\nTitre : ${formHote.titre}\nPrix/nuit : ${formHote.prix} MAD\nChambres : ${formHote.chambres}\nVoyageurs : ${formHote.voyageurs}\nDescription : ${formHote.description}\nPhotos sélectionnées : ${photosUpload.map((p) => p.name).join(", ") || formHote.photos || "Aucune"}\n\nNote : les photos sont ajoutées dans le formulaire Marbnb. Pour WhatsApp, il faudra les envoyer aussi en pièce jointe si nécessaire.`)}`;
  const ajouterDemandeLocale = () => { const nouvelleDemande: DemandeHote = { id: Date.now(), date: new Date().toLocaleDateString("fr-FR"), statut: "En attente", ...formHote, photos: photosUpload.map((p) => p.name).join(", ") || formHote.photos, photoPreviews: photosUpload.map((p) => p.url) }; setDemandes([nouvelleDemande, ...demandes]); setFormulaireOuvert(false); setPhotosUpload([]); };
  const moisPrecedent = () => { if (moisCalendrier === 0) { setMoisCalendrier(11); setAnneeCalendrier(anneeCalendrier - 1); } else setMoisCalendrier(moisCalendrier - 1); };
  const moisSuivant = () => { if (moisCalendrier === 11) { setMoisCalendrier(0); setAnneeCalendrier(anneeCalendrier + 1); } else setMoisCalendrier(moisCalendrier + 1); };
  const galerieDetail = logementSelectionne?.galerie && logementSelectionne.galerie.length > 0 ? logementSelectionne.galerie : photosDemo;

  return (
    <div className="min-h-screen bg-[#f4ead7] text-[#1e1b18]">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#9b1c1c 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <header className="sticky top-0 z-30 border-b border-[#e5d3b3] bg-[#fff8ec]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <button onClick={() => setPage("accueil")} className="flex items-center gap-3 text-left"><img src="/logo.png" alt="Logo Marbnb" className="h-12 w-12 rounded-2xl object-cover shadow-sm ring-2 ring-[#c59b54]/30" onError={(e) => { e.currentTarget.style.display = "none"; }} /><div><h1 className="text-2xl font-black tracking-tight"><span className="text-[#c1121f]">Mar</span><span className="text-[#10271d]">bnb</span></h1><p className="hidden text-xs text-[#7a6446] sm:block">Séjours authentiques au Maroc</p></div></button>
          <div className="hidden items-center gap-6 text-sm font-bold md:flex"><button onClick={() => setPage("accueil")} className="hover:text-[#c1121f]">Séjours</button><button onClick={() => setFormulaireOuvert(true)} className="hover:text-[#c1121f]">Mettre mon logement</button></div>
          <button onClick={() => setPage("admin")} className="rounded-full bg-[#0f2f22] px-5 py-2.5 text-sm font-black text-white shadow-sm hover:bg-[#174c37]">Admin</button>
        </div>
      </header>

      {page === "accueil" && (
        <main>
          <section className="relative overflow-hidden">
            <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1600&auto=format&fit=crop&q=80" alt="Décor marocain" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-[#f4ead7]" /></div>
            <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 md:pt-24">
              <div className="max-w-4xl"><p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur">🇲🇦 Plateforme marocaine · Réservation simple · MAD</p><h2 className="text-5xl font-black tracking-tight text-white drop-shadow md:text-7xl">Vivez le Maroc, réservez votre logement autrement.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">Riads, appartements, villas et studios avec disponibilité claire, contact WhatsApp et identité marocaine chaleureuse.</p></div>
              <div className="mt-10 max-w-6xl rounded-[2rem] border border-white/30 bg-[#fff8ec]/95 p-3 shadow-2xl md:rounded-full"><div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_0.9fr_auto]"><div className="rounded-full px-5 py-3 hover:bg-white"><label className="block text-xs font-black text-[#7a3d14]">Destination</label><input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ville ou quartier" className="w-full bg-transparent text-sm outline-none" /></div><div className="rounded-full px-5 py-3 hover:bg-white"><label className="block text-xs font-black text-[#7a3d14]">Arrivée</label><input type="date" value={arrivee} onChange={(e) => setArrivee(e.target.value)} className="w-full bg-transparent text-sm outline-none" /></div><div className="rounded-full px-5 py-3 hover:bg-white"><label className="block text-xs font-black text-[#7a3d14]">Départ</label><input type="date" value={depart} onChange={(e) => setDepart(e.target.value)} className="w-full bg-transparent text-sm outline-none" /></div><div className="rounded-full px-5 py-3 hover:bg-white"><label className="block text-xs font-black text-[#7a3d14]">Voyageurs</label><input type="number" min={1} value={voyageurs} onChange={(e) => setVoyageurs(Number(e.target.value) || 1)} className="w-full bg-transparent text-sm outline-none" /></div><button className="rounded-full bg-[#c1121f] px-8 py-4 font-black text-white hover:bg-[#a50f1a]">Rechercher</button></div></div>
              <div className="mt-7 flex max-w-6xl gap-3 overflow-x-auto pb-2">{categories.map((cat) => <button key={cat} className="shrink-0 rounded-full border border-[#e5d3b3] bg-[#fff8ec] px-5 py-3 text-sm font-black shadow-sm hover:border-[#c1121f] hover:text-[#c1121f]">{cat}</button>)}</div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-10"><div className="grid gap-4 md:grid-cols-5">{destinations.map((ville) => <button key={ville} onClick={() => setDestination(ville)} className="rounded-[2rem] bg-[#0f2f22] p-5 text-left text-white shadow-sm hover:bg-[#c1121f]"><p className="text-lg font-black">{ville}</p><p className="mt-1 text-sm text-white/70">Explorer</p></button>)}</div></section>
          <section className="mx-auto max-w-7xl px-4 py-8"><div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="font-black text-[#c1121f]">Sélection Marbnb</p><h3 className="text-3xl font-black">Logements recommandés</h3><p className="text-[#7a6446]">Cartes modernes, disponibilité, photos annonceur et prix transparent.</p></div><div className="flex gap-2 overflow-x-auto">{types.map((t) => <button key={t} onClick={() => setType(t)} className={`rounded-full border px-5 py-2.5 text-sm font-bold ${type === t ? "bg-[#0f2f22] text-white" : "bg-[#fff8ec] hover:border-[#c1121f]"}`}>{t}</button>)}</div></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{resultats.map((l) => <div key={l.id} className="group overflow-hidden rounded-[2rem] bg-[#fff8ec] shadow-sm ring-1 ring-[#e5d3b3] transition hover:-translate-y-1 hover:shadow-2xl"><div className="relative"><img src={l.image} alt={l.titre} className="h-60 w-full object-cover transition duration-300 group-hover:scale-105" /><button onClick={() => toggleFavori(l.id)} className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-white/95 shadow">{favoris.includes(l.id) ? "❤️" : "🤍"}</button><span className="absolute left-3 top-3 rounded-full bg-[#fff8ec]/95 px-3 py-1 text-xs font-black text-[#7a3d14]">{l.badge}</span></div><div className="p-5"><div className="flex justify-between gap-3"><h4 className="font-black leading-tight">{l.titre}</h4><span className="text-sm font-bold">⭐ {l.note}</span></div><p className="mt-1 text-sm text-[#7a6446]">{l.quartier}, {l.ville}</p><p className="mt-3 text-sm text-[#7a6446]">{l.chambres} chambre(s) · {l.voyageurs} voyageurs</p><p className="mt-3"><span className="text-lg font-black">{l.prix} MAD</span> <span className="text-sm text-[#7a6446]">/ nuit</span></p><button onClick={() => ouvrirDetail(l)} className="mt-4 w-full rounded-2xl bg-[#c1121f] py-3 font-black text-white hover:bg-[#a50f1a]">Voir détails</button></div></div>)}</div></section>
        </main>
      )}

      {page === "detail" && logementSelectionne && <main className="mx-auto max-w-7xl px-4 py-8"><button onClick={() => setPage("accueil")} className="mb-5 rounded-full border border-[#e5d3b3] bg-[#fff8ec] px-5 py-2 font-bold">← Retour</button><div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><h2 className="text-4xl font-black">{logementSelectionne.titre}</h2><p className="mt-2 text-[#7a6446]">📍 {logementSelectionne.quartier}, {logementSelectionne.ville} · ⭐ {logementSelectionne.note}</p></div><button onClick={() => toggleFavori(logementSelectionne.id)} className="rounded-full border bg-[#fff8ec] px-5 py-2 font-bold">{favoris.includes(logementSelectionne.id) ? "❤️ Favori" : "🤍 Ajouter aux favoris"}</button></div><div className="grid gap-3 md:grid-cols-4 md:grid-rows-2"><img src={logementSelectionne.image} alt={logementSelectionne.titre} className="h-96 w-full rounded-[2rem] object-cover md:col-span-2 md:row-span-2" />{galerieDetail.slice(0,4).map((photo, index) => <img key={index} src={photo} alt={`Photo logement ${index + 1}`} className="hidden h-full w-full rounded-[2rem] object-cover md:block" />)}</div><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]"><div><h3 className="text-2xl font-black">Description</h3><p className="mt-3 leading-8 text-[#5f4b32]">{logementSelectionne.description}</p><div className="mt-8 border-t border-[#e5d3b3] pt-8"><h3 className="text-2xl font-black">Ce que propose ce logement</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{logementSelectionne.equipements.map((e) => <div key={e} className="rounded-2xl border border-[#e5d3b3] bg-[#fff8ec] p-4 font-bold">✓ {e}</div>)}</div></div><div className="mt-8 rounded-[2rem] border border-[#e5d3b3] bg-[#fff8ec] p-5"><div className="mb-4 flex items-center justify-between"><button onClick={moisPrecedent} className="rounded-full border px-3 py-1 font-black">‹</button><h4 className="font-black">{moisNoms[moisCalendrier]} {anneeCalendrier}</h4><button onClick={moisSuivant} className="rounded-full border px-3 py-1 font-black">›</button></div><p className="mb-4 text-sm text-[#7a6446]">Clique pour choisir arrivée puis départ. Mode : <b>{selectionMode === "arrivee" ? "arrivée" : "départ"}</b></p><div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-[#7a6446]">{joursNoms.map((j) => <div key={j}>{j}</div>)}</div><div className="mt-2 grid grid-cols-7 gap-2">{joursDuCalendrier(anneeCalendrier, moisCalendrier).map((caseJour, index) => { const bloque = caseJour.iso ? logementSelectionne.indisponibles.includes(caseJour.iso) : false; const dansPeriode = caseJour.iso ? datesEntre(arrivee, depart).includes(caseJour.iso) : false; const choisi = caseJour.iso === arrivee || caseJour.iso === depart; return <button key={index} disabled={!caseJour.jour || bloque} onClick={() => caseJour.iso && choisirDateCalendrier(caseJour.iso)} className={`h-11 rounded-xl text-sm font-bold ${!caseJour.jour ? "bg-transparent" : bloque ? "bg-red-50 text-red-300 line-through" : choisi ? "bg-[#0f2f22] text-white" : dansPeriode ? "bg-[#e5d3b3] text-[#1e1b18]" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>{caseJour.jour || ""}</button>; })}</div></div></div><div className="h-fit rounded-[2rem] border border-[#e5d3b3] bg-[#fff8ec] p-5 shadow-xl"><p><span className="text-2xl font-black">{logementSelectionne.prix} MAD</span> / nuit</p><div className="mt-4 overflow-hidden rounded-2xl border border-[#e5d3b3]"><div className="grid grid-cols-2 border-b"><div className="p-3"><p className="text-xs font-black">ARRIVÉE</p><input type="date" value={arrivee} onChange={(e) => setArrivee(e.target.value)} className="w-full bg-transparent outline-none" /></div><div className="border-l p-3"><p className="text-xs font-black">DÉPART</p><input type="date" value={depart} onChange={(e) => setDepart(e.target.value)} className="w-full bg-transparent outline-none" /></div></div><div className="p-3"><p className="text-xs font-black">VOYAGEURS</p><input type="number" min={1} value={voyageurs} onChange={(e) => setVoyageurs(Number(e.target.value) || 1)} className="w-full bg-transparent outline-none" /></div></div>{periodeBloquee && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">Cette période contient une date indisponible.</p>}<div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span>{logementSelectionne.prix} MAD x {nuits} nuit(s)</span><span>{prixTotal} MAD</span></div><div className="flex justify-between"><span>Frais de service</span><span>{fraisService} MAD</span></div><div className="border-t pt-3 flex justify-between text-base font-black"><span>Total</span><span>{totalAvecFrais} MAD</span></div></div><a href={lienWhatsAppClient(logementSelectionne)} target="_blank" rel="noreferrer"><button disabled={nuits === 0 || periodeBloquee} className="mt-5 w-full rounded-2xl bg-green-700 py-3 font-black text-white hover:bg-green-800 disabled:bg-slate-300">Demander sur WhatsApp</button></a></div></div></main>}

      {page === "admin" && <main className="mx-auto max-w-7xl px-4 py-10">{!adminConnecte ? <div className="mx-auto max-w-md rounded-[2rem] bg-[#fff8ec] p-8 shadow-xl"><h2 className="text-3xl font-black">Connexion Admin</h2><p className="mt-2 text-sm text-[#7a6446]">Mot de passe prototype : admin123</p><input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="Mot de passe" className="mt-5 w-full rounded-2xl border bg-white px-4 py-3 outline-none" /><button onClick={connecterAdmin} className="mt-4 w-full rounded-2xl bg-[#0f2f22] py-3 font-black text-white">Se connecter</button>{erreurAdmin && <p className="mt-3 text-sm font-bold text-red-600">{erreurAdmin}</p>}</div> : <><div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-3 inline-block rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-black text-red-700">Espace Admin Marbnb</p><h2 className="text-4xl font-black">Gestion des demandes hôtes</h2><p className="mt-2 text-[#7a6446]">Valide, refuse, consulte ou supprime les demandes propriétaires.</p></div><button onClick={() => setAdminConnecte(false)} className="rounded-2xl border bg-[#fff8ec] px-5 py-3 font-bold">Déconnexion</button></div><div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm"><p className="text-sm text-[#7a6446]">Total demandes</p><p className="text-3xl font-black">{stats.total}</p></div><div className="rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm"><p className="text-sm text-[#7a6446]">En attente</p><p className="text-3xl font-black text-amber-600">{stats.attente}</p></div><div className="rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm"><p className="text-sm text-[#7a6446]">Acceptées</p><p className="text-3xl font-black text-green-600">{stats.acceptees}</p></div><div className="rounded-[2rem] bg-[#fff8ec] p-5 shadow-sm"><p className="text-sm text-[#7a6446]">Refusées</p><p className="text-3xl font-black text-red-600">{stats.refusees}</p></div></div><div className="overflow-hidden rounded-[2rem] bg-[#fff8ec] shadow-sm"><div className="flex flex-wrap justify-between gap-3 border-b p-5"><h3 className="text-xl font-black">Demandes reçues</h3><div className="flex gap-2">{statuts.map((s) => <button key={s} onClick={() => setFiltreAdmin(s)} className={`rounded-full border px-4 py-2 text-sm font-bold ${filtreAdmin === s ? "bg-[#0f2f22] text-white" : "bg-white"}`}>{s}</button>)}</div></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#f4ead7] text-[#7a6446]"><tr><th className="p-4 text-left">Photo</th><th className="p-4 text-left">Date</th><th className="p-4 text-left">Propriétaire</th><th className="p-4 text-left">Logement</th><th className="p-4 text-left">Ville</th><th className="p-4 text-left">Prix</th><th className="p-4 text-left">Statut</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{demandesFiltrees.map((d) => <tr key={d.id} className="border-t hover:bg-white/60"><td className="p-4">{d.photoPreviews && d.photoPreviews[0] ? <img src={d.photoPreviews[0]} alt={d.titre} className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-slate-100" />}</td><td className="p-4">{d.date}</td><td className="p-4"><p className="font-black">{d.nom}</p><p className="text-[#7a6446]">{d.telephone}</p></td><td className="p-4"><p className="font-black">{d.titre}</p><p className="text-[#7a6446]">{d.photos || "Aucune photo"}</p></td><td className="p-4">{d.quartier}, {d.ville}</td><td className="p-4 font-black">{d.prix} MAD</td><td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-black ${d.statut === "Acceptée" ? "bg-green-100 text-green-700" : d.statut === "Refusée" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{d.statut}</span></td><td className="p-4"><div className="flex justify-end gap-2"><button onClick={() => setDemandeSelectionnee(d)} className="rounded-xl border bg-white px-3 py-2">Voir</button><button onClick={() => changerStatut(d.id, "Acceptée")} className="rounded-xl bg-green-600 px-3 py-2 text-white">Accepter</button><button onClick={() => changerStatut(d.id, "Refusée")} className="rounded-xl bg-red-600 px-3 py-2 text-white">Refuser</button></div></td></tr>)}</tbody></table></div></div></>}</main>}

      {formulaireOuvert && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-[#fff8ec]"><div className="sticky top-0 flex justify-between border-b bg-[#fff8ec] px-6 py-5"><div><h3 className="text-2xl font-black">Publier un logement sur Marbnb</h3><p className="text-sm text-[#7a6446]">Remplis les informations du logement et ajoute jusqu'à 10 photos.</p></div><button onClick={() => setFormulaireOuvert(false)} className="h-10 w-10 rounded-full bg-white">X</button></div><div className="grid gap-4 p-6 md:grid-cols-2">{(["nom", "telephone", "ville", "quartier", "titre", "prix", "chambres", "voyageurs"] as const).map((key) => <div key={key}><label className="text-sm font-bold capitalize">{key}</label><input value={formHote[key]} onChange={(e) => setFormHote({ ...formHote, [key]: e.target.value })} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" /></div>)}<div><label className="text-sm font-bold">Type de logement</label><select value={formHote.typeLogement} onChange={(e) => setFormHote({ ...formHote, typeLogement: e.target.value })} className="w-full rounded-2xl border bg-white px-4 py-3"><option>Appartement</option><option>Studio</option><option>Villa</option><option>Riad</option><option>Maison</option></select></div><div className="md:col-span-2"><label className="text-sm font-bold">Description</label><textarea value={formHote.description} onChange={(e) => setFormHote({ ...formHote, description: e.target.value })} className="min-h-28 w-full rounded-2xl border bg-white px-4 py-3" /></div><div className="md:col-span-2"><label className="text-sm font-bold">Upload des photos du logement</label><div className="mt-2 rounded-[2rem] border-2 border-dashed border-[#c59b54] bg-white/70 p-6 text-center"><input id="photos-logement" type="file" accept="image/*" multiple onChange={(e) => gererUploadPhotos(e.target.files)} className="hidden" /><label htmlFor="photos-logement" className="inline-flex cursor-pointer rounded-2xl bg-[#0f2f22] px-6 py-3 font-black text-white">Choisir des photos</label><p className="mt-3 text-sm text-[#7a6446]">JPG, PNG, WEBP. Maximum 10 photos.</p></div>{photosUpload.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">{photosUpload.map((photo, index) => <div key={photo.url} className="relative"><img src={photo.url} alt={photo.name} className="h-28 w-full rounded-2xl object-cover" /><button onClick={() => supprimerPhotoUpload(index)} className="absolute right-2 top-2 h-7 w-7 rounded-full bg-white font-black text-red-600">×</button><p className="mt-1 truncate text-xs text-[#7a6446]">{photo.name}</p></div>)}</div>}</div><div className="md:col-span-2"><label className="text-sm font-bold">Lien photos optionnel</label><input value={formHote.photos} onChange={(e) => setFormHote({ ...formHote, photos: e.target.value })} className="w-full rounded-2xl border bg-white px-4 py-3" placeholder="Lien Google Drive si tu préfères" /></div><div className="mt-4 flex flex-col justify-end gap-3 md:col-span-2 md:flex-row"><button onClick={() => setFormulaireOuvert(false)} className="rounded-2xl border px-6 py-3">Annuler</button><button onClick={ajouterDemandeLocale} className="rounded-2xl bg-[#0f2f22] px-6 py-3 font-black text-white">Ajouter dans Admin</button><a href={lienWhatsAppHote()} target="_blank" rel="noreferrer"><button className="rounded-2xl bg-green-700 px-6 py-3 font-black text-white">Envoyer sur WhatsApp</button></a></div></div></div></div>}

      {demandeSelectionnee && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-[#fff8ec] p-6"><div className="mb-6 flex justify-between"><div><h3 className="text-2xl font-black">Détail de la demande</h3><p className="text-[#7a6446]">#{demandeSelectionnee.id} · {demandeSelectionnee.date}</p></div><button onClick={() => setDemandeSelectionnee(null)} className="h-10 w-10 rounded-full bg-white">X</button></div>{demandeSelectionnee.photoPreviews && demandeSelectionnee.photoPreviews.length > 0 && <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">{demandeSelectionnee.photoPreviews.map((photo, index) => <img key={photo} src={photo} alt={`Photo ${index + 1}`} className="h-32 w-full rounded-2xl object-cover" />)}</div>}<div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-white p-4"><p className="text-sm text-[#7a6446]">Propriétaire</p><p className="font-black">{demandeSelectionnee.nom}</p><p>{demandeSelectionnee.telephone}</p></div><div className="rounded-2xl bg-white p-4"><p className="text-sm text-[#7a6446]">Statut</p><p className="font-black">{demandeSelectionnee.statut}</p></div><div className="rounded-2xl bg-white p-4"><p className="text-sm text-[#7a6446]">Logement</p><p className="font-black">{demandeSelectionnee.titre}</p><p>{demandeSelectionnee.typeLogement}</p></div><div className="rounded-2xl bg-white p-4"><p className="text-sm text-[#7a6446]">Adresse</p><p>{demandeSelectionnee.quartier}, {demandeSelectionnee.ville}</p></div><div className="rounded-2xl bg-white p-4 md:col-span-2"><p className="text-sm text-[#7a6446]">Description</p><p>{demandeSelectionnee.description}</p></div></div><div className="mt-6 flex flex-col justify-end gap-3 md:flex-row"><button onClick={() => changerStatut(demandeSelectionnee.id, "Acceptée")} className="rounded-2xl bg-green-600 px-6 py-3 text-white">Accepter</button><button onClick={() => changerStatut(demandeSelectionnee.id, "Refusée")} className="rounded-2xl bg-red-600 px-6 py-3 text-white">Refuser</button><button onClick={() => supprimerDemande(demandeSelectionnee.id)} className="rounded-2xl border px-6 py-3 text-red-600">Supprimer</button></div></div></div>}

      <section className="border-t border-[#e5d3b3] bg-[#fff8ec]"><div className="mx-auto max-w-7xl px-4 py-8"><h3 className="font-black">Marbnb.ma</h3><p className="mt-2 text-sm text-[#7a6446]">Design marocain : couleurs chaudes, rouge Maroc, vert traditionnel, fond beige et ambiance riad.</p></div></section>
      <footer className="border-t border-[#e5d3b3] bg-[#fff8ec]"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-8 text-sm text-[#7a6446] md:flex-row"><p>© 2026 Marbnb. Tous droits réservés.</p><p>Paiement sécurisé · Données protégées · Support 7/7</p></div></footer>
    </div>
  );
}
