# Deployment & Versioning Protocol

## Mandatory Rule on Deployment
Whenever the user requests a deployment to production (e.g., "déployer", "deploy", "mettre en production", "حط فالسيرفور"):

1. **Calculate Semantic Version**: Increment `vMAJOR.MINOR.PATCH` based on changes.
2. **Update `CHANGELOG.md`**: Detail all features, fixes, translations, database changes, and infra updates.
3. **Update `Frontend/package.json`**: Update the `"version"` field.
4. **Git Commit**: `git commit -m "release: vX.Y.Z - <summary>"`
5. **Git Tag**: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
6. **Push to GitHub**: `git push origin main --tags`
7. **Deploy to VPS**: Run `python scripts/deploy_git.py` (with `BypassSandbox: true`).
8. **Report**: Inform the user of the deployed version, changes list, and live status at `https://em.nexenflow.com`.
