# Plan de Développement Frontend — Angular Standalone + OneUI 5.12

Ce document définit les directives architecturales et le plan d'intégration pour le développement du frontend de l'application **EventManager**.

---

## 1. Choix Technologiques & Charte Graphique

* **Framework :** Angular (v18+) avec API **Standalone** (sans NgModules).
* **Styles & Composants UI :** Intégration stricte de la charte **OneUI 5.12**. Aucun composant UI n'est créé à partir de zéro sans s'appuyer sur les structures HTML/SCSS de OneUI.
* **Moteur de Styles :** Sass (SCSS) compilé par le builder Angular.

---

## 2. Structure des Dossiers Angular (`src/app/`)

Le projet suit une structure alignée sur les fonctionnalités (Feature-Aligned) :

```text
src/app/
├── app.config.ts         # Configuration des Providers (ex: routage, HTTP)
├── app.routes.ts         # Table de routage principale (Lazy loading)
├── app.ts                # Composant racine
│
├── core/                 # Services Singletons globaux
│   ├── auth/             # Service d'authentification, Guards et Intercepteurs JWT
│   ├── tenant/           # Gestion du contexte multi-tenant
│   └── error/            # Gestionnaire global des erreurs et intercepteur d'erreur
│
├── features/             # Dossiers alignés sur les fonctionnalités métier
│   ├── dashboard/        # Tableau de bord principal (Statistiques, widgets)
│   ├── events/           # Gestion des événements (Liste, Création, Détails)
│   └── caterers/         # Profil et inscription des traiteurs
│
└── shared/               # Directives, pipes et composants réutilisables
```

---

## 3. Plan d'Implémentation Étape par Étape

### Étape 1 : Initialisation & Intégration OneUI [✓ TERMINÉ]
* Initialisation de l'application Angular Standalone.
* Intégration des polices, icônes (FontAwesome, Simple Line Icons) et SCSS OneUI.
* Validation de la compilation (`npm run build` OK).

### Étape 2 : Création du Layout Global (Sidebar, Header, Main) [EN COURS]
* Création du composant de mise en page réutilisable adaptant le template OneUI (`be_pages_generic_blank.html`).
* Mise en place de la Sidebar avec la navigation principale.
* Mise en place du Header avec le bouton de déconnexion et de profil.
* Gestion de l'état d'ouverture/fermeture de la Sidebar.

### Étape 3 : Authentification & Inscription (JWT)
* Implémentation du service Angular `AuthService` appelant `/api/auth/login`.
* Ajout du `AuthInterceptor` pour injecter automatiquement le token `Authorization: Bearer <token>` dans toutes les requêtes API sortantes.
* Intégration de la page de Login (`op_auth_signin.html`) et d'Inscription (`op_auth_signup.html`).

### Étape 4 : Gestion des Événements
* Page de liste des événements (Appel vers `/api/events` qui récupère automatiquement les événements du traiteur connecté grâce au contexte JWT).
* Formulaire de création d'un événement (Appel `POST /api/events`).
