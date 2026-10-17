# PowerShell script reading server-config.json to deploy EventManager to remote VPS
$configFile = Join-Path $PSScriptRoot "..\server-config.json"
if (-not (Test-Path $configFile)) {
    Write-Host "[ERREUR] Le fichier server-config.json est introuvable." -ForegroundColor Red
    exit 1
}

$config = Get-Content $configFile -Raw | ConvertFrom-Json
$host = $config.server.host
$user = $config.server.user
$port = $config.server.port
$remoteDir = $config.deployment.remoteDirectory

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  EventManager — Déploiement vers $user@$host" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$sshArgs = @("-p", $port, "-o", "StrictHostKeyChecking=accept-new")
if ($config.server.privateKeyPath -and (Test-Path $config.server.privateKeyPath)) {
    $sshArgs += @("-i", $config.server.privateKeyPath)
}

$remoteCommands = @"
echo '=== [1/4] Préparation du répertoire de déploiement ==='
mkdir -p $remoteDir
cd $remoteDir

echo '=== [2/4] Vérification de Docker ==='
if ! command -v docker &> /dev/null; then
    echo 'Installation de Docker...'
    sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin
    sudo usermod -aG docker `$USER
fi

echo '=== [3/4] Mise à jour du code et configuration ==='
if [ -d .git ]; then
    git pull origin main
else
    git clone https://github.com/HajarDWM/EventManager.git .
fi

if [ ! -f .env ]; then
    cp .env.example .env
fi

echo '=== [4/4] Construction et lancement des conteneurs de production ==='
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps

echo '==================================================='
echo '  DÉPLOIEMENT TERMINÉ SUR LE SERVEUR !'
echo '==================================================='
"@

Write-Host "Connexion en cours à $user@$host sur le port $port..." -ForegroundColor Yellow
ssh @sshArgs "$user@$host" $remoteCommands
