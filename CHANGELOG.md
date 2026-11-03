# Journal des Modifications (CHANGELOG)

Toutes les modifications notables apportées au projet **EventManager** sont consignées dans ce fichier.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet respecte le [Semantic Versioning](https://semver.org/lang/fr/).

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
