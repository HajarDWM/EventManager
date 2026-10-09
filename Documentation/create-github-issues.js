/**
 * Script Node.js pour créer automatiquement toutes les GitHub Issues (Done et To Do)
 * pour le repository HajarDWM/EventManager.
 * 
 * Usage:
 *   node Documentation/create-github-issues.js GITHUB_TOKEN
 * ou:
 *   set GITHUB_TOKEN=ghp_xxx && node Documentation/create-github-issues.js
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
        'User-Agent': 'EventManager-Issue-Sync',
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
  // DONE
  {
    title: "[DONE] Multi-Tenant Architecture, RBAC & JWT Security Pipeline",
    state: "closed",
    labels: ["status:done", "scope:backend", "scope:frontend"],
    body: `## 📌 Résumé de la Réalisation\nMise en place de l'architecture Multi-Tenant isolée par Traiteur avec sécurité complète et contrôle d'accès par rôles (RBAC).\n\n### ✅ Tâches Réalisées :\n- [x] **Isolation Multi-Tenant :** Cloisonnement strict des données par organisation traiteur.\n- [x] **Rôles & Permissions :** Gestion des rôles SUPER_ADMIN, CATERER_ADMIN, STAFF, CLIENT.\n- [x] **Pipeline JWT :** Authentification stateless avec refresh tokens et chiffrement BCrypt.\n- [x] **Subscription Guarding :** Protection middleware bloquant l'accès en cas d'abonnement expiré.`
  },
  {
    title: "[DONE] Digital Luxury Invitation Studio & Dynamic Template Engine",
    state: "closed",
    labels: ["status:done", "feature:rsvp", "scope:frontend", "scope:backend"],
    body: `## 📌 Résumé de la Réalisation\nStudio d'édition d'invitations digitales d'exception avec aperçu responsive en direct.\n\n### ✅ Tâches Réalisées :\n- [x] **Catalogue Admin :** CRUD complet des modèles.\n- [x] **Design & Typographie Luxe :** Chargement dynamique des polices Google Fonts.\n- [x] **Particules d'Ambiance Visuelles :** 5 effets animés avec cadrage responsive (marges latérales sur mobile, plein écran sur desktop).\n- [x] **5 Expériences d'Ouverture Interactives** (Sceau de cire, Ruban, Rideau, Portes, Badge).\n- [x] **Lecteur Audio Flottant** avec vinyle rotatif et égaliseur.\n- [x] **Hydratation Instantanée 0ms** via sessionStorage.`
  },
  {
    title: "[DONE] Public Guest RSVP Portal & Multi-Course Gastronomy Selection",
    state: "closed",
    labels: ["status:done", "feature:rsvp", "feature:catering", "scope:frontend"],
    body: `## 📌 Résumé de la Réalisation\nPortail public invité (/rsvp/:id) avec sélection gastronomique pas-à-pas et gestion des régimes alimentaires.\n\n### ✅ Tâches Réalisées :\n- [x] **Accès sans friction :** URL sécurisée par token individuel.\n- [x] **Formules Plats Fixes, Buffet et Mix.**\n- [x] **Allergènes & Régimes Spécifiques.**\n- [x] **Gestion des Accompagnants (+1).**\n- [x] **Export Calendrier (.ics) & Navigation GPS Google Maps.**`
  },
  {
    title: "[DONE] Dedicated End-Client Collaboration Portal",
    state: "closed",
    labels: ["status:done", "scope:frontend", "scope:backend"],
    body: `## 📌 Résumé de la Réalisation\nPortail dédié aux hôtes pour co-piloter leur événement en direct avec le traiteur.\n\n### ✅ Tâches Réalisées :\n- [x] **Dashboard Client :** Statistiques en direct et compte à rebours.\n- [x] **Gestion de la Liste des Invités :** Ajout, modification, recherche et groupes.\n- [x] **Suivi Culinaire :** Synthèse en direct des choix de plats.\n- [x] **Aperçu Live de l'Invitation.**`
  },
  {
    title: "[DONE] Menu & Culinary Catering Engine",
    state: "closed",
    labels: ["status:done", "feature:catering", "scope:backend", "scope:frontend"],
    body: `## 📌 Résumé de la Réalisation\nMoteur de gestion des cartes et menus traiteur.\n\n### ✅ Tâches Réalisées :\n- [x] **Catalogue de Plats & Catégories.**\n- [x] **Upload & Gestion des photos de plats.**\n- [x] **Récapitulatif de Production Cuisine pour les chefs.**`
  },
  {
    title: "[DONE] Event Financials, Billing & Expense Accounting",
    state: "closed",
    labels: ["status:done", "feature:finance", "scope:backend", "scope:frontend"],
    body: `## 📌 Résumé de la Réalisation\nModule de comptabilité et rentabilité événementielle.\n\n### ✅ Tâches Réalisées :\n- [x] **Suivi des Paiements Clients & Acomptes.**\n- [x] **Journal des Dépenses de l'Événement.**\n- [x] **Calcul du Bénéfice Net en temps réel.**\n- [x] **Impression PDF des Reçus de Paiement et Bons de Décaissement.**`
  },
  {
    title: "[DONE] Multi-Channel Guest Communication & Excel/CSV Pipeline",
    state: "closed",
    labels: ["status:done", "feature:rsvp", "scope:backend", "scope:frontend"],
    body: `## 📌 Résumé de la Réalisation\nCentre d'envoi multi-canal et import/export de données.\n\n### ✅ Tâches Réalisées :\n- [x] **Envoi Multi-Canal :** WhatsApp Web, Email, SMS.\n- [x] **Import Excel (.xlsx) et CSV côté serveur avec validation des groupes.**\n- [x] **Exportation en 1 clic vers Excel et CSV.**`
  },
  {
    title: "[DONE] Internationalization (i18n) & Multi-Currency Engine",
    state: "closed",
    labels: ["status:done", "scope:frontend"],
    body: `## 📌 Résumé de la Réalisation\nSupport multilingue et multi-devises complet.\n\n### ✅ Tâches Réalisées :\n- [x] **i18n :** Français (fr), Anglais (en), Arabe (ar).\n- [x] **Multi-Devises :** MAD, EUR, USD, GBP, CAD.`
  },
  {
    title: "[DONE] SaaS Monetization & Stripe Subscription Billing",
    state: "closed",
    labels: ["status:done", "feature:finance", "scope:backend"],
    body: `## 📌 Résumé de la Réalisation\nMonétisation SaaS avec abonnements récurrents via Stripe Checkout et Webhooks.`
  },
  // TO DO
  {
    title: "[TODO] Priority 1: Interactive Visual Table Plan & Seating Chart",
    state: "open",
    labels: ["status:todo", "priority:critical", "scope:frontend", "scope:backend"],
    body: `## 🎯 Objectif\nOffrir un outil visuel interactif de plan de table avec placement des invités par Drag & Drop.\n\n### 📋 Spécifications :\n- [ ] Canvas visuel de salle avec tables (rondes, rectangulaires, ovales).\n- [ ] Drag & Drop des invités confirmés sur les chaises.\n- [ ] Alertes de surcapacité et affinités de groupes.\n- [ ] Export PDF du plan de salle et chevalets de table.\n\n*Cible : Q4 2026 | Priorité : 🔴 Critique*`
  },
  {
    title: "[TODO] Priority 2: Real-Time Day-of Event Chronogramme & Live Run-of-Show",
    state: "open",
    labels: ["status:todo", "priority:high", "scope:frontend", "scope:backend"],
    body: `## 🎯 Objectif\nRemplacer le déroulé papier par un chronogramme digital partagé en direct.\n\n### 📋 Spécifications :\n- [ ] Timeline heure par heure.\n- [ ] Assignation par brigade (Cuisine, Salle, DJ, Photo).\n- [ ] Vue mobile live pour les serveurs et coordinateurs.\n\n*Cible : Q4 2026 | Priorité : 🟠 Haute*`
  },
  {
    title: "[TODO] Priority 3: Staffing, Extras & Shift Management",
    state: "open",
    labels: ["status:todo", "priority:medium", "scope:frontend", "scope:backend"],
    body: `## 🎯 Objectif\nGestion des extras et serveurs avec calcul automatique de la masse salariale rattachée aux dépenses de l'événement.\n\n### 📋 Spécifications :\n- [ ] Roster et plannings des extras.\n- [ ] Suivi des heures effectuées et calcul automatique des salaires.\n- [ ] Briefing SMS / Email des équipes.\n\n*Cible : Q1 2027 | Priorité : 🟡 Moyenne-Haute*`
  },
  {
    title: "[TODO] Priority 4: Shared Post-Event Media Gallery & Table QR Code Wall",
    state: "open",
    labels: ["status:todo", "priority:medium", "scope:frontend", "scope:backend"],
    body: `## 🎯 Objectif\nGalerie souvenir partagée où les invités déposent leurs photos en direct via un QR code de table.\n\n### 📋 Spécifications :\n- [ ] Générateur de QR Code pour chevalets de table.\n- [ ] Upload mobile direct sans application.\n- [ ] Dashboard de modération pour l'organisateur.\n- [ ] Téléchargement de l'album en archive ZIP HD.\n\n*Cible : Q1 2027 | Priorité : 🟢 Moyenne*`
  },
  {
    title: "[TODO] Priority 5: Meta WhatsApp Cloud API & Automated Reminder Gateway",
    state: "open",
    labels: ["status:todo", "priority:medium", "scope:backend"],
    body: `## 🎯 Objectif\nAutomatisation de l'envoi des invitations et relances de présence via l'API officielle WhatsApp Cloud.\n\n### 📋 Spécifications :\n- [ ] Envoi de masse de modèles vérifiés WhatsApp.\n- [ ] Relances automatiques à J-7 et J-2 pour les invités sans réponse.\n- [ ] Boutons de confirmation interactive dans le chat.\n\n*Cible : Q2 2027 | Priorité : 🟢 Moyenne*`
  },
  {
    title: "[TODO] Priority 6: AI-Powered Catering Assistant & Ingredient Scaling",
    state: "open",
    labels: ["status:todo", "priority:medium", "scope:backend", "scope:frontend"],
    body: `## 🎯 Objectif\nAssistance IA pour suggestions de menus traiteur et calcul automatique des matières premières requises selon les choix RSVP des invités.\n\n*Cible : Q2 2027 | Priorité : 🔵 Innovation*`
  },
  {
    title: "[TODO] Priority 7: Offline-First PWA & Door Check-In QR Scanner",
    state: "open",
    labels: ["status:todo", "priority:medium", "scope:frontend"],
    body: `## 🎯 Objectif\nApplication PWA hors-ligne pour le contrôle d'accès et scan des QR codes invités aux portes de la salle.\n\n*Cible : Q2 2027 | Priorité : ⚪ Amélioration*`
  }
];

async function main() {
  console.log(`\x1b[36m🚀 Création automatique des GitHub Issues sur ${REPO_OWNER}/${REPO_NAME}...\x1b[0m\n`);

  for (const issue of issues) {
    try {
      console.log(`⏳ Création de : \x1b[33m${issue.title}\x1b[0m...`);
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
        console.log(`   \x1b[35m✔ Issue #${created.number} marquée comme [FERMÉE / DONE]\x1b[0m`);
      }

      // Petite pause pour les limites d'API
      await new Promise(r => setTimeout(r, 800));
    } catch (err) {
      console.error(`   \x1b[31m✖ Erreur : ${err.message}\x1b[0m`);
    }
  }

  console.log(`\n\x1b[36m✔ Terminé ! Consultez vos issues sur https://github.com/${REPO_OWNER}/${REPO_NAME}/issues\x1b[0m`);
}

main();
