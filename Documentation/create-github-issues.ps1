<#
.SYNOPSIS
    Script PowerShell d'automatisation pour créer toutes les GitHub Issues (Done & To Do) 
    sur le repository GitHub HajarDWM/EventManager.

.DESCRIPTION
    Ce script lit les fonctionnalités définies dans ROADMAP.md et CHANGELOG.md et 
    utilise l'API REST de GitHub pour créer automatiquement les labels et les issues.

.PARAMETER GitHubToken
    Votre Personal Access Token (PAT) GitHub avec les permissions 'repo'.
    Si non renseigné, le script vous le demandera interactivement.

.EXAMPLE
    .\create-github-issues.ps1 -GitHubToken "ghp_yourTokenHere..."
    ou simplement :
    .\create-github-issues.ps1
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubToken = $env:GITHUB_TOKEN,

    [Parameter(Mandatory=$false)]
    [string]$RepoOwner = "HajarDWM",

    [Parameter(Mandatory=$false)]
    [string]$RepoName = "EventManager"
)

# 1. Vérification / Saisie du Token GitHub
if ([string]::IsNullOrWhiteSpace($GitHubToken)) {
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  EventManager - Automatisation de Création des GitHub Issues   " -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pour créer les issues sur GitHub, vous avez besoin d'un Personal Access Token (PAT)." -ForegroundColor Yellow
    Write-Host "1. Allez sur https://github.com/settings/tokens (classic ou fine-grained)" -ForegroundColor Gray
    Write-Host "2. Cochez la permission 'repo' (Full control of private/public repositories)" -ForegroundColor Gray
    Write-Host ""
    $GitHubToken = Read-Host "Entrez votre GitHub Token (PAT)"
}

if ([string]::IsNullOrWhiteSpace($GitHubToken)) {
    Write-Error "Le token GitHub est requis pour continuer. Opération annulée."
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $GitHubToken"
    "Accept"        = "application/vnd.github+json"
    "User-Agent"    = "EventManager-Issue-Automator"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$apiBaseUrl = "https://api.github.com/repos/$RepoOwner/$RepoName"

# 2. Test de connexion au repository
Write-Host "`n🔍 Vérification de l'accès au repository $RepoOwner/$RepoName..." -ForegroundColor Cyan
try {
    $repoInfo = Invoke-RestMethod -Uri $apiBaseUrl -Method Get -Headers $headers
    Write-Host " Connected successfully to: $($repoInfo.full_name) ($($repoInfo.visibility))" -ForegroundColor Green
} catch {
    Write-Error " Impossible d'accéder au repository $RepoOwner/$RepoName. Vérifiez votre token et vos permissions."
    Write-Error $_
    exit 1
}

# 3. Création des Labels recommandés
Write-Host "`n🏷️  Configuration des Labels GitHub..." -ForegroundColor Cyan
$labelsToCreate = @(
    @{ name = "status:done"; color = "0e8a16"; description = "Feature entièrement développée et validée" },
    @{ name = "status:todo"; color = "fbca04"; description = "Fonctionnalité planifiée dans la roadmap" },
    @{ name = "priority:critical"; color = "b60205"; description = "Priorité absolue / Bloquant" },
    @{ name = "priority:high"; color = "d93f0b"; description = "Haute priorité" },
    @{ name = "priority:medium"; color = "e99695"; description = "Moyenne priorité" },
    @{ name = "scope:frontend"; color = "1d76db"; description = "Concerne le client Angular" },
    @{ name = "scope:backend"; color = "5319e7"; description = "Concerne l'API Spring Boot" },
    @{ name = "feature:rsvp"; color = "c5def5"; description = "Module d'invitation et RSVP" },
    @{ name = "feature:catering"; color = "d4c5f9"; description = "Module de restauration et menus" },
    @{ name = "feature:finance"; color = "bfd4f2"; description = "Module de facturation et dépenses" }
)

foreach ($lbl in $labelsToCreate) {
    try {
        $body = $lbl | ConvertTo-Json -Compress
        $null = Invoke-RestMethod -Uri "$apiBaseUrl/labels" -Method Post -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "  [+] Label créé : $($lbl.name)" -ForegroundColor Gray
    } catch {
        # Si le label existe déjà, GitHub renvoie 422 - c'est normal
        Write-Host "  [=] Label déjà existant : $($lbl.name)" -ForegroundColor DarkGray
    }
}

# 4. Définition des Issues à Créer (Done & To Do)
$issues = @(
    # =========================================================================
    # COMPLETED FEATURES (DONE)
    # =========================================================================
    @{
        title = "[DONE] Multi-Tenant Architecture, RBAC & JWT Security Pipeline"
        state = "closed"
        labels = @("status:done", "scope:backend", "scope:frontend")
        body = @"
## 📌 Résumé de la Réalisation
Mise en place de l'architecture Multi-Tenant isolée par Traiteur avec sécurité complète et contrôle d'accès par rôles (RBAC).

### ✅ Tâches Réalisées :
- [x] **Isolation Multi-Tenant :** Cloisonnement strict des données par organisation traiteur au niveau JPA et API.
- [x] **Rôles & Permissions :** Gestion des rôles ``SUPER_ADMIN``, ``CATERER_ADMIN``, ``STAFF``, ``CLIENT``.
- [x] **Pipeline JWT :** Authentification stateless avec refresh tokens, hachage BCrypt et filtres de sécurité Spring Security.
- [x] **Authentification Client :** Accès sécurisé par jeton / magic-link sans création de compte complexe.
- [x] **Subscription Guarding :** Intercepteur middleware bloquant l'accès en cas d'expiration de l'abonnement SaaS.

*Référence : CHANGELOG v1.0.0 & ROADMAP.md Section 1*
"@
    },
    @{
        title = "[DONE] Digital Luxury Invitation Studio & Dynamic Template Engine"
        state = "closed"
        labels = @("status:done", "feature:rsvp", "scope:frontend", "scope:backend")
        body = @"
## 📌 Résumé de la Réalisation
Studio d'édition et catalogue de modèles d'invitations digitales d'exception avec aperçu responsive en direct.

### ✅ Tâches Réalisées :
- [x] **Catalogue Admin :** CRUD complet des modèles (*Mariage, Fiançailles, Corporate, Anniversaire, Gala*).
- [x] **Design & Typographie Luxe :** Chargement dynamique des polices Google Fonts (*Alex Brush, Cinzel, Playfair Display, Great Vibes*).
- [x] **Particules d'Ambiance Visuelles :** 5 effets animés (*Poussière d'or, Pétales de roses, Confettis, Étoiles, Faisceau lumineux*).
- [x] **Positionnement Responsive des Particules :**
  - *Mobile (< 992px) :* Particules cadrées sur les marges latérales ($\le 16\%$ et $\ge 84\%$) pour garantir la lisibilité du texte.
  - *Desktop ($\ge 992px$) :* Particules réparties sur tout le canvas d'arrière-plan ($3\% - 97\%$).
- [x] **Expériences d'Ouverture Interactives :** 5 animations (*Sceau de cire, Ruban de soie, Rideau de théâtre, Portes coulissantes, Badge VIP*).
- [x] **Lecteur Audio Flottant :** Widget vinyle rotatif, ondes égaliseurs audio et lecture automatique au premier geste interactif.
- [x] **Hydratation Instantanée 0ms :** Mise en cache ``sessionStorage`` garantissant 0ms de temps de chargement au refresh F5.

*Référence : CHANGELOG v2.0.0, v2.2.0, v2.4.0 & ROADMAP.md Section 2*
"@
    },
    @{
        title = "[DONE] Public Guest RSVP Portal & Multi-Course Gastronomy Selection"
        state = "closed"
        labels = @("status:done", "feature:rsvp", "feature:catering", "scope:frontend")
        body = @"
## 📌 Résumé de la Réalisation
Portail public invité fluide avec sélection gastronomique pas-à-pas et gestion des régimes alimentaires.

### ✅ Tâches Réalisées :
- [x] **Accès sans friction :** URL sécurisée par token individuel (``/rsvp/:id``).
- [x] **Sélection du Menu par Formule :**
  - *Plats Fixes :* Parcours pas-à-pas Entrées $\rightarrow$ Plats $\rightarrow$ Desserts $\rightarrow$ Boissons.
  - *Buffet :* Catalogue complet avec catégories (*Salé, Chaud, Douceurs, Boissons*).
  - *Mix :* Plats chauds servis à table + buffets d'entrées et desserts.
- [x] **Allergènes & Régimes :** Sélection multiple des allergies (Gluten, Lactose, Arachides...) et régimes (Halal, Casher, Végan).
- [x] **Accompagnants (+1) :** Gestion dynamique des membres de la famille et conjoints.
- [x] **Flux de Déclinaison :** Message personnalisé de remerciement ou regret adressé aux organisateurs.
- [x] **GPS & Calendrier :** Export Google Calendar / ``.ics`` et guidage Google Maps vers le lieu et le parking.

*Référence : CHANGELOG v1.5.0, v2.1.0 & ROADMAP.md Section 3*
"@
    },
    @{
        title = "[DONE] Dedicated End-Client Collaboration Portal"
        state = "closed"
        labels = @("status:done", "scope:frontend", "scope:backend")
        body = @"
## 📌 Résumé de la Réalisation
Portail dédié aux hôtes (mariés / organisateurs) pour co-piloter leur événement en temps réel avec le traiteur.

### ✅ Tâches Réalisées :
- [x] **Dashboard Client :** Statistiques en direct des invités (confirmés, en attente, déclinés) et compte à rebours.
- [x] **Gestion de la Liste des Invités :** Ajout, modification, recherche et regroupement des invités (*Famille, Amis, VIP, Collègues*).
- [x] **Suivi Culinaire :** Synthèse en direct des choix de plats et régimes alimentaires pour le chef traiteur.
- [x] **Aperçu Live de l'Invitation :** Visualisation immédiate du rendu final de l'invitation digitale.

*Référence : CHANGELOG v2.3.0 & ROADMAP.md Section 4*
"@
    },
    @{
        title = "[DONE] Menu & Culinary Catering Engine"
        state = "closed"
        labels = @("status:done", "feature:catering", "scope:backend", "scope:frontend")
        body = @"
## 📌 Résumé de la Réalisation
Moteur de gestion des cartes et menus traiteur avec tarification et fiches techniques.

### ✅ Tâches Réalisées :
- [x] **Catalogue de Plats :** Gestion des entrées, plats chauds, desserts et boissons avec descriptifs gastronomiques.
- [x] **Gestionnaire d'Images :** Upload multipart des photos de plats et distribution via CDN/serveur.
- [x] **Récapitulatif Cuisine :** Calcul agrégé en temps réel du nombre exact de portions par plat et liste des allergènes pour la brigade en cuisine.

*Référence : CHANGELOG v1.0.0, v2.1.0 & ROADMAP.md Section 5*
"@
    },
    @{
        title = "[DONE] Event Financials, Billing & Expense Accounting"
        state = "closed"
        labels = @("status:done", "feature:finance", "scope:backend", "scope:frontend")
        body = @"
## 📌 Résumé de la Réalisation
Module de comptabilité et rentabilité événementielle avec suivi des paiements clients et dépenses de production.

### ✅ Tâches Réalisées :
- [x] **Suivi des Règlements Clients :** Échéancier d'acomptes, enregistrement des encaissements et solde restant dû.
- [x] **Gestion des Dépenses Événement :** Journalisation des coûts (matières premières, personnel, location vaisselle, logistique).
- [x] **Calcul de Rentabilité Nette :** Indicateurs KPI en direct : Chiffre d'affaires global, Charges totales et Bénéfice net.
- [x] **Justificatifs & Impression PDF :** Génération instantanée et impression de Reçus de Paiement client et Bons de Décaissement internes.

*Référence : CHANGELOG v2.0.0 & ROADMAP.md Section 6*
"@
    },
    @{
        title = "[DONE] Multi-Channel Guest Communication & Excel/CSV Pipeline"
        state = "closed"
        labels = @("status:done", "feature:rsvp", "scope:backend", "scope:frontend")
        body = @"
## 📌 Résumé de la Réalisation
Centre d'envoi multi-canal des invitations et pipeline haute performance d'import/export de données.

### ✅ Tâches Réalisées :
- [x] **Envoi Multi-Canal :** Génération et envoi direct des invitations via WhatsApp Web, Email et format SMS.
- [x] **Importation Serveur Excel (.xlsx) & CSV :** Parsing backend robuste avec détection des séparateurs et validation dynamique des groupes personnalisés.
- [x] **Exportation de Données :** Export en 1 clic de la liste des invités, fiches de régimes et bilans financiers au format Excel et CSV.

*Référence : CHANGELOG v2.0.0, v2.1.0 & ROADMAP.md Section 7*
"@
    },
    @{
        title = "[DONE] Internationalization (i18n) & Multi-Currency Engine"
        state = "closed"
        labels = @("status:done", "scope:frontend")
        body = @"
## 📌 Résumé de la Réalisation
Support multilingue et multi-devises complet pour s'adapter à une clientèle internationale.

### ✅ Tâches Réalisées :
- [x] **i18n Multilingue :** Traduction intégrale de l'application en Français (``fr``), Anglais (``en``) et Arabe (``ar``).
- [x] **Moteur Multi-Devises :** Formatage et conversion dynamique des montants en Dirham Marocain (``MAD``), Euro (``EUR``), Dollar US (``USD``), Livre Sterling (``GBP``) et Dollar Canadien (``CAD``).

*Référence : CHANGELOG v1.5.0 & ROADMAP.md Section 8*
"@
    },
    @{
        title = "[DONE] SaaS Monetization & Stripe Subscription Billing"
        state = "closed"
        labels = @("status:done", "feature:finance", "scope:backend")
        body = @"
## 📌 Résumé de la Réalisation
Infrastructure de monétisation SaaS avec gestion des abonnements traiteurs récurrents.

### ✅ Tâches Réalisées :
- [x] **Grille Tarifaire :** Plans d'abonnement Starter, Professionnel et Entreprise.
- [x] **Stripe Checkout & Webhooks :** Paiement sécurisé par carte bancaire et traitement asynchrone des événements de renouvellement / résiliation.

*Référence : CHANGELOG v1.0.0 & ROADMAP.md Section 9*
"@
    },

    # =========================================================================
    # PLANNED ROADMAP TASKS (TO DO)
    # =========================================================================
    @{
        title = "[TODO] Priority 1: Interactive Visual Table Plan & Seating Chart"
        state = "open"
        labels = @("status:todo", "priority:critical", "scope:frontend", "scope:backend")
        body = @"
## 🎯 Objectif
Offrir un outil visuel interactif de plan de table pour concevoir la salle de réception et assigner les invités par glisser-déposer (Drag & Drop).

### 📋 Spécifications Techniques & Fonctionnelles :
- [ ] **Canvas / Grille Interactive :** Concepteur visuel de salle avec positionnement de tables (rondes, rectangulaires, ovales, d'honneur).
- [ ] **Assignation des Invités (Drag & Drop) :** Glisser les invités confirmés depuis la liste latérale vers les chaises des tables.
- [ ] **Alertes de Cohérence & Affinités :** Détection automatique des tables en surcapacité ou de la séparation de groupes familiaux.
- [ ] **Export Plan de Table & Chevalets (PDF) :** Impression haute définition du plan global de la salle et des listes par table pour l'accueil des invités.

### 🏗️ Impact Architectural :
- **Backend :** Entité ``ReceptionTableEntity``, relation avec ``GuestEntity``, endpoint de mise à jour par lot (batch update).
- **Frontend :** Composant Angular avec CDK Drag-and-Drop ou HTML5 Canvas.

*Cible : Q4 2026 | Priorité : 🔴 Critique*
"@
    },
    @{
        title = "[TODO] Priority 2: Real-Time Day-of Event Chronogramme & Live Run-of-Show"
        state = "open"
        labels = @("status:todo", "priority:high", "scope:frontend", "scope:backend")
        body = @"
## 🎯 Objectif
Remplacer les plannings papier du Jour J par un chronogramme digital partagé en direct entre la cuisine, le maître d'hôtel et les organisateurs.

### 📋 Spécifications Techniques & Fonctionnelles :
- [ ] **Timeline Déroulé Heure par Heure :** Planification détaillée (ex: 17:30 Arrivée, 18:45 Cocktail, 20:30 Lancement plat chaud, 23:00 Pièce montée).
- [ ] **Assignation par Équipe :** Filtrage par brigade responsable (Cuisine, Salle, DJ/Animation, Photographe).
- [ ] **Mode Mobile Live :** Vue responsive temps réel pour smartphone permettant aux équipes terrain de cocher les étapes franchies.

### 🏗️ Impact Architectural :
- **Backend :** Entité ``TimelineItemEntity``, statut de progression en direct.
- **Frontend :** Composant vertical OneUI Timeline interactif.

*Cible : Q4 2026 | Priorité : 🟠 Haute*
"@
    },
    @{
        title = "[TODO] Priority 3: Staffing, Extras & Shift Management"
        state = "open"
        labels = @("status:todo", "priority:medium", "scope:frontend", "scope:backend")
        body = @"
## 🎯 Objectif
Gérer les équipes de serveurs, cuisiniers et extras requis pour la prestation, avec calcul automatique des coûts salariaux.

### 📋 Spécifications Techniques & Fonctionnelles :
- [ ] **Gestion du Roster :** Fiches des équipiers réguliers et extras (Serveurs, Maître d'hôtel, Barmen, Plongeurs).
- [ ] **Planning & Pointage :** Saisie des heures prévues vs heures réelles effectuées.
- [ ] **Calcul Automatique des Coûts :** Liaison directe des salaires calculés avec le registre des dépenses de l'événement.
- [ ] **Briefing Équipe (SMS / Email) :** Envoi automatique des feuilles de route et codes vestimentaires aux extras confirmés.

*Cible : Q1 2027 | Priorité : 🟡 Moyenne-Haute*
"@
    },
    @{
        title = "[TODO] Priority 4: Shared Post-Event Media Gallery & Table QR Code Wall"
        state = "open"
        labels = @("status:todo", "priority:medium", "scope:frontend", "scope:backend")
        body = @"
## 🎯 Objectif
Créer un espace souvenir partagé où les invités téléversent leurs photos de la soirée en scannant un simple QR code de table.

### 📋 Spécifications Techniques & Fonctionnelles :
- [ ] **Générateur de QR Code de Table :** Modèle imprimable pour les chevalets de table invitant au partage de photos.
- [ ] **Téléversement Mobile Rapide :** Téléversement immédiat de photos depuis le smartphone sans inscription préalable.
- [ ] **Modération Hôte :** Dashboard de validation pour approuver ou masquer les clichés avant diffusion publique.
- [ ] **Téléchargement Groupé (ZIP) :** Export en 1 clic de l'ensemble des photos en haute résolution pour les mariés / clients.

*Cible : Q1 2027 | Priorité : 🟢 Moyenne*
"@
    },
    @{
        title = "[TODO] Priority 5: Meta WhatsApp Cloud API & Automated Reminder Gateway"
        state = "open"
        labels = @("status:todo", "priority:medium", "scope:backend")
        body = @"
## 🎯 Objectif
Automatiser l'envoi des invitations et des relances de confirmation via l'API officielle WhatsApp Cloud.

### 📋 Spécifications Techniques & Fonctionnelles :
- [ ] **Intégration Meta Cloud API :** Envoi de masse de modèles d'invitations vérifiés WhatsApp avec nom personnalisé.
- [ ] **Relances Automatiques :** Programmation de rappels automatiques à J-7 et J-2 avant la date limite de RSVP pour les invités n'ayant pas répondu.
- [ ] **Boutons Interactifs :** Possibilité pour l'invité de confirmer ou décliner en 1 clic directement dans la discussion WhatsApp.

*Cible : Q2 2027 | Priorité : 🟢 Moyenne*
"@
    },
    @{
        title = "[TODO] Priority 6: AI-Powered Catering Assistant & Ingredient Scaling"
        state = "open"
        labels = @("status:todo", "priority:medium", "scope:backend", "scope:frontend")
        body = @"
## 🎯 Objectif
Intégrer une assistance intelligente pour optimiser les propositions de menus traiteur et calculer précisément les matières premières.

### 📋 Spécifications Techniques & Fonctionnelles :
- [ ] **Générateur de Menu Intelligent :** Suggestions de formules selon le budget par convive, la saisonnalité et le thème.
- [ ] **Calculateur de Matières Premières :** Mise à l'échelle automatique des grammages d'ingrédients bruts selon les plats choisis par les invités RSVP.
- [ ] **Réduction du Gaspillage :** Analyse prédictive des marges tampons recommandées pour les buffets.

*Cible : Q2 2027 | Priorité : 🔵 Innovation*
"@
    },
    @{
        title = "[TODO] Priority 7: Offline-First PWA & Door Check-In QR Scanner"
        state = "open"
        labels = @("status:todo", "priority:medium", "scope:frontend")
        body = @"
## 🎯 Objectif
Fournir une application mobile ultra-rapide fonctionnant hors-ligne pour scanner les billets/invitations à l'entrée de la salle.

### 📋 Spécifications Techniques & Fonctionnelles :
- [ ] **PWA Hôtesse d'Accueil :** Scanner QR Code fluide optimisé pour tablettes et smartphones.
- [ ] **Mode Hors-Ligne (Offline-First) :** Stockage local IndexDB pour valider les entrées même sans connexion internet dans la salle.
- [ ] **Synchronisation Multi-Portes :** Mise à jour en temps réel des présences entre les différents points d'accès dès reconnexion réseau.

*Cible : Q2 2027 | Priorité : ⚪ Amélioration*
"@
    }
)

# 5. Création effective des issues via l'API GitHub
Write-Host "`n🚀 Lancement de la création des issues ($($issues.Count) au total)..." -ForegroundColor Cyan

$successCount = 0
$errorCount = 0

foreach ($issue in $issues) {
    Write-Host "`n Traitement : $($issue.title)..." -ForegroundColor Yellow
    
    $issuePayload = @{
        title  = $issue.title
        body   = $issue.body
        labels = $issue.labels
    }
    
    try {
        $jsonPayload = $issuePayload | ConvertTo-Json -Depth 5
        # 1. Création de l'issue (ouverte par défaut)
        $createdIssue = Invoke-RestMethod -Uri "$apiBaseUrl/issues" -Method Post -Headers $headers -Body $jsonPayload -ContentType "application/json; charset=utf-8"
        
        Write-Host "   Issue #$($createdIssue.number) créée avec succès ($($createdIssue.html_url))" -ForegroundColor Green
        
        # 2. Si l'issue est marquée 'closed' (Done), on la ferme immédiatement
        if ($issue.state -eq "closed") {
            $closePayload = @{ state = "closed"; state_reason = "completed" } | ConvertTo-Json -Compress
            $null = Invoke-RestMethod -Uri "$apiBaseUrl/issues/$($createdIssue.number)" -Method Patch -Headers $headers -Body $closePayload -ContentType "application/json"
            Write-Host "   Issue #$($createdIssue.number) marquée comme [FERMÉE / COMPLETED]" -ForegroundColor Magenta
        }
        
        $successCount++
        Start-Sleep -Milliseconds 800 # Petite pause pour respecter les quotas de rate-limiting GitHub
    } catch {
        Write-Error "   Erreur lors de la création de l'issue : $($issue.title)"
        Write-Error $_
        $errorCount++
    }
}

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "  Rapport d'exécution : $successCount créées avec succès, $errorCount erreurs." -ForegroundColor Cyan
Write-Host "  Consultez vos issues : https://github.com/$RepoOwner/$RepoName/issues" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
