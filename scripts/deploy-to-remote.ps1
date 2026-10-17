# PowerShell script to deploy updates to remote server via SSH
param(
    [Parameter(Mandatory = $false)]
    [string]$ServerHost = "",

    [Parameter(Mandatory = $false)]
    [string]$User = "root",

    [Parameter(Mandatory = $false)]
    [string]$RemotePath = "/var/www/eventmanager"
)

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  EventManager — Déploiement à Distance via SSH    " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

if (-not $ServerHost) {
    $ServerHost = Read-Host "Entrez l'adresse IP ou le nom d'hôte de votre serveur distant"
}

if (-not $ServerHost) {
    Write-Host "[ERREUR] L'adresse du serveur est obligatoire." -ForegroundColor Red
    exit 1
}

Write-Host "Connexion à $User@$ServerHost et déploiement dans $RemotePath..." -ForegroundColor Yellow

$remoteCommand = @"
cd $RemotePath || exit 1
echo '[1/3] Récupération du code le plus récent depuis Git...'
git pull origin main
echo '[2/3] Rebuild et redémarrage des conteneurs de production...'
docker compose -f docker-compose.prod.yml up -d --build
echo '[3/3] Statut des services...'
docker compose -f docker-compose.prod.yml ps
"@

ssh -o StrictHostKeyChecking=accept-new "$User@$ServerHost" $remoteCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCÈS] Déploiement sur le serveur distant terminé avec succès !" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[ERREUR] Échec lors du déploiement à distance." -ForegroundColor Red
}
