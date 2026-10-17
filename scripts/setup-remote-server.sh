#!/bin/bash
# ==============================================================================
# Script d'Installation & Déploiement Automatique sur Serveur VPS (Ubuntu/Debian)
# Usage : chmod +x scripts/setup-remote-server.sh && ./scripts/setup-remote-server.sh
# ==============================================================================

set -e

echo "==================================================="
echo "  EventManager — Déploiement sur Serveur Distant"
echo "==================================================="

# 1. Vérification des droits root
if [ "$EUID" -ne 0 ]; then
  echo "Attention: Certaines étapes peuvent nécessiter des privilèges sudo."
fi

# 2. Installation de Docker et Docker Compose si absent
if ! command -v docker &> /dev/null; then
    echo "Installation de Docker et du plugin Docker Compose..."
    apt-get update
    apt-get install -y ca-certificates curl gnupg ufw git
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo "Docker installé avec succès."
else
    echo "Docker est déjà installé."
fi

# 3. Configuration du Pare-feu UFW
echo "Configuration du pare-feu (UFW)..."
ufw allow OpenSSH || ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 4. Vérification du fichier d'environnement .env
if [ ! -f .env ]; then
    echo "Création du fichier .env à partir de .env.example..."
    cp .env.example .env
    echo "Veuillez éditer le fichier .env avec vos identifiants avant de lancer l'application :"
    echo "nano .env"
    exit 0
fi

# 5. Création des répertoires de persistance
mkdir -p certbot/conf certbot/www

# 6. Build et Démarrage des Conteneurs
echo "Construction et lancement des conteneurs de production..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "==================================================="
echo "  EventManager est déployé avec succès !"
echo "==================================================="
echo "Pour initialiser les certificats SSL HTTPS gratuits :"
echo "  ./scripts/init-letsencrypt.sh"
echo "==================================================="
