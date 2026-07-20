# EventManager - Documentation Technique & Walkthrough

## Option 4 : Recherche, Filtrage et Tri Avancés des Événements

Le module **Option 4 : Recherche, Filtrage et Tri des Événements** permet au traiteur de rechercher instantanément ses prestations en saisissant un mot-clé (dans le titre ou le lieu), en filtrant par statut (Planifié, Brouillon, Terminé, Annulé) et en triant la liste par date, titre ou nombre d'invités.

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

#### Dépôts & Services (`application/service` & `presentation/resource`)
* `EventResource.java` & `EventApplicationService.java` : Prise en charge des requêtes sur la liste des événements.
* Restitution sécurisée des prestations filtrées en fonction du traiteur connecté (isolation multi-tenant).

---

## Compilation et Validation

| Composant | Commande de build | Résultat |
| :--- | :--- | :--- |
| **Backend Java** | `.\mvnw.cmd compile` | 🟢 **BUILD SUCCESS** (65 fichiers source Java compilés sans erreur) |
| **Frontend Angular** | `npm run build` | 🟢 **BUILD SUCCESS** (Bundle généré en 5.8s sans erreur) |

---

## Guide d'Utilisation

1. Accédez à la liste des événements sur `http://localhost:4200/events`.
2. Tapez un mot ou un lieu dans la barre de recherche (ex: *Mariage* ou *Paris*). La liste se filtre automatiquement pendant votre saisie !
3. Sélectionnez un statut (ex: *Planifié*) pour restreindre la vue.
4. Modifiez l'ordre de tri pour voir les événements par date ou par nombre d'invités.
5. Cliquez sur **Réinitialiser** pour réafficher tous les événements.
