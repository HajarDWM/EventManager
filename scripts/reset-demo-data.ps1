# PowerShell script to reset EventManager showcase demo data with full UTF-8 encoding support
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  EventManager - Reinitialisation des Donnees Demo " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$sqlFile = Join-Path $PSScriptRoot "..\Backend\src\main\resources\db\migration\V31__Demo_showcase_data.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "[ERREUR] Le fichier V31__Demo_showcase_data.sql est introuvable." -ForegroundColor Red
    exit 1
}

Write-Host "Copie du fichier SQL vers le conteneur MySQL..." -ForegroundColor Yellow
docker cp $sqlFile event-mysql-db:/tmp/v31.sql

Write-Host "Application du jeu de donnees V31 avec encodage UTF-8..." -ForegroundColor Yellow
docker exec -i event-mysql-db mysql -u root -prootpassword --default-character-set=utf8mb4 event_manager_db -e "source /tmp/v31.sql;"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCES] Les donnees de demonstration ont ete remises a neuf avec accents parfaits !" -ForegroundColor Green
    Write-Host "Identifiants Traiteur : demo@eventmanager.com / demo12345" -ForegroundColor White
    Write-Host "Lien d'acces          : http://localhost" -ForegroundColor White
} else {
    Write-Host "[ERREUR] Une erreur est survenue lors de l'injection SQL." -ForegroundColor Red
}
