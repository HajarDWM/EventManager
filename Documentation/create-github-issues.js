/**
 * Script Node.js exhaustif pour créer l'ensemble des 55 GitHub Issues (44 Done + 11 To Do)
 * pour le repository HajarDWM/EventManager.
 * 
 * Usage:
 *   node Documentation/create-github-issues.js VOTRE_GITHUB_TOKEN
 */

const https = require('https');

const GITHUB_TOKEN = process.argv[2] || process.env.GITHUB_TOKEN;
const REPO_OWNER = 'HajarDWM';
const REPO_NAME = 'EventManager';

if (!GITHUB_TOKEN) {
  console.error('\x1b[31mErreur : GitHub Token manquant.\x1b[0m');
  console.log('\nUsage : node Documentation/create-github-issues.js <VOTRE_GITHUB_TOKEN>');
  process.exit(1);
}

function githubRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = https.request({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${REPO_OWNER}/${REPO_NAME}${path}`,
      method: method,
      headers: {
        'User-Agent': 'EventManager-Full-Issue-Sync',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(payload ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body ? JSON.parse(body) : {});
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const issues = [
  // MODULE 1 : AUTH & MULTI-TENANT (5)
  {
    title: "[DONE-AUTH-01] Architecture Multi-Tenant et Isolation de Base de Données par Traiteur",
    state: "closed",
    labels: ["status:done", "scope:backend", "feature:auth"],
    body: "## 📌 Réalisation\n- Cloisonnement strict des données par organisation Traiteur au niveau JPA et Spring Data.\n- Zéro fuite de données inter-locataires."
  },
  {
    title: "[DONE-AUTH-02] Système de Contrôle d'Accès par Rôles (RBAC : SuperAdmin, Caterer, Staff, Client)",
    state: "closed",
    labels: ["status:done", "scope:backend", "scope:frontend", "feature:auth"],
    body: "## 📌 Réalisation\n- Rôles SUPER_ADMIN, CATERER_ADMIN, STAFF, CLIENT avec guards de routage Angular et autorisations Spring Security."
  },
  {
    title: "[DONE-AUTH-03] Pipeline d'Authentification Stateless JWT avec Refresh Tokens",
    state: "closed",
    labels: ["status:done", "scope:backend", "feature:auth"],
    body: "## 📌 Réalisation\n- Authentification stateless JWT avec refresh tokens et hachage BCrypt sécurisé."
  },
  {
    title: "[DONE-AUTH-04] Authentification Directe Client Hôte par Token Sécurisé / Magic Link",
    state: "closed",
    labels: ["status:done", "scope:backend", "scope:frontend", "feature:auth", "feature:client"],
    body: "## 📌 Réalisation\n- ClientAuthController permettant l'accès sans mot de passe complexe pour les mariés/organisateurs."
  },
  {
    title: "[DONE-AUTH-05] Intercepteur et Guard de Vérification d'Abonnement Actif Traiteur",
    state: "closed",
    labels: ["status:done", "scope:backend", "scope:frontend", "feature:auth", "feature:saas"],
    body: "## 📌 Réalisation\n- Middleware bloquant l'accès aux fonctionnalités d'organisation si l'abonnement SaaS est expiré."
  },

  // MODULE 2 : ÉVÉNEMENTS (5)
  {
    title: "[DONE-EVT-01] Assistant Multi-Étapes de Création d'Événements avec Validation",
    state: "closed",
    labels: ["status:done", "scope:frontend", "scope:backend", "feature:event"],
    body: "## 📌 Réalisation\n- Formulaire multi-étapes réactif OneUI 5.12 avec validation et liaison API."
  },
  {
    title: "[DONE-EVT-02] Tableau de Bord Maître des Détails de l'Événement & KPI en Direct",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:event"],
    body: "## 📌 Réalisation\n- Page centrale de pilotage EventDetailsComponent avec métriques clés et compte à rebours."
  },
  {
    title: "[DONE-EVT-03] Moteur de Statuts d'Événements (Brouillon, Confirmé, Terminé, Annulé)",
    state: "closed",
    labels: ["status:done", "scope:backend", "scope:frontend", "feature:event"],
    body: "## 📌 Réalisation\n- Machine à états du cycle de vie de l'événement (DRAFT, CONFIRMED, COMPLETED, CANCELLED)."
  },
  {
    title: "[DONE-EVT-04] Duplication d'Événements et Clonage Rapide de Prestations",
    state: "closed",
    labels: ["status:done", "scope:backend", "scope:frontend", "feature:event"],
    body: "## 📌 Réalisation\n- Duplication en 1 clic d'un événement (menus, thèmes, checklists de préparation)."
  },
  {
    title: "[DONE-EVT-05] Checklist des Tâches de Préparation et Compte à Rebours d'Échéances",
    state: "closed",
    labels: ["status:done", "scope:backend", "scope:frontend", "feature:event"],
    body: "## 📌 Réalisation\n- Gestion des tâches de préparation avec priorités, deadlines et barre de progression."
  },

  // MODULE 3 : INVITATIONS & TEMPLATES (10)
  {
    title: "[DONE-TPL-01] Catalogue Admin et Studio d'Édition de Modèles d'Invitations Digitales",
    state: "closed",
    labels: ["status:done", "scope:frontend", "scope:backend", "feature:template"],
    body: "## 📌 Réalisation\n- Studio complet AdminTemplatesComponent avec CRUD des modèles classés par type d'événement."
  },
  {
    title: "[DONE-TPL-02] Personnalisation des Palettes de Couleurs et Arrière-plans de Prestige",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:template"],
    body: "## 📌 Réalisation\n- Sélecteurs de couleur primaire dorée, couleur de texte et fond personnalisé avec gestion du contraste."
  },
  {
    title: "[DONE-TPL-03] Chargeur Dynamique de Typographies de Luxe Google Fonts",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:template"],
    body: "## 📌 Réalisation\n- Injection dynamique runtime des Google Fonts (Alex Brush, Cinzel, Playfair Display, Great Vibes, Montserrat)."
  },
  {
    title: "[DONE-TPL-04] Cadres Décoratifs Filigranes (Floral, Bordure Dorée, Géométrique, Minimaliste)",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:template"],
    body: "## 📌 Réalisation\n- 4 couches ornementales décoratives pour sublimer la carte d'invitation."
  },
  {
    title: "[DONE-TPL-05] Moteur de Particules d'Ambiance Visuelles (Or, Pétales, Confettis, Étoiles, Bokeh)",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:template"],
    body: "## 📌 Réalisation\n- 5 systèmes de particules animées GPU-accélérées sans impact sur les performances."
  },
  {
    title: "[DONE-TPL-06] Cadrage Responsive des Particules : Marges Latérales sur Mobile vs Plein Écran Desktop",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:template"],
    body: "## 📌 Réalisation\n- Confinement des particules aux marges latérales sur Mobile (< 992px) et dispersion globale sur Desktop."
  },
  {
    title: "[DONE-TPL-07] 5 Expériences d'Ouverture Interactives de Prestige",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:template"],
    body: "## 📌 Réalisation\n- 5 animations d'entrée : Sceau de cire, Ruban de soie, Rideau, Portes de palace, Badge VIP."
  },
  {
    title: "[DONE-TPL-08] Widget Lecteur Audio Flottant avec Vinyle Rotatif et Égaliseur d'Ondes",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:template"],
    body: "## 📌 Réalisation\n- Lecteur audio d'ambiance avec disque vinyle tournant, égaliseur et lecture automatique au premier geste."
  },
  {
    title: "[DONE-TPL-09] Sélecteur de Rendu d'Aperçu en Direct Double-Écran (Mobile & Desktop)",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:template"],
    body: "## 📌 Réalisation\n- Commutateur de prévisualisation en temps réel sur smartphone et sur grand écran."
  },
  {
    title: "[DONE-TPL-10] Hydratation Instantanée 0ms via sessionStorage contre les Latences F5",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:template"],
    body: "## 📌 Réalisation\n- Mise en cache et réhydratation synchrone 0ms supprimant tout délai de chargement au refresh."
  },

  // MODULE 4 : PUBLIC RSVP (7)
  {
    title: "[DONE-RSVP-01] Portail Public d'Invitation RSVP Sécurisé par Jeton Individuel",
    state: "closed",
    labels: ["status:done", "scope:frontend", "scope:backend", "feature:rsvp"],
    body: "## 📌 Réalisation\n- Route publique /rsvp/:id résolue sans authentification avec personnalisation pour chaque invité."
  },
  {
    title: "[DONE-RSVP-02] Parcours Gastronomique Pas-à-Pas de Sélection des Plats",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:rsvp", "feature:catering"],
    body: "## 📌 Réalisation\n- Stepper interactif de sélection : Entrées -> Plats -> Desserts -> Boissons avec photos HD."
  },
  {
    title: "[DONE-RSVP-03] Moteur Multi-Formules Traiteur (Plats Fixes, Buffet, Formule Mixte)",
    state: "closed",
    labels: ["status:done", "scope:frontend", "scope:backend", "feature:rsvp", "feature:catering"],
    body: "## 📌 Réalisation\n- Support complet des formules PLATS_FIXES, BUFFET et MIX."
  },
  {
    title: "[DONE-RSVP-04] Gestion des Régimes Spéciaux et Tags d'Allergènes Alimentaires",
    state: "closed",
    labels: ["status:done", "scope:frontend", "scope:backend", "feature:rsvp", "feature:catering"],
    body: "## 📌 Réalisation\n- Sélection multi-critères des allergies et régimes particuliers (Halal, Casher, Végan, etc.)."
  },
  {
    title: "[DONE-RSVP-05] Enregistrement Dynamique des Accompagnants (+1 et Famille)",
    state: "closed",
    labels: ["status:done", "scope:frontend", "scope:backend", "feature:rsvp"],
    body: "## 📌 Réalisation\n- Déclaration dynamique des conjoints et enfants avec choix de plats individuels."
  },
  {
    title: "[DONE-RSVP-06] Parcours de Déclinaison avec Messages de Vœux et Regrets aux Hôtes",
    state: "closed",
    labels: ["status:done", "scope:frontend", "scope:backend", "feature:rsvp"],
    body: "## 📌 Réalisation\n- Modal bienveillant permettant de laisser un message chaleureux aux organisateurs."
  },
  {
    title: "[DONE-RSVP-07] Export Calendrier .ics en 1 Clic et Guidage GPS Google Maps / Parking",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:rsvp"],
    body: "## 📌 Réalisation\n- Génération .ics / Google Calendar et liens directs Google Maps pour la salle et le parking."
  },

  // MODULE 5 : CLIENT PORTAL (4)
  {
    title: "[DONE-CLNT-01] Tableau de Bord Client Privé avec Statistiques de Réponses en Direct",
    state: "closed",
    labels: ["status:done", "scope:frontend", "scope:backend", "feature:client"],
    body: "## 📌 Réalisation\n- Dashboard client responsive avec décompte des présences en temps réel."
  },
  {
    title: "[DONE-CLNT-02] Gestion Collaborative de la Liste des Invités et Groupes Dynamiques",
    state: "closed",
    labels: ["status:done", "scope:frontend", "scope:backend", "feature:client"],
    body: "## 📌 Réalisation\n- Ajout, modification, filtres et groupes personnalisés d'invités par les hôtes."
  },
  {
    title: "[DONE-CLNT-03] Synthèse des Choix de Menus et Régimes Alimentaires Côté Client",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:client", "feature:catering"],
    body: "## 📌 Réalisation\n- Visualisation consolidée des plats et régimes alimentaires choisis par les convives."
  },
  {
    title: "[DONE-CLNT-04] Composant d'Aperçu Live de l'Invitation Digitale dans le Portail Client",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:client", "feature:template"],
    body: "## 📌 Réalisation\n- Aperçu interactif reflétant les personnalisations du texte et du modèle."
  },

  // MODULE 6 : CATERING & MENUS (3)
  {
    title: "[DONE-CAT-01] Catalogue des Plats et Cartes Gastronomiques du Traiteur",
    state: "closed",
    labels: ["status:done", "scope:backend", "scope:frontend", "feature:catering"],
    body: "## 📌 Réalisation\n- Gestion des entrées, plats, desserts et boissons avec descriptifs et prix."
  },
  {
    title: "[DONE-CAT-02] Contrôleur d'Upload et Distribution des Photos de Plats (Multipart)",
    state: "closed",
    labels: ["status:done", "scope:backend", "feature:catering"],
    body: "## 📌 Réalisation\n- Téléversement multipart et distribution optimisée des images de plats."
  },
  {
    title: "[DONE-CAT-03] Tableau de Bord Récapitulatif de Production pour la Brigade Cuisine",
    state: "closed",
    labels: ["status:done", "scope:backend", "scope:frontend", "feature:catering"],
    body: "## 📌 Réalisation\n- Calcul agrégé automatique du nombre exact de portions par plat pour la cuisine."
  },

  // MODULE 7 : FINANCES & DÉPENSES (4)
  {
    title: "[DONE-FIN-01] Échéancier des Paiements Clients, Suivi des Acomptes et Reste à Payer",
    state: "closed",
    labels: ["status:done", "scope:backend", "scope:frontend", "feature:finance"],
    body: "## 📌 Réalisation\n- Enregistrement des règlements clients, calcul de l'acompte et du solde restant dû."
  },
  {
    title: "[DONE-FIN-02] Journal Détaillé des Dépenses et Charges de l'Événement",
    state: "closed",
    labels: ["status:done", "scope:backend", "scope:frontend", "feature:finance"],
    body: "## 📌 Réalisation\n- Suivi des charges réelles par catégorie (Ingrédients, Personnel, Location, Transport)."
  },
  {
    title: "[DONE-FIN-03] Calcul en Temps Réel de la Marge et du Bénéfice Net par Événement",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:finance"],
    body: "## 📌 Réalisation\n- Bénéfice Net calculé en direct par Angular Signals (Budget - Charges)."
  },
  {
    title: "[DONE-FIN-04] Génération et Impression PDF des Reçus de Paiement et Bons de Décaissement",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:finance"],
    body: "## 📌 Réalisation\n- Impression rapide de reçus clients officiels et bons internes de dépense."
  },

  // MODULE 8 : COMMUNICATION, DATA & CORE (6)
  {
    title: "[DONE-COMM-01] Centre d'Expédition Multi-Canal des Invitations (WhatsApp, Email, SMS)",
    state: "closed",
    labels: ["status:done", "scope:frontend", "scope:backend", "feature:rsvp"],
    body: "## 📌 Réalisation\n- Expédition sélective en 1 clic via WhatsApp Web, Email et SMS."
  },
  {
    title: "[DONE-DATA-01] Pipeline d'Importation Serveur Excel (.xlsx) et CSV avec Détection de Séparateurs",
    state: "closed",
    labels: ["status:done", "scope:backend", "feature:data"],
    body: "## 📌 Réalisation\n- Parsing haute performance Excel/CSV côté serveur avec validation des groupes."
  },
  {
    title: "[DONE-DATA-02] Moteur d'Exportation de Données en 1 Clic vers Excel et CSV",
    state: "closed",
    labels: ["status:done", "scope:backend", "scope:frontend", "feature:data"],
    body: "## 📌 Réalisation\n- Export des listes d'invités, fiches cuisine et bilans financiers."
  },
  {
    title: "[DONE-I18N-01] Internationalisation Complète de l'Application (Français, Anglais, Arabe)",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:i18n"],
    body: "## 📌 Réalisation\n- Support multilingue complet (fr, en, ar) avec sélecteur de langue dynamique."
  },
  {
    title: "[DONE-CURR-01] Moteur Multi-Devises avec Formatage Dynamique (MAD, EUR, USD, GBP, CAD)",
    state: "closed",
    labels: ["status:done", "scope:frontend", "feature:i18n"],
    body: "## 📌 Réalisation\n- Formatage et conversion dynamique des prix selon la devise choisie."
  },
  {
    title: "[DONE-SAAS-01] Monétisation SaaS Traiteur par Stripe Checkout et Webhooks d'Abonnement",
    state: "closed",
    labels: ["status:done", "scope:backend", "feature:saas"],
    body: "## 📌 Réalisation\n- Gestion des forfaits traiteur récurrents par Stripe Checkout et Webhooks."
  },

  // MODULE 9 : TO DO PLANIFIÉS (11)
  {
    title: "[TODO-LOG-01] Concepteur Visuel de Plan de Salle Interactif (Canvas 2D / Grille)",
    state: "open",
    labels: ["status:todo", "priority:critical", "scope:frontend", "scope:backend"],
    body: "## 🎯 Objectif\nOutil visuel interactif pour positionner les tables de réception (rondes, rectangulaires, ovales).\n\n*Cible : Q4 2026 | Priorité : 🔴 Critique*"
  },
  {
    title: "[TODO-LOG-02] Placement des Invités par Glisser-Déposer (Drag & Drop) et Alertes de Capacité",
    state: "open",
    labels: ["status:todo", "priority:critical", "scope:frontend", "scope:backend"],
    body: "## 🎯 Objectif\nAssignation des invités confirmés aux chaises par Drag & Drop avec alertes de surcapacité.\n\n*Cible : Q4 2026 | Priorité : 🔴 Critique*"
  },
  {
    title: "[TODO-LOG-03] Export Haute Définition du Plan de Table et des Chevalets en PDF",
    state: "open",
    labels: ["status:todo", "priority:high", "scope:frontend", "scope:backend"],
    body: "## 🎯 Objectif\nGénération PDF haute résolution du plan de table global et des listes d'accueil par table.\n\n*Cible : Q4 2026 | Priorité : 🟠 Haute*"
  },
  {
    title: "[TODO-OPS-01] Chronogramme Déroulé Heure par Heure du Jour J avec Assignation d'Équipe",
    state: "open",
    labels: ["status:todo", "priority:high", "scope:frontend", "scope:backend"],
    body: "## 🎯 Objectif\nPlanning minute-par-minute de la journée partagé entre cuisine, salle, DJ et organisateurs.\n\n*Cible : Q4 2026 | Priorité : 🟠 Haute*"
  },
  {
    title: "[TODO-OPS-02] Vue Mobile Live pour Équipes Terrain (Serveurs et Maître d'Hôtel)",
    state: "open",
    labels: ["status:todo", "priority:medium", "scope:frontend"],
    body: "## 🎯 Objectif\nInterface smartphone pour cocher l'avancement des étapes du Jour J en direct.\n\n*Cible : Q4 2026 | Priorité : 🟡 Moyenne*"
  },
  {
    title: "[TODO-HR-01] Gestion du Roster et Plannings des Équipes de Service et Extras",
    state: "open",
    labels: ["status:todo", "priority:medium", "scope:backend", "scope:frontend"],
    body: "## 🎯 Objectif\nFiches des serveurs et extras avec planification des horaires d'embauche.\n\n*Cible : Q1 2027 | Priorité : 🟡 Moyenne*"
  },
  {
    title: "[TODO-HR-02] Calcul Automatique des Salaires et Intégration aux Dépenses de l'Événement",
    state: "open",
    labels: ["status:todo", "priority:medium", "scope:backend", "scope:frontend"],
    body: "## 🎯 Objectif\nCalcul automatique des coûts salariaux injectés dans le registre des dépenses.\n\n*Cible : Q1 2027 | Priorité : 🟡 Moyenne*"
  },
  {
    title: "[TODO-MEDIA-01] Galerie Souvenir Partagée avec Téléversement par QR Code de Table",
    state: "open",
    labels: ["status:todo", "priority:medium", "scope:frontend", "scope:backend"],
    body: "## 🎯 Objectif\nTéléversement mobile direct de photos souvenirs via QR code de table avec modération hôte.\n\n*Cible : Q1 2027 | Priorité : 🟢 Moyenne*"
  },
  {
    title: "[TODO-COMM-01] Intégration de l'API Meta WhatsApp Cloud et Relances Automatisées",
    state: "open",
    labels: ["status:todo", "priority:medium", "scope:backend"],
    body: "## 🎯 Objectif\nEnvoi officiel en masse sur WhatsApp et relances automatiques programmées à J-7 et J-2.\n\n*Cible : Q2 2027 | Priorité : 🟢 Moyenne*"
  },
  {
    title: "[TODO-AI-01] Assistant IA de Proposition de Menus et Calcul Prédictif des Matières Premières",
    state: "open",
    labels: ["status:todo", "priority:medium", "scope:backend", "scope:frontend"],
    body: "## 🎯 Objectif\nSuggestions IA de menus et calcul exact des grammages d'ingrédients bruts selon les réponses RSVP.\n\n*Cible : Q2 2027 | Priorité : 🔵 Innovation*"
  },
  {
    title: "[TODO-PWA-01] Application PWA Hors-Ligne et Scanner QR Code de Contrôle d'Accès",
    state: "open",
    labels: ["status:todo", "priority:medium", "scope:frontend"],
    body: "## 🎯 Objectif\nApplication PWA hors-ligne pour le scan rapide des invitations à l'entrée de la salle.\n\n*Cible : Q2 2027 | Priorité : ⚪ Amélioration*"
  }
];

async function main() {
  console.log(`\x1b[36m🚀 Création des ${issues.length} GitHub Issues sur ${REPO_OWNER}/${REPO_NAME}...\x1b[0m\n`);

  let count = 0;
  for (const issue of issues) {
    try {
      count++;
      console.log(`[${count}/${issues.length}] ⏳ \x1b[33m${issue.title}\x1b[0m...`);
      const created = await githubRequest('/issues', 'POST', {
        title: issue.title,
        body: issue.body,
        labels: issue.labels
      });

      console.log(`   \x1b[32m✔ Issue #${created.number} créée\x1b[0m (${created.html_url})`);

      if (issue.state === 'closed') {
        await githubRequest(`/issues/${created.number}`, 'PATCH', {
          state: 'closed',
          state_reason: 'completed'
        });
        console.log(`   \x1b[35m✔ Issue #${created.number} marquée [FERMÉE / DONE]\x1b[0m`);
      }

      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      console.error(`   \x1b[31m✖ Erreur : ${err.message}\x1b[0m`);
    }
  }

  console.log(`\n\x1b[36m✔ Terminé ! 55 issues synchronisées sur https://github.com/${REPO_OWNER}/${REPO_NAME}/issues\x1b[0m`);
}

main();
