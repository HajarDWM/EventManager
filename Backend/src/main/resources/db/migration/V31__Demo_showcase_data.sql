-- V31__Demo_showcase_data.sql
-- Jeu de données de démonstration haut de gamme (Showcase Client Demo)

-- 1. Traiteur Démo Showcase
INSERT INTO caterers (id, business_name, email, password, account_status, role, subscription_plan, subscription_status)
VALUES (
    100,
    'Maison Gourmet Traiteur & Événements',
    'demo@eventmanager.com',
    '$2a$10$PtlQmVe.FlmAXZUmRLduvePhB6ecHGz0l/28plaTfSYo9u2at275e', -- demo12345
    'ACTIVE',
    'TRAITEUR',
    'PREMIUM',
    'ACTIVE'
)
ON DUPLICATE KEY UPDATE 
    business_name = VALUES(business_name),
    account_status = VALUES(account_status),
    subscription_plan = VALUES(subscription_plan),
    subscription_status = VALUES(subscription_status);

-- 2. Client Démo Showcase (Espace Client Collaboratif)
INSERT INTO clients (id, name, email, phone, access_link_token)
VALUES (
    100,
    'Sophie & Marc Laurent',
    'client@eventmanager.com',
    '+33 6 12 34 56 78',
    'demo-client-token'
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    email = VALUES(email),
    access_link_token = VALUES(access_link_token);

-- 3. Événements de Démonstration
-- Événement 1 : Mariage Château de Chambord (Événement Phare)
INSERT INTO events (
    id, title, event_date, location, guest_count, status, caterer_id, 
    archived, meal_type, digital_template_id, parking_location, invitation_subtitle, 
    is_paid_event, ticket_price, currency, location_map_url, client_id,
    table_shape, table_capacity, tables_count
) VALUES (
    101,
    'Mariage Féérique - Château de Chambord',
    '2026-11-28 17:00:00',
    'Château de Chambord, 41250 Chambord',
    150,
    'PLANNED',
    100,
    FALSE,
    'PLATS_FIXES',
    2,
    'Parking Visiteurs P2 - Accès VIP Nord',
    'Célébration de notre union & Dîner de prestige aux chandelles',
    FALSE,
    0.0,
    'EUR',
    'https://maps.google.com/?q=Chateau+de+Chambord',
    100,
    'ROUND',
    10,
    15
)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    location = VALUES(location),
    parking_location = VALUES(parking_location),
    invitation_subtitle = VALUES(invitation_subtitle),
    guest_count = VALUES(guest_count),
    status = VALUES(status);

-- Événement 2 : Gala Annuel Corporate
INSERT INTO events (
    id, title, event_date, location, guest_count, status, caterer_id, 
    archived, meal_type, digital_template_id, parking_location, invitation_subtitle, 
    is_paid_event, ticket_price, currency, location_map_url, client_id,
    table_shape, table_capacity, tables_count
) VALUES (
    102,
    'Gala Annuel Tech Horizons 2026',
    '2026-12-15 19:30:00',
    'Palais des Congrès, 75017 Paris',
    280,
    'PLANNED',
    100,
    FALSE,
    'BUFFET',
    3,
    'Parking Indigo Porte Maillot (Niveau -2)',
    'Soirée de Gala & Cérémonie des Trophées de l''Innovation',
    FALSE,
    0.0,
    'EUR',
    'https://maps.google.com/?q=Palais+des+Congres+Paris',
    NULL,
    'RECTANGULAR',
    8,
    35
)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    location = VALUES(location),
    parking_location = VALUES(parking_location),
    invitation_subtitle = VALUES(invitation_subtitle),
    guest_count = VALUES(guest_count),
    status = VALUES(status);

-- Événement 3 : Séminaire d'Entreprise Clôturé
INSERT INTO events (
    id, title, event_date, location, guest_count, status, caterer_id, 
    archived, meal_type, digital_template_id, parking_location, invitation_subtitle, 
    is_paid_event, ticket_price, currency, location_map_url, client_id,
    table_shape, table_capacity, tables_count
) VALUES (
    103,
    'Séminaire d''Entreprise - Banque & Finance',
    '2026-09-20 09:00:00',
    'Domaine de Chantilly, 60500 Chantilly',
    45,
    'COMPLETED',
    100,
    FALSE,
    'PLATS_FIXES',
    3,
    'Parking Principal du Domaine',
    'Journée d''Étude & Dîner de Clôture Annuelle',
    FALSE,
    0.0,
    'EUR',
    'https://maps.google.com/?q=Domaine+de+Chantilly',
    NULL,
    'ROUND',
    6,
    8
)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    location = VALUES(location),
    parking_location = VALUES(parking_location),
    invitation_subtitle = VALUES(invitation_subtitle),
    guest_count = VALUES(guest_count),
    status = VALUES(status);

-- 4. Carte Gastronomique & Menus (Événement 101)
DELETE FROM menu_items WHERE event_id = 101;
INSERT INTO menu_items (event_id, name, category, price_per_person, dietary_tag, description, image_url) VALUES
(101, 'Foie Gras Poêlé & Chutney de Figue', 'STARTER', 22.50, 'Sans Gluten', 'Foie gras de canard du Sud-Ouest poêlé minute, réduction balsamique et brioche toastée.', NULL),
(101, 'Carpaccio de Saint-Jacques & Émulsion Yuzu', 'STARTER', 24.00, 'Bio', 'Noix de Saint-Jacques fraîches tranchées fin, perles d''huile d''olive et pousses aromatiques.', NULL),
(101, 'Filet de Bœuf Rossini & Mousseline Truffée', 'MAIN', 44.00, 'Halal', 'Cœur de filet charolais poêlé, lamelle de truffe d''hiver et jus corsé réduit au porto.', NULL),
(101, 'Risotto Arborio aux Cèpes Sauvages', 'MAIN', 34.00, 'Végétarien', 'Riz crémeux préparé minute au bouillon de légumes bio et Parmigiano Reggiano 24 mois.', NULL),
(101, 'Pièce Montée Macarons & Chocolat Grand Cru', 'DESSERT', 18.00, 'Végétarien', 'Choux caramélisés croustillants garnis à la vanille bourbon et ganache Valrhona.', NULL),
(101, 'Champagne Brut Réserve & Vins Fins Sélection', 'BEVERAGE', 28.00, 'Sans Alcool disponible', 'Service à discrétion durant le vin d''honneur et l''ensemble du dîner.', NULL);

-- 5. Liste des Invités & Statuts RSVP (Événement 101)
DELETE FROM guests WHERE event_id = 101;
INSERT INTO guests (
    event_id, full_name, email, phone, status, table_number, 
    dietary_requirements, group_name, payment_status, paid_amount, 
    invitation_token, invitation_expiry
) VALUES
(101, 'Alexandre Dumas', 'alexandre.dumas@demo.fr', '+33 6 01 02 03 04', 'CONFIRMED', 'Table Royale (Honneur)', 'Sans Gluten', 'Famille Marié', 'NOT_REQUIRED', 0.0, 'demo-rsvp-token-1', '2026-12-31 23:59:59'),
(101, 'Éléonore de Montmirail', 'eleonore.montmirail@demo.fr', '+33 6 11 22 33 44', 'CONFIRMED', 'Table Royale (Honneur)', 'Végétarien', 'Famille Mariée', 'NOT_REQUIRED', 0.0, 'demo-rsvp-token-2', '2026-12-31 23:59:59'),
(101, 'Dr. Julien Fontaine', 'j.fontaine@demo.fr', '+33 6 55 44 33 22', 'CONFIRMED', 'Table Orchidée', 'Halal', 'Amis Proches', 'NOT_REQUIRED', 0.0, 'demo-rsvp-token-3', '2026-12-31 23:59:59'),
(101, 'Camille Claudel', 'camille.claudel@demo.fr', '+33 6 99 88 77 66', 'CONFIRMED', 'Table Orchidée', 'Allergie Fruits de mer', 'Amis Proches', 'NOT_REQUIRED', 0.0, 'demo-rsvp-token-4', '2026-12-31 23:59:59'),
(101, 'Maxime Bellanger', 'maxime.b@demo.fr', '+33 6 44 33 22 11', 'PENDING', 'Table Saphir', 'Aucun', 'Collègues', 'NOT_REQUIRED', 0.0, 'demo-rsvp-token-5', '2026-12-31 23:59:59'),
(101, 'Inès Benali', 'ines.benali@demo.fr', '+33 6 77 88 99 00', 'PENDING', 'Table Saphir', 'Halal', 'Collègues', 'NOT_REQUIRED', 0.0, 'demo-rsvp-token-6', '2026-12-31 23:59:59'),
(101, 'Thomas Leroy', 't.leroy@demo.fr', '+33 6 22 33 44 55', 'DECLINED', 'Non assigné', 'Aucun', 'Amis', 'NOT_REQUIRED', 0.0, 'demo-rsvp-token-7', '2026-12-31 23:59:59'),
(101, 'Sarah Bernhardt', 'sarah.b@demo.fr', '+33 6 33 44 55 66', 'CONFIRMED', 'Table Diamant (VIP)', 'Végétarien', 'VIP', 'NOT_REQUIRED', 0.0, 'demo-rsvp-token-8', '2026-12-31 23:59:59');

-- 6. Checklist & Rétroplanning Opérationnel (Événement 101)
DELETE FROM event_tasks WHERE event_id = 101;
INSERT INTO event_tasks (event_id, title, description, due_date, priority, status, assigned_to) VALUES
(101, 'Sélection et dégustation du menu gastronomique', 'Validation finale des fiches recettes avec le chef exécutif', '2026-10-15', 'HIGH', 'COMPLETED', 'Chef Damien'),
(101, 'Validation du plan de table et récapitulatif des régimes', 'Vérifier le placement des convives et l''absence d''allergènes critiques', '2026-11-10', 'HIGH', 'COMPLETED', 'Sophie (Coordinatrice)'),
(101, 'Commande des matières premières d''exception et vins', 'Passer commande auprès des producteurs locaux certifiés Bio et AOP', '2026-11-18', 'HIGH', 'IN_PROGRESS', 'Damien (Achats)'),
(101, 'Installation des postes de dressage et office traiteur', 'Montage du matériel réfrigéré et des étuves au Château de Chambord', '2026-11-27', 'MEDIUM', 'TODO', 'Équipe Technique'),
(101, 'Briefing général de la brigade de service et maîtres d''hôtel', 'Point opérationnel sur le timing du service, les VIP et les régimes spéciaux', '2026-11-28', 'HIGH', 'TODO', 'Maître d''Hôtel'),
(101, 'Départ des navettes retour et nettoyage des offices', 'Contrôle des états des lieux et restitution des locaux au régisseur du domaine', '2026-11-29', 'LOW', 'TODO', 'Régisseur Général');