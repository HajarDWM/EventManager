# EventManager — Workspace Rules & Guidelines

## 1. Project Overview & Architecture
- **Frontend**: Angular 19+ (standalone components, signals, OneUI theme, i18n translations with ngx-translate/custom service).
- **Backend**: Spring Boot 3 / Java 21, Spring Data JPA, Flyway migrations, JWT security.
- **Production Infrastructure**:
  - Remote Server IP: `41.214.254.0` (SSH user: `manager`, remote directory: `/home/manager/eventmanager`).
  - Production Domain: `https://em.nexenflow.com` (managed via Traefik & Cloudflare CDN).
  - Containers: `event-backend`, `event-frontend`, `event-mysql-db`, `event-phpmyadmin`.
  - Deployment Script: `scripts/deploy_git.py`.

---

## 2. Mandatory Deployment & Versioning Protocol (Rule "Déployer")

Whenever the user requests a deployment to the production server (e.g., using terms like **"déployer"**, **"deploy"**, **"déploie"**, **"mettre en production"**, **"حط فالسيرفور"**, **"دير ديبلويمون"**, etc.), the AI agent **MUST ALWAYS** follow this automated versioning and release lifecycle:

### Step 1: Analyze Changes
- Review all commits and file modifications made since the previous git release tag.

### Step 2: Determine Next Semantic Version (SemVer)
Follow `vMAJOR.MINOR.PATCH`:
- **PATCH** (`v1.1.1`): Bug fixes, CSS/UI tweaks, translation additions, minor refactors.
- **MINOR** (`v1.2.0`): New features, new pages, new API endpoints, database schema changes.
- **MAJOR** (`v2.0.0`): Breaking changes, major architectural redesigns.

### Step 3: Update `CHANGELOG.md`
- Append the new release block at the top of `CHANGELOG.md` with the following structure:
  ```markdown
  ## [vX.Y.Z] - YYYY-MM-DD
  ### ✨ Nouveautés / Features
  - ...
  ### 🐛 Corrections / Bug Fixes
  - ...
  ### 🌐 Traductions / i18n
  - ...
  ### 🗄️ Base de données / Migrations
  - ...
  ### 🚀 Infrastructure & Déploiement
  - ...
  ```

### Step 4: Update Version Declarations in Code
- Update `"version"` in `Frontend/package.json`.
- Update `<version>` in `Backend/pom.xml` if backend changes were included.

### Step 5: Git Commit & Tag
- Stage all changes including `CHANGELOG.md`, `package.json`, etc.
- Commit using standard release format:
  ```bash
  git commit -m "release: vX.Y.Z - <Concise summary of release>"
  ```
- Create an annotated Git tag:
  ```bash
  git tag -a vX.Y.Z -m "Release vX.Y.Z"
  ```

### Step 6: Push to Remote Repository
- Push the commit and the new tag to GitHub:
  ```bash
  git push origin main --tags
  ```

### Step 7: Run Server Deployment
- Execute the deployment script:
  ```bash
  python scripts/deploy_git.py
  ```
  *(Note: Run with `BypassSandbox: true` because Paramiko SSH connects to external host `41.214.254.0`).*
  *(Fallback: If Git push or remote Git pull fails, `python scripts/deploy_remote.py` can be used to bundle and transfer directly via SFTP).*

### Step 8: Verify & Report to User
- Confirm remote containers are healthy (`docker compose -f docker-compose.prod.yml ps`).
- Deliver a clear summary to the user in Moroccan Darija and French:
  - Release version (`vX.Y.Z`) and Git tag.
  - Highlights of what was included in this version (from `CHANGELOG.md`).
  - Confirmation that the production site is live at `https://em.nexenflow.com`.

---

## 3. General Development Guidelines
- **Translations (i18n)**: Whenever frontend keys are added or modified, BOTH `fr.json` and `ar.json` must be updated and kept in sync.
- **Cache Invalidation**: Never remove the timestamp query parameter (`?v=...`) in `translation.service.ts` or the `Cache-Control: no-cache` header in `nginx.prod.conf` to avoid CDN/browser cache staleness.
- **Database Migrations**: Always check foreign key constraints and verify test data in Flyway migration scripts before pushing to production.
