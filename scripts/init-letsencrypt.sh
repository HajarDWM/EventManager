#!/bin/bash
# ==============================================================================
# Script d'Initialisation SSL Automatique (Let's Encrypt / Certbot)
# Usage sur le serveur distant : chmod +x scripts/init-letsencrypt.sh && ./scripts/init-letsencrypt.sh
# ==============================================================================

set -e

if [ ! -f .env ]; then
    echo "Erreur: Le fichier .env est introuvable. Veuillez exécuter 'cp .env.example .env' et configurer votre domaine."
    exit 1
fi

source .env

if [ -z "$DOMAIN_NAME" ] || [ -z "$SSL_EMAIL" ]; then
    echo "Erreur: DOMAIN_NAME ou SSL_EMAIL n'est pas défini dans le fichier .env."
    exit 1
fi

echo "==================================================="
echo "  Configuration SSL Let's Encrypt pour : $DOMAIN_NAME"
echo "  Email de contact                   : $SSL_EMAIL"
echo "==================================================="

CERT_PATH="./certbot/conf/live/$DOMAIN_NAME"
mkdir -p "./certbot/conf/live/$DOMAIN_NAME"
mkdir -p "./certbot/www"

if [ -f "$CERT_PATH/fullchain.pem" ]; then
    echo "Un certificat SSL existe déjà dans $CERT_PATH."
    read -p "Voulez-vous écraser et renouveler le certificat existant ? (y/N) " decision
    if [ "$decision" != "y" ] && [ "$decision" != "Y" ]; then
        echo "Opération annulée."
        exit 0
    fi
fi

echo "1/4 Création d'un certificat factice temporaire pour permettre le démarrage de Nginx..."
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$CERT_PATH/privkey.pem" \
    -out "$CERT_PATH/fullchain.pem" \
    -subj "/CN=localhost" 2>/dev/null

echo "2/4 Démarrage de Nginx..."
docker compose -f docker-compose.prod.yml up -d event-frontend

echo "3/4 Suppression du certificat temporaire et demande du certificat officiel Let's Encrypt..."
rm -rf "$CERT_PATH"

# Mode staging ou production (décommenter --staging pour tester sans limite de quota)
# STAGING_FLAG="--staging"
STAGING_FLAG=""

docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_FLAG \
    --email $SSL_EMAIL \
    -d $DOMAIN_NAME \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

echo "4/4 Rechargement de Nginx avec le certificat SSL valide..."
docker compose -f docker-compose.prod.yml exec event-frontend nginx -s reload

echo "==================================================="
echo "  SUCCÈS : HTTPS est actif sur https://$DOMAIN_NAME !"
echo "==================================================="
