# EventManager - Documentation Technique & Walkthrough

## Option 5 : Gestion de la Restauration & des Menus (+ Optimisations Générales)

Le module **Option 5 : Gestion de la Restauration & des Menus** permet aux traiteurs d'élaborer la carte gourmande de leurs prestations (Entrées, Plats principaux, Desserts, Boissons), d'indiquer les régimes/allergènes et de calculer automatiquement le **budget traiteur total** (Coût par personne × Nombre d'invités attendus).

---

## 1. Optimisations Générales Réalisées

1. **Tableau de bord dynamique (`Dashboard`) :** Connexion temps réel aux événements réels du traiteur via `EventService` et routing interactif vers `/events` et `/profile`.
2. **Gestionnaire d'exceptions global (`GlobalExceptionHandler`) :** Restitution de codes HTTP REST propres (404 Not Found, 403 Forbidden, 400 Bad Request) au lieu d'erreurs 500 génériques.
3. **Suppression en cascade (`Cascade Delete`) :** Nettoyage automatique des invités (`guests`) et plats (`menu_items`) lors de la suppression d'un événement.
4. **Synchronisation dynamique des invités (`Guest Sync`) :** Mise à jour automatique de l'estimation du nombre d'invités sur l'événement lors des ajouts/suppressions dans le module invités.

---

## 2. Architecture & Code Source Option 5

### Backend Spring Boot (Clean Architecture Hexagonale)

#### Domaine (`domain/model`)
* `MenuItem.java` : Modèle métier représentant un plat/boisson (`id`, `eventId`, `name`, `category`, `pricePerPerson`, `dietaryTag`, `description`).
* `MenuItemCategory.java` : Énumération des catégories (`STARTER`, `MAIN`, `DESSERT`, `BEVERAGE`).

#### Application & Ports (`application`)
* `MenuItemDTO.java` & `MenuItemMapper.java` : Transfert et conversion DTO/Domaine/Entité.
* Ports d'entrée : `CreateMenuItemUseCase`, `GetMenuItemsByEventUseCase`, `UpdateMenuItemUseCase`, `DeleteMenuItemUseCase`.
* Port de sortie : `MenuItemRepositoryPort`.
* Service d'application : `MenuItemApplicationService.java` (avec contrôle d'accès multi-tenant vérifiant qu'un traiteur ne gère que les menus de ses propres événements).

#### Infrastructure & REST (`infrastructure` & `presentation`)
* Entité JPA : `MenuItemEntity.java` (Table SQL `menu_items`).
* Dépôt JPA : `JpaMenuItemRepository.java` & Adaptateur `MenuItemRepositoryAdapter.java`.
* Contrôleur REST : `MenuItemResource.java`
  - `GET /api/events/{eventId}/menu-items` : Obtenir la carte du menu d'un événement.
  - `POST /api/events/{eventId}/menu-items` : Ajouter un plat.
  - `PUT /api/menu-items/{id}` : Modifier un plat.
  - `DELETE /api/menu-items/{id}` : Supprimer un plat.

---

### Frontend Angular (Style OneUI 5.12)

* Service API : `menu-item.service.ts` (`src/app/core/services/menu-item.service.ts`).
* Composant Menu : `menu-list.ts` & `menu-list.html` (`src/app/features/events/components/menu-list/`).
  - **4 Cartes Métriques :** Total Plats, Coût par Personne, Budget Traiteur Total Calculé (Coût/Pers × Invités) et Répartition par catégories.
  - **Barre d'outils de filtres par catégories :** Tous, Entrées, Plats, Desserts, Boissons.
  - **Formulaire Modal :** Création et édition de plats avec gestion des allergènes et prix.
* Routage : Route `/events/:id/menu` dans `app.routes.ts`.
* Bouton d'accès : Bouton **Menu** (jaune/orange) dans le tableau des événements (`event-list.html`).

---

## 3. Compilation et Validation

| Composant | Commande de build | Résultat |
| :--- | :--- | :--- |
| **Backend Java** | `.\mvnw.cmd compile` | 🟢 **BUILD SUCCESS** (80 fichiers source Java compilés sans erreur) |
| **Frontend Angular** | `npm run build` | 🟢 **BUILD SUCCESS** (Bundle généré en 8.1s sans erreur) |

---

## 4. Instructions de Test

1. **Serveur Backend :** Assurez-vous que `.\mvnw.cmd spring-boot:run` tourne dans `Backend/`. Hibernate va créer la table `menu_items`.
2. **Serveur Frontend :** Accédez à `http://localhost:4200/events`.
3. **Gestion des Menus :** Cliquez sur le bouton **Menu** (jaune/orange) sur n'importe quel événement.
4. **Création & Calcul :** Ajoutez des entrées, plats ou desserts avec un prix par personne. Le coût par personne et le budget traiteur total sont recalculés instantanément !
