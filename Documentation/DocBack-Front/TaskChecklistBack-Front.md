# EventManager - Documentation Technique & Walkthrough

## Option 6 : Checklist & Gestion des Tâches par Événement

Le module **Option 6 : Checklist & Gestion des Tâches par Événement** permet aux traiteurs d'organiser le rétroplanning de chaque prestation (ex: "Valider la liste des allergènes", "Briefing serveurs", "Livraison des boissons"), de définir les priorités et d'observer le pourcentage de réalisation des préparatifs en temps réel via une barre de progression interactive OneUI 5.12.

---

## 1. Architecture & Code Source Option 6

### Backend Spring Boot (Clean Architecture Hexagonale)

#### Domaine (`domain/model`)
* `EventTask.java` : Modèle métier d'une tâche (`id`, `eventId`, `title`, `description`, `dueDate`, `priority`, `status`, `assignedTo`).
* `TaskPriority.java` : Énumération des priorités (`LOW`, `MEDIUM`, `HIGH`).
* `TaskStatus.java` : Énumération des états (`TODO`, `IN_PROGRESS`, `COMPLETED`).

#### Application & Ports (`application`)
* `EventTaskDTO.java` & `EventTaskMapper.java` : DTO d'échange de données et convertisseur métier.
* Ports d'entrée : `CreateEventTaskUseCase`, `GetTasksByEventUseCase`, `UpdateEventTaskUseCase`, `DeleteEventTaskUseCase`, `ToggleTaskStatusUseCase`.
* Port de sortie : `EventTaskRepositoryPort`.
* Service d'application : `EventTaskApplicationService.java` (avec contrôle multi-tenant vérifiant qu'un traiteur n'administre que les tâches de ses propres prestations).

#### Infrastructure & REST (`infrastructure` & `presentation`)
* Entité JPA : `EventTaskEntity.java` (Table SQL `event_tasks`).
* Dépôt JPA : `JpaEventTaskRepository.java` & Adaptateur `EventTaskRepositoryAdapter.java`.
* Contrôleur REST : `EventTaskResource.java`
  - `GET /api/events/{eventId}/tasks` : Liste des tâches d'un événement.
  - `POST /api/events/{eventId}/tasks` : Créer une tâche.
  - `PUT /api/tasks/{id}` : Modifier une tâche.
  - `PATCH /api/tasks/{id}/toggle` : Basculer en 1 clic l'état (À faire / Terminé).
  - `DELETE /api/tasks/{id}` : Supprimer une tâche.
* **Cascade Delete :** Infiltration de `eventTaskRepositoryPort.deleteByEventId(id)` dans `EventApplicationService.java` pour nettoyer automatiquement les tâches lorsqu'un événement est supprimé.

---

### Frontend Angular (Style OneUI 5.12)

* Service API : `event-task.service.ts` (`src/app/core/services/event-task.service.ts`).
* Composant Checklist : `task-list.ts` & `task-list.html` (`src/app/features/events/components/task-list/`).
  - **Barre de progression visuelle (%) :** Pourcentage de réalisation des préparatifs actualisé dynamiquement.
  - **4 Cartes Métriques :** Total Tâches, Terminées, En cours, Tâches Urgentes (Priorité Haute).
  - **Basculement instantané (Checkbox) :** Modification d'état en 1-clic.
  - **Barre de filtres par statut :** Toutes, À faire, En cours, Terminées.
  - **Formulaire Modal :** Création et modification rapide d'une tâche avec date d'échéance et responsable assigné.
* Routage : Route `/events/:id/tasks` dans `app.routes.ts`.
* Bouton d'accès : Bouton **Tâches** (vert/cyan) dans le tableau des événements (`event-list.html`).

---

## 2. Compilation et Validation

| Composant | Commande de build | Résultat |
| :--- | :--- | :--- |
| **Backend Java** | `.\mvnw.cmd compile` | 🟢 **BUILD SUCCESS** (96 fichiers source Java compilés sans erreur) |
| **Frontend Angular** | `npm run build` | 🟢 **BUILD SUCCESS** (Bundle généré en 7.8s sans erreur) |

---

## 3. Instructions de Test

1. **Serveur Backend :** Relancez `.\mvnw.cmd spring-boot:run` dans `Backend/`. Hibernate génère automatiquement la table `event_tasks`.
2. **Serveur Frontend :** Rendez-vous sur `http://localhost:4200/events`.
3. **Checklist & Tâches :** Cliquez sur le bouton vert/cyan **Tâches** sur l'événement de votre choix.
4. **Interactivité :** Ajoutez des tâches, cochez les cases pour les marquer comme terminées et observez la barre de progression évoluer en temps réel !
