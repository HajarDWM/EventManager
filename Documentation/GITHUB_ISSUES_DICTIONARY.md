# Répertoire Complet des GitHub Issues - EventManager

Ce document contient la fiche complète de chaque **Issue GitHub** du projet **EventManager** avec son **Titre**, ses **Labels**, son **Statut**, et son **Contenu Markdown détaillé (Body)** prêt à être copié ou synchronisé.

---

# 📑 Table des Matières

- [1. Architecture, Multi-Tenant & Sécurité (Issues 1 à 5)](#1-architecture-multi-tenant--sécurité)
- [2. Gestion & Cycle de Vie des Événements (Issues 6 à 10)](#2-gestion--cycle-de-vie-des-événements)
- [3. Studio d'Invitations Digitales de Luxe & Modèles (Issues 11 à 20)](#3-studio-dinvitations-digitales-de-luxe--modèles)
- [4. Portail Public Invités RSVP (Issues 21 à 27)](#4-portail-public-invités-rsvp)
- [5. Espace Collaboratif Client Hôte (Issues 28 à 31)](#5-espace-collaboratif-client-hôte)
- [6. Gestion des Cartes, Menus & Restauration (Issues 32 à 34)](#6-gestion-des-cartes-menus--restauration)
- [7. Gestion Financière, Acomptes & Dépenses (Issues 35 à 38)](#7-gestion-financière-acomptes--dépenses)
- [8. Communication Multi-Canal, Import/Export & Core (Issues 39 à 44)](#8-communication-multi-canal-importexport--core)
- [9. Nouvelles Fonctionnalités Planifiées (Issues 45 à 55)](#9-nouvelles-fonctionnalités-planifiées-to-do)

---

## 1. Architecture, Multi-Tenant & Sécurité

### Issue #1 : [DONE-AUTH-01] Architecture Multi-Tenant et Isolation de Base de Données par Traiteur
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `feature:auth`
- **Description / Body :**
```markdown
## 📌 Description du Module
Mise en place du cloisonnement strict des données au niveau de la couche de persistance et des API pour garantir une isolation totale entre les différentes entreprises de traiteurs (Tenants).

### ✅ Tâches Réalisées :
- [x] **Isolation Multi-Locataire :** Filtrage systématique par `caterer_id` sur l'ensemble des requêtes JPA et Hibernate.
- [x] **Sécurité des Données :** Impossibilité pour un traiteur d'accéder aux événements, menus, invités ou finances d'un concurrent.
- [x] **Migrations Flyway :** Versionnage de schéma de base de données PostgreSQL/MySQL assurant l'intégrité référentielle multi-tenant.

### 💻 Fichiers & Composants Clés :
- `Backend/src/main/java/com/example/eventmanager/domain/model/Caterer.java`
- `Backend/src/main/java/com/example/eventmanager/infrastructure/persistence/entity/CatererEntity.java`
- `Backend/src/main/resources/db/migration/`
```

---

### Issue #2 : [DONE-AUTH-02] Système de Contrôle d'Accès par Rôles (RBAC : SuperAdmin, Caterer, Staff, Client)
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `scope:frontend`, `feature:auth`
- **Description / Body :**
```markdown
## 📌 Description du Module
Gestion granulaire des permissions et des profils utilisateurs pour sécuriser les points d'entrée de l'application.

### ✅ Tâches Réalisées :
- [x] **Hiérarchie des Rôles :** Implémentation des rôles `SUPER_ADMIN`, `CATERER_ADMIN`, `STAFF`, et `CLIENT`.
- [x] **Filtres de Sécurité Backend :** Sécurisation des contrôleurs REST via Spring Security `@PreAuthorize`.
- [x] **Guards de Routage Frontend :** Protection des routes Angular avec redirection automatique selon le rôle de l'utilisateur connecté.

### 💻 Fichiers & Composants Clés :
- `Backend/src/main/java/com/example/eventmanager/domain/model/CatererRole.java`
- `Frontend/src/app/core/guards/auth.guard.ts`
- `Frontend/src/app/core/guards/admin.guard.ts`
```

---

### Issue #3 : [DONE-AUTH-03] Pipeline d'Authentification Stateless JWT avec Refresh Tokens
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `feature:auth`
- **Description / Body :**
```markdown
## 📌 Description du Module
Mécanisme d'authentification robuste et stateless basé sur des jetons JWT avec gestion de session sécurisée.

### ✅ Tâches Réalisées :
- [x] **Génération & Validation JWT :** Signature cryptographique HMAC-SHA256 avec claims personnalisés.
- [x] **Hachage Sécurisé :** Chiffrement des mots de passe avec BCrypt.
- [x] **Renouvellement de Jeton :** Support des refresh tokens pour maintenir la session sans forcer la reconnexion.
- [x] **Endpoints Dédiés :** `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`.

### 💻 Fichiers & Composants Clés :
- `Backend/src/main/java/com/example/eventmanager/presentation/resource/AuthResource.java`
- `Backend/src/main/java/com/example/eventmanager/infrastructure/security/JwtService.java`
```

---

### Issue #4 : [DONE-AUTH-04] Authentification Directe Client Hôte par Token Sécurisé / Magic Link
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `scope:frontend`, `feature:auth`, `feature:client`
- **Description / Body :**
```markdown
## 📌 Description du Module
Accès sécurisé et simplifié pour les clients finaux (les mariés ou organisateurs de l'événement) sans création de compte complexe.

### ✅ Tâches Réalisées :
- [x] **Lien Magique / Jeton Unique :** Accès direct via jeton chiffré intégré à l'URL.
- [x] **Contrôleur Dédié :** Endpoints `ClientAuthController` dédiés à la validation et à la session de l'hôte.
- [x] **Session Client Frontend :** Stockage sécurisé de la session client pour naviguer sur le portail `/client-dashboard`.

### 💻 Fichiers & Composants Clés :
- `Backend/src/main/java/com/example/eventmanager/presentation/resource/ClientAuthController.java`
- `Frontend/src/app/features/client-dashboard/`
```

---

### Issue #5 : [DONE-AUTH-05] Intercepteur et Guard de Vérification d'Abonnement Actif Traiteur
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `scope:frontend`, `feature:auth`, `feature:saas`
- **Description / Body :**
```markdown
## 📌 Description du Module
Garde de sécurité SaaS contrôlant la validité de l'abonnement du traiteur avant d'autoriser la gestion d'événements.

### ✅ Tâches Réalisées :
- [x] **Contrôle d'Expiration :** Vérification automatique du statut de l'abonnement (`ACTIVE`, `EXPIRED`, `TRIAL`).
- [x] **Blocage des Actions Traiteur :** Désactivation des fonctions d'envoi et d'édition pour les comptes expirés.
- [x] **Exception Super Admin :** Accès illimité préservé pour l'administrateur de la plateforme.

### 💻 Fichiers & Composants Clés :
- `Frontend/src/app/core/guards/subscription.guard.ts`
- `Frontend/src/app/features/events/components/organiser-invitation-setup/organiser-invitation-setup.ts`
```

---

## 2. Gestion & Cycle de Vie des Événements

### Issue #6 : [DONE-EVT-01] Assistant Multi-Étapes de Création d'Événements avec Validation
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `scope:backend`, `feature:event`
- **Description / Body :**
```markdown
## 📌 Description du Module
Formulaire guidé étape par étape permettant la configuration complète d'un nouvel événement.

### ✅ Tâches Réalisées :
- [x] **Stepper OneUI Réactif :** Saisie des coordonnées de l'événement, date, type de réception et effectif prévisionnel.
- [x] **Validation en Temps Réel :** Contrôle de saisie des champs obligatoires et des formats de date.
- [x] **Persistance API :** Création transactionnelle dans `EventResource`.

### 💻 Fichiers & Composants Clés :
- `Frontend/src/app/features/events/components/event-create/`
- `Backend/src/main/java/com/example/eventmanager/presentation/resource/EventResource.java`
```

---

### Issue #7 : [DONE-EVT-02] Tableau de Bord Maître des Détails de l'Événement & KPI en Direct
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:event`
- **Description / Body :**
```markdown
## 📌 Description du Module
Page centrale de gestion affichant la synthèse complète de l'événement en cours.

### ✅ Tâches Réalisées :
- [x] **Indicateurs Clés (KPI) :** Total des invités, présences confirmées, budget global, solde encaissé et compte à rebours Jour J.
- [x] **Navigation par Onglets :** Accès instantané aux invités, aux menus, à la facturation, aux tâches et aux exports.

### 💻 Fichiers & Composants Clés :
- `Frontend/src/app/features/events/components/event-details/`
```

---

### Issue #8 : [DONE-EVT-03] Moteur de Statuts d'Événements (Brouillon, Confirmé, Terminé, Annulé)
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `scope:frontend`, `feature:event`
- **Description / Body :**
```markdown
## 📌 Description du Module
Gestion des états de l'événement tout au long de son cycle de vie.

### ✅ Tâches Réalisées :
- [x] **Machine à États :** Transition contrôlée `DRAFT` ➔ `CONFIRMED` ➔ `COMPLETED` / `CANCELLED`.
- [x] **Badges Visuels :** Code couleur distinctif OneUI pour chaque état.
```

---

### Issue #9 : [DONE-EVT-04] Duplication d'Événements et Clonage Rapide de Prestations
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `scope:frontend`, `feature:event`
- **Description / Body :**
```markdown
## 📌 Description du Module
Outil de clonage permettant de réutiliser la structure d'un événement antérieur pour une nouvelle prestation.

### ✅ Tâches Réalisées :
- [x] **Clonage de Configuration :** Duplication des menus, réglages de modèles d'invitations et checklists.
- [x] **Réinitialisation des Données Spécifiques :** Remise à zéro des listes d'invités et des règlements financiers.
```

---

### Issue #10 : [DONE-EVT-05] Checklist des Tâches de Préparation et Compte à Rebours d'Échéances
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `scope:frontend`, `feature:event`
- **Description / Body :**
```markdown
## 📌 Description du Module
Gestionnaire de tâches pour orchestrer les étapes logistiques avant le jour J.

### ✅ Tâches Réalisées :
- [x] **CRUD des Tâches :** Création de tâches avec priorités (`HIGH`, `MEDIUM`, `LOW`) et dates d'échéance.
- [x] **Barre de Progression :** Calcul en temps réel du pourcentage d'achèvement de la préparation.

### 💻 Fichiers & Composants Clés :
- `Frontend/src/app/features/events/components/task-list/`
- `Backend/src/main/java/com/example/eventmanager/presentation/resource/EventTaskResource.java`
```

---

## 3. Studio d'Invitations Digitales de Luxe & Modèles

### Issue #11 : [DONE-TPL-01] Catalogue Admin et Studio d'Édition de Modèles d'Invitations Digitales
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `scope:backend`, `feature:template`
- **Description / Body :**
```markdown
## 📌 Description du Module
Studio complet de création et d'administration de modèles d'invitations électroniques haut de gamme.

### ✅ Tâches Réalisées :
- [x] **Gestionnaire de Modèles :** CRUD complet des thèmes d'invitations.
- [x] **Catégorisation :** Mariage, Fiançailles, Corporate, Anniversaire, Gala d'exception.

### 💻 Fichiers & Composants Clés :
- `Frontend/src/app/features/admin/templates/`
- `Backend/src/main/java/com/example/eventmanager/presentation/resource/AdminTemplateController.java`
```

---

### Issue #12 : [DONE-TPL-02] Personnalisation des Palettes de Couleurs et Arrière-plans de Prestige
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:template`
- **Description / Body :**
```markdown
## 📌 Description du Module
Moteur de thématisation visuelle permettant un contrôle total des couleurs et arrière-plans.

### ✅ Tâches Réalisées :
- [x] **Sélecteurs de Teintes :** Couleur d'accentuation dorée, couleur des titres et du texte secondaire.
- [x] **Thèmes Sombres & Clairs :** Détection automatique de la luminosité du fond avec ajustement automatique du contraste.
```

---

### Issue #13 : [DONE-TPL-03] Chargeur Dynamique de Typographies de Luxe Google Fonts
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:template`
- **Description / Body :**
```markdown
## 📌 Description du Module
Module d'injection dynamique à l'exécution de polices typographiques de prestige depuis Google Fonts.

### ✅ Tâches Réalisées :
- [x] **Catalogue de Polices :** *Alex Brush, Cinzel, Playfair Display, Great Vibes, Montserrat, Cormorant Garamond*.
- [x] **Contrôles Typographiques :** Réglage en direct de la taille (`fontSize`), de la graisse (`fontWeight`) et de l'espacement (`letterSpacing`).
```

---

### Issue #14 : [DONE-TPL-04] Cadres Décoratifs Filigranes (Floral, Bordure Dorée, Géométrique, Minimaliste)
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:template`
- **Description / Body :**
```markdown
## 📌 Description du Module
Couches ornementales décoratives superposées à la carte d'invitation pour un rendu esthétique haute fidélité.

### ✅ Tâches Réalisées :
- [x] **4 Styles de Cadres :** Cadre Floral Romantique, Bordure Dorée Royale, Lignes Géométriques Modernes, et Bordure Minimaliste.
```

---

### Issue #15 : [DONE-TPL-05] Moteur de Particules d'Ambiance Visuelles (Or, Pétales, Confettis, Étoiles, Bokeh)
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:template`
- **Description / Body :**
```markdown
## 📌 Description du Module
Générateur de particules atmosphériques en CSS GPU-accéléré pour animer l'arrière-plan de l'invitation.

### ✅ Tâches Réalisées :
- [x] **5 Effets Visuels :** Poussière d'or flottante, Chute de pétales de roses, Confettis de fête, Étoiles scintillantes, Orbes Bokeh.
```

---

### Issue #16 : [DONE-TPL-06] Cadrage Responsive des Particules : Marges Latérales sur Mobile vs Plein Écran Desktop
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:template`
- **Description / Body :**
```markdown
## 📌 Description du Module
Système d'adaptation responsive du positionnement des particules visuelles pour préserver la lisibilité du texte.

### ✅ Tâches Réalisées :
- [x] **Mode Mobile (< 992px) :** Particules restreintes exclusivement aux bordures latérales (gauche <= 16% et droite >= 84%) pour laisser le texte 100% lisible au centre.
- [x] **Mode Desktop (>= 992px) :** Dispersion harmonieuse sur l'ensemble de l'écran (3% à 97%).

### 💻 Fichiers & Composants Clés :
- `Frontend/src/app/features/events/components/guest-rsvp/guest-rsvp.ts`
- `Frontend/src/app/features/events/components/guest-rsvp/guest-rsvp.scss`
- `Frontend/src/app/features/admin/templates/admin-templates.scss`
```

---

### Issue #17 : [DONE-TPL-07] 5 Expériences d'Ouverture Interactives de Prestige
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:template`
- **Description / Body :**
```markdown
## 📌 Description du Module
Séquences d'animation immersives simulant l'ouverture physique d'une invitation de luxe lors du premier clic de l'invité.

### ✅ Tâches Réalisées :
- [x] **5 Styles d'Ouverture :** Sceau de Cire Royal, Découpe du Ruban de Soie, Dévoilement de Rideau de Théâtre, Portes Battantes de Palace, et Badge VIP Holographique.
```

---

### Issue #18 : [DONE-TPL-08] Widget Lecteur Audio Flottant avec Vinyle Rotatif et Égaliseur d'Ondes
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:template`
- **Description / Body :**
```markdown
## 📌 Description du Module
Lecteur de musique d'ambiance intégré à l'invitation avec micro-interactions visuelles soignées.

### ✅ Tâches Réalisées :
- [x] **Widget Flottant :** Disque vinyle en rotation continue lors de la lecture.
- [x] **Barres d'Égaliseur :** Ondes sonores animées réagissant à l'état de lecture.
- [x] **Lecture Automatique :** Déclenchement automatique de la musique au premier clic de l'invité sur l'invitation.
```

---

### Issue #19 : [DONE-TPL-09] Sélecteur de Rendu d'Aperçu en Direct Double-Écran (Mobile & Desktop)
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:template`
- **Description / Body :**
```markdown
## 📌 Description du Module
Outil de prévisualisation en temps réel dans l'espace d'administration permettant de basculer instantanément entre la vue smartphone et la vue grand écran.
```

---

### Issue #20 : [DONE-TPL-10] Hydratation Instantanée 0ms via sessionStorage contre les Latences F5
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:template`
- **Description / Body :**
```markdown
## 📌 Description du Module
Mécanisme d'optimisation des performances supprimant les temps de chargement et spinners au rafraîchissement de la page.

### ✅ Tâches Réalisées :
- [x] **Cache Session :** Stockage local et réhydratation synchrone 0ms des modèles dans `TemplateService`.
```

---

## 4. Portail Public Invités RSVP

### Issue #21 : [DONE-RSVP-01] Portail Public d'Invitation RSVP Sécurisé par Jeton Individuel
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `scope:backend`, `feature:rsvp`
- **Description / Body :**
```markdown
## 📌 Description du Module
Page publique accessible via URL tokenisée (`/rsvp/:id`) permettant à l'invité de confirmer sa présence en toute fluidité.
```

---

### Issue #22 : [DONE-RSVP-02] Parcours Gastronomique Pas-à-Pas de Sélection des Plats
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:rsvp`, `feature:catering`
- **Description / Body :**
```markdown
## 📌 Description du Module
Stepper interactif guidant l'invité dans le choix de son repas (Entrée, Plat chaud, Dessert, Boisson) avec photos HD et descriptifs des saveurs.
```

---

### Issue #23 : [DONE-RSVP-03] Moteur Multi-Formules Traiteur (Plats Fixes, Buffet, Formule Mixte)
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `scope:backend`, `feature:rsvp`, `feature:catering`
- **Description / Body :**
```markdown
## 📌 Description du Module
Adaptation dynamique du portail RSVP selon le format de restauration choisi pour l'événement : `PLATS_FIXES`, `BUFFET` ou `MIX`.
```

---

### Issue #24 : [DONE-RSVP-04] Gestion des Régimes Spéciaux et Tags d'Allergènes Alimentaires
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `scope:backend`, `feature:rsvp`, `feature:catering`
- **Description / Body :**
```markdown
## 📌 Description du Module
Collecte précise des contraintes alimentaires des convives (Sans Gluten, Lactose, Arachides, Halal, Casher, Végan, Végétarien).
```

---

### Issue #25 : [DONE-RSVP-05] Enregistrement Dynamique des Accompagnants (+1 et Famille)
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `scope:backend`, `feature:rsvp`
- **Description / Body :**
```markdown
## 📌 Description du Module
Prise en compte des conjoints et enfants invités avec sélection de repas individuels pour chaque membre de la famille.
```

---

### Issue #26 : [DONE-RSVP-06] Parcours de Déclinaison avec Messages de Vœux et Regrets aux Hôtes
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `scope:backend`, `feature:rsvp`
- **Description / Body :**
```markdown
## 📌 Description du Module
Expérience soignée pour les invités ne pouvant pas se déplacer, leur permettant de transmettre un mot d'affection et des vœux de félicitations aux hôtes.
```

---

### Issue #27 : [DONE-RSVP-07] Export Calendrier .ics en 1 Clic et Guidage GPS Google Maps / Parking
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:rsvp`
- **Description / Body :**
```markdown
## 📌 Description du Module
Utilitaires pratiques sur l'invitation : ajout de l'événement dans Google Calendar / Apple iCal et ouverture de l'itinéraire GPS vers le lieu et le parking.
```

---

## 5. Espace Collaboratif Client Hôte

### Issue #28 : [DONE-CLNT-01] Tableau de Bord Client Privé avec Statistiques de Réponses en Direct
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `scope:backend`, `feature:client`
- **Description / Body :**
```markdown
## 📌 Description du Module
Espace sécurisé permettant aux mariés et clients de suivre en direct le taux de confirmation de leurs invités et le décompte des présences.
```

---

### Issue #29 : [DONE-CLNT-02] Gestion Collaborative de la Liste des Invités et Groupes Dynamiques
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `scope:backend`, `feature:client`
- **Description / Body :**
```markdown
## 📌 Description du Module
Outils de gestion d'invités mis à disposition des hôtes : ajout de convives, modification des coordonnées, filtres et groupes personnalisés.
```

---

### Issue #30 : [DONE-CLNT-03] Synthèse des Choix de Menus et Régimes Alimentaires Côté Client
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:client`, `feature:catering`
- **Description / Body :**
```markdown
## 📌 Description du Module
Visualisation en temps réel pour l'hôte de la répartition des plats choisis et de la liste des convives ayant des régimes particuliers.
```

---

### Issue #31 : [DONE-CLNT-04] Composant d'Aperçu Live de l'Invitation Digitale dans le Portail Client
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:client`, `feature:template`
- **Description / Body :**
```markdown
## 📌 Description du Module
Composant `ClientInvitationPreviewComponent` affichant à l'hôte le rendu exact de son carton d'invitation avec ses personnalisations.
```

---

## 6. Gestion des Cartes, Menus & Restauration

### Issue #32 : [DONE-CAT-01] Catalogue des Plats et Cartes Gastronomiques du Traiteur
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `scope:frontend`, `feature:catering`
- **Description / Body :**
```markdown
## 📌 Description du Module
Inventaire des propositions culinaires du traiteur classées par catégories (Entrées, Plats Chauds, Douceurs, Boissons).
```

---

### Issue #33 : [DONE-CAT-02] Contrôleur d'Upload et Distribution des Photos de Plats (Multipart)
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `feature:catering`
- **Description / Body :**
```markdown
## 📌 Description du Module
Endpoint dédié `MenuItemImageController` pour le téléversement d'images de plats et leur affichage optimisé sur les invitations.
```

---

### Issue #34 : [DONE-CAT-03] Tableau de Bord Récapitulatif de Production pour la Brigade Cuisine
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `scope:frontend`, `feature:catering`
- **Description / Body :**
```markdown
## 📌 Description du Module
Outil d'agrégation calculant le nombre exact de portions à cuisiner par recette pour le chef exécutif et son équipe.
```

---

## 7. Gestion Financière, Acomptes & Dépenses

### Issue #35 : [DONE-FIN-01] Échéancier des Paiements Clients, Suivi des Acomptes et Reste à Payer
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `scope:frontend`, `feature:finance`
- **Description / Body :**
```markdown
## 📌 Description du Module
Module de facturation enregistrant les acomptes reçus, les modes de règlement et le solde restant à percevoir.
```

---

### Issue #36 : [DONE-FIN-02] Journal Détaillé des Dépenses et Charges de l'Événement
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `scope:frontend`, `feature:finance`
- **Description / Body :**
```markdown
## 📌 Description du Module
Enregistrement des coûts réels de revient par poste de dépense : matières premières, personnel, matériel, logistique.
```

---

### Issue #37 : [DONE-FIN-03] Calcul en Temps Réel de la Marge et du Bénéfice Net par Événement
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:finance`
- **Description / Body :**
```markdown
## 📌 Description du Module
Indicateur KPI calculant en direct : `Bénéfice Net = Total Encaissé Client - Total des Dépenses Réelles`.
```

---

### Issue #38 : [DONE-FIN-04] Génération et Impression PDF des Reçus de Paiement et Bons de Décaissement
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:finance`
- **Description / Body :**
```markdown
## 📌 Description du Module
Génération et impression immédiate au format PDF des reçus d'encaissement clients officiels et des bons internes de dépenses.
```

---

## 8. Communication Multi-Canal, Import/Export & Core

### Issue #39 : [DONE-COMM-01] Centre d'Expédition Multi-Canal des Invitations (WhatsApp, Email, SMS)
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `scope:backend`, `feature:rsvp`
- **Description / Body :**
```markdown
## 📌 Description du Module
Interface d'envoi groupé ou individuel des liens d'invitations via WhatsApp Web, Email et message SMS formaté.
```

---

### Issue #40 : [DONE-DATA-01] Pipeline d'Importation Serveur Excel (.xlsx) et CSV avec Détection de Séparateurs
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `feature:data`
- **Description / Body :**
```markdown
## 📌 Description du Module
Service d'importation de fichiers Excel et CSV robuste traitant de grandes listes de convives avec validation automatique des groupes.
```

---

### Issue #41 : [DONE-DATA-02] Moteur d'Exportation de Données en 1 Clic vers Excel et CSV
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `scope:frontend`, `feature:data`
- **Description / Body :**
```markdown
## 📌 Description du Module
Exportation instantanée des données de l'événement : fiches de présence, commandes de cuisine et bilans financiers.
```

---

### Issue #42 : [DONE-I18N-01] Internationalisation Complète de l'Application (Français, Anglais, Arabe)
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:i18n`
- **Description / Body :**
```markdown
## 📌 Description du Module
Prise en charge intégrale du multilingue sur l'ensemble des écrans (Français, Anglais, Arabe).
```

---

### Issue #43 : [DONE-CURR-01] Moteur Multi-Devises avec Formatage Dynamique (MAD, EUR, USD, GBP, CAD)
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:frontend`, `feature:i18n`
- **Description / Body :**
```markdown
## 📌 Description du Module
Conversion et formatage des montants financiers selon la devise choisie par le traiteur.
```

---

### Issue #44 : [DONE-SAAS-01] Monétisation SaaS Traiteur par Stripe Checkout et Webhooks d'Abonnement
- **Statut :** `Closed (Done)`
- **Labels :** `status:done`, `scope:backend`, `feature:saas`
- **Description / Body :**
```markdown
## 📌 Description du Module
Système d'abonnement récurrent pour les traiteurs avec intégration de Stripe Checkout et traitement des webhooks de facturation.
```

---

## 9. Nouvelles Fonctionnalités Planifiées (TO DO)

### Issue #45 : [TODO-LOG-01] Concepteur Visuel de Plan de Salle Interactif (Canvas 2D / Grille)
- **Statut :** `Open (To Do)`
- **Labels :** `status:todo`, `priority:critical`, `scope:frontend`, `scope:backend`
- **Cible :** `Q4 2026`
- **Description / Body :**
```markdown
## 🎯 Objectif
Outil visuel interactif pour positionner les tables de réception (rondes, rectangulaires, ovales, table d'honneur) dans la salle.

### 📋 Spécifications :
- [ ] Canvas interactif de positionnement de tables (coordonnées X/Y).
- [ ] Définition de la capacité maximale par table.
```

---

### Issue #46 : [TODO-LOG-02] Placement des Invités par Glisser-Déposer (Drag & Drop) et Alertes de Capacité
- **Statut :** `Open (To Do)`
- **Labels :** `status:todo`, `priority:critical`, `scope:frontend`, `scope:backend`
- **Cible :** `Q4 2026`
- **Description / Body :**
```markdown
## 🎯 Objectif
Permettre d'assigner les invités confirmés aux chaises des tables par glisser-déposer depuis une liste latérale avec détection des conflits.
```

---

### Issue #47 : [TODO-LOG-03] Export Haute Définition du Plan de Table et des Chevalets en PDF
- **Statut :** `Open (To Do)`
- **Labels :** `status:todo`, `priority:high`, `scope:frontend`, `scope:backend`
- **Cible :** `Q4 2026`
- **Description / Body :**
```markdown
## 🎯 Objectif
Génération PDF haute résolution du plan de table global et des listes d'accueil par table pour l'accueil des convives.
```

---

### Issue #48 : [TODO-OPS-01] Chronogramme Déroulé Heure par Heure du Jour J avec Assignation d'Équipe
- **Statut :** `Open (To Do)`
- **Labels :** `status:todo`, `priority:high`, `scope:frontend`, `scope:backend`
- **Cible :** `Q4 2026`
- **Description / Body :**
```markdown
## 🎯 Objectif
Rétroplanning minute-par-minute de la journée partagé entre la cuisine, la salle, le DJ et les organisateurs.
```

---

### Issue #49 : [TODO-OPS-02] Vue Mobile Live pour Équipes Terrain (Serveurs et Maître d'Hôtel)
- **Statut :** `Open (To Do)`
- **Labels :** `status:todo`, `priority:medium`, `scope:frontend`
- **Cible :** `Q4 2026`
- **Description / Body :**
```markdown
## 🎯 Objectif
Interface smartphone épurée permettant aux équipes en salle de suivre et cocher l'avancement des étapes en direct.
```

---

### Issue #50 : [TODO-HR-01] Gestion du Roster et Plannings des Équipes de Service et Extras
- **Statut :** `Open (To Do)`
- **Labels :** `status:todo`, `priority:medium`, `scope:backend`, `scope:frontend`
- **Cible :** `Q1 2027`
- **Description / Body :**
```markdown
## 🎯 Objectif
Gestion des fiches des serveurs, cuisiniers et extras requis pour la prestation avec planification des horaires d'embauche.
```

---

### Issue #51 : [TODO-HR-02] Calcul Automatique des Salaires et Intégration aux Dépenses de l'Événement
- **Statut :** `Open (To Do)`
- **Labels :** `status:todo`, `priority:medium`, `scope:backend`, `scope:frontend`
- **Cible :** `Q1 2027`
- **Description / Body :**
```markdown
## 🎯 Objectif
Calcul automatique de la masse salariale réelle (taux horaire x heures effectuées) et liaison avec le registre des dépenses de l'événement.
```

---

### Issue #52 : [TODO-MEDIA-01] Galerie Souvenir Partagée avec Téléversement par QR Code de Table
- **Statut :** `Open (To Do)`
- **Labels :** `status:todo`, `priority:medium`, `scope:frontend`, `scope:backend`
- **Cible :** `Q1 2027`
- **Description / Body :**
```markdown
## 🎯 Objectif
Espace photo souvenir où les invités téléversent leurs photos de la soirée en scannant un QR code sur leur table, avec modération par l'hôte.
```

---

### Issue #53 : [TODO-COMM-01] Intégration de l'API Meta WhatsApp Cloud et Relances Automatisées
- **Statut :** `Open (To Do)`
- **Labels :** `status:todo`, `priority:medium`, `scope:backend`
- **Cible :** `Q2 2027`
- **Description / Body :**
```markdown
## 🎯 Objectif
Envoi officiel en masse d'invitations WhatsApp vérifiées et rappels automatiques programmés à J-7 et J-2 pour les invités n'ayant pas encore répondu.
```

---

### Issue #54 : [TODO-AI-01] Assistant IA de Proposition de Menus et Calcul Prédictif des Matières Premières
- **Statut :** `Open (To Do)`
- **Labels :** `status:todo`, `priority:medium`, `scope:backend`, `scope:frontend`
- **Cible :** `Q2 2027`
- **Description / Body :**
```markdown
## 🎯 Objectif
Suggestions IA de menus selon le budget par convive et calcul automatique précis des grammages d'ingrédients bruts selon les choix des invités RSVP.
```

---

### Issue #55 : [TODO-PWA-01] Application PWA Hors-Ligne et Scanner QR Code de Contrôle d'Accès
- **Statut :** `Open (To Do)`
- **Labels :** `status:todo`, `priority:medium`, `scope:frontend`
- **Cible :** `Q2 2027`
- **Description / Body :**
```markdown
## 🎯 Objectif
Application PWA ultra-rapide fonctionnant hors-ligne pour scanner les billets et invitations QR Code à l'entrée de la salle.
```
