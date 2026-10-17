# Compte-Rendu de Réunion : Plateforme d'Invitations et Événements (Meeting 4)

---

## 1. Synthèse Globale des Discussions

La réunion a porté sur l'évaluation des dernières fonctionnalités développées sur la plateforme d'invitations événementielles, les ajustements ergonomiques (UI/UX), et la définition de la feuille de route stratégique (Milestones & User Stories).

### Points clés abordés :
* **Expérience Invité (Guest Flow) :** Accès direct à la localisation géographique (GPS / Parking) et ajout à l'agenda (Google Calendar), gestion flexible du menu selon les traditions locales.
* **Back-Office Organisateur :** Optimisation de l'attribution des tables par groupe d'invités, transformation des cartes récapitulatives en boutons interactifs, et gestion paramétrable des délais d'expiration.
* **Administration & Templates :** Alignement horizontal des catégories et personnalisation poussée des modèles d'invitations.
* **Stratégie de Lancement :** Priorisation d'un MVP gratuit B2C avec intégration WhatsApp, suivi d'une offre dédiée aux traiteurs (B2B).

---

## 2. Ajustements Fonctionnels & UI/UX Requis

### A. Flux Invité (Guest Experience)
1. **Localisation & Calendrier :**
   - Intégrer des boutons directs pour ouvrir l'itinéraire Google Maps (salle et parking le plus proche).
   - Bouton d'ajout rapide à Google Calendar avec invitation synchronisée à la confirmation (RSVP).
2. **Gestion du Menu (Repas & Régimes) :**
   - **Mode Informatif (Traditionnel / Mariage Marocain) :** Présentation visuelle séquentielle des plats prévus (ex. Poulet, Agneau aux pruneaux, Corbeille de fruits / Glace) sans forcer l'invité à faire un choix.
   - **Mode Personnalisable (À la carte / Formule) :** Possibilité de configurer le choix au niveau de chaque étape (ex. entrée libre ou imposée, choix du plat principal, buffet de desserts).
   - Formulaire dédié pour renseigner les allergies alimentaires et régimes particuliers.
3. **Multilinguisme :**
   - Support complet de l'Arabe (marché local et pays du Golfe) et de l'Anglais.

### B. Interface Organisateur (Organizer Dashboard)
1. **Attribution des Tables :**
   - Attribution groupée (ex. sélectionner tout le groupe "Famille" ou "Amis proches" et l'affecter en un clic à une table).
   - Affichage dynamique du nom de la catégorie sur la table sélectionnée.
2. **Dashboard Interactif :**
   - Rendre les cartes de statistiques cliquables pour afficher les détails sans quitter la vue principale.
3. **Paramétrage des Liens :**
   - Définir une date limite de réponse personnalisable (paramétrable par événement au lieu d'une valeur fixe de 7 ou 10 jours).
   - Option d'affichage du nom de l'invité (complet ou partiel).

### C. Interface Administrateur (Admin)
- **Gestion des Catégories :** Affichage horizontal fluide lors de l'ajout de nouvelles catégories pour préserver la lisibilité de l'interface.

---

## 3. Feuille de Route du Projet (Milestones)

| Jalons (Milestone) | Intitulé | Objectifs & Livrables |
| :--- | :--- | :--- |
| **M1** | Déploiement & Environnement de Test | Mise en ligne sur le serveur de staging, configuration d'une base de données avec des jeux de données réels (multi-événements, multi-clients), et mise en place du suivi de projet. |
| **M2** | MVP B2C Gratuit (Client Direct) | Parcours simplifié en 3 étapes : création d'événement, sélection de template, génération de liens d'invitation personnalisés partageables via WhatsApp. |
| **M3** | MVP B2B Traiteur (Caterer Experience) | Espace dédié permettant au traiteur de prédéfinir le menu, puis de déléguer la sélection du template et l'ajout des contacts au client final. |
| **M4** | Monétisation & Fonctionnalités Avancées | Gestion des événements payants (billetterie / précommandes pour restaurants), templates animés premium, et ciblage des marchés régionaux (Moyen-Orient). |

---

## 4. Spécifications : User Stories

### US-01 : Configuration Modulaire du Menu
* **En tant qu' :** Organisateur d'événement,
* **Je veux :** Pouvoir définir pour chaque composante du menu (Entrée, Plat, Dessert) si elle est en mode indicatif ou à choix multiple,
* **Afin de :** M'adapter aussi bien aux mariages traditionnels qu'aux réceptions modernes.

### US-02 : Raccourcis d'Accès et de Planification
* **En tant qu' :** Invité,
* **Je veux :** Accéder immédiatement à la carte GPS et ajouter la date à mon Google Calendar en un clic,
* **Afin de :** Préparer mon déplacement sans chercher l'adresse manuellement.

### US-03 : Placement Rapide par Catégorie
* **En tant qu' :** Organisateur,
* **Je veux :** Assigner une catégorie d'invités complète à une table en une seule action,
* **Afin de :** Gagner du temps lors du plan de table pour les grands événements.

### US-04 : Envoi Personnalisé par WhatsApp
* **En tant qu' :** Hôte d'événement,
* **Je veux :** Générer des messages WhatsApp pré-remplis avec lien nominatif pour chaque invité,
* **Afin d' :** Éviter les transferts impersonnels et suivre précisément les confirmations individuelles.

### US-05 : Internationalisation (Arabe / Anglais)
* **En tant qu' :** Utilisateur (Organisateur ou Invité),
* **Je veux :** Disposer d'une interface intégralement traduite en langue arabe et anglaise,
* **Afin de :** Faciliter l'adoption auprès du public local et de la clientèle du Golfe.