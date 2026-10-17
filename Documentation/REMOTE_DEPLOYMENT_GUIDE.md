# 🌐 Guide Complet de Déploiement sur Serveur Distant (VPS / Cloud)

Ce guide décrit la procédure pas-à-pas pour déployer **EventManager** en environnement de production sécurisé (HTTPS avec SSL Let's Encrypt automatique) sur n'importe quel serveur VPS (DigitalOcean, OVH, Hetzner, AWS EC2, Linode, Scaleway, etc.) sous Ubuntu ou Debian.

---

## 🏗️ Architecture de Production Distante

```
              Visiteurs & Clients (Internet)
                            │
                            │ HTTPS (Port 443) / HTTP (Port 80 -> 301 Redirect)
                            ▼
     ┌─────────────────────────────────────────────────────────┐
     │           NGINX REVERSE PROXY & SSL LET'S ENCRYPT       │
     │                 (Conteneur: event-frontend)             │
     │                                                         │
     │  • Certificats SSL auto-renouvelés (Certbot)            │
     │  • /              ──► Angular 21 (Fichiers SPA)         │
     │  • /api/*         ──► Proxy vers Spring Boot:8080       │
     │  • /uploads/*     ──► Médias et photos de plats         │
     └──────────────────────────┬──────────────────────────────┘
                                │
                 Réseau Privé Docker (Non accessible depuis Internet)
                                │
                                ▼
     ┌─────────────────────────────────────────────────────────┐
     │              BACKEND SPRING BOOT (PROD)                 │
     │               (Conteneur: event-backend)                │
     │                                                         │
     │  • Profil: prod                                         │
     │  • Port interne: 8080                                   │
     │  • Sécurisation JWT & Validation Flyway                 │
     └──────────────────────────┬──────────────────────────────┘
                                │
                                ▼
     ┌─────────────────────────────────────────────────────────┐
     │               MYSQL 8.0 (ISOLÉ & SÉCURISÉ)              │
     │                  (Conteneur: event-db)                  │
     │                                                         │
     │  • Aucun port exposé sur Internet (Zéro attaque brute)  │
     │  • Persistance sur volume Docker: db_data               │
     │  • Encodage UTF-8 pur (utf8mb4)                         │
     └─────────────────────────────────────────────────────────┘
```

---

## 📋 Étape 1 : Configuration du Domaine DNS

Avant de lancer le serveur, associez votre nom de domaine ou sous-domaine à l'adresse IP publique de votre serveur VPS :
- **Type :** `A`
- **Nom :** `events` (ou `@` pour le domaine racine)
- **Cible :** `VOTRE_ADRESSE_IP_VPS` (ex: `198.51.100.42`)
- **TTL :** `300` ou standard

---

## 🚀 Étape 2 : Première Installation sur le Serveur VPS

Connectez-vous à votre serveur distant via SSH :
```bash
ssh root@VOTRE_ADRESSE_IP_VPS
```

Clonez votre dépôt dans le répertoire recommandé `/var/www/eventmanager` :
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/HajarDWM/EventManager.git eventmanager
cd eventmanager
```

Configurez les variables d'environnement de production :
```bash
cp .env.example .env
nano .env
```
Renseignez les champs :
- `DOMAIN_NAME` : votre domaine (ex: `events.votredomaine.com`)
- `SSL_EMAIL` : votre email pour les alertes de renouvellement Let's Encrypt
- `DB_PASSWORD` & `DB_ROOT_PASSWORD` : des mots de passe robustes
- `JWT_SECRET` : généré avec la commande `openssl rand -hex 32`

Lancez le script d'installation automatique :
```bash
chmod +x scripts/setup-remote-server.sh scripts/init-letsencrypt.sh
./scripts/setup-remote-server.sh
```
Ce script :
1. Installe Docker et Docker Compose si nécessaire.
2. Active le pare-feu UFW pour n'ouvrir que les ports nécessaires (`22`, `80`, `443`).
3. Compile et démarre les conteneurs de production.

---

## 🔒 Étape 3 : Activation du SSL HTTPS Gratuit (Let's Encrypt)

Une fois vos conteneurs démarrés et votre DNS propagé, activez le certificat SSL officiel en une commande :
```bash
./scripts/init-letsencrypt.sh
```
Ce script configure automatiquement les certificats SSL, active HTTPS avec HTTP/2 et programme le renouvellement automatique via Certbot tous les 60 jours sans intervention manuelle.

---

## 🔄 Étape 4 : Déploiement des Mises à Jour Futures

Pour déployer les nouvelles versions de votre code, vous disposez de 3 méthodes au choix :

### Méthode A : Depuis votre machine locale (PowerShell)
```powershell
.\scripts\deploy-to-remote.ps1 -ServerHost "VOTRE_IP_VPS"
```

### Méthode B : Directement sur le serveur VPS
```bash
cd /var/www/eventmanager
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

### Méthode C : Déploiement Continu Automatique (GitHub Actions)
Le fichier [`.github/workflows/deploy.yml`](file:///c:/Users/Hajar/OneDrive/Documents/EventManager/.github/workflows/deploy.yml) est déjà configuré.  
Il vous suffit d'ajouter les secrets suivants dans les paramètres de votre dépôt GitHub (`Settings > Secrets and variables > Actions`) :
- `REMOTE_HOST` : Adresse IP de votre serveur
- `REMOTE_USER` : `root` (ou utilisateur SSH)
- `SSH_PRIVATE_KEY` : Clé privée SSH autorisée sur le serveur

---

## 💾 Sauvegarde & Maintenance de la Base de Données

### Sauvegarder la base de données :
```bash
docker compose -f docker-compose.prod.yml exec -T event-db mysqldump -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) event_manager_db > backup_$(date +%F).sql
```

### Restaurer une sauvegarde :
```bash
docker compose -f docker-compose.prod.yml exec -T event-db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) event_manager_db < backup_file.sql
```

### Consulter les journaux en direct :
```bash
docker compose -f docker-compose.prod.yml logs -f event-backend
docker compose -f docker-compose.prod.yml logs -f event-frontend
```
