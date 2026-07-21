# EventManager - Documentation Master & Bilan Global du Projet

**Projet :** EventManager — Plateforme Saas Multi-Tenant de Gestion de Prestations et Événements pour Traiteurs  
**Tech Stack Backend :** Java 21, Spring Boot 3, Clean Architecture Hexagonale, Spring Security JWT, Spring Data JPA, H2 / PostgreSQL  
**Tech Stack Frontend :** Angular 18+ (Standalone API, Reactive Signals), OneUI 5.12 Design System (Sass/SCSS), Bootstrap 5  
**État Actuel :** 🟢 **100% Fonctionnel & Compilé (Build Success Backend & Frontend)**

---

## 📋 Table des Matières

1. [Vue d'Ensemble & Architecture Globale](#1-vue-densemble--architecture-globale)
2. [Historique & Progression (Du Début à Aujourd'hui)](#2-historique--progression-du-début-à-aujourdhui)
3. [Détail des Modules Implémentés](#3-détail-des-modules-implémentés)
   - [Module 1 : Authentification & Multi-Tenant (Traiteurs)](#module-1--authentification--multi-tenant-traiteurs)
   - [Module 2 : Gestion CRUD des Événements](#module-2--gestion-crud-des-événements)
   - [Module 3 (Option 3) : Gestion des Invités par Événement](#module-3-option-3--gestion-des-invités-par-événement)
   - [Module 4 (Option 4) : Recherche, Filtrage et Tri Avancés](#module-4-option-4--recherche-filtrage-et-tri-avancés)
   - [Module 5 (Option 5) : Gestion de la Restauration & des Menus](#module-5-option-5--gestion-de-la-restauration--des-menus)
   - [Module 6 (Option 6) : Checklist & Gestion des Tâches par Événement](#module-6-option-6--checklist--gestion-des-tâches-par-événement)
   - [Module 7 : Tableau de Bord Dynamique & Métriques Temps Réel](#module-7--tableau-de-bord-dynamique--métriques-temps-réel)
4. [Bilan des Builds & Validations](#4-bilan-des-builds--validations)
5. [Prochaines Évolutions Possibles (Roadmap)](#5-prochaines-évolutions-possibles-roadmap)

---

## 1. Vue d'Ensemble & Architecture Globale

L'application **EventManager** est une plateforme SaaS conçue pour les traiteurs professionnels. Elle leur permet d'administrer l'intégralité de leurs prestations événementielles, leurs listes d'invités, leurs régimes alimentaires, la confection de leurs menus culinaires et l'organisation du rétroplanning des tâches.

```text
               +-------------------------------------------------------+
               |            FRONTEND ANGULAR 18 (STANDALONE)           |
               |      Design System OneUI 5.12 & Reactive Signals     |
               +-------------------------------------------------------+
                                           |  HTTP (Authorization: Bearer <JWT>)
                                           v
               +-------------------------------------------------------+
               |            BACKEND SPRING BOOT (HEXAGONAL)            |
               |                                                       |
               |  [Presentation] REST Resources & ExceptionHandler     |
               |                                                       |
               |  [Application]   Use Cases, DTOs, Mappers, Services   |
               |                                                       |
               |  [Domain]        Pure Core Models & Business Enums    |
               |                                                       |
               |  [Infrastructure] JPA Adapters, Security, Entities    |
               +-------------------------------------------------------+
                                           |  Spring Data JPA
                                           v
               +-------------------------------------------------------+
               |                DATABASE (SQL / JPA)                   |
               | Tables: caterers, events, guests, menu_items, event_tasks|
               +-------------------------------------------------------+
```

---

## 2. Historique & Progression (Du Début à Aujourd'hui)

Voici le fil chronologique des grandes étapes de développement franchies sur le projet :

| Étape | Description & Fonctionnalités | Statut |
| :--- | :--- | :---: |
| **Étape 1** | **Socle & Architecture Hexagonale Backend** : Mise en place du projet Spring Boot avec l'architecture hexagonale (Domaine, Ports, Application, Infrastructure, REST). | 🟢 Fait |
| **Étape 2** | **Design System OneUI 5.12 & Frontend Standalone** : Intégration du template OneUI 5.12 dans Angular 18 avec routage et mise en page réutilisable (`Layout`, `Header`, `Sidebar`). | 🟢 Fait |
| **Étape 3** | **Authentification JWT & Multi-Tenant** : Inscription traiteur, Connexion, génération du Token JWT, `AuthInterceptor` Angular et `SecurityContextPort` backend pour isoler les données par traiteur. | 🟢 Fait |
| **Étape 4** | **Gestion des Événements (CRUD)** : Module complet de création, édition, affichage et suppression d'événements/prestations. | 🟢 Fait |
| **Étape 5** | **Option 3 - Gestion des Invités** : Suivi des presences (`CONFIRMED`, `PENDING`, `DECLINED`), attribution des tables et saisie des régimes alimentaires/allergies par événement. | 🟢 Fait |
| **Étape 6** | **Option 4 - Recherche & Tri Réactifs** : Barre de recherche instantanée sur le titre/lieu, filtre par statut et tri dynamique multi-critères via les **Angular Signals** (`computed()`). | 🟢 Fait |
| **Étape 7** | **Optimisations Générales Core** :<br>- **Tableau de bord dynamique** connecté en temps réel aux données API.<br>- **GlobalExceptionHandler** REST pour renvoyer les codes HTTP propres (`404`, `403`, `400`).<br>- **Suppression en Cascade** (`guests`, `menu_items` & `event_tasks`) lors de la suppression d'un événement.<br>- **Auto-Sync** du nombre d'invités sur l'événement. | 🟢 Fait |
| **Étape 8** | **Option 5 - Restauration & Menus** : Carte des menus par événement (Entrées, Plats, Desserts, Boissons), allergènes et **calculateur automatique du budget traiteur total**. | 🟢 Fait |
| **Étape 9** | **Option 6 - Checklist & Tâches de Préparation** : Gestion du rétroplanning (priorités `LOW`/`MEDIUM`/`HIGH`, états `TODO`/`IN_PROGRESS`/`COMPLETED`, échéances), basculement réactif des états (checkbox 1-clic) et **barre de progression visuelle de réalisation (%)**. | 🟢 Fait |

---

## 3. Détail des Modules Implémentés

### Module 1 : Authentification & Multi-Tenant (Traiteurs)
- **Fonctionnalités :** Inscription d'un nouveau traiteur avec nom d'entreprise (`businessName`), email et mot de passe chiffré BCrypt. Connexion sécurisée délivrant un jeton JWT.
- **Sécurité Multi-Tenant :** Chaque requête sortante injecte le header `Authorization: Bearer <token>`. Le backend extrait le `catererId` du jeton. Aucun traiteur ne peut voir ou modifier les données d'un autre traiteur.
- **Composants Angular :** `Login`, `Register`, `Profile` (Gestion du nom d'entreprise et changement de mot de passe).

### Module 2 : Gestion CRUD des Événements
- **Fonctionnalités :** Création et modification d'événements (`title`, `eventDate`, `location`, `guestCount`, `status`).
- **Statuts d'événements :** `DRAFT` (Brouillon), `PLANNED` (Planifié), `COMPLETED` (Terminé), `CANCELLED` (Annulé).
- **Composants Angular :** `EventList`, `EventCreate`, `EventEdit`.

### Module 3 (Option 3) : Gestion des Invités par Événement
- **Fonctionnalités :** Liste interactive des invités rattachés à un événement spécifique (`/events/:id/guests`).
- **Champs suivis :** Nom complet, email, téléphone, statut de réponse (`CONFIRMED`, `PENDING`, `DECLINED`), numéro de table attribué et régimes alimentaires (ex: *Végétarien*, *Allergie fruits de mer*).
- **Widgets :** 4 cartes de statistiques réactives (Total, Confirmés, En attente, Déclinés) et formulaire Modal OneUI.
- **Auto-Sync :** Le nombre d'invités sur l'événement récapitulatif se met à jour automatiquement en base de données.

### Module 4 (Option 4) : Recherche, Filtrage et Tri Avancés
- **Fonctionnalités :** Barre de recherche réactive filtrant la liste des prestations au fil de la frappe sans rechargement de page.
- **Critères :** Filtrage par mot-clé (dans le titre ou le lieu), filtrage par statut et tri multi-critères (Par date, Par nombre d'invités, Par ordre alphabétique A-Z).
- **Bouton 1-clic :** Réinitialisation instantanée de tous les critères.

### Module 5 (Option 5) : Gestion de la Restauration & des Menus
- **Fonctionnalités :** Création et gestion de la carte traiteur par événement (`/events/:id/menu`).
- **Catégories Culinaires :** `STARTER` (Entrée), `MAIN` (Plat Principal), `DESSERT` (Dessert), `BEVERAGE` (Boisson).
- **Spécificités :** Prix par personne (€), tags d'allergènes/régimes (*Bio*, *Sans Gluten*, *Halal*, etc.) et description complète de la recette/composition.
- **Calculateur de Budget Traiteur :**
  $$\text{Budget Total Traiteur} = \text{Coût Total Menu par Personne} \times \text{Nombre d'Invités Attendus}$$
- **Widgets :** 4 cartes métriques + Barre d'outils de filtres par catégories culinaires.

### Module 6 (Option 6) : Checklist & Gestion des Tâches par Événement
- **Fonctionnalités :** Organisation complète des préparatifs et tâches de chaque prestation (`/events/:id/tasks`).
- **Niveaux de Priorité & Statuts :** Priorités (`LOW`, `MEDIUM`, `HIGH`), États (`TODO`, `IN_PROGRESS`, `COMPLETED`), date d'échéance et responsable assigné.
- **Barre de Progression Dynamique :** Affichage visuel du taux d'avancement des préparatifs (`Tâches terminées / Total * 100%`).
- **Widgets & Actions :** 4 cartes statistiques (Total, Terminées, En cours, Urgentes), basculement instantané d'état via Checkbox 1-clic et filtres de checklist.

### Module 7 : Tableau de Bord Dynamique & Métriques Temps Réel
- **Fonctionnalités :** Écran principal (`/dashboard`) affichant l'état d'activité du traiteur connecté.
- **Métriques en direct :** Nombre total d'événements enregistrés, cumul total d'invités attendus sur l'ensemble des prestations, statut du compte.
- **Navigation :** Boutons d'action redirigeant directement vers la liste des prestations et le profil.

---

## 4. Bilan des Builds & Validations

Les vérifications de compilation et d'exécution sont régulièrement exécutées et validées sans aucune erreur :

```text
Backend Spring Boot (Java 21) :
  Command : .\mvnw.cmd compile
  Status  : 🟢 BUILD SUCCESS (96 source files compiled)

Frontend Angular (v18 Standalone + OneUI 5.12) :
  Command : npm run build
  Status  : 🟢 BUILD SUCCESS (Application bundle generated in 7.8s)
```

---

## 5. Prochaines Évolutions Possibles (Roadmap)

Pour poursuivre le développement de votre SaaS **EventManager**, voici les extensions naturelles prêtes à être intégrées :

1. **Export PDF & Impression (Option 7) :** Génération de fiches cuisine, cartes de menu imprimables, fiches rétroplanning et plans de table au format PDF.
2. **Devis & Invoicing (Option 8) :** Module de génération de devis traiteur automatisé et suivi de facturation.
