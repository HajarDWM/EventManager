-- V32__Ten_diverse_test_events.sql
-- 10 Événements de test complets et diversifiés pour valider tous les workflows traiteur, menus, choix invités, budget et tâches.

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Nettoyage préalable pour ré-exécutabilité sans conflits
DELETE FROM event_expenses WHERE event_id BETWEEN 201 AND 210;
DELETE FROM event_tasks WHERE event_id BETWEEN 201 AND 210;
DELETE FROM guests WHERE event_id BETWEEN 201 AND 210;
DELETE FROM menu_items WHERE event_id BETWEEN 201 AND 210;
DELETE FROM events WHERE id BETWEEN 201 AND 210;

-- ============================================================================
-- 1. INSERTION DES 10 ÉVÉNEMENTS (Tied to Caterer 20 - Rosa)
-- ============================================================================

INSERT INTO events (
    id, title, event_date, location, guest_count, status, caterer_id, 
    archived, meal_type, digital_template_id, parking_location, invitation_subtitle, 
    is_paid_event, ticket_price, currency, location_map_url, client_id,
    table_shape, table_capacity, tables_count, invitation_token
) VALUES 
-- Événement 201 : Formule Mixte (Entrée Buffet + Plat Chaud à table avec Choix + Desserts Buffet)
(
    201,
    'Test 01 - Mariage Royal Al Jawhara (Mixte: Buffet Entrée + Plat Choix)',
    '2026-11-20 18:00:00',
    'Palais des Congrès, Marrakech',
    120,
    'PLANNED',
    20,
    FALSE,
    'MIX,BUFFET_ENTREES,PLATS_FIXES,COURSE_MAIN,BUFFET_DESSERTS,BUFFET_BEVERAGES,GUEST_CHOICE,CHOICE_MAIN',
    1,
    'Parking VIP Nord - Avenue Mohammed VI',
    'Le Mariage de Zineb & Youssef',
    FALSE,
    0.0,
    'MAD',
    'https://maps.google.com/?q=Marrakech',
    3,
    'ROUND',
    10,
    12,
    'event-token-test-201'
),

-- Événement 202 : Formule Mixte avec Plat Unique à l'Entrée (Tester l'auto-sélection à l'Entrée)
(
    202,
    'Test 02 - Soirée Prestige & Dégustation (Mixte: 1 Entrée Auto + Choix Plat)',
    '2026-11-25 19:30:00',
    'Domaine de la Palmeraie, Marrakech',
    80,
    'PLANNED',
    20,
    FALSE,
    'MIX,PLATS_FIXES,COURSE_STARTER,COURSE_MAIN,BUFFET_DESSERTS,BUFFET_BEVERAGES,GUEST_CHOICE,CHOICE_STARTER,CHOICE_MAIN',
    2,
    'Parking Principal du Domaine',
    'Dîner de Gala Annuel',
    FALSE,
    0.0,
    'MAD',
    'https://maps.google.com/?q=Marrakech',
    4,
    'ROUND',
    8,
    10,
    'event-token-test-202'
),

-- Événement 203 : Formule Plats Fixes avec Choix sur TOUS les services (Entrée + Plat + Dessert)
(
    203,
    'Test 03 - Gala d\'Exception Palais des Roses (À table: Choix Entrée + Plat + Dessert)',
    '2026-12-05 20:00:00',
    'Hôtel Hyatt Regency, Place des Nations Unies, Casablanca',
    150,
    'PLANNED',
    20,
    FALSE,
    'PLATS_FIXES,COURSE_STARTER,COURSE_MAIN,COURSE_DESSERT,COURSE_BEVERAGE,GUEST_CHOICE,CHOICE_STARTER,CHOICE_MAIN,CHOICE_DESSERT',
    3,
    'Parking Indigo Sous-sol - Niveau -1',
    'Soirée de Bienfaisance',
    FALSE,
    0.0,
    'MAD',
    'https://maps.google.com/?q=Casablanca',
    5,
    'ROUND',
    10,
    15,
    'event-token-test-203'
),

-- Événement 204 : Formule Plats Fixes avec Choix UNIQUEMENT sur le Plat Principal (Entrée et Dessert fixes)
(
    204,
    'Test 04 - Fiançailles Diamant Salma & Karim (À table: Entrée & Dessert Fixes + Choix Plat)',
    '2026-12-12 17:30:00',
    'Villa Blanche, Anfa Supérieur, Casablanca',
    60,
    'PLANNED',
    20,
    FALSE,
    'PLATS_FIXES,COURSE_STARTER,COURSE_MAIN,COURSE_DESSERT,COURSE_BEVERAGE,GUEST_CHOICE,CHOICE_MAIN',
    7,
    'Service Voiturier à l\'entrée',
    'Les Fiançailles de Salma & Karim',
    FALSE,
    0.0,
    'MAD',
    'https://maps.google.com/?q=Casablanca+Anfa',
    3,
    'ROUND',
    10,
    6,
    'event-token-test-204'
),

-- Événement 205 : Formule Plats Fixes SANS Choix (Menu unique servi d'office / Indicatif)
(
    205,
    'Test 05 - Banquet Beldi Traditionnel (À table: Menu Unique Fixe Sans Choix)',
    '2026-10-15 13:00:00',
    'Riad Al Andalous, Fès Médina',
    90,
    'COMPLETED',
    20,
    FALSE,
    'PLATS_FIXES,COURSE_STARTER,COURSE_MAIN,COURSE_DESSERT,COURSE_BEVERAGE,MENU_INDICATIF',
    15,
    'Parking Bab Boujloud Fès',
    'L\'Aqiqah de Rayan',
    FALSE,
    0.0,
    'MAD',
    'https://maps.google.com/?q=Fes+Boujloud',
    4,
    'ROUND',
    10,
    9,
    'event-token-test-205'
),

-- Événement 206 : Formule 100% Buffet Libre (Self-service complet)
(
    206,
    'Test 06 - Garden Party & Barbecue Festif (100% Buffet Libre)',
    '2026-11-18 12:30:00',
    'Club Équestre Dar Es Salam, Rabat',
    200,
    'PLANNED',
    20,
    FALSE,
    'BUFFET,BUFFET_STANDARD,BUFFET_VEG,BUFFET_HALAL,BUFFET_BEVERAGES',
    4,
    'Grand Parking Club Équestre Allée des Chênes',
    'Événement d\'Entreprise',
    FALSE,
    0.0,
    'MAD',
    'https://maps.google.com/?q=Rabat+Dar+Es+Salam',
    5,
    'RECTANGULAR',
    8,
    25,
    'event-token-test-206'
),

-- Événement 207 : Formule Mixte Inversée (Entrée à Table, Plat Chaud à Table avec choix, Desserts en Buffet)
(
    207,
    'Test 07 - Dîner des Ambassadeurs (Mixte: Entrée Table + Plat Choix + Dessert Buffet)',
    '2026-12-20 20:00:00',
    'Hôtel Sofitel Jardin des Roses, Rabat',
    70,
    'PLANNED',
    20,
    FALSE,
    'MIX,PLATS_FIXES,COURSE_STARTER,COURSE_MAIN,BUFFET_DESSERTS,BUFFET_BEVERAGES,GUEST_CHOICE,CHOICE_MAIN',
    3,
    'Parking Privé Sofitel Rabat',
    'Dîner de Gala Diplomatique',
    FALSE,
    0.0,
    'MAD',
    'https://maps.google.com/?q=Rabat+Sofitel',
    3,
    'ROUND',
    10,
    7,
    'event-token-test-207'
),

-- Événement 208 : Formule Mixte (Entrée Buffet, Plat Chaud et Dessert à Table avec choix)
(
    208,
    'Test 08 - Célébration Tahara & Henné (Mixte: Entrée Buffet + Plat & Dessert Choix)',
    '2026-11-22 17:00:00',
    'Palais des Fêtes Al Firdaous, Salé',
    100,
    'PLANNED',
    20,
    FALSE,
    'MIX,BUFFET_ENTREES,PLATS_FIXES,COURSE_MAIN,COURSE_DESSERT,BUFFET_BEVERAGES,GUEST_CHOICE,CHOICE_MAIN,CHOICE_DESSERT',
    8,
    'Esplanade de stationnement Al Firdaous',
    'Soirée Henné de Ghita',
    FALSE,
    0.0,
    'MAD',
    'https://maps.google.com/?q=Sale+Al+Firdaous',
    4,
    'ROUND',
    10,
    10,
    'event-token-test-208'
),

-- Événement 209 : Événement Payant avec Billetterie (Ticketing + Formule Plats Fixes avec Choix)
(
    209,
    'Test 09 - Conférence Tech & Networking Summit (Payant 350 DH + Choix Plat)',
    '2026-12-08 09:00:00',
    'Technopark Casablanca, Route de Nouaceur',
    110,
    'PLANNED',
    20,
    FALSE,
    'PLATS_FIXES,COURSE_STARTER,COURSE_MAIN,COURSE_DESSERT,GUEST_CHOICE,CHOICE_MAIN',
    11,
    'Parking Technopark P1 & P2',
    'Événement d\'Entreprise',
    TRUE,
    350.00,
    'MAD',
    'https://maps.google.com/?q=Technopark+Casablanca',
    5,
    'RECTANGULAR',
    6,
    18,
    'event-token-test-209'
),

-- Événement 210 : Formule Mixte (Entrée Buffet + Plat Choix + Dessert Buffet + Boisson Choix)
(
    210,
    'Test 10 - Anniversaire Jubilé d\'Or (Mixte: Choix Plat & Choix Boisson Bar)',
    '2026-11-30 19:00:00',
    'Villa des Hespérides, Tanger',
    85,
    'PLANNED',
    20,
    FALSE,
    'MIX,BUFFET_ENTREES,PLATS_FIXES,COURSE_MAIN,BUFFET_DESSERTS,PLATS_FIXES,COURSE_BEVERAGE,GUEST_CHOICE,CHOICE_MAIN,CHOICE_BEVERAGE',
    6,
    'Allée privée Villa des Hespérides',
    'L\'Anniversaire de Mehdi',
    FALSE,
    0.0,
    'MAD',
    'https://maps.google.com/?q=Tanger+Hesperides',
    3,
    'ROUND',
    10,
    9,
    'event-token-test-210'
);

-- ============================================================================
-- 2. INSERTION DE LA CARTE GASTRONOMIQUE / MENU ITEMS
-- ============================================================================

INSERT INTO menu_items (event_id, name, category, price_per_person, dietary_tag, description, image_url) VALUES
-- Event 201
(201, 'Plateau Découverte Salades Marocaines & Briouates', 'STARTER', 35.00, 'Halal', 'Assortiment de zaalouk d\'aubergine, salade méchouia parfumée, et briouates croustillantes aux crevettes royales.', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500'),
(201, 'Pastillas Croustillantes Miniatures', 'STARTER', 40.00, 'Halal', 'Mini pastillas dorées au poulet fermier et amandes concassées.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(201, 'Souris d\'Agneau Confite 7h au Miel & Pruneaux', 'MAIN', 85.00, 'Halal', 'Agneau tendre mijoté à basse température, jus ambré réduit à la cannelle et amandes effilées.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(201, 'Filet de Loup de Mer Rôti aux Herbes de l\'Atlas', 'MAIN', 95.00, 'Sans Gluten', 'Loup de mer sauvage de Méditerranée, écrasé de patate douce au cumin et émulsion citronnée.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500'),
(201, 'Tajine Berbère Bio & Quinoa Royal', 'MAIN', 65.00, 'Végétarien', 'Légumes du potager bio glacés au safran de Taliouine, pois chiches et quinoa croustillant.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'),
(201, 'Buffet de Pâtisseries Fines & Fontaine Chocolat', 'DESSERT', 45.00, 'Végétarien', 'Pastilla Jawhara miniature, cornes de gazelle, macarons et brochettes de fruits frais.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'),
(201, 'Bar à Mocktails Signatures & Thé à la Menthe', 'BEVERAGE', 25.00, 'Bio', 'Cocktails rafraîchissants fruits de la passion, mojito vierge et thé traditionnel de Fès.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'),

-- Event 202 (Important: Seulement 1 plat en STARTER pour tester l'auto-sélection !)
(202, 'Pastilla Fassie Traditionnelle au Pigeon & Amandes', 'STARTER', 55.00, 'Halal', 'Recette ancestrale aux pigeons fermiers, amandes dorées et cannelle pure de Ceylan.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(202, 'Médaillon de Veau Forestier & Purée Truffée', 'MAIN', 90.00, 'Halal', 'Filet de veau tendre poêlé, poêlée de cèpes et mousseline de pommes de terre à l\'huile de truffe.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(202, 'Pavé de Saumon Atlantique Laqué au Soja Doux', 'MAIN', 85.00, 'Sans Gluten', 'Saumon d\'Écosse rôti minute, graines de sésame grillées et tombée de jeunes pousses.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500'),
(202, 'Buffet Gourmandise des Chefs', 'DESSERT', 40.00, 'Végétarien', 'Entremets variés, verrines pana cotta mangue et mignardises.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'),
(202, 'Cocktail de Bienvenue & Eaux Minérales', 'BEVERAGE', 20.00, 'Bio', 'Nectar de grenade fraîche et eaux aromatisées au romarin.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'),

-- Event 203 (Choix sur TOUT : Entrée, Plat, Dessert)
(203, 'Carpaccio de Saint-Jacques aux Perles de Truffe', 'STARTER', 60.00, 'Sans Gluten', 'Fines lamelles de noix fraîches, huile d\'olive vierge extra de Chefchaouen et fleur de sel.', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500'),
(203, 'Foie Gras Poêlé & Chutney de Dattes Majhoul', 'STARTER', 65.00, 'Halal', 'Escalope de foie gras dorée à point, réduction au vinaigre de figue et pain brioché.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(203, 'Filet de Bœuf Rossini & Mousseline Panais', 'MAIN', 110.00, 'Halal', 'Cœur de filet charolais grillé, tranche de foie gras poêlé et sauce porto réduit.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(203, 'Dos de Cabillaud en Croûte d\'Herbes & Risotto Safran', 'MAIN', 95.00, 'Sans Gluten', 'Cabillaud sauvage nacré, risotto arborio onctueux au safran et asperges vertes.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500'),
(203, 'Risotto Onctueux aux Morilles & Asperges Sauvages', 'MAIN', 80.00, 'Végétarien', 'Riz carnaroli crémeux au parmesan 24 mois et champignons des bois.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'),
(203, 'Sphère Chocolat Grand Cru Guanaja & Cœur Praliné', 'DESSERT', 45.00, 'Végétarien', 'Coque de chocolat noir 70%, ganache montée au praliné noisette et coulis chaud.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'),
(203, 'Tartelette Sablée Déstructurée au Citron Meringué', 'DESSERT', 40.00, 'Végétarien', 'Crémeux aux citrons de Berkane, meringue italienne flambée et zeste de combawa.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'),
(203, 'Nectars de Fruits Exotiques & Eaux d\'Origine', 'BEVERAGE', 25.00, 'Bio', 'Service continu d\'eaux d\'Oulmès, Sidi Ali et nectars de mangue passion.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'),

-- Event 204 (Entrée et Dessert fixes, Choix sur le Plat Chaud uniquement)
(204, 'Salade Méditerranéenne au Homard & Agrumes', 'STARTER', 70.00, 'Sans Gluten', 'Queue de homard pochée, suprêmes d\'oranges et pamplemousses, vinaigrette balsamique blanc.', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500'),
(204, 'Épaule d\'Agneau Confite 12h & Patate Douce', 'MAIN', 90.00, 'Halal', 'Agneau de terroir fondant sous la fourchette, purée douce relevée à la coriandre fraîche.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(204, 'Lotte Rôtie au Beurre Safrané & Tagliatelles de Légumes', 'MAIN', 95.00, 'Sans Gluten', 'Médaillons de lotte fraîche dorés à la plancha, réduction crémeuse safranée.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500'),
(204, 'Pavlova Croustillante aux Fruits Rouges & Fruit de la Passion', 'DESSERT', 45.00, 'Végétarien', 'Meringue légère suisse, chantilly mascarpone vanille bourbon et coulis acidulé.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'),
(204, 'Mocktail Pétillant & Boissons Festives', 'BEVERAGE', 20.00, 'Bio', 'Cocktail signature framboise gingembre servi à l\'arrivée.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'),

-- Event 205 (Menu Fixe Traditionnel Beldi Sans Choix)
(205, 'Pastilla Impériale au Poulet & Amandes Grillées', 'STARTER', 50.00, 'Halal', 'Pastilla festive grand format dorée au four, saupoudrée de cannelle et sucre glace.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(205, 'Méchoui Royal d\'Agneau à l\'Étouffée', 'MAIN', 110.00, 'Halal', 'Quartier d\'agneau entier rôti selon la pure tradition marocaine, servi avec cumin et sel pur.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(205, 'Corbeille de Fruits d\'Exception & Pâtisseries de Fès', 'DESSERT', 40.00, 'Végétarien', 'Plateaux de cornes de gazelle, ghriba amande, fekkas et fruits de saison rafraîchissants.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'),
(205, 'Grand Service de Thé à la Menthe & Eau de Fleur d\'Oranger', 'BEVERAGE', 20.00, 'Bio', 'Thé vert gunpowder infusé à la menthe fraîche et arrosé selon la coutume.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'),

-- Event 206 (100% Buffet Libre)
(206, 'Salad Bar Fraîcheur & Tapas Méditerranéennes', 'STARTER', 30.00, 'Végétarien', 'Salade grecque, taboulé libanais à la menthe, guacamole maison et dips variés.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'),
(206, 'Show Cooking Barbecue & Brochettes Grillées', 'MAIN', 75.00, 'Halal', 'Brochettes de rumsteck mariné, aiguillettes de volaille au paprika doux, merguez artisanales.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(206, 'Buffet de Desserts & Pâtisseries Gourmandes', 'DESSERT', 35.00, 'Végétarien', 'Mini tartes aux fraises, brownies fondants, tiramisu café et carpaccio d\'ananas.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'),
(206, 'Bar à Smoothies & Jus Détox Frais', 'BEVERAGE', 20.00, 'Bio', 'Jus d\'orange pressé, smoothie mangue banane et citronnade fraîche à la menthe.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'),

-- Event 207 (Mixte Inversée: Entrée Table, Plat Choix Table, Desserts Buffet)
(207, 'Velouté de Châtaignes & Émulsion Truffe Blanche', 'STARTER', 45.00, 'Végétarien', 'Crème onctueuse de marrons réconfortante, éclats de noisettes torréfiées et écume de lait truffé.', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500'),
(207, 'Filet Mignon de Veau Braisé & Mousseline de Céleri', 'MAIN', 95.00, 'Halal', 'Veau fondant nappé de son jus réduit au romarin, légumes glacés au beurre.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(207, 'Pavé de Turbot Rôti & Émulsion au Beurre Blanc', 'MAIN', 105.00, 'Sans Gluten', 'Turbot d\'Atlantique poêlé minute, tombée d\'épinards et pommes fondantes.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500'),
(207, 'Buffet Impérial de Desserts & Mignardises', 'DESSERT', 45.00, 'Végétarien', 'Îles flottantes, mille-feuilles croustillants, verrines crème brûlée vanille.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'),
(207, 'Bar Lounge Boissons Chaudes & Froides', 'BEVERAGE', 20.00, 'Bio', 'Sélection de cafés d\'origine, thés rares et eaux parfumées.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'),

-- Event 208 (Mixte: Entrée Buffet + Plat & Dessert Choix Table)
(208, 'Buffet Entrées Délices du Maroc', 'STARTER', 35.00, 'Halal', 'Plateaux de mini briouates kefta et fromage, salade zaalouk et mechouia, pastillas individuelles.', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500'),
(208, 'Tajine de Veau Fondant aux Pruneaux & Sésame', 'MAIN', 85.00, 'Halal', 'Jarret de veau mijoté dans son jus onctueux aux épices, pruneaux moelleux et amandes frites.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(208, 'Poulet Fermier Beldi au Citron Confit & Olives Rouges', 'MAIN', 75.00, 'Halal', 'Coquelet doré au four avec sa charmoula traditionnelle et oignons caramélisés d\'Ait Ourir.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(208, 'Pastilla Jawhara Croustillante à la Crème d\'Amande', 'DESSERT', 40.00, 'Végétarien', 'Feuilles ouarka dorées superposées d\'une crème légère parfumée à la fleur d\'oranger.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'),
(208, 'Tartelette Croustillante au Chocolat Noir & Caramel Salé', 'DESSERT', 38.00, 'Végétarien', 'Pâte sablée pur beurre, ganache fondante et touche de sel d\'Ifrane.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'),
(208, 'Buffet de Boissons Fraîches & Jus Pressés', 'BEVERAGE', 18.00, 'Bio', 'Assortiment de boissons et thé servi à volonté.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'),

-- Event 209 (Événement Payant Billetterie + Choix Plat)
(209, 'Salade César Revisitée & Blanc de Poulet Rôti', 'STARTER', 35.00, 'Halal', 'Cœur de romaine croquante, copeaux de parmesan affiné et croûtons dorés à l\'huile d\'ail.', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500'),
(209, 'Wok d\'Émincé de Bœuf Sauce Teriyaki & Nouilles Soba', 'MAIN', 75.00, 'Halal', 'Filet de bœuf sauté vivement aux petits légumes croquants et sauce soja caramélisée.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(209, 'Pavé de Saumon Vapeur Douce & Légumes Verts', 'MAIN', 80.00, 'Sans Gluten', 'Saumon d\'élevage responsable, tombée de brocolis, asperges et sauce au yaourt aneth.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500'),
(209, 'Bowl Végétal au Quinoa, Avocat & Falafels Maison', 'MAIN', 65.00, 'Végétarien', 'Mélange énergétique de pois chiches dorés, graines de grenade et vinaigrette tahini.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'),
(209, 'Fondant Chocolat Noir Intense Cœur Coulant', 'DESSERT', 35.00, 'Végétarien', 'Gâteau au chocolat noir 66% servi tiède avec une boule de glace vanille de Madagascar.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'),

-- Event 210 (Mixte: Choix Plat & Choix Boisson)
(210, 'Buffet Apéritif Dînatoire & Canapés Gastronomiques', 'STARTER', 40.00, 'Halal', 'Toasts au saumon fumé, verrines de crabe et agrumes, feuilletés chauds au fromage de chèvre.', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500'),
(210, 'Carré d\'Agneau Rôti au Thym & Gratin Dauphinois', 'MAIN', 95.00, 'Halal', 'Côtes d\'agneau persillées dorées au four, gratin crémeux à la muscade.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
(210, 'Filet de Bar Rôti à la Plancha Sauce Vierge', 'MAIN', 90.00, 'Sans Gluten', 'Bar frais atlantique, concassée de tomates fraîches, câpres, citron et basilic.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500'),
(210, 'Gâteau Jubilé d\'Or Personnalisé & Buffet Sucré', 'DESSERT', 50.00, 'Végétarien', 'Pièce maîtresse aux feuilles d\'or comestibles, ganache pralinée et framboises fraîches.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'),
(210, 'Cocktail Signature Passion-Gingembre Épicé', 'BEVERAGE', 25.00, 'Bio', 'Mocktail rafraîchissant créé spécialement pour la soirée jubilé.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'),
(210, 'Mojito Royal Virgin Framboise & Menthe Poivrée', 'BEVERAGE', 25.00, 'Bio', 'Purée de framboises fraîches, eau pétillante et zeste de citron vert.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'),
(210, 'Thé Glacé Artisanal Pêche Blanche & Hibiscus Bio', 'BEVERAGE', 20.00, 'Bio', 'Infusion à froid de fleurs d\'hibiscus et nectar de pêche de verger.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500');

-- ============================================================================
-- 3. INSERTION DES INVITÉS & LIENS RSVP POUR TOUS LES ÉVÉNEMENTS
-- ============================================================================

INSERT INTO guests (
    event_id, full_name, email, phone, status, table_number, 
    dietary_requirements, group_name, payment_status, paid_amount, 
    invitation_token, invitation_expiry
) VALUES
-- Invités Event 201 (Test Mixte + Choix Plat)
(201, 'Amine Tazi', 'amine.tazi@demo.ma', '+212 6 61 11 22 33', 'CONFIRMED', 'Table 1 - Royale', 'Halal', 'Famille Marié', 'NOT_REQUIRED', 0.0, 'token-test-201-1', '2026-12-31 23:59:59'),
(201, 'Sara El Fassi', 'sara.elfassi@demo.ma', '+212 6 62 33 44 55', 'CONFIRMED', 'Table 1 - Royale', 'Sans Gluten', 'Famille Mariée', 'NOT_REQUIRED', 0.0, 'token-test-201-2', '2026-12-31 23:59:59'),
(201, 'Karim Bennani', 'karim.b@demo.ma', '+212 6 63 55 66 77', 'CONFIRMED', 'Table 2 - Saphir', 'Végétarien', 'Amis Proches', 'NOT_REQUIRED', 0.0, 'token-test-201-3', '2026-12-31 23:59:59'),
(201, 'Leila Cherkaoui', 'leila.ch@demo.ma', '+212 6 64 77 88 99', 'PENDING', 'Table 2 - Saphir', 'Aucun', 'Amis Proches', 'NOT_REQUIRED', 0.0, 'token-test-201-4', '2026-12-31 23:59:59'),
(201, 'Mehdi Chraibi', 'mehdi.chr@demo.ma', '+212 6 65 99 00 11', 'DECLINED', 'Non assigné', 'Allergie Fruits de Mer', 'Collègues', 'NOT_REQUIRED', 0.0, 'token-test-201-5', '2026-12-31 23:59:59'),

-- Invités Event 202 (Test Plat unique Entrée)
(202, 'Driss Alami', 'driss.alami@demo.ma', '+212 6 71 22 33 44', 'CONFIRMED', 'Table Honneur A', 'Halal', 'VIP', 'NOT_REQUIRED', 0.0, 'token-test-202-1', '2026-12-31 23:59:59'),
(202, 'Nadia Belkahia', 'nadia.b@demo.ma', '+212 6 72 33 44 55', 'CONFIRMED', 'Table Honneur A', 'Sans Gluten', 'Direction', 'NOT_REQUIRED', 0.0, 'token-test-202-2', '2026-12-31 23:59:59'),
(202, 'Omar Kabbaj', 'omar.k@demo.ma', '+212 6 73 44 55 66', 'PENDING', 'Table Honneur B', 'Aucun', 'Partenaires', 'NOT_REQUIRED', 0.0, 'token-test-202-3', '2026-12-31 23:59:59'),
(202, 'Fatima Zahra Mansouri', 'fz.m@demo.ma', '+212 6 74 55 66 77', 'DECLINED', 'Non assigné', 'Aucun', 'Partenaires', 'NOT_REQUIRED', 0.0, 'token-test-202-4', '2026-12-31 23:59:59'),

-- Invités Event 203 (Test Choix 3 services)
(203, 'Sultan Moulay Hicham', 'hicham.s@demo.ma', '+212 6 81 11 22 33', 'CONFIRMED', 'Table Diamant 1', 'Halal', 'VIP d\'Honneur', 'NOT_REQUIRED', 0.0, 'token-test-203-1', '2026-12-31 23:59:59'),
(203, 'Mme Sophia Berrada', 'sophia.b@demo.ma', '+212 6 82 22 33 44', 'CONFIRMED', 'Table Diamant 1', 'Sans Gluten', 'Bienfaiteurs', 'NOT_REQUIRED', 0.0, 'token-test-203-2', '2026-12-31 23:59:59'),
(203, 'Ingénieur Yassine Naciri', 'yassine.n@demo.ma', '+212 6 83 33 44 55', 'CONFIRMED', 'Table Diamant 2', 'Végétarien', 'Donateurs', 'NOT_REQUIRED', 0.0, 'token-test-203-3', '2026-12-31 23:59:59'),
(203, 'Khadija Senhaji', 'khadija.s@demo.ma', '+212 6 84 44 55 66', 'PENDING', 'Table Diamant 2', 'Aucun', 'Invités d\'honneur', 'NOT_REQUIRED', 0.0, 'token-test-203-4', '2026-12-31 23:59:59'),

-- Invités Event 204 (Test Choix Plat seul)
(204, 'Salma Benjelloun', 'salma.b@demo.ma', '+212 6 91 10 20 30', 'CONFIRMED', 'Table Famille 1', 'Halal', 'Famille', 'NOT_REQUIRED', 0.0, 'token-test-204-1', '2026-12-31 23:59:59'),
(204, 'Karim Tlemcani', 'karim.t@demo.ma', '+212 6 92 20 30 40', 'CONFIRMED', 'Table Famille 1', 'Sans Gluten', 'Famille', 'NOT_REQUIRED', 0.0, 'token-test-204-2', '2026-12-31 23:59:59'),
(204, 'Meriem Lahlou', 'meriem.l@demo.ma', '+212 6 93 30 40 50', 'PENDING', 'Table Amis 2', 'Aucun', 'Amis', 'NOT_REQUIRED', 0.0, 'token-test-204-3', '2026-12-31 23:59:59'),

-- Invités Event 205 (Test Menu Indicatif Sans Choix)
(205, 'Hajj Abdelkader Lemsayeh', 'abdelkader@demo.ma', '+212 6 51 01 02 03', 'CONFIRMED', 'Table 1 - Beldi', 'Halal', 'Famille Proche', 'NOT_REQUIRED', 0.0, 'token-test-205-1', '2026-12-31 23:59:59'),
(205, 'Lalla Fatima Zahra', 'fatimazahra@demo.ma', '+212 6 52 02 03 04', 'CONFIRMED', 'Table 1 - Beldi', 'Sans Sel', 'Famille Proche', 'NOT_REQUIRED', 0.0, 'token-test-205-2', '2026-12-31 23:59:59'),
(205, 'Mourad Benmoussa', 'mourad.b@demo.ma', '+212 6 53 03 04 05', 'CONFIRMED', 'Table 2 - Beldi', 'Aucun', 'Voisins & Proches', 'NOT_REQUIRED', 0.0, 'token-test-205-3', '2026-12-31 23:59:59'),

-- Invités Event 206 (Test Buffet Libre)
(206, 'Tariq Boukhari', 'tariq.b@demo.ma', '+212 6 41 12 13 14', 'CONFIRMED', 'Table Jardin A', 'Halal', 'Département Tech', 'NOT_REQUIRED', 0.0, 'token-test-206-1', '2026-12-31 23:59:59'),
(206, 'Salwa Doukkali', 'salwa.d@demo.ma', '+212 6 42 13 14 15', 'CONFIRMED', 'Table Jardin A', 'Végétarien', 'Département Marketing', 'NOT_REQUIRED', 0.0, 'token-test-206-2', '2026-12-31 23:59:59'),
(206, 'Zouhair Guessous', 'zouhair.g@demo.ma', '+212 6 43 14 15 16', 'PENDING', 'Table Jardin B', 'Aucun', 'Département Finance', 'NOT_REQUIRED', 0.0, 'token-test-206-3', '2026-12-31 23:59:59'),

-- Invités Event 207 (Test Mixte Inversée)
(207, 'Son Excellence l\'Ambassadeur Laurent', 'ambassadeur@demo.fr', '+212 6 31 21 31 41', 'CONFIRMED', 'Table Diplomatique 1', 'Sans Porc', 'Corps Diplomatique', 'NOT_REQUIRED', 0.0, 'token-test-207-1', '2026-12-31 23:59:59'),
(207, 'Mme l\'Attachée Culturelle Valérie', 'valerie.c@demo.fr', '+212 6 32 22 32 42', 'CONFIRMED', 'Table Diplomatique 1', 'Sans Gluten', 'Corps Diplomatique', 'NOT_REQUIRED', 0.0, 'token-test-207-2', '2026-12-31 23:59:59'),
(207, 'Directeur Général Reda Bennis', 'reda.bennis@demo.ma', '+212 6 33 23 33 43', 'PENDING', 'Table Officielle 2', 'Aucun', 'Ministère des Affaires Étrangères', 'NOT_REQUIRED', 0.0, 'token-test-207-3', '2026-12-31 23:59:59'),

-- Invités Event 208 (Test Mixte Plat & Dessert Choix)
(208, 'Malika Filali', 'malika.f@demo.ma', '+212 6 21 31 41 51', 'CONFIRMED', 'Table Henné Honneur', 'Halal', 'Famille Filleule', 'NOT_REQUIRED', 0.0, 'token-test-208-1', '2026-12-31 23:59:59'),
(208, 'Kenza Benchekroun', 'kenza.b@demo.ma', '+212 6 22 32 42 52', 'CONFIRMED', 'Table Henné Honneur', 'Halal', 'Amies d\'Enfance', 'NOT_REQUIRED', 0.0, 'token-test-208-2', '2026-12-31 23:59:59'),
(208, 'Ghali Sefrioui', 'ghali.s@demo.ma', '+212 6 23 33 43 53', 'PENDING', 'Table Émeraude', 'Sans Lactose', 'Cousins', 'NOT_REQUIRED', 0.0, 'token-test-208-3', '2026-12-31 23:59:59'),

-- Invités Event 209 (Test Événement Payant & Billetterie)
(209, 'Hicham Dev Lead', 'hicham.dev@tech.ma', '+212 6 11 55 66 77', 'CONFIRMED', 'Table Hackathon 1', 'Halal', 'Speakers', 'PAID', 350.0, 'token-test-209-1', '2026-12-31 23:59:59'),
(209, 'Asmaa UX Designer', 'asmaa.ux@tech.ma', '+212 6 12 66 77 88', 'CONFIRMED', 'Table Hackathon 1', 'Végétarien', 'Participants VIP', 'UNPAID', 0.0, 'token-test-209-2', '2026-12-31 23:59:59'),
(209, 'Hamza Cloud Architect', 'hamza.cloud@tech.ma', '+212 6 13 77 88 99', 'PENDING', 'Table Tech 2', 'Sans Gluten', 'Participants', 'NOT_REQUIRED', 0.0, 'token-test-209-3', '2026-12-31 23:59:59'),
(209, 'Imane Product Owner', 'imane.po@tech.ma', '+212 6 14 88 99 00', 'CONFIRMED', 'Table Tech 2', 'Aucun', 'Participants', 'PAID', 350.0, 'token-test-209-4', '2026-12-31 23:59:59'),

-- Invités Event 210 (Test Mixte Choix Plat & Boisson)
(210, 'Mehdi Chafik', 'mehdi.chafik@demo.ma', '+212 6 01 23 45 67', 'CONFIRMED', 'Table Jubilé Or 1', 'Halal', 'Famille Proche', 'NOT_REQUIRED', 0.0, 'token-test-210-1', '2026-12-31 23:59:59'),
(210, 'Soraya Chafik', 'soraya.ch@demo.ma', '+212 6 02 34 56 78', 'CONFIRMED', 'Table Jubilé Or 1', 'Sans Gluten', 'Famille Proche', 'NOT_REQUIRED', 0.0, 'token-test-210-2', '2026-12-31 23:59:59'),
(210, 'Youssef El Amrani', 'youssef.ela@demo.ma', '+212 6 03 45 67 89', 'PENDING', 'Table Amis 50ans', 'Aucun', 'Amis de Promotion', 'NOT_REQUIRED', 0.0, 'token-test-210-3', '2026-12-31 23:59:59'),
(210, 'Nabil Hajji', 'nabil.hajji@demo.ma', '+212 6 04 56 78 90', 'DECLINED', 'Non assigné', 'Végétarien', 'Collègues', 'NOT_REQUIRED', 0.0, 'token-test-210-4', '2026-12-31 23:59:59');

-- ============================================================================
-- 4. INSERTION DU MODULE BUDGET (DÉPENSES & PRESTATAIRES)
-- ============================================================================

INSERT INTO event_expenses (event_id, category, description, amount, provider_name, expense_date) VALUES
-- Event 201
(201, 'CATERING', 'Acompte Service Traiteur Haute Gastronomie', 42000.00, 'Maison Gourmet & Traiteur', '2026-10-01 10:00:00'),
(201, 'DECORATION', 'Design floral d\'exception et centres de table', 14500.00, 'Floral Art Marrakech', '2026-10-05 14:30:00'),
(201, 'MUSIC', 'Orchestre Andalous & Prestation DJ VIP', 18000.00, 'Orchestre Al Anwar', '2026-10-10 11:00:00'),
(201, 'PHOTOGRAPHY', 'Reportage Photo 4K & Drone aérien', 8500.00, 'Studio Mirage Pro', '2026-10-15 16:00:00'),

-- Event 202
(202, 'VENUE', 'Location privatisation Domaine de la Palmeraie', 28000.00, 'Palmeraie Events Group', '2026-10-02 09:00:00'),
(202, 'CATERING', 'Frais de bouche & carte prestige du chef', 26000.00, 'Rosa Traiteur', '2026-10-08 15:00:00'),
(202, 'TECHNICAL', 'Sonorisation, jeux de lumière architecturale et écrans LED', 11000.00, 'Sound & Light Tech', '2026-10-12 16:30:00'),

-- Event 203
(203, 'VENUE', 'Location Salle Royale Palais des Roses', 35000.00, 'Hyatt Regency Casablanca', '2026-10-03 10:00:00'),
(203, 'CATERING', 'Dîner de prestige 4 services en gants blancs', 54000.00, 'Maison Gourmet Traiteur', '2026-10-14 11:30:00'),
(203, 'SECURITY', 'Agent de sécurité VIP et service voiturier', 6500.00, 'Protocole & Sécurité SA', '2026-10-18 17:00:00'),

-- Event 204
(204, 'CATERING', 'Menu dégustation Fiançailles et vaisselle dorée', 32000.00, 'Rosa Traiteur', '2026-10-04 12:00:00'),
(204, 'DECORATION', 'Arche florale d\'entrée et rideaux féériques', 9500.00, 'Luxury Wedding Decor', '2026-10-11 15:00:00'),

-- Event 205
(205, 'CATERING', 'Achat des agneaux de l\'Atlas et préparation méchoui', 16500.00, 'Boucherie Traditionnelle de Fès', '2026-09-20 08:30:00'),
(205, 'VENUE', 'Privatisation Riad Al Andalous Fès', 15000.00, 'Riad Al Andalous', '2026-09-22 10:00:00'),
(205, 'MUSIC', 'Troupe d\'Issawa et chantres traditionnels', 6000.00, 'Issawa de Fès', '2026-09-25 14:00:00'),

-- Event 206
(206, 'VENUE', 'Espaces extérieurs Club Équestre Rabat', 18000.00, 'Club Dar Es Salam', '2026-10-05 11:00:00'),
(206, 'CATERING', 'Barbecue show cooking et viandes marinées bio', 24000.00, 'Grill Master Traiteur', '2026-10-12 14:00:00'),
(206, 'BEVERAGES', 'Bar à jus frais et mixologie sans alcool', 5500.00, 'Juice Bar Events', '2026-10-16 16:00:00'),

-- Event 207
(207, 'CATERING', 'Menu gastronomique dîner diplomatique', 38000.00, 'Sofitel Gastronomie', '2026-10-06 10:30:00'),
(207, 'FLOWERS', 'Compositions florales de table diplomatique', 7000.00, 'Fleurs de Rabat', '2026-10-15 15:00:00'),

-- Event 208
(208, 'DECORATION', 'Décoration Henné vert émeraude et dorures', 8500.00, 'Traditions & Henné', '2026-10-07 11:00:00'),
(208, 'CATERING', 'Menu traditionnel beldi tajine et pastillas', 29000.00, 'Rosa Traiteur', '2026-10-13 16:00:00'),

-- Event 209
(209, 'VENUE', 'Amphithéâtre et salle de conférence Technopark', 22000.00, 'Technopark Casablanca', '2026-10-08 09:30:00'),
(209, 'CATERING', 'Pause-café matinale et déjeuner assis', 19500.00, 'Corporate Coffee & Catering', '2026-10-14 13:00:00'),
(209, 'LOGISTICS', 'Badges RFID, lanyards et dossiers conférenciers', 4500.00, 'Print Tech Solutions', '2026-10-17 15:30:00'),

-- Event 210
(210, 'CATERING', 'Banquet assis Jubilé d\'Or et gâteau sur mesure', 36000.00, 'Rosa Traiteur', '2026-10-09 10:00:00'),
(210, 'MUSIC', 'Violoniste de renom et spectacle visuel', 12000.00, 'Art & Symphony Tanger', '2026-10-16 18:00:00');

-- ============================================================================
-- 5. INSERTION DES TÂCHES & RÉTROPLANNING OPÉRATIONNEL
-- ============================================================================

INSERT INTO event_tasks (event_id, title, description, due_date, priority, status, assigned_to) VALUES
-- Event 201
(201, 'Validation finale de la fiche technique Formule Mixte', 'Vérifier la coordination entre le buffet d\'entrées et l\'envoi des plats chauds à table', '2026-11-05', 'HIGH', 'COMPLETED', 'Chef Damien'),
(201, 'Impression des cartons de table et récapitulatif des choix', 'Imprimer la liste des plats choisis par chaque invité par numéro de table', '2026-11-15', 'HIGH', 'IN_PROGRESS', 'Sophie Coordinatrice'),
(201, 'Briefing de la brigade de service et maîtres d\'hôtel', 'Rappeler les consignes d\'allergies alimentaires (Sans Gluten et Végétarien)', '2026-11-19', 'HIGH', 'TODO', 'Maître d\'Hôtel'),

-- Event 202
(202, 'Vérification de la sélection automatique de l\'entrée', 'Confirmer que l\'entrée unique s\'affiche directement comme validée pour le convive', '2026-11-10', 'HIGH', 'COMPLETED', 'Équipe Qualité'),
(202, 'Commande des morilles fraîches et pavés de saumon', 'Valider la chaîne de froid avec le poissonnier et primeur de Marrakech', '2026-11-20', 'MEDIUM', 'IN_PROGRESS', 'Achats Traiteur'),

-- Event 203
(203, 'Test du flux de sélection des 3 plats (Entrée, Plat, Dessert)', 'S\'assurer que le convive peut faire son choix fluide sur l\'ensemble des services', '2026-11-25', 'HIGH', 'COMPLETED', 'Damien'),
(203, 'Acheminement de la vaisselle en porcelaine et verres cristal', 'Livraison et inventaire au Palais des Roses', '2026-12-03', 'MEDIUM', 'TODO', 'Logistique'),

-- Event 204
(204, 'Contrôle des proportions de plats chauds commandés', 'Faire le ratio des choix entre Épaule d\'Agneau et Lotte rôtie', '2026-12-05', 'HIGH', 'TODO', 'Chef Exécutif'),

-- Event 205
(205, 'Bilan de clôture de l\'Aqiqah et satisfaction client', 'Réception de l\'avis des parents de Rayan et clôture comptable', '2026-10-16', 'LOW', 'COMPLETED', 'Relation Client'),

-- Event 206
(206, 'Installation des pergolas et stands de show cooking', 'Montage des barbecues sécurisés au Club Équestre', '2026-11-17', 'HIGH', 'TODO', 'Équipe Technique'),

-- Event 207
(207, 'Protocole officiel et vérification des préséances', 'Validation du plan de table avec l\'ambassade', '2026-12-18', 'HIGH', 'IN_PROGRESS', 'Directeur Protocole'),

-- Event 208
(208, 'Mise en place de l\'espace Henné et théière géante', 'Décoration florale et coussins brodés pour la mariée', '2026-11-21', 'MEDIUM', 'TODO', 'Décoratrice Salé'),

-- Event 209
(209, 'Vérification des paiements en ligne reçus sur la billetterie', 'Rapprochement bancaire des inscriptions confirmées (350 DH)', '2026-12-01', 'HIGH', 'IN_PROGRESS', 'Comptable'),

-- Event 210
(210, 'Dégustation des maquettes du gâteau jubilé d\'or', 'Validation du visuel et du goût avec M. Mehdi Chafik', '2026-11-22', 'MEDIUM', 'COMPLETED', 'Chef Pâtissier');
