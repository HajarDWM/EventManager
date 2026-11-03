# Journal des Modifications (CHANGELOG)

Toutes les modifications notables apportées au projet **EventManager** sont consignées dans ce fichier.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet respecte le [Semantic Versioning](https://semver.org/lang/fr/).

---

## [v1.1.2] - 2026-11-03

### 🐛 Corrections / Bug Fixes
- **Généralisation des routes d'API relatives (`/api`)** : Suppression de `http://localhost:8080` codé en dur dans `MenuItemService`, `ClientMenuService`, `EventTaskService`, `ExportPdfService` et `MenuList` pour garantir un fonctionnement parfait en production comme en développement.
- **Résolution des erreurs 403 Forbidden sur les menus et événements** : Amélioration du filtre `auth.interceptor.ts` afin d'injecter fidèlement le token JWT sur toutes les requêtes d'API internes tout en protégeant les APIs tierces externes.
- **Élimination du blocage au rendu (Google Fonts)** : Remplacement de l'import synchrone render-blocking dans `index.html` par un chargement asynchrone non-bloquant via `preload` et `media="print" onload="this.media='all'"`, éliminant le délai de chargement initial de 25s lors de connexions ralenties.

### ⚡ Performance & Optimisation
- **Compression HTTP GZIP Spring Boot** : Activation de `server.compression` pour les types JSON, HTML, CSS et JS dans `application.yml` et `application-prod.yml` afin d'alléger considérablement les payloads d'invitations et de catalogues volumineux.
- **Proxy de dev pour les médias** : Ajout de la règle de redirection `/uploads` dans `proxy.conf.json` pour la prévisualisation fluide des images de menus en local.

---

## [v1.1.1] - 2026-11-03

### 🐛 Corrections / Bug Fixes
- **Affichage de la liste des invités dans la personnalisation d'invitation** : Correction de la condition d'affichage `*ngIf` dans `organiser-invitation-setup.html` et initialisation du token dans `organiser-invitation-setup.ts` pour que la table des invités et le bloc d'envoi s'affichent correctement dès qu'un modèle d'invitation est actif.
- **Erreur OneUI `classList of null` sur `#page-container`** : Ajout de vérifications de sécurité dans `oneui.app.min.js` pour éviter que le script de template ne plante au chargement initial lorsque le DOM Angular n'a pas encore injecté `#page-container`.
- **Blocage CORS et fuite de JWT sur `ipapi.co`** : Correction de `auth.interceptor.ts` afin de n'injecter le token `Authorization: Bearer` que sur les endpoints internes de notre API (`/api/`), éliminant ainsi les requêtes CORS preflight non autorisées vers les services tiers.
- **Requête Geo-IP résiliente dans `currency.service.ts`** : Utilisation de `fetch` avec timeout court (2s) et fallback fluide vers la détection de devise via le locale du navigateur (`detectFromBrowserLocale`).

### 🗄️ Base de données / Migrations
- **Migration Flyway V36** : Ajout du script `V36__Ensure_invitation_tokens_for_events.sql` pour garantir que tous les événements existants avec un modèle d'invitation disposent d'un `invitation_token` valide.

---

## [v1.1.0] - 2026-11-03

### ✨ Nouveautés / Features
- **Statuts d'événements standardisés** : Export et utilisation globale de l'énumération `EventStatus` (`DRAFT`, `PLANNED`, `AWAITING_PAYMENT`, `COMPLETED`, `CANCELLED`) dans `event.model.ts`, `event-edit.ts` et `event-create.ts`.
- **Traductions Arabes complètes pour l'Administration** : Ajout de l'ensemble des 123 clés de traduction manquantes dans `Frontend/src/assets/i18n/ar.json` pour la section Admin (Tableau de bord, Traiteurs, Détail du traiteur, Modèles de contrat, Facturation, Transactions).
- **Règles de déploiement et versioning automatique** : Mise en place de `AGENTS.md` et `.agents/rules/deployment-versioning.md` pour garantir la traçabilité de chaque version déployée sur le serveur.

### 🐛 Corrections / Bug Fixes
- **Erreur de compilation TypeScript TS2345** : Résolution du conflit de types sur `status.set(data.status)` dans `event-edit.ts` en incluant le statut `AWAITING_PAYMENT`.
- **Options de statut dans l'édition d'événement** : Ajout de l'option `AWAITING_PAYMENT` dans le sélecteur HTML de `event-edit.html`.
- **Affichage des clés brutes de traduction sur le portail client** : Résolution du problème d'affichage des clés non traduites (ex: `EVENT_DETAILS.VALIDITY_MODAL_TITLE`) provoqué par la mise en cache agressive du navigateur et du CDN Cloudflare.
- **Migration Flyway V32 en production** : Résolution de l'échec de la migration `V32__Ten_diverse_test_events.sql` en créant les entités dépendantes manquantes (`caterer_id: 20`, `client_id: 3, 4, 5`) et en activant `SPRING_FLYWAY_OUT_OF_ORDER: "true"`.

### 🚀 Infrastructure & Déploiement
- **Cache-Busting des traductions** : Ajout automatique d'un paramètre d'horodatage `?v=${Date.now()}` lors du chargement des fichiers JSON de traduction dans `translation.service.ts`.
- **Headers Nginx** : Configuration de `Cache-Control: no-cache, no-store, must-revalidate` pour les fichiers `*.json` dans `Frontend/nginx.prod.conf`.

---

## [v1.0.0] - 2026-10-28

### 🎉 Lancement Initial (Initial Release)
- **Gestion des Événements & Traiteurs** : Création, planification, gestion des menus, devis et facturation pour les traiteurs.
- **Portail Client** : Espace dédié aux clients pour consulter les détails d'événements, valider les devis et télécharger les factures.
- **Back-office Administrateur** : Gestion des souscriptions, modèles et suivi global de la plateforme.
- **Sécurité & Authentification** : Authentification JWT, contrôle d'accès basé sur les rôles (ADMIN, CATERER, CLIENT).
- **Déploiement Docker & Cloud** : Architecture conteneurisée (Frontend Angular, Backend Spring Boot, Base MySQL, PhpMyAdmin) déployée sur VPS avec Nginx.

