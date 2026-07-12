/*
  Marbnb auto-fix script
  Usage:
    1) Place this file in the root of your Marbnb project: C:\Users\SAGHOUGH\marbnb
    2) Run: node marbnb-auto-fix.js
    3) Run: npm run build
    4) If OK: git add . && git commit -m "Fix admin demandes, logements, reservations and photos" && git push
*/

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

function write(p, content) {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("[OK] écrit : " + p);
}

function patch(p, callback) {
  if (!exists(p)) {
    console.log("[INFO] fichier absent, ignoré : " + p);
    return;
  }
  const before = read(p);
  const after = callback(before);
  if (after !== before) write(p, after);
  else console.log("[OK] déjà corrigé : " + p);
}

function firstExisting(candidates) {
  return candidates.find(exists) || candidates[0];
}

const files = {
  adminDemandes: firstExisting(["app/admin-demandes/page.tsx", "app/admin demande/page.tsx", "app/admin-demande/page.tsx"]),
  adminLogements: firstExisting(["app/admin-logements/page.tsx", "app/admin logements/page.tsx"]),
  adminReservations: firstExisting(["app/admin-reservations/page.tsx", "app/admin reservations/page.tsx"]),
  resultats: firstExisting(["app/resultats/page.tsx", "app/sesultats/page.tsx"]),
  compte: firstExisting(["app/compte/page.tsx"]),
  installation: firstExisting(["app/installation/page.tsx"]),
};

const adminDemandesPage = String.raw`"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Demande = Record<string, any>;

type StatutDemande = "Toutes" | "En attente" | "Acceptée" | "Refusée";

function getText(row: Demande, keys: string[], fallback = "-") {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return String(value);
  }
  return fallback;
}

function getNumber(row: Demande, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = Number(row?.[key]);
    if (!Number.isNaN(value) && value > 0) return value;
  }
  return fallback;
}

function parsePhotos(value: unknown, imageUrl?: string | null) {
  const photos: string[] = [];
  if (imageUrl) photos.push(String(imageUrl));
  if (Array.isArray(value)) photos.push(...value.filter(Boolean).map(String));
  else if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) photos.push(...parsed.filter(Boolean).map(String));
      else if (parsed) photos.push(String(parsed));
    } catch {
      photos.push(value);
    }
  }
  return Array.from(new Set(photos.filter(Boolean)));
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR");
}

export default function AdminDemandesPage() {
  const [autorise, setAutorise] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [filtre, setFiltre] = useState<StatutDemande>("Toutes");
  const [ouverte, setOuverte] = useState<Demande | null>(null);
  const [actionId, setActionId] = useState<string | number | null>(null);

  useEffect(() => {
    const ok = localStorage.getItem("marbnb_admin_ok") === "true" || localStorage.getItem("mbnb_admin_ok") === "true";
    if (!ok) {
      window.location.href = "/admin-login";
      return;
    }
    setAutorise(true);
    chargerDemandes();
  }, []);

  async function chargerDemandes() {
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase
      .from("demandes_hotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Erreur chargement demandes : " + error.message + " — vérifie la table demandes_hotes dans Supabase.");
      setDemandes([]);
    } else {
      setDemandes(data || []);
    }
    setLoading(false);
  }

  async function accepterDemande(demande: Demande) {
    const id = demande.id;
    setActionId(id);
    setMessage("");

    const photos = parsePhotos(demande.photos, demande.image_url);
    const logement = {
      titre: getText(demande, ["titre", "nom_logement"], "Logement Marbnb"),
      ville: getText(demande, ["ville", "city"], "Casablanca"),
      quartier: getText(demande, ["quartier", "adresse", "zone"], "Centre"),
      type_logement: getText(demande, ["type_logement", "typeLogement", "type"], "Appartement"),
      prix: getNumber(demande, ["prix", "price"], 0),
      chambres: getNumber(demande, ["chambres", "rooms"], 1),
      voyageurs: getNumber(demande, ["voyageurs", "guests"], 1),
      description: getText(demande, ["description"], "Logement proposé par un hôte Marbnb."),
      image_url: photos[0] || null,
      photos: JSON.stringify(photos),
      statut: "Actif",
    };

    const { error: insertError } = await supabase.from("logements").insert(logement);
    if (insertError) {
      setActionId(null);
      setMessage("Erreur publication logement : " + insertError.message + " — vérifie que la table logements contient les colonnes utilisées.");
      return;
    }

    const { error: updateError } = await supabase.from("demandes_hotes").update({ statut: "Acceptée" }).eq("id", id);
    if (updateError) {
      setMessage("Logement publié, mais statut demande non modifié : " + updateError.message);
    } else {
      setMessage("Demande acceptée ✅ Logement publié dans les résultats.");
    }

    setDemandes((old) => old.map((d) => (d.id === id ? { ...d, statut: "Acceptée" } : d)));
    setActionId(null);
  }

  async function refuserDemande(id: string | number) {
    const ok = window.confirm("Refuser cette demande hôte ?");
    if (!ok) return;
    setActionId(id);
    setMessage("");
    const { error } = await supabase.from("demandes_hotes").update({ statut: "Refusée" }).eq("id", id);
    if (error) {
      setMessage("Erreur refus demande : " + error.message);
    } else {
      setDemandes((old) => old.map((d) => (d.id === id ? { ...d, statut: "Refusée" } : d)));
      setMessage("Demande refusée.");
    }
    setActionId(null);
  }

  async function remettreEnAttente(id: string | number) {
    setActionId(id);
    setMessage("");
    const { error } = await supabase.from("demandes_hotes").update({ statut: "En attente" }).eq("id", id);
    if (error) {
      setMessage("Erreur modification statut : " + error.message);
    } else {
      setDemandes((old) => old.map((d) => (d.id === id ? { ...d, statut: "En attente" } : d)));
      setMessage("Demande remise en attente.");
    }
    setActionId(null);
  }

  function deconnexion() {
    localStorage.removeItem("marbnb_admin_ok");
    localStorage.removeItem("mbnb_admin_ok");
    window.location.href = "/admin-login";
  }

  const visibles = useMemo(() => {
    if (filtre === "Toutes") return demandes;
    return demandes.filter((d) => getText(d, ["statut"], "En attente") === filtre);
  }, [demandes, filtre]);

  const stats = useMemo(() => ({
    total: demandes.length,
    attente: demandes.filter((d) => getText(d, ["statut"], "En attente") === "En attente").length,
    acceptees: demandes.filter((d) => getText(d, ["statut"], "") === "Acceptée").length,
    refusees: demandes.filter((d) => getText(d, ["statut"], "") === "Refusée").length,
  }), [demandes]);

  if (!autorise) return <main className="min-h-screen bg-[#f4ead7] p-8 font-black">Vérification accès admin...</main>;

  return (
    <main className="min-h-screen bg-[#f4ead7] px-4 py-8 text-[#1e1b18]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href="/admin-dashboard" className="text-sm font-black text-[#c1121f]">← Dashboard</a>
          <div className="flex flex-wrap gap-2">
            <a href="/admin-logements" className="rounded-full bg-[#7a3d14] px-5 py-2 text-sm font-black text-white">Logements</a>
            <a href="/admin-reservations" className="rounded-full bg-[#c1121f] px-5 py-2 text-sm font-black text-white">Réservations</a>
            <button onClick={chargerDemandes} className="rounded-full bg-white px-5 py-2 text-sm font-black text-[#7a3d14] ring-1 ring-[#e5d3b3]">Actualiser</button>
            <button onClick={deconnexion} className="rounded-full bg-red-700 px-5 py-2 text-sm font-black text-white">Déconnexion</button>
          </div>
        </div>

        <section className="mt-5 rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3]">
          <p className="font-black text-[#c1121f]">Admin Marbnb</p>
          <h1 className="mt-2 text-4xl font-black">Demandes hôtes</h1>
          <p className="mt-3 text-[#7a6446]">Accepter une demande publie automatiquement le logement dans la table logements.</p>

          {message && <p className="mt-4 rounded-2xl bg-[#EAF3E4] p-4 font-bold text-[#3F7D3B]">{message}</p>}
          {loading && <p className="mt-6 font-bold">Chargement...</p>}

          {!loading && (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]"><p className="text-xs font-black text-[#7a3d14]">Total</p><p className="mt-2 text-3xl font-black">{stats.total}</p></div>
                <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]"><p className="text-xs font-black text-[#7a3d14]">En attente</p><p className="mt-2 text-3xl font-black">{stats.attente}</p></div>
                <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]"><p className="text-xs font-black text-[#7a3d14]">Acceptées</p><p className="mt-2 text-3xl font-black">{stats.acceptees}</p></div>
                <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]"><p className="text-xs font-black text-[#7a3d14]">Refusées</p><p className="mt-2 text-3xl font-black">{stats.refusees}</p></div>
              </div>

              <div className="mt-5 rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]">
                <label className="text-xs font-black text-[#7a3d14]">Filtrer par statut</label>
                <select value={filtre} onChange={(e) => setFiltre(e.target.value as StatutDemande)} className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 outline-none md:w-72">
                  <option>Toutes</option>
                  <option>En attente</option>
                  <option>Acceptée</option>
                  <option>Refusée</option>
                </select>
              </div>

              <div className="mt-6 grid gap-5">
                {visibles.map((d) => {
                  const photos = parsePhotos(d.photos, d.image_url);
                  const statut = getText(d, ["statut"], "En attente");
                  const busy = actionId === d.id;
                  return (
                    <article key={String(d.id)} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-[#e5d3b3] md:grid-cols-[220px_1fr]">
                      <div>
                        {photos.length > 0 ? <img src={photos[0]} alt={getText(d, ["titre"], "Demande logement")} className="h-44 w-full rounded-2xl object-cover" /> : <div className="grid h-44 place-items-center rounded-2xl bg-[#f4ead7] text-sm font-bold text-[#7a6446]">Pas de photo</div>}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="text-2xl font-black">{getText(d, ["titre", "nom_logement"], "Logement Marbnb")}</h2>
                            <p className="mt-1 text-sm text-[#7a6446]">{getText(d, ["type_logement", "typeLogement", "type"], "Appartement")} · {getText(d, ["quartier"], "Centre")}, {getText(d, ["ville"], "Maroc")}</p>
                            <p className="mt-1 text-sm text-[#7a6446]">Hôte : <b>{getText(d, ["nom", "name"], "-")}</b> · {getText(d, ["telephone", "phone"], "-")}</p>
                          </div>
                          <span className="rounded-full bg-[#f4ead7] px-4 py-2 text-sm font-black text-[#7a3d14]">{statut}</span>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-4">
                          <div className="rounded-2xl bg-[#fff8ec] p-4"><p className="text-xs font-black text-[#7a3d14]">Prix</p><p className="font-black">{getNumber(d, ["prix"], 0).toLocaleString("fr-FR")} MAD</p></div>
                          <div className="rounded-2xl bg-[#fff8ec] p-4"><p className="text-xs font-black text-[#7a3d14]">Chambres</p><p className="font-black">{getNumber(d, ["chambres"], 1)}</p></div>
                          <div className="rounded-2xl bg-[#fff8ec] p-4"><p className="text-xs font-black text-[#7a3d14]">Voyageurs</p><p className="font-black">{getNumber(d, ["voyageurs"], 1)}</p></div>
                          <div className="rounded-2xl bg-[#fff8ec] p-4"><p className="text-xs font-black text-[#7a3d14]">Date</p><p className="font-black">{formatDate(d.created_at)}</p></div>
                        </div>
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#5f4b32]">{getText(d, ["description"], "Aucune description.")}</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button disabled={busy} onClick={() => setOuverte(d)} className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#7a3d14] ring-1 ring-[#e5d3b3] disabled:opacity-60">Voir détails</button>
                          <button disabled={busy || statut === "Acceptée"} onClick={() => accepterDemande(d)} className="rounded-full bg-[#3F7D3B] px-5 py-3 text-sm font-black text-white disabled:opacity-50">Accepter / publier</button>
                          <button disabled={busy || statut === "Refusée"} onClick={() => refuserDemande(d.id)} className="rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white disabled:opacity-50">Refuser</button>
                          {statut !== "En attente" && <button disabled={busy} onClick={() => remettreEnAttente(d.id)} className="rounded-full bg-amber-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50">Remettre en attente</button>}
                        </div>
                      </div>
                    </article>
                  );
                })}
                {visibles.length === 0 && <p className="rounded-[2rem] bg-white p-8 text-center font-bold text-[#7a6446] ring-1 ring-[#e5d3b3]">Aucune demande pour ce filtre.</p>}
              </div>
            </>
          )}
        </section>
      </div>

      {ouverte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-[#fff8ec] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-[#c1121f]">Détail demande #{ouverte.id}</p>
                <h2 className="mt-1 text-3xl font-black">{getText(ouverte, ["titre"], "Logement Marbnb")}</h2>
              </div>
              <button onClick={() => setOuverte(null)} className="grid h-10 w-10 place-items-center rounded-full bg-white font-black ring-1 ring-[#e5d3b3]">×</button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {parsePhotos(ouverte.photos, ouverte.image_url).map((p, i) => <img key={p + i} src={p} alt={`Photo ${i + 1}`} className="h-44 w-full rounded-2xl object-cover" />)}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-[#e5d3b3]"><p className="text-xs font-black text-[#7a3d14]">Propriétaire</p><p className="font-bold">{getText(ouverte, ["nom"])} — {getText(ouverte, ["telephone"])}</p></div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-[#e5d3b3]"><p className="text-xs font-black text-[#7a3d14]">Localisation</p><p className="font-bold">{getText(ouverte, ["quartier"], "Centre")}, {getText(ouverte, ["ville"], "Maroc")}</p></div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-[#e5d3b3] md:col-span-2"><p className="text-xs font-black text-[#7a3d14]">Description</p><p className="mt-2 whitespace-pre-wrap leading-7">{getText(ouverte, ["description"], "-")}</p></div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
`;

// 1) Remplacer l'ancien prototype Admin demandes par une page Supabase propre.
write(files.adminDemandes, adminDemandesPage);

// 2) Corriger admin logements : fonction manquante, encodage, textes et sécurité.
patch(files.adminLogements, (s) => {
  s = s
    .replaceAll("Modification enregistrÃ©e âœ…", "Modification enregistrée ✅")
    .replaceAll("Supprimer dÃ©finitivement", "Supprimer définitivement")
    .replaceAll("Logement supprimÃ© âœ…", "Logement supprimé ✅")
    .replaceAll("VÃ©rification accÃ¨s admin", "Vérification accès admin")
    .replaceAll("â† Demandes hÃ´tes", "← Demandes hôtes")
    .replaceAll("Voir rÃ©sultats", "Voir résultats")
    .replaceAll("DÃ©connexion", "Déconnexion")
    .replaceAll("publiÃ©", "publié")
    .replaceAll("MasquÃ©", "Masqué")
    .replaceAll("ArchivÃ©", "Archivé")
    .replaceAll(" Â· ", " · ");

  if (!s.includes("async function sauvegarderLogement")) {
    const fn = `
  async function sauvegarderLogement(logement: Logement) {
    const { error } = await supabase
      .from("logements")
      .update({
        prix: logement.prix,
        chambres: logement.chambres,
        voyageurs: logement.voyageurs,
        statut: logement.statut,
      })
      .eq("id", logement.id);

    if (error) {
      setMessage("Erreur sauvegarde : " + error.message);
      return;
    }

    setMessage("Modifications enregistrées ✅");
  }
`;
    s = s.replace("  async function supprimerLogement", fn + "\n  async function supprimerLogement");
  }
  return s;
});

// 3) Corriger résultats : afficher les vraies photos Supabase avant les images fallback.
patch(files.resultats, (s) => {
  s = s.replace(
    "const imagePrincipale = getLogementFallbackImage(index);",
    "const imagePrincipale = photosBase[0] || l.image_url || getLogementFallbackImage(index);"
  );
  s = s.replaceAll("text-#3F7D3B", "text-[#3F7D3B]");
  s = s.replaceAll("bg-#3F7D3B", "bg-[#3F7D3B]");
  return s;
});

// 4) Corriger réservations : classes Tailwind invalides + cohérence accès admin.
patch(files.adminReservations, (s) => {
  s = s.replaceAll("bg-#3F7D3B", "bg-[#3F7D3B]");
  s = s.replaceAll("text-#3F7D3B", "text-[#3F7D3B]");
  s = s.replace(
    'const ok = localStorage.getItem("marbnb_admin_ok") === "true";',
    'const ok = localStorage.getItem("marbnb_admin_ok") === "true" || localStorage.getItem("mbnb_admin_ok") === "true";'
  );
  s = s.replace(
    'localStorage.removeItem("marbnb_admin_ok");',
    'localStorage.removeItem("marbnb_admin_ok");\n    localStorage.removeItem("mbnb_admin_ok");'
  );
  return s;
});

// 5) Corriger petits problèmes de className dans compte si présents.
patch(files.compte, (s) => {
  s = s.replaceAll("text-#3F7D3B", "text-[#3F7D3B]");
  return s;
});

// 6) Amélioration : page installation en JSX propre si nécessaire.
if (exists(files.installation)) {
  const current = read(files.installation);
  if (!current.includes("<main") || current.includes("Application Marbnb")) {
    write(files.installation, String.raw`"use client";

export default function InstallationPage() {
  return (
    <main className="min-h-screen bg-[#f4ead7] px-4 py-8 text-[#1e1b18]">
      <section className="mx-auto max-w-3xl rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3] md:p-8">
        <a href="/" className="font-black text-[#c1121f]">← Retour accueil</a>
        <p className="mt-6 font-black text-[#c1121f]">Application Marbnb</p>
        <h1 className="mt-2 text-4xl font-black">Installer Marbnb sur Android et iPhone</h1>
        <p className="mt-4 leading-7 text-[#7a6446]">
          Cette version transforme le site en application installable. Le site reste le même : quand vous modifiez le site ou l’admin, l’application se met à jour automatiquement.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]">
            <h2 className="text-xl font-black">Android</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[#5f4b32]">
              <li>Ouvrir Marbnb dans Chrome.</li>
              <li>Appuyer sur le bouton “Installer” si le message apparaît.</li>
              <li>Sinon : menu ⋮ puis “Ajouter à l’écran d’accueil”.</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]">
            <h2 className="text-xl font-black">iPhone</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[#5f4b32]">
              <li>Ouvrir Marbnb dans Safari.</li>
              <li>Appuyer sur le bouton Partager.</li>
              <li>Choisir “Ajouter à l’écran d’accueil”.</li>
              <li>Valider avec le nom “Marbnb”.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]">
          <h2 className="text-xl font-black">Modifier le site</h2>
          <p className="mt-2 text-[#7a6446]">Les modifications restent centralisées sur le site web. Pour modifier les logements, réservations et demandes, utilisez l’espace Admin.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/admin-dashboard" className="rounded-full bg-[#c1121f] px-5 py-3 text-sm font-black text-white">Ouvrir Admin</a>
            <a href="/resultats" className="rounded-full bg-[#3F7D3B] px-5 py-3 text-sm font-black text-white">Explorer</a>
          </div>
        </div>
      </section>
    </main>
  );
}
`);
  }
}

console.log("\n✅ Corrections Marbnb terminées.");
console.log("Étape suivante : npm run build");
console.log("Si le build est OK : git add . && git commit -m \"Fix Marbnb admin workflow\" && git push");
