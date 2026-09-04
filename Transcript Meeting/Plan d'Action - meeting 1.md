# Compte Rendu et Plan d'Action - Projet Traiteur / Event Management

## 1. Interface Traiteur / Organisateur (UX & Métier)

### Navigation & Accueil
* **Page par défaut :** Conserver la liste des événements comme page d'accueil principale (accès direct aux opérations) au lieu du Dashboard.

### Formulaire d'Événement
* **Statut :** Retirer le champ *Statut* lors de la création d'un événement. Le statut initial doit être géré automatiquement par le système (ex: *Nouveau*).
* **Saisie Date/Heure :** Remplacer le sélecteur actuel par un composant plus simple et ergonomique pour la sélection des horaires.
* **Nombre d'invités :** Ne pas rendre ce champ obligatoire à la création (autoriser la valeur *Non défini* ou `0`).

### Gestion des Invités
* **Champ Position/Table :** Remplacer le terme `Table` par `Position` afin de couvrir plusieurs configurations (ex: `Table A1`, `Buffet 1`, `VIP`).
* **Importation :** Ajouter l'importation/exportation via fichier Excel pour faciliter l'ajout de listes d'invités volumineuses.

### Gestion du Menu
* **Auto-suggestion :** Proposer un système de saisie prédictive basé sur l'historique des plats enregistrés.
* **Régimes & Allergies :** Utiliser des cases à cocher (*checkboxes*) pour les spécificités alimentaires.
* **Catégories :** Ajouter la catégorie `Autre` pour couvrir les formats spécifiques (buffets, amuse-bouches, etc.).

### Suivi des Tâches
* **Check-list :** Conserver le module de tâches comme fonctionnalité secondaire (*Nice to have* pour le MVP).

---

## 2. Interface Administration & Back-Office

* **Inscriptions :** Validation des demandes d'inscription des traiteurs/organisateurs par l'administrateur.
* **Offres & Packs :**
  * Offrir un accès d'essai complet (*Premium*) pour la période d'évaluation.
  * Permettre la transition vers les packs définitifs (*Free*, *Standard*, *Premium*).
* **Prise en main d'un compte (*Impersonation*) :** Permettre à l'administrateur de basculer sur la vue d'un traiteur pour le support et le suivi.
* **Facturation :** Génération automatique des factures selon l'abonnement en cours.

---

## 3. Cartes d'Invitation & Communication

* **Format :** Modèles conçus comme des pages web/HTML dédiées (incluant détails de l'événement, localisation GPS, QR Code, gestion de confirmation RSVP).
* **Canaux de diffusion :** Partage des invitations via Email, WhatsApp et lien direct.