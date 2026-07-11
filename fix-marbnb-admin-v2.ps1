# fix-marbnb-admin-v2.ps1
# Correction V2 plus robuste pour Marbnb
# A lancer depuis C:\Users\SAGHOUGH\marbnb

$ErrorActionPreference = "Stop"
$root = Get-Location
$adminDemandes = Join-Path $root "app\admin-demandes\page.tsx"
$adminLogements = Join-Path $root "app\admin-logements\page.tsx"

function Backup-File($path) {
  if (Test-Path $path) {
    $backup = "$path.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $path $backup
    Write-Host "[OK] Backup : $backup" -ForegroundColor Green
  }
}

function Write-Utf8($path, $content) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
}

if (!(Test-Path $adminDemandes)) { Write-Host "[ERREUR] Introuvable : $adminDemandes" -ForegroundColor Red; exit 1 }
if (!(Test-Path $adminLogements)) { Write-Host "[ERREUR] Introuvable : $adminLogements" -ForegroundColor Red; exit 1 }

Backup-File $adminDemandes
Backup-File $adminLogements

# =========================================================
# 1) On remplace totalement admin-demandes/page.tsx
# =========================================================
$adminDemandesContent = @'
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Demande = {
  id: number;
  nom: string;
  telephone: string | null;
  ville: string | null;
  quartier: string | null;
  type_logement: string | null;
  titre: string | null;
  prix: number | null;
  chambres: number | null;
  voyageurs: number | null;
  description: string | null;
  photos: string | null;
  statut: string | null;
  created_at: string | null;
};

function parsePhotos(value: string | null) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
  } catch {
    return value ? [value] : [];
  }
}

export default function AdminDemandesPage() {
  const [autorise, setAutorise] = useState(false);
  const [verificationAdmin, setVerificationAdmin] = useState(true);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [publicationId, setPublicationId] = useState<number | null>(null);

  useEffect(() => {
    const ok = localStorage.getItem("marbnb_admin_ok") === "true";
    if (!ok) {
      window.location.href = "/admin-login";
      return;
    }
    setAutorise(true);
    setVerificationAdmin(false);
    chargerDemandes();
  }, []);

  function deconnexionAdmin() {
    localStorage.removeItem("marbnb_admin_ok");
    window.location.href = "/admin-login";
  }

  async function chargerDemandes() {
    setLoading(true);
    const { data, error } = await supabase.from("demandes_hotes").select("*").order("created_at", { ascending: false });
    if (error) {
      setMessage("Erreur technique : " + error.message);
      setDemandes([]);
    } else {
      setMessage("");
      setDemandes(data || []);
    }
    setLoading(false);
  }

  async function changerStatut(id: number, statut: string) {
    setMessage("");
    const { error } = await supabase.from("demandes_hotes").update({ statut }).eq("id", id);
    if (error) {
      setMessage("Erreur changement statut : " + error.message);
      return;
    }
    setDemandes((old) => old.map((d) => (d.id === id ? { ...d, statut } : d)));
    setMessage("Statut mis à jour ✅");
  }

  async function publierLogement(d: Demande) {
    setMessage("");
    setPublicationId(d.id);
    const photos = parsePhotos(d.photos);

    const { error: insertError } = await supabase.from("logements").insert({
      titre: d.titre || "Logement Marbnb",
      ville: d.ville || "",
      quartier: d.quartier || "",
      type_logement: d.type_logement || "Appartement",
      prix: Number(d.prix || 0),
      chambres: Number(d.chambres || 1),
      voyageurs: Number(d.voyageurs || 1),
      description: d.description || "",
      image_url: photos[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80",
      photos: JSON.stringify(photos),
      statut: "Actif",
    });

    if (insertError) {
      setPublicationId(null);
      setMessage("Erreur publication logement : " + insertError.message);
      return;
    }

    const { error: updateError } = await supabase.from("demandes_hotes").update({ statut: "Acceptée et publiée" }).eq("id", d.id);
    setPublicationId(null);

    if (updateError) {
      setMessage("Logement publié, mais erreur statut demande : " + updateError.message);
      await chargerDemandes();
      return;
    }

    setDemandes((old) => old.map((item) => (item.id === d.id ? { ...item, statut: "Acceptée et publiée" } : item)));
    setMessage("Logement accepté et publié avec succès ✅ Il apparaît maintenant dans /resultats.");
  }

  if (verificationAdmin || !autorise) {
    return <main className="min-h-screen bg-[#f4ead7] p-8 font-black">Vérification accès admin...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f4ead7] px-4 py-8 text-[#1e1b18]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <a href="/" className="text-sm font-black text-[#c1121f]">← Accueil</a>
            <a href="/admin-dashboard" className="text-sm font-black text-[#7a3d14]">Dashboard</a>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/hote" className="rounded-full bg-[#3F7D3B] px-5 py-2 text-sm font-black text-white shadow hover:bg-[#2f6f34]">Ajouter demande test</a>
            <a href="/admin-logements" className="rounded-full bg-[#7a3d14] px-5 py-2 text-sm font-black text-white shadow hover:bg-[#69320f]">Gérer logements</a>
            <button onClick={deconnexionAdmin} className="rounded-full bg-red-700 px-5 py-2 text-sm font-black text-white shadow hover:bg-red-800">Déconnexion</button>
          </div>
        </div>

        <section className="mt-5 rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3]">
          <p className="font-black text-[#c1121f]">Admin Marbnb</p>
          <h1 className="mt-2 text-4xl font-black">Demandes hôtes</h1>
          <p className="mt-3 text-[#7a6446]">Valide les demandes hôtes puis publie les logements dans le catalogue public.</p>
          {message && <p className="mt-4 rounded-2xl bg-[#EAF3E4] p-4 font-bold text-[#3F7D3B]">{message}</p>}
          {loading && <p className="mt-6 font-bold">Chargement...</p>}
          {!loading && demandes.length === 0 && <p className="mt-6 rounded-2xl bg-amber-50 p-4 font-bold text-amber-700">Aucune demande pour le moment.</p>}

          <div className="mt-6 grid gap-5">
            {demandes.map((d) => {
              const photos = parsePhotos(d.photos);
              const statut = d.statut || "En attente";
              const dejaPublie = statut === "Acceptée et publiée";
              return (
                <article key={d.id} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-[#e5d3b3] md:grid-cols-[220px_1fr]">
                  <div>{photos.length > 0 ? <div className="grid gap-2"><img src={photos[0]} alt={d.titre || "Logement"} className="h-44 w-full rounded-2xl object-cover" />{photos.length > 1 && <div className="grid grid-cols-3 gap-2">{photos.slice(1, 4).map((photo) => <img key={photo} src={photo} alt="Photo logement" className="h-16 w-full rounded-xl object-cover" />)}</div>}</div> : <div className="grid h-44 place-items-center rounded-2xl bg-[#f4ead7] text-sm font-bold text-[#7a6446]">Pas de photo</div>}</div>
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><h2 className="text-2xl font-black">{d.titre || "Sans titre"}</h2><p className="text-sm text-[#7a6446]">{d.type_logement || "Logement"} · {d.quartier || "-"}, {d.ville || "-"}</p></div>
                      <span className={`rounded-full px-4 py-2 text-sm font-black ${dejaPublie ? "bg-[#EAF3E4] text-[#3F7D3B]" : statut === "Refusée" ? "bg-red-50 text-red-700" : "bg-[#f4ead7] text-[#7a3d14]"}`}>{statut}</span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-[#5f4b32] md:grid-cols-3">
                      <p><b>Hôte :</b> {d.nom}</p><p><b>Téléphone :</b> {d.telephone || "-"}</p><p><b>Prix :</b> {d.prix || 0} MAD / nuit</p>
                      <p><b>Chambres :</b> {d.chambres || 1}</p><p><b>Voyageurs :</b> {d.voyageurs || 1}</p><p><b>Date :</b> {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : "-"}</p>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[#5f4b32]">{d.description || "Aucune description."}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {!dejaPublie && <button onClick={() => publierLogement(d)} disabled={publicationId === d.id} className="rounded-full bg-[#3F7D3B] px-5 py-3 text-sm font-black text-white shadow hover:bg-[#2f6f34] disabled:opacity-60">{publicationId === d.id ? "Publication..." : "Accepter et publier"}</button>}
                      {statut !== "Refusée" && <button onClick={() => changerStatut(d.id, "Refusée")} className="rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white shadow hover:bg-red-800">Refuser</button>}
                      {statut !== "En attente" && <button onClick={() => changerStatut(d.id, "En attente")} className="rounded-full bg-[#f4ead7] px-5 py-3 text-sm font-black text-[#7a3d14] shadow hover:bg-[#ead9ba]">Remettre en attente</button>}
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
'@
Write-Utf8 $adminDemandes $adminDemandesContent
Write-Host "[OK] admin-demandes/page.tsx remplace completement" -ForegroundColor Green

# =========================================================
# 2) Patch admin-logements/page.tsx sans supprimer ton code
# =========================================================
$logements = Get-Content $adminLogements -Raw
$logements = $logements.Replace('bg-#3F7D3B', 'bg-[#3F7D3B]')
$logements = $logements.Replace('text-#3F7D3B', 'text-[#3F7D3B]')

if ($logements -notmatch 'async function sauvegarderLogement') {
$saveFunction = @'
  async function sauvegarderLogement(logement: any) {
    setMessage("");

    const { error } = await supabase
      .from("logements")
      .update({
        prix: Number(logement.prix) || 0,
        chambres: Number(logement.chambres) || 1,
        voyageurs: Number(logement.voyageurs) || 1,
        statut: logement.statut || "Actif",
      })
      .eq("id", logement.id);

    if (error) {
      setMessage("Erreur modification logement : " + error.message);
      return;
    }

    setMessage("Modifications enregistrées avec succès ✅");
    chargerLogements();
  }
'@
  $logements = $logements.Replace('  if (verificationAdmin || !autorise) {', $saveFunction + "`r`n  if (verificationAdmin || !autorise) {")
}

# Ajout bouton avant Masquer si absent
if ($logements -notmatch 'Valider les modifications') {
  $logements = $logements.Replace('<button onClick={() => changerStatut(l.id, "Masqué")} className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white">Masquer</button>', '<button onClick={() => sauvegarderLogement(l)} className="rounded-full bg-[#3F7D3B] px-5 py-3 text-sm font-black text-white shadow hover:bg-[#2f6f34]">Valider les modifications</button><button onClick={() => changerStatut(l.id, "Masqué")} className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white">Masquer</button>')
  $logements = $logements.Replace('<button onClick={() => supprimerLogement(l.id)} className="rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white">Supprimer</button>', '<button onClick={() => sauvegarderLogement(l)} className="rounded-full bg-[#3F7D3B] px-5 py-3 text-sm font-black text-white shadow hover:bg-[#2f6f34]">Valider les modifications</button><button onClick={() => supprimerLogement(l.id)} className="rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white">Supprimer</button>')
}

Write-Utf8 $adminLogements $logements
Write-Host "[OK] admin-logements/page.tsx patche" -ForegroundColor Green
Write-Host ""
Write-Host "Maintenant :" -ForegroundColor Cyan
Write-Host "1) Ferme l'ancien serveur avec CTRL+C" -ForegroundColor Yellow
Write-Host "2) Lance : npm run dev" -ForegroundColor Yellow
Write-Host "3) Va exactement sur : http://localhost:3000/admin-demandes" -ForegroundColor Yellow
Write-Host "4) Va exactement sur : http://localhost:3000/admin-logements" -ForegroundColor Yellow
