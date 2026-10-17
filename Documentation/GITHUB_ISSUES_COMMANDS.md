# Guide Exhaustif des 55 GitHub Issues (HajarDWM/EventManager)

Ce document détaille les **55 GitHub Issues** générées directement à partir de l'analyse complète de l'architecture, du code source et de l'historique de commits du projet **EventManager** :
- **44 Tâches Terminées (DONE)** : Issues créées et automatiquement clôturées (`status:done` / `completed`).
- **11 Tâches Futures (TO DO)** : Issues ouvertes (`status:todo`) prêtes pour le suivi agile.

---

## ⚡ Méthode d'Exécution Automatique

### En 1 ligne PowerShell :
```powershell
.\Documentation\create-github-issues.ps1
```
*(Collez votre Personal Access Token GitHub avec permission `repo` lorsque le script vous y invite).*

### Ou en 1 ligne Node.js :
```bash
node Documentation/create-github-issues.js VOTRE_GITHUB_TOKEN
```

---

## 📋 Inventaire Exhaustif des 55 Issues GitHub

### 🔐 Module 1 : Architecture, Multi-Tenant & Sécurité (5 Done)
1. `[DONE-AUTH-01] Architecture Multi-Tenant et Isolation de Base de Données par Traiteur`
2. `[DONE-AUTH-02] Système de Contrôle d'Accès par Rôles (RBAC : SuperAdmin, Caterer, Staff, Client)`
3. `[DONE-AUTH-03] Pipeline d'Authentification Stateless JWT avec Refresh Tokens`
4. `[DONE-AUTH-04] Authentification Directe Client Hôte par Token Sécurisé / Magic Link`
5. `[DONE-AUTH-05] Intercepteur et Guard de Vérification d'Abonnement Actif Traiteur`

### 📅 Module 2 : Gestion et Cycle de Vie des Événements (5 Done)
6. `[DONE-EVT-01] Assistant Multi-Étapes de Création d'Événements avec Validation`
7. `[DONE-EVT-02] Tableau de Bord Maître des Détails de l'Événement & KPI en Direct`
8. `[DONE-EVT-03] Moteur de Statuts d'Événements (Brouillon, Confirmé, Terminé, Annulé)`
9. `[DONE-EVT-04] Duplication d'Événements et Clonage Rapide de Prestations`
10. `[DONE-EVT-05] Checklist des Tâches de Préparation et Compte à Rebours d'Échéances`

### 🎨 Module 3 : Studio d'Invitations Digitales de Luxe & Templates (10 Done)
11. `[DONE-TPL-01] Catalogue Admin et Studio d'Édition de Modèles d'Invitations Digitales`
12. `[DONE-TPL-02] Personnalisation des Palettes de Couleurs et Arrière-plans de Prestige`
13. `[DONE-TPL-03] Chargeur Dynamique de Typographies de Luxe Google Fonts`
14. `[DONE-TPL-04] Cadres Décoratifs Filigranes (Floral, Bordure Dorée, Géométrique, Minimaliste)`
15. `[DONE-TPL-05] Moteur de Particules d'Ambiance Visuelles (Or, Pétales, Confettis, Étoiles, Bokeh)`
16. `[DONE-TPL-06] Cadrage Responsive des Particules : Marges Latérales sur Mobile vs Plein Écran Desktop`
17. `[DONE-TPL-07] 5 Expériences d'Ouverture Interactives de Prestige`
18. `[DONE-TPL-08] Widget Lecteur Audio Flottant avec Vinyle Rotatif et Égaliseur d'Ondes`
19. `[DONE-TPL-09] Sélecteur de Rendu d'Aperçu en Direct Double-Écran (Mobile & Desktop)`
20. `[DONE-TPL-10] Hydratation Instantanée 0ms via sessionStorage contre les Latences F5`

### 💌 Module 4 : Portail Public Invités RSVP (/rsvp/:id) (7 Done)
21. `[DONE-RSVP-01] Portail Public d'Invitation RSVP Sécurisé par Jeton Individuel`
22. `[DONE-RSVP-02] Parcours Gastronomique Pas-à-Pas de Sélection des Plats`
23. `[DONE-RSVP-03] Moteur Multi-Formules Traiteur (Plats Fixes, Buffet, Formule Mixte)`
24. `[DONE-RSVP-04] Gestion des Régimes Spéciaux et Tags d'Allergènes Alimentaires`
25. `[DONE-RSVP-05] Enregistrement Dynamique des Accompagnants (+1 et Famille)`
26. `[DONE-RSVP-06] Parcours de Déclinaison avec Messages de Vœux et Regrets aux Hôtes`
27. `[DONE-RSVP-07] Export Calendrier .ics en 1 Clic et Guidage GPS Google Maps / Parking`

### 👥 Module 5 : Espace Collaboratif Client Hôte (4 Done)
28. `[DONE-CLNT-01] Tableau de Bord Client Privé avec Statistiques de Réponses en Direct`
29. `[DONE-CLNT-02] Gestion Collaborative de la Liste des Invités et Groupes Dynamiques`
30. `[DONE-CLNT-03] Synthèse des Choix de Menus et Régimes Alimentaires Côté Client`
31. `[DONE-CLNT-04] Composant d'Aperçu Live de l'Invitation Digitale dans le Portail Client`

### 🍽️ Module 6 : Gestion des Cartes, Menus et Restauration (3 Done)
32. `[DONE-CAT-01] Catalogue des Plats et Cartes Gastronomiques du Traiteur`
33. `[DONE-CAT-02] Contrôleur d'Upload et Distribution des Photos de Plats (Multipart)`
34. `[DONE-CAT-03] Tableau de Bord Récapitulatif de Production pour la Brigade Cuisine`

### 💰 Module 7 : Gestion Financière, Acomptes et Dépenses (4 Done)
35. `[DONE-FIN-01] Échéancier des Paiements Clients, Suivi des Acomptes et Reste à Payer`
36. `[DONE-FIN-02] Journal Détaillé des Dépenses et Charges de l'Événement`
37. `[DONE-FIN-03] Calcul en Temps Réel de la Marge et du Bénéfice Net par Événement`
38. `[DONE-FIN-04] Génération et Impression PDF des Reçus de Paiement et Bons de Décaissement`

### 📊 Module 8 : Communication Multi-Canal, Import/Export & Core (6 Done)
39. `[DONE-COMM-01] Centre d'Expédition Multi-Canal des Invitations (WhatsApp, Email, SMS)`
40. `[DONE-DATA-01] Pipeline d'Importation Serveur Excel (.xlsx) et CSV avec Détection de Séparateurs`
41. `[DONE-DATA-02] Moteur d'Exportation de Données en 1 Clic vers Excel et CSV`
42. `[DONE-I18N-01] Internationalisation Complète de l'Application (Français, Anglais, Arabe)`
43. `[DONE-CURR-01] Moteur Multi-Devises avec Formatage Dynamique (MAD, EUR, USD, GBP, CAD)`
44. `[DONE-SAAS-01] Monétisation SaaS Traiteur par Stripe Checkout et Webhooks d'Abonnement`

---

### 🚀 Module 9 : Nouvelles Fonctionnalités Planifiées (11 To Do)
45. `[TODO-LOG-01] Concepteur Visuel de Plan de Salle Interactif (Canvas 2D / Grille)` *(Q4 2026 - 🔴 Critique)*
46. `[TODO-LOG-02] Placement des Invités par Glisser-Déposer (Drag & Drop) et Alertes de Capacité` *(Q4 2026 - 🔴 Critique)*
47. `[TODO-LOG-03] Export Haute Définition du Plan de Table et des Chevalets en PDF` *(Q4 2026 - 🟠 Haute)*
48. `[TODO-OPS-01] Chronogramme Déroulé Heure par Heure du Jour J avec Assignation d'Équipe` *(Q4 2026 - 🟠 Haute)*
49. `[TODO-OPS-02] Vue Mobile Live pour Équipes Terrain (Serveurs et Maître d'Hôtel)` *(Q4 2026 - 🟡 Moyenne)*
50. `[TODO-HR-01] Gestion du Roster et Plannings des Équipes de Service et Extras` *(Q1 2027 - 🟡 Moyenne)*
51. `[TODO-HR-02] Calcul Automatique des Salaires et Intégration aux Dépenses de l'Événement` *(Q1 2027 - 🟡 Moyenne)*
52. `[TODO-MEDIA-01] Galerie Souvenir Partagée avec Téléversement par QR Code de Table` *(Q1 2027 - 🟢 Moyenne)*
53. `[TODO-COMM-01] Intégration de l'API Meta WhatsApp Cloud et Relances Automatisées` *(Q2 2027 - 🟢 Moyenne)*
54. `[TODO-AI-01] Assistant IA de Proposition de Menus et Calcul Prédictif des Matières Premières` *(Q2 2027 - 🔵 Innovation)*
55. `[TODO-PWA-01] Application PWA Hors-Ligne et Scanner QR Code de Contrôle d'Accès` *(Q2 2027 - ⚪ Amélioration)*
