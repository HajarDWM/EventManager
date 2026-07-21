# EventManager - Documentation Technique & Walkthrough

## Option 7 : Export PDF & Impression (Fiches Cuisine, Invités & Rétroplanning)

Le module **Option 7 : Export PDF & Impression** permet aux traiteurs de générer, prévisualiser et imprimer/télécharger en 1-clic des fiches techniques papier au format PDF adaptées à l'équipe en cuisine, aux maîtres d'hôtel et aux organisateurs sur le terrain.

---

## 1. Architecture & Code Source Option 7

### Backend Spring Boot (Clean Architecture Hexagonale)

#### Application & DTO (`application`)
* `EventExportDTO.java` : DTO d'agrégation regroupant en une seule réponse `EventDTO`, `List<GuestDTO>`, `List<MenuItemDTO>` et `List<EventTaskDTO>`.
* Port d'entrée : `GetEventExportDataUseCase.java`.
* Service d'application : `EventApplicationService.java` (implémentation de la méthode `getEventExportData(eventId)` avec vérification d'accès multi-tenant).

#### Infrastructure & REST (`presentation`)
* Contrôleur REST : `ExportResource.java`
  - `GET /api/events/{eventId}/export-data` : Récupère les données agrégées complètes de la prestation.

---

### Frontend Angular (Style OneUI 5.12 & Impression Native)

* Service API : `export-pdf.service.ts` (`src/app/core/services/export-pdf.service.ts`).
* Composant Export : `event-export.ts`, `event-export.html` & `event-export.scss` (`src/app/features/events/components/event-export/`).
  - **Onglets de sélection de fiches :**
    - 🍴 **Fiche Cuisine & Restauration :** Carte complète du menu par catégories (Entrées, Plats, Desserts, Boissons), badges d'allergènes et récapitulatif financier (Prix menu/personne, Budget total).
    - 👥 **Fiche Plan de Table & Invités :** Tableau synthétique des invités avec numéros de table, statut de présence et régimes alimentaires spécifiques.
    - 📋 **Fiche Rétroplanning & Checklist :** Tâches à effectuer avec priorités, échéances et responsables assignés.
  - **Style d'impression dédié `@media print` :** Masque automatiquement la navigation web (sidebar, header, boutons) et adapte la mise en page au format papier A4 natif.
* Routage : Route `/events/:id/export` dans `app.routes.ts`.
* Bouton d'accès : Bouton **Export PDF** (violet `<i class="fa fa-file-pdf"></i>`) dans le tableau des événements (`event-list.html`).

---

## 2. Compilation et Validation

| Composant | Commande de build | Résultat |
| :--- | :--- | :--- |
| **Backend Java** | `.\mvnw.cmd compile` | 🟢 **BUILD SUCCESS** (99 fichiers source Java compilés sans erreur) |
| **Frontend Angular** | `npm run build` | 🟢 **BUILD SUCCESS** (Bundle généré en 7.8s sans erreur) |

---

## 3. Instructions de Test

1. **Serveur Backend :** Assurez-vous que `.\mvnw.cmd spring-boot:run` fonctionne dans `Backend/`.
2. **Serveur Frontend :** Accédez à `http://localhost:4200/events`.
3. **Export & Impression :** Cliquez sur le bouton violet **Export PDF** sur l'événement souhaité.
4. **Prévisualisation & PDF :** Basculez entre les fiches (Cuisine, Plan de table, Rétroplanning) et cliquez sur **Imprimer / Sauvegarder PDF** pour valider la génération PDF !
