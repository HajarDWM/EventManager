# EventManager - Documentation Technique & Walkthrough

## Option 3 : Gestion des Invités par Événement

Le module **Option 3 : Gestion des Invités par Événement** permet aux traiteurs de gérer l'ensemble de leurs invités pour chaque événement planifié (suivi des présences, attribution des tables et prise en compte des régimes alimentaires).

---

## Architecture & Code Source

### 1. Backend Spring Boot (Clean Architecture Hexagonale)

#### Domaine (`domain/model`)
* `Guest.java` : Modèle métier représentant un invité (`id`, `eventId`, `fullName`, `email`, `phone`, `status`, `tableNumber`, `dietaryRequirements`).
* `GuestStatus.java` : Énumération des statuts d'invitation (`PENDING`, `CONFIRMED`, `DECLINED`).

#### Application & Ports (`application`)
* `GuestDTO.java` : DTO d'échange de données invité.
* `GuestMapper.java` : Convertisseur entre DTO, Domaine et Entités JPA.
* Ports d'entrée : `CreateGuestUseCase`, `GetGuestsByEventUseCase`, `UpdateGuestUseCase`, `DeleteGuestUseCase`.
* Port de sortie : `GuestRepositoryPort`.
* Service d'application : `GuestApplicationService.java` (avec contrôle multi-tenant vérifiant qu'un traiteur ne gère que les invités de ses propres événements).

#### Infrastructure & REST (`infrastructure` & `presentation`)
* Entité JPA : `GuestEntity.java` (Table SQL `guests`).
* Dépôt Spring Data JPA : `JpaGuestRepository.java`.
* Adaptateur de persistence : `GuestRepositoryAdapter.java`.
* Contrôleur REST : `GuestResource.java`
  - `GET /api/events/{eventId}/guests` : Récupérer la liste des invités d'un événement.
  - `POST /api/events/{eventId}/guests` : Ajouter un invité.
  - `PUT /api/guests/{id}` : Mettre à jour un invité.
  - `DELETE /api/guests/{id}` : Supprimer un invité.

---

### 2. Frontend Angular (Style OneUI 5.12)

* Service API : `guest.service.ts` (`src/app/core/services/guest.service.ts`).
* Composant Liste des Invités : `guest-list.ts` & `guest-list.html` (`src/app/features/events/components/guest-list/`).
  - **Tableau de bord :** 4 cartes de statistiques (Total Invités, Confirmés, En attente, Déclinés).
  - **Tableau interactif :** Badges colorés par statut, numéro de table et régimes alimentaires.
  - **Formulaire Modal :** Création et modification rapide d'un invité.
* Routage : Route `/events/:id/guests` dans `app.routes.ts`.
* Bouton d'accès : Bouton **Invités** (bleu info) dans le tableau des événements (`event-list.html`).

---

## Compilation et Validation

| Composant | Commande de build | Résultat |
| :--- | :--- | :--- |
| **Backend Java** | `.\mvnw.cmd compile` | 🟢 **BUILD SUCCESS** (65 fichiers source Java compilés sans erreur) |
| **Frontend Angular** | `npm run build` | 🟢 **BUILD SUCCESS** (Bundle généré en 7.2s sans erreur) |

---

## Instructions de Test pour l'Utilisateur

1. **Serveur Backend :** Relancez `.\mvnw.cmd spring-boot:run` dans le dossier Backend pour qu'Hibernate génère la table `guests`.
2. **Serveur Frontend :** Accédez à `http://localhost:4200/events`.
3. **Gestion des Invités :** Cliquez sur le bouton bleu **Invités** sur n'importe quel événement pour ajouter, modifier ou supprimer des invités.
