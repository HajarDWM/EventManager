# Documentation : Isolation Multi-Tenant (Sécurité)

Objectif : Sécuriser l'application pour qu'un Traiteur ne puisse créer, modifier et consulter que **ses propres événements**. Le système utilisera le Token JWT pour identifier le traiteur sans jamais faire confiance aux données envoyées par le client (Front-end ou Postman).

## Implémentation

### 1. Couche Infrastructure (Sécurité Avancée)
- `infrastructure/security/model/CatererUserDetails.java` : Une classe personnalisée qui étend l'utilisateur Spring Security pour y stocker le `catererId`.
- `UserDetailsServiceImpl.java` : Modifié pour retourner `CatererUserDetails` au lieu de l'utilisateur par défaut.

### 2. Couche Application (Port de Sécurité)
Pour respecter la Clean Architecture, la couche Application ne doit pas importer de classes "Spring Security".
- `application/port/out/SecurityContextPort.java` : Une interface pure (Port) déclarant la méthode `Long getCurrentCatererId();`.
- `infrastructure/security/adapter/SpringSecurityContextAdapter.java` : L'adaptateur (Infrastructure) qui implémente le port et lit le contexte Spring Security.

### 3. Couche Domaine
- `domain/exception/UnauthorizedAccessException.java` : Exception levée si un traiteur essaie de lire l'événement d'un autre.

### 4. Couche Application (Logique de Protection)
- `EventApplicationService.java` : 
  - *Création* : Lors de la création d'un événement, le service force le `catererId` avec celui récupéré via le `SecurityContextPort`. Les tentatives de piratage via Postman seront ignorées.
  - *Lecture* : Lorsqu'on récupère un événement par son ID, le service vérifie si `event.getCatererId() == currentCatererId`. Sinon, accès refusé.
- `application/port/in/GetEventUseCase.java` et `EventApplicationService.java` : Ajout d'une méthode pour récupérer **tous** les événements du traiteur connecté (`List<EventDTO> getAllEvents()`).

### 5. Couche Présentation (Contrôleur)
- `EventResource.java` : 
  - Ajout d'une nouvelle route `GET /api/events` (sans ID) pour lister la totalité des événements du traiteur connecté.
