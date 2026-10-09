# Guide de Synchronisation des GitHub Issues (HajarDWM/EventManager)

Ce document fournit les méthodes pour synchroniser automatiquement l'ensemble des tâches **Done** et **To Do** de notre [ROADMAP.md](file:///c:/Users/Hajar/OneDrive/Documents/EventManager/Documentation/ROADMAP.md) et [CHANGELOG.md](file:///c:/Users/Hajar/OneDrive/Documents/EventManager/Documentation/CHANGELOG.md) sous forme d'Issues GitHub.

---

## ⚡ Méthode 1 : Exécution Directe par Script PowerShell (Recommandé sur Windows)

Un script interactif complet a été généré dans [Documentation/create-github-issues.ps1](file:///c:/Users/Hajar/OneDrive/Documents/EventManager/Documentation/create-github-issues.ps1).

### Étapes :
1. Générez un **Personal Access Token (PAT)** sur GitHub :
   - Rendez-vous sur : [https://github.com/settings/tokens](https://github.com/settings/tokens)
   - Cliquez sur **Generate new token (classic)**
   - Cochez la permission **`repo`** (Full control of private/public repositories).
2. Ouvrez votre terminal PowerShell à la racine du projet et lancez :
   ```powershell
   .\Documentation\create-github-issues.ps1 -GitHubToken "ghp_votreTokenGitHubIci"
   ```
   *(Ou lancez simplement `.\Documentation\create-github-issues.ps1` et collez votre token à l'invite).*

---

## ⚡ Méthode 2 : Exécution via Script Node.js

Si vous disposez de Node.js, vous pouvez exécuter le script [Documentation/create-github-issues.js](file:///c:/Users/Hajar/OneDrive/Documents/EventManager/Documentation/create-github-issues.js) :

```bash
node Documentation/create-github-issues.js ghp_votreTokenGitHubIci
```

---

## ⚡ Méthode 3 : Commandes GitHub CLI (`gh`)

Si vous installez la CLI GitHub (`winget install GitHub.cli`), voici les commandes directes à copier-coller :

### 1. Création des Labels Recommandés :
```bash
gh label create "status:done" --color "0e8a16" --description "Feature terminée et validée" --repo HajarDWM/EventManager
gh label create "status:todo" --color "fbca04" --description "Fonctionnalité planifiée" --repo HajarDWM/EventManager
gh label create "priority:critical" --color "b60205" --description "Priorité absolue" --repo HajarDWM/EventManager
gh label create "priority:high" --color "d93f0b" --description "Haute priorité" --repo HajarDWM/EventManager
gh label create "priority:medium" --color "e99695" --description "Moyenne priorité" --repo HajarDWM/EventManager
gh label create "scope:frontend" --color "1d76db" --description "Angular Client" --repo HajarDWM/EventManager
gh label create "scope:backend" --color "5319e7" --description "Spring Boot API" --repo HajarDWM/EventManager
gh label create "feature:rsvp" --color "c5def5" --description "Module Invitation & RSVP" --repo HajarDWM/EventManager
gh label create "feature:catering" --color "d4c5f9" --description "Module Menus & Restauration" --repo HajarDWM/EventManager
gh label create "feature:finance" --color "bfd4f2" --description "Module Finances & Dépenses" --repo HajarDWM/EventManager
```

---

### 2. Issues Terminées (DONE) :

```bash
# 1. Multi-Tenant Architecture & JWT
gh issue create --title "[DONE] Multi-Tenant Architecture, RBAC & JWT Security Pipeline" \
  --body "Architecture Multi-Tenant isolée par Traiteur avec RBAC (SUPER_ADMIN, CATERER_ADMIN, STAFF, CLIENT) et pipeline JWT." \
  --label "status:done,scope:backend,scope:frontend" --repo HajarDWM/EventManager

# 2. Digital Luxury Invitation Studio
gh issue create --title "[DONE] Digital Luxury Invitation Studio & Dynamic Template Engine" \
  --body "Studio de modèles d'invitations digitales, polices Google Fonts, 5 particules d'ambiance avec cadrage responsive mobile et 5 animations d'ouverture." \
  --label "status:done,feature:rsvp,scope:frontend,scope:backend" --repo HajarDWM/EventManager

# 3. Public Guest RSVP Portal
gh issue create --title "[DONE] Public Guest RSVP Portal & Multi-Course Gastronomy Selection" \
  --body "Portail /rsvp/:id sans login, sélection pas-à-pas des menus (Plats Fixes, Buffet, Mix), gestion des allergies et déclinaison." \
  --label "status:done,feature:rsvp,feature:catering,scope:frontend" --repo HajarDWM/EventManager

# 4. Dedicated End-Client Portal
gh issue create --title "[DONE] Dedicated End-Client Collaboration Portal" \
  --body "Portail collaboratif pour les mariés/hôtes avec stats RSVP, gestion d'invités et suivi des choix de menus en direct." \
  --label "status:done,scope:frontend,scope:backend" --repo HajarDWM/EventManager

# 5. Menu & Catering Engine
gh issue create --title "[DONE] Menu & Culinary Catering Engine" \
  --body "Catalogue de plats traiteur avec photos, tarification et récapitulatif des portions pour les brigades cuisine." \
  --label "status:done,feature:catering,scope:backend,scope:frontend" --repo HajarDWM/EventManager

# 6. Event Financials & Expense Accounting
gh issue create --title "[DONE] Event Financials, Billing & Expense Accounting" \
  --body "Comptabilité de l'événement avec suivi des acomptes, journal des dépenses de production, KPI bénéfice net et reçus PDF." \
  --label "status:done,feature:finance,scope:backend,scope:frontend" --repo HajarDWM/EventManager

# 7. Multi-Channel Communication & Excel Pipeline
gh issue create --title "[DONE] Multi-Channel Guest Communication & Excel/CSV Pipeline" \
  --body "Envoi des invitations via WhatsApp, Email et SMS, import serveur Excel (.xlsx) et export complet." \
  --label "status:done,feature:rsvp,scope:backend,scope:frontend" --repo HajarDWM/EventManager

# 8. Internationalization & Multi-Currency
gh issue create --title "[DONE] Internationalization (i18n) & Multi-Currency Engine" \
  --body "Interface multilingue (FR, EN, AR) et moteur multi-devises (MAD, EUR, USD, GBP, CAD)." \
  --label "status:done,scope:frontend" --repo HajarDWM/EventManager

# 9. SaaS Monetization & Stripe
gh issue create --title "[DONE] SaaS Monetization & Stripe Subscription Billing" \
  --body "Grille tarifaire traiteur et gestion des abonnements récurrents par Stripe Checkout et Webhooks." \
  --label "status:done,feature:finance,scope:backend" --repo HajarDWM/EventManager
```

---

### 3. Issues Planifiées (TO DO) :

```bash
# 1. Interactive Seating Chart
gh issue create --title "[TODO] Priority 1: Interactive Visual Table Plan & Seating Chart" \
  --body "Concepteur visuel de plan de salle interactif avec placement des invités par Drag & Drop et export PDF des plans et chevalets." \
  --label "status:todo,priority:critical,scope:frontend,scope:backend" --repo HajarDWM/EventManager

# 2. Real-Time Day-of Chronogramme
gh issue create --title "[TODO] Priority 2: Real-Time Day-of Event Chronogramme & Live Run-of-Show" \
  --body "Déroulé chronologique heure par heure du Jour J partagé en direct avec vue mobile live pour la brigade et les serveurs." \
  --label "status:todo,priority:high,scope:frontend,scope:backend" --repo HajarDWM/EventManager

# 3. Staffing & Shift Management
gh issue create --title "[TODO] Priority 3: Staffing, Extras & Shift Management" \
  --body "Gestion des extras et du personnel de service avec calcul automatique de la masse salariale intégrée aux dépenses de l'événement." \
  --label "status:todo,priority:medium,scope:frontend,scope:backend" --repo HajarDWM/EventManager

# 4. Shared Post-Event Media Gallery
gh issue create --title "[TODO] Priority 4: Shared Post-Event Media Gallery & Table QR Code Wall" \
  --body "Espace photo souvenir partagé avec téléversement immédiat par QR code de table et dashboard de modération hôte." \
  --label "status:todo,priority:medium,scope:frontend,scope:backend" --repo HajarDWM/EventManager

# 5. WhatsApp Cloud API
gh issue create --title "[TODO] Priority 5: Meta WhatsApp Cloud API & Automated Reminder Gateway" \
  --body "Envoi de masse officiel d'invitations WhatsApp et relances automatiques programmées pour les invités sans réponse." \
  --label "status:todo,priority:medium,scope:backend" --repo HajarDWM/EventManager

# 6. AI Catering Assistant
gh issue create --title "[TODO] Priority 6: AI-Powered Catering Assistant & Ingredient Scaling" \
  --body "Génération intelligente de formules de menus et calcul prédictif des grammages de matières premières selon les RSVP." \
  --label "status:todo,priority:medium,scope:backend,scope:frontend" --repo HajarDWM/EventManager

# 7. Offline-First PWA Check-In
gh issue create --title "[TODO] Priority 7: Offline-First PWA & Door Check-In QR Scanner" \
  --body "Application mobile PWA hors-ligne pour le contrôle d'accès rapide des invités aux portes avec synchronisation multi-portes." \
  --label "status:todo,priority:medium,scope:frontend" --repo HajarDWM/EventManager
```
