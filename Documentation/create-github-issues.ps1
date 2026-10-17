# =============================================================================
# Script PowerShell d'automatisation pour synchroniser les 55 GitHub Issues
# (44 tâches DONE fermées + 11 tâches TO DO ouvertes) sur HajarDWM/EventManager
# =============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubToken = $env:GITHUB_TOKEN,

    [Parameter(Mandatory=$false)]
    [string]$RepoOwner = "HajarDWM",

    [Parameter(Mandatory=$false)]
    [string]$RepoName = "EventManager"
)

# Fixer l'encodage de sortie en UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 1. Vérification / Saisie interactive du Token
if ([string]::IsNullOrWhiteSpace($GitHubToken)) {
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host "  EventManager - Synchronisation des 55 GitHub Issues          " -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ce script va synchroniser les 44 tâches Done et les 11 tâches To Do." -ForegroundColor Yellow
    Write-Host "Pour continuer, veuillez coller votre GitHub Personal Access Token (PAT)." -ForegroundColor Gray
    Write-Host "Lien : https://github.com/settings/tokens (Permission 'repo' requise)" -ForegroundColor Gray
    Write-Host ""
    $GitHubToken = Read-Host "Entrez votre GitHub Token (PAT)"
}

if ([string]::IsNullOrWhiteSpace($GitHubToken)) {
    Write-Error "Le token GitHub est requis pour continuer. Opération annulée."
    exit 1
}

$headers = @{
    "Authorization"        = "Bearer $GitHubToken"
    "Accept"               = "application/vnd.github+json"
    "User-Agent"           = "EventManager-Issue-Automator"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$apiBaseUrl = "https://api.github.com/repos/$RepoOwner/$RepoName"

# 2. Test de connexion au repository
Write-Host "`n Connexion au repository GitHub $RepoOwner/$RepoName..." -ForegroundColor Cyan
try {
    $repoInfo = Invoke-RestMethod -Uri $apiBaseUrl -Method Get -Headers $headers
    Write-Host " Connecte avec succes : $($repoInfo.full_name) ($($repoInfo.visibility))" -ForegroundColor Green
} catch {
    Write-Error " Impossible d'acceder au repository $RepoOwner/$RepoName. Verifiez votre token et vos droits."
    Write-Error $_
    exit 1
}

# 3. Chargement des données des issues depuis issues-data.json
$jsonPath = Join-Path $PSScriptRoot "issues-data.json"
if (-not (Test-Path $jsonPath)) {
    $jsonPath = ".\Documentation\issues-data.json"
}

if (-not (Test-Path $jsonPath)) {
    Write-Error " Le fichier 'issues-data.json' est introuvable au chemin : $jsonPath"
    exit 1
}

$rawJson = [System.IO.File]::ReadAllText($jsonPath, [System.Text.Encoding]::UTF8)
$issues = $rawJson | ConvertFrom-Json

Write-Host " Fichier charge avec succes : $($issues.Count) issues a synchroniser." -ForegroundColor Green

# 4. Configuration des Labels Recommandés
Write-Host "`n Configuration des Labels GitHub..." -ForegroundColor Cyan
$labelsToCreate = @(
    @{ name = "status:done"; color = "0e8a16"; description = "Feature entièrement développée et validée" },
    @{ name = "status:todo"; color = "fbca04"; description = "Fonctionnalité planifiée dans la roadmap" },
    @{ name = "priority:critical"; color = "b60205"; description = "Priorité absolue / Bloquant" },
    @{ name = "priority:high"; color = "d93f0b"; description = "Haute priorité" },
    @{ name = "priority:medium"; color = "e99695"; description = "Moyenne priorité" },
    @{ name = "scope:frontend"; color = "1d76db"; description = "Composants Angular & UI" },
    @{ name = "scope:backend"; color = "5319e7"; description = "API Spring Boot & Services" },
    @{ name = "feature:auth"; color = "0052cc"; description = "Module d'authentification et sécurité" },
    @{ name = "feature:event"; color = "006b75"; description = "Gestion des événements et plannings" },
    @{ name = "feature:template"; color = "d93f0b"; description = "Studio d'invitations et thèmes" },
    @{ name = "feature:rsvp"; color = "c5def5"; description = "Portail public d'invitation RSVP" },
    @{ name = "feature:client"; color = "bfdadc"; description = "Espace collaboratif client hôte" },
    @{ name = "feature:catering"; color = "d4c5f9"; description = "Gestion des menus et restauration" },
    @{ name = "feature:finance"; color = "bfd4f2"; description = "Facturation, acomptes et dépenses" },
    @{ name = "feature:data"; color = "fef2c0"; description = "Import/Export Excel/CSV et communication" },
    @{ name = "feature:i18n"; color = "e11d48"; description = "Multilingue et multi-devises" },
    @{ name = "feature:saas"; color = "047857"; description = "Monétisation et abonnements Stripe" }
)

foreach ($lbl in $labelsToCreate) {
    try {
        $body = $lbl | ConvertTo-Json -Compress
        $null = Invoke-RestMethod -Uri "$apiBaseUrl/labels" -Method Post -Headers $headers -Body $body -ContentType "application/json; charset=utf-8"
        Write-Host "  [+] Label cree : $($lbl.name)" -ForegroundColor Gray
    } catch {
        # Si le label existe déjà, GitHub renvoie 422 - c'est attendu
    }
}

# 5. Création effective des issues
Write-Host "`n Creation des $($issues.Count) issues sur GitHub..." -ForegroundColor Cyan

$successCount = 0
$errorCount = 0
$idx = 0

foreach ($issue in $issues) {
    $idx++
    Write-Host "[$idx/$($issues.Count)] Traitement : $($issue.title)..." -ForegroundColor Yellow
    
    $issuePayload = @{
        title  = $issue.title
        body   = $issue.body
        labels = $issue.labels
    }
    
    try {
        $jsonPayload = $issuePayload | ConvertTo-Json -Depth 5
        $createdIssue = Invoke-RestMethod -Uri "$apiBaseUrl/issues" -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($jsonPayload)) -ContentType "application/json; charset=utf-8"
        
        Write-Host "   ✔ Issue #$($createdIssue.number) creee ($($createdIssue.html_url))" -ForegroundColor Green
        
        if ($issue.state -eq "closed") {
            $closePayload = @{ state = "closed"; state_reason = "completed" } | ConvertTo-Json -Compress
            $null = Invoke-RestMethod -Uri "$apiBaseUrl/issues/$($createdIssue.number)" -Method Patch -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($closePayload)) -ContentType "application/json; charset=utf-8"
            Write-Host "   ✔ Issue #$($createdIssue.number) fermee [DONE / COMPLETED]" -ForegroundColor Magenta
        }
        
        $successCount++
        Start-Sleep -Milliseconds 600
    } catch {
        Write-Error "   ✖ Erreur lors de la creation de : $($issue.title)"
        Write-Error $_
        $errorCount++
    }
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  Rapport d'execution : $successCount creees avec succes, $errorCount erreurs." -ForegroundColor Cyan
Write-Host "  Consultez vos issues : https://github.com/$RepoOwner/$RepoName/issues" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
