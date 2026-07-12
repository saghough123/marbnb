# fix-marbnb-hero-height.ps1
# Objectif : réduire la hauteur des grandes photos (hero) sur Accueil et Explorer/Résultats
# À placer et lancer depuis : C:\Users\SAGHOUGH\marbnb
# Commande : powershell -ExecutionPolicy Bypass -File .\fix-marbnb-hero-height.ps1

$ErrorActionPreference = "Stop"
$root = Get-Location
$homeFile = Join-Path $root "app\page.tsx"
$resultatsFile = Join-Path $root "app\resultats\page.tsx"

function Backup-File($path) {
  if (Test-Path $path) {
    $backup = "$path.bak-hero-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $path $backup
    Write-Host "[OK] Sauvegarde : $backup" -ForegroundColor Green
  }
}

function Write-Utf8NoBom($path, $content) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
}

function Patch-Home($path) {
  if (!(Test-Path $path)) {
    Write-Host "[INFO] app\page.tsx introuvable, étape ignorée." -ForegroundColor Yellow
    return
  }

  Backup-File $path
  $content = Get-Content $path -Raw
  $original = $content

  # Réduction des grands blocs hero connus sur l'accueil
  $content = $content.Replace('min-h-[720px]', 'min-h-[520px]')
  $content = $content.Replace('min-h-[700px]', 'min-h-[520px]')
  $content = $content.Replace('min-h-[680px]', 'min-h-[520px]')
  $content = $content.Replace('min-h-screen', 'min-h-[520px]')
  $content = $content.Replace('h-screen', 'h-[520px]')

  # Réduction des grands espacements qui poussent le contenu trop bas
  $content = $content.Replace('pb-16 pt-[175px]', 'pb-8 pt-12')
  $content = $content.Replace('pb-16 pt-16 md:pt-24', 'pb-8 pt-8 md:pt-10')
  $content = $content.Replace('pb-16 pt-16', 'pb-8 pt-8')
  $content = $content.Replace('md:py-16', 'md:py-10')
  $content = $content.Replace('py-16', 'py-10')

  # Si une grande carte hero a mt trop bas, on remonte un peu
  $content = $content.Replace('mt-10 max-w-6xl', 'mt-5 max-w-6xl')
  $content = $content.Replace('mt-8 flex flex-col', 'mt-5 flex flex-col')

  # Ajout d'un marqueur pour savoir que le patch a été appliqué
  if ($content -notmatch 'MARBNB_HERO_HEIGHT_PATCH_V1') {
    $content = $content.Replace('export default function', '// MARBNB_HERO_HEIGHT_PATCH_V1`r`nexport default function')
  }

  if ($content -ne $original) {
    Write-Utf8NoBom $path $content
    Write-Host "[OK] Accueil : hero réduit et contenu remonté" -ForegroundColor Green
  } else {
    Write-Host "[INFO] Accueil : aucun changement nécessaire" -ForegroundColor Yellow
  }
}

function Patch-Resultats($path) {
  if (!(Test-Path $path)) {
    Write-Host "[INFO] app\resultats\page.tsx introuvable, étape ignorée." -ForegroundColor Yellow
    return
  }

  Backup-File $path
  $content = Get-Content $path -Raw
  $original = $content

  # Réduction du hero Explorer/Résultats
  $content = $content.Replace('<section className="relative overflow-hidden border-b border-[#ead9ba]">', '<section className="relative h-[420px] overflow-hidden border-b border-[#ead9ba]">')
  $content = $content.Replace('<section className="relative overflow-hidden">', '<section className="relative h-[420px] overflow-hidden">')
  $content = $content.Replace('pb-10 pt-10 md:pb-16 md:pt-16', 'pb-6 pt-8 md:pb-8 md:pt-10')
  $content = $content.Replace('pb-10 pt-12 md:pb-16 md:pt-20', 'pb-6 pt-8 md:pb-8 md:pt-10')
  $content = $content.Replace('mt-8 rounded-[2rem]', 'mt-5 rounded-[2rem]')
  $content = $content.Replace('mt-5 flex flex-wrap gap-3', 'mt-3 flex flex-wrap gap-3')

  # Réduction des très gros titres pour que la barre de recherche apparaisse plus haut
  $content = $content.Replace('text-4xl font-black tracking-tight text-white drop-shadow md:text-6xl', 'text-3xl font-black tracking-tight text-white drop-shadow md:text-5xl')
  $content = $content.Replace('text-5xl font-black tracking-tight text-white drop-shadow md:text-7xl', 'text-3xl font-black tracking-tight text-white drop-shadow md:text-5xl')

  # Si la section a été patchée plusieurs fois, éviter h h
  $content = $content.Replace('relative h-[420px] h-[420px] overflow-hidden', 'relative h-[420px] overflow-hidden')

  if ($content -notmatch 'MARBNB_RESULTATS_HERO_HEIGHT_PATCH_V1') {
    $content = $content.Replace('export default function', '// MARBNB_RESULTATS_HERO_HEIGHT_PATCH_V1`r`nexport default function')
  }

  if ($content -ne $original) {
    Write-Utf8NoBom $path $content
    Write-Host "[OK] Résultats/Explorer : hero réduit et contenu remonté" -ForegroundColor Green
  } else {
    Write-Host "[INFO] Résultats/Explorer : aucun changement nécessaire" -ForegroundColor Yellow
  }
}

Patch-Home $homeFile
Patch-Resultats $resultatsFile

Write-Host ""
Write-Host "Corrections terminées." -ForegroundColor Cyan
Write-Host "Maintenant lance :" -ForegroundColor Cyan
Write-Host "  rmdir /s /q .next" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host "Puis teste :" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor Yellow
Write-Host "  http://localhost:3000/resultats" -ForegroundColor Yellow
Write-Host "Si tout est bon : git add . ; git commit -m 'Remonte contenu accueil et explorer' ; git push" -ForegroundColor Yellow
