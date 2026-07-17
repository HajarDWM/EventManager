# Documentation : Module "Événement" (Event)

Objectif : Module central de l'application permettant aux traiteurs de gérer leurs prestations (création, consultation). Ce module suit la Clean Architecture.

## Données de l'Événement
Les champs définis pour un événement sont :
- `title` (Titre, ex: "Mariage de Sophie")
- `eventDate` (Date et heure de l'événement)
- `location` (Lieu)
- `guestCount` (Nombre d'invités attendus)
- `status` (Brouillon, Planifié, Terminé, Annulé)
- `catererId` (L'ID du traiteur qui l'a créé)

## Architecture & Implémentation

### 1. Base de données (Flyway)
- `V2__Create_events_table.sql` : Script SQL pour créer la table `events` avec une clé étrangère vers `caterers`.

### 2. Couche Domaine (Le Cœur)
- `Event.java` : Entité métier.
- `EventStatus.java` : Enumération (`DRAFT`, `PLANNED`, `COMPLETED`, `CANCELLED`).
- `EventNotFoundException.java`

### 3. Couche Application (Orchestration)
- `EventDTO.java` : Objet de transfert.
- `EventMapper.java` : Mapper métier/DTO.
- `CreateEventUseCase.java` & `GetEventUseCase.java` : Ports entrants.
- `EventRepositoryPort.java` : Port sortant.
- `EventApplicationService.java` : Logique d'orchestration de la création et récupération d'événements.

### 4. Couche Infrastructure (Accès aux Données)
- `EventEntity.java` : Entité Hibernate (JPA).
- `EventRepository.java` : Interface Spring Data.
- `EventRepositoryAdapter.java` : Adaptateur implémentant le port.
- `EventPersistenceMapper.java` : Mapper entre le domaine et l'entité.

### 5. Couche Présentation (Routes Web)
- `EventResource.java` : Contrôleur REST (`POST /api/events` et `GET /api/events/{id}`).
