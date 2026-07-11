# fix-marbnb-admin.ps1
# Script de correction Marbnb pour :
# 1) app/admin-demandes/page.tsx : bouton "Accepter et publier" visible + classes Tailwind correctes
# 2) app/admin-logements/page.tsx : ajout du bouton "Valider les modifications" si absent
#
# Utilisation :
# 1. Place ce fichier dans C:\Users\SAGHOUGH\marbnb
# 2. Ouvre PowerShell dans ce dossier
# 3. Lance : powershell -ExecutionPolicy Bypass -File .\fix-marbnb-admin.ps1

$ErrorActionPreference = "Stop"

$root = Get-Location
$adminDemandes = Join-Path $root "app\admin-demandes\page.tsx"
$adminLogements = Join-Path $root "app\admin-logements\page.tsx"

function Backup-File($path) {
    if (Test-Path $path) {
        $backup = "$path.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $path $backup
        Write-Host "[OK] Sauvegarde creee : $backup" -ForegroundColor Green
    }
}

function Write-Utf8($path, $content) {
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
}

if (!(Test-Path $adminDemandes)) {
    Write-Host "[ERREUR] Fichier introuvable : $adminDemandes" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $adminLogements)) {
    Write-Host "[ERREUR] Fichier introuvable : $adminLogements" -ForegroundColor Red
    exit 1
}

Backup-File $adminDemandes
Backup-File $adminLogements

# =============================================================
# 1) Correction admin-demandes/page.tsx
# =============================================================
$demandes = Get-Content $adminDemandes -Raw

# Corrige les classes Tailwind invalides qui cachent parfois les boutons
$demandes = $demandes.Replace('bg-#3F7D3B', 'bg-[#3F7D3B]')
$demandes = $demandes.Replace('text-#3F7D3B', 'text-[#3F7D3B]')

# Corrige le libelle si l'ancien bouton existe mais est mal nomme
$demandes = $demandes.Replace('Accepter + publier', 'Accepter et publier')

# Renforce la classe du bouton publier s'il existe deja
$demandes = $demandes.Replace('className="rounded-full bg-[#3F7D3B] px-5 py-3 text-sm font-black text-white"', 'className="rounded-full bg-[#3F7D3B] px-5 py-3 text-sm font-black text-white shadow hover:bg-[#2f6f34]"')

# Si le bouton publier est totalement absent, on l'ajoute avant le bouton Refuser dans la zone des actions
if ($demandes -notmatch 'Accepter et publier') {
    $patternRefuser = '<button onClick=\{\(\) => changerStatut\(d\.id, "Refusée"\)\} className="rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white">Refuser</button>'
    $buttonPublier = @'
                    <button onClick={() => publierLogement(d)} className="rounded-full bg-[#3F7D3B] px-5 py-3 text-sm font-black text-white shadow hover:bg-[#2f6f34]">Accepter et publier</button>
                    <button onClick={() => changerStatut(d.id, "Refusée")} className="rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white">Refuser</button>
'@
    $demandes = [regex]::Replace($demandes, $patternRefuser, $buttonPublier)
}

# Si la fonction publierLogement n'existe pas, on l'insere avant le return verificationAdmin
if ($demandes -notmatch 'async function publierLogement') {
$fonctionPublier = @'
  async function publierLogement(d: Demande) {
    setMessage("");
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
      setMessage("Erreur publication logement : " + insertError.message);
      return;
    }

    await changerStatut(d.id, "Acceptée et publiée");
    setMessage("Logement accepté et publié avec succès ✅ Il apparaît maintenant dans /resultats.");
  }
'@
    $demandes = $demandes.Replace('  if (verificationAdmin || !autorise) {', $fonctionPublier + "`r`n  if (verificationAdmin || !autorise) {")
}

Write-Utf8 $adminDemandes $demandes
Write-Host "[OK] admin-demandes/page.tsx corrige" -ForegroundColor Green

# =============================================================
# 2) Correction admin-logements/page.tsx
# =============================================================
$logements = Get-Content $adminLogements -Raw

# Corrige les classes Tailwind invalides
$logements = $logements.Replace('bg-#3F7D3B', 'bg-[#3F7D3B]')
$logements = $logements.Replace('text-#3F7D3B', 'text-[#3F7D3B]')

# Detection d'une fonction de sauvegarde existante
$hasSaveFunction = ($logements -match 'sauvegarderLogement') -or ($logements -match 'modifierLogement') -or ($logements -match 'updateLogement')

# Si aucune fonction de sauvegarde n'existe, on ajoute une fonction generique.
# Elle suppose que les champs sont deja modifies dans l'etat "logements" via onChange.
# C'est le cas le plus courant dans ta page actuelle.
if (-not $hasSaveFunction) {
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
    if (typeof chargerLogements === "function") {
      chargerLogements();
    }
  }
'@
    $logements = $logements.Replace('  if (verificationAdmin || !autorise) {', $saveFunction + "`r`n  if (verificationAdmin || !autorise) {")
}

# Ajout du bouton "Valider les modifications" avant Masquer si absent.
if ($logements -notmatch 'Valider les modifications') {
    $patternMasquer = '<button onClick=\{\(\) => changerStatut\(([^,]+), "Masqué"\)\} className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white">Masquer</button>'
    $replacement = '<button onClick={() => sauvegarderLogement(l)} className="rounded-full bg-[#3F7D3B] px-5 py-3 text-sm font-black text-white shadow hover:bg-[#2f6f34]">Valider les modifications</button><button onClick={() => changerStatut($1, "Masqué")} className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white">Masquer</button>'
    $newLogements = [regex]::Replace($logements, $patternMasquer, $replacement)

    # Si le pattern avec changerStatut ne matche pas, on tente d'ajouter avant le bouton Supprimer
    if ($newLogements -eq $logements) {
        $patternSupprimer = '<button onClick=\{\(\) => supprimerLogement\(([^\)]+)\)\} className="rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white">Supprimer</button>'
        $replacement2 = '<button onClick={() => sauvegarderLogement(l)} className="rounded-full bg-[#3F7D3B] px-5 py-3 text-sm font-black text-white shadow hover:bg-[#2f6f34]">Valider les modifications</button><button onClick={() => supprimerLogement($1)} className="rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white">Supprimer</button>'
        $newLogements = [regex]::Replace($logements, $patternSupprimer, $replacement2)
    }

    $logements = $newLogements
}

Write-Utf8 $adminLogements $logements
Write-Host "[OK] admin-logements/page.tsx corrige" -ForegroundColor Green

Write-Host ""
Write-Host "Corrections terminees. Lance maintenant :" -ForegroundColor Cyan
Write-Host "npm run dev" -ForegroundColor Yellow
Write-Host "Puis teste : /admin-demandes et /admin-logements" -ForegroundColor Yellow
Write-Host "Si tout est bon : git add . ; git commit -m 'Correction admin demandes et logements' ; git push" -ForegroundColor Yellow
