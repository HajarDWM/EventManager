# 🎬 EventManager — Playbook & Scénario de Démonstration Client

Ce guide est votre fil conducteur pour présenter la solution **EventManager** à des clients prospects (traiteurs, agences événementielles, organisateurs de réceptions), investisseurs ou partenaires.

---

## 🧭 Prérequis Avant le Rendez-vous (Checklist 2 minutes)

1. **Lancer l'application :**
   Double-cliquez sur `scripts/start-demo.bat` ou lancez dans le terminal :
   ```bash
   docker compose up -d
   ```
2. **Vérifier l'accès navigateur :**
   - Ouvrez votre navigateur sur `http://localhost`
   - Préparez un deuxième onglet (ou fenêtre privée) pour l'espace client : `http://localhost/client/login?token=demo-client-token`
   - Préparez un onglet en simulation mobile (Touche `F12` > Bascule mobile) avec le lien RSVP : `http://localhost/rsvp/demo-rsvp-token-1`
3. **Identifiants Aide-Mémoire :**
   - **Traiteur :** `demo@eventmanager.com` / `demo12345`
   - **Client Collaboratif :** Jeton `demo-client-token` (ou lien direct)
   - **Invité RSVP :** `http://localhost/rsvp/demo-rsvp-token-1`
   - **Super Admin :** `admin@eventmanager.com` / `admin12345`

---

## 🎭 Scénario de Présentation en 6 Actes

### 🌟 Acte 1 : L'Accroche & Le Tableau de Bord Traiteur (3 min)
* **Objectif :** Montrer le gain de temps et la maîtrise opérationnelle d'un professionnel de la réception.
* **Navigation :** Se connecter sur `http://localhost/login` avec `demo@eventmanager.com` / `demo12345`.
* **Ce qu'il faut dire au client :**
  > *"Bienvenue sur EventManager. Voici le cockpit d'un traiteur événementiel moderne. En un coup d'œil, vous suivez votre calendrier de prestations, le nombre total de convives attendus, l'état d'avancement des préparatifs et vos alertes critiques. Fini les classeurs papier ou les multiples feuilles Excel dispersées."*
* **Ce qu'il faut montrer à l'écran :**
  - Le bandeau d'en-tête affichant la marque de l'établissement : *"Maison Gourmet Traiteur & Événements"*.
  - Les cartes métriques dynamiques (Nombre d'événements, Taux de confirmation des invités, Budget cumulé).
  - La liste claire des événements à venir avec filtres instantanés par mot-clé et tri réactif.

---

### 🍽️ Acte 2 : L'Ingénierie de la Prestation & Le Calculateur de Budget (5 min)
* **Objectif :** Démontrer la précision du chiffrage culinaire et la gestion des régimes alimentaires.
* **Navigation :** Cliquer sur l'événement phare **"Mariage Féérique - Château de Chambord"** > Onglet **Menu**.
* **Ce qu'il faut dire au client :**
  > *"Voici l'un de nos atouts majeurs : la conception de la carte et le calculateur dynamique de budget. Chaque pièce culinaire — de l'entrée au dessert en passant par les vins — est tarifée au convive avec ses spécificités (Bio, Sans Gluten, Halal, etc.). Le système recalcule instantanément le budget traiteur total en fonction du nombre d'invités attendus."*
* **Ce qu'il faut montrer à l'écran :**
  - La carte des menus (Foie Gras Poêlé, Filet Rossini, Risotto aux Cèpes, Pièce Montée, Champagne).
  - La bannière récapitulative : `Coût par convive (€) × 150 invités = Budget Total (€)`.
  - La possibilité d'ajouter ou modifier un plat avec ses allergènes en un clic.

---

### 📱 Acte 3 : L'Expérience Invité Mobile & RSVP Intelligent (4 min)
* **Objectif :** Créer l'effet "Wahou" en montrant l'interaction en temps réel entre l'invité et l'organisateur.
* **Navigation :** Ouvrir l'onglet simulation mobile avec l'URL : `http://localhost/rsvp/demo-rsvp-token-1`.
* **Ce qu'il faut dire au client :**
  > *"Comment récoltez-vous les réponses de vos invités aujourd'hui ? Relances téléphoniques, formulaires papier ? Avec EventManager, chaque invité reçoit un lien ou un QR code personnalisé. Regardez sur smartphone : le design est soigné, l'invité découvre les détails de la réception, confirme sa présence avec un bouton ergonomique 70/30, et renseigne ses régimes alimentaires ou allergies sévères."*
* **Ce qu'il faut faire en direct :**
  - Montrer l'invitation au nom d'**Alexandre Dumas**.
  - Sélectionner *"Je confirme ma présence"*, cocher le tag *"Sans Gluten"* ou ajouter une note.
  - Valider l'envoi.
  - Revenir sur l'onglet Traiteur > Onglet **Invités** : Montrer que le statut et les régimes sont instantanément mis à jour sans recharger la page.
  - Souligner les statistiques réactives en haut : badges *Confirmés*, *En attente*, *Déclinés*.

---

### 🤝 Acte 4 : L'Espace Collaboratif Dédié au Client Final (3 min)
* **Objectif :** Montrer comment le traiteur fidélise et valorise son client (les mariés, le responsable d'entreprise).
* **Navigation :** Ouvrir `http://localhost/client/login?token=demo-client-token`.
* **Ce qu'il faut dire au client :**
  > *"EventManager propose également un portail sécurisé pour vos clients (les mariés ou l'entreprise commanditaire). Pas de compte compliqué à créer : un simple lien sécurisé leur permet de suivre en temps réel la liste de leurs invités, de voir les tables et de prévisualiser le menu sans interférer avec vos coulisses techniques."*
* **Ce qu'il faut montrer à l'écran :**
  - Le dashboard épuré de **Sophie & Marc Laurent**.
  - La consultation de leurs invités et des confirmations.

---

### 📋 Acte 5 : Les Outils Terrain & L'Export PDF en 1 Clic (3 min)
* **Objectif :** Rassurer sur la transition du digital vers le terrain (cuisine, salle, logistique).
* **Navigation :** Revenir sur la vue Traiteur > Événement Chambord > Onglet **Export & Impression** (`/events/101/export`).
* **Ce qu'il faut dire au client :**
  > *"Le jour J sur le terrain, vos équipes ont besoin de documents précis et fiables. En 1 clic, EventManager génère trois fiches techniques professionnelles au format A4 haute résolution : la Fiche Cuisine (quantités, recettes, régimes spéciaux), le Plan de Table & Invités (pour vos maîtres d'hôtel), et la Fiche Rétroplanning (pour la brigade)."*
* **Ce qu'il faut montrer à l'écran :**
  - Cliquer sur le bouton d'impression / export PDF.
  - Montrer la mise en page élégante avec en-tête d'entreprise, prête pour l'impression ou l'envoi par email.
  - Montrer l'onglet **Checklist & Tâches** : le basculement d'une tâche à *"Terminée"* et la progression visuelle dynamique qui grimpe.

---

### 💼 Acte 6 : La Plateforme SaaS & Modèle d'Abonnement (Optionnel - Pour Partenaires/Investisseurs) (2 min)
* **Navigation :** Se connecter avec `admin@eventmanager.com` / `admin12345`.
* **Ce qu'il faut dire au client :**
  > *"Côté éditeur et administration globale, la plateforme intègre la gestion multi-tenant complète, la gestion des forfaits d'abonnement (Standard / Premium), les catalogues de modèles de faire-part et la facturation globale."*

---

## 🔄 Réinitialiser les Données Après le Rendez-vous

Pour remettre la base de données à neuf avant la prochaine présentation :
```powershell
.\scripts\reset-demo-data.ps1
```
Cette commande réinitialise instantanément les invitations, menus et statuts RSVP à leur configuration de démonstration parfaite.
