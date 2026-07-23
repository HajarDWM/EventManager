# EventManager - Documentation Technique & Walkthrough

## Option 4 : Recherche, Filtrage et Tri Avancés des Événements

Le module **Option 4 : Recherche, Filtrage et Tri des Événements** permet au traiteur de rechercher instantanément ses prestations en saisissant un mot-clé (dans le titre ou le lieu), en filtrant par statut (Planifié, Brouillon, Terminé, Annulé) et en triant la liste par date, titre ou nombre d'invités.

---

## 🔒 Soft Delete & Préservation des Données

Afin de garantir qu'aucune donnée importante ne soit supprimée de la base de données par inadvertance, la suppression des événements a été migrée vers un système de **Soft Delete** :

1. **Pas de suppression physique :** Lors de l'appel à la suppression d'un événement, l'événement n'est pas effacé de la base de données (pas de `DELETE`).
2. **Propriété `archived` :** L'événement est simplement marqué comme archivé (`archived = true` en base).
3. **Maintien des données associées :** Les invités (`guests`), les plats (`menu_items`) et les tâches de préparation (`event_tasks`) rattachés à cet événement restent intacts en base de données.
4. **Filtrage des requêtes :** Les méthodes de lecture (comme `findAllByCatererId`) filtrent automatiquement les événements archivés afin qu'ils n'apparaissent plus dans la liste des prestations de l'application.

---

## Architecture & Code Source

### 1. Frontend Angular (OneUI 5.12 & Reactive Signals)

#### Composants (`src/app/features/events/components/event-list/`)
* `event-list.ts` : 
  - Utilisation des **Signals réactifs** d'Angular (`searchTerm`, `statusFilter`, `sortBy`).
  - Utilisation du signal dérivé `computed()` pour effectuer le filtrage et le tri en temps réel à la volée avec des performances maximales sans rechargement de page.
  - Méthode `resetFilters()` pour réinitialiser tous les filtres en 1 clic.
* `event-list.html` : 
  - **Barre d'outils de recherche OneUI :** Champ de recherche textuel avec icône de loupe.
  - **Menu déroulant par Statut :** Tous les statuts, Planifiés, Brouillons, Terminés, Annulés.
  - **Menu déroulant de Tri :** Date (Plus proche / éloignée), Nombre d'invités (décroissant), Titre (A-Z).
  - **Compteur réactif :** Badge affichant le nombre de prestations correspondant aux filtres.
  - **Bouton de réinitialisation :** Pour effacer instantanément les critères de recherche.

---

### 2. Backend Spring Boot (Clean Architecture Hexagonale)

#### Modèle & Entités
* `Event.java` & `EventEntity.java` : Ajout du champ `archived` (booléen).
* `EventPersistenceMapper.java` : Prise en charge du mapping du champ `archived`.

#### Dépôts & Services (`application/service` & `presentation/resource`)
* `EventRepository.java` : Ajout de la méthode `findByCatererIdAndArchivedFalse(Long catererId)`.
* `EventRepositoryAdapter.java` : Modification de `findAllByCatererId` pour ne retourner que les événements non archivés.
* `EventApplicationService.java` : Modification de `deleteEvent(Long id)` pour simplement passer `archived` à `true` et sauvegarder l'événement sans altérer les autres tables de la base.
* Restitution sécurisée des prestations filtrées en fonction du traiteur connecté (isolation multi-tenant).

---

## Compilation et Validation

| Composant | Commande de build | Résultat |
| :--- | :--- | :--- |
| **Backend Java** | `.\mvnw.cmd compile` | 🟢 **BUILD SUCCESS** (123 fichiers source Java compilés sans erreur) |
| **Frontend Angular** | `npm run build` | 🟢 **BUILD SUCCESS** (Bundle généré en 9.7s sans erreur) |

---

## Guide d'Utilisation

1. Accédez à la liste des événements sur `http://localhost:4200/events`.
2. Tapez un mot ou un lieu dans la barre de recherche (ex: *Mariage* ou *Paris*). La liste se filtre automatiquement pendant votre saisie !
3. Sélectionnez un statut (ex: *Planifié*) pour restreindre la vue.
4. Modifiez l'ordre de tri pour voir les événements par date ou par nombre d'invités.
5. Cliquez sur **Réinitialiser** pour réafficher tous les événements.
