-- V34__Ensure_unique_client_per_event.sql
-- Ensure test events 201..210 have distinct client accounts and unique access tokens
-- so that sharing or copying an event link/token opens only that specific event.

INSERT INTO clients (id, name, email, phone, access_link_token, access_link_expires_at)
VALUES 
(201, 'Zineb & Youssef (Mariage Al Jawhara)', 'jawhara@client.ma', '+212 6 01 02 03 04', MD5(CONCAT('client-token-201-', UUID())), '2026-12-31 23:59:59'),
(202, 'Club Dégustation Prestige', 'prestige@client.ma', '+212 6 02 03 04 05', MD5(CONCAT('client-token-202-', UUID())), '2026-12-31 23:59:59'),
(203, 'Comité Gala Palais des Roses', 'gala@client.ma', '+212 6 03 04 05 06', MD5(CONCAT('client-token-203-', UUID())), '2026-12-31 23:59:59'),
(204, 'Salma & Karim (Fiançailles)', 'fiancailles@client.ma', '+212 6 04 05 06 07', MD5(CONCAT('client-token-204-', UUID())), '2026-12-31 23:59:59'),
(205, 'Association Banquet Traditionnel', 'banquet@client.ma', '+212 6 05 06 07 08', MD5(CONCAT('client-token-205-', UUID())), '2026-12-31 23:59:59'),
(206, 'Hôte Garden Party', 'garden@client.ma', '+212 6 06 07 08 09', MD5(CONCAT('client-token-206-', UUID())), '2026-12-31 23:59:59'),
(207, 'Protocole Dîner des Ambassadeurs', 'ambassadeurs@client.ma', '+212 6 07 08 09 10', MD5(CONCAT('client-token-207-', UUID())), '2026-12-31 23:59:59'),
(208, 'Famille Tahara & Henné', 'tahara@client.ma', '+212 6 08 09 10 11', MD5(CONCAT('client-token-208-', UUID())), '2026-12-31 23:59:59'),
(209, 'Organisation Conférence Tech Summit', 'tech.summit@client.ma', '+212 6 09 10 11 12', MD5(CONCAT('client-token-209-', UUID())), '2026-12-31 23:59:59'),
(210, 'Jubilé d''Or Anniversaire', 'jubile@client.ma', '+212 6 10 11 12 13', MD5(CONCAT('client-token-210-', UUID())), '2026-12-31 23:59:59')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    email = VALUES(email),
    phone = VALUES(phone);

UPDATE events SET client_id = 201 WHERE id = 201;
UPDATE events SET client_id = 202 WHERE id = 202;
UPDATE events SET client_id = 203 WHERE id = 203;
UPDATE events SET client_id = 204 WHERE id = 204;
UPDATE events SET client_id = 205 WHERE id = 205;
UPDATE events SET client_id = 206 WHERE id = 206;
UPDATE events SET client_id = 207 WHERE id = 207;
UPDATE events SET client_id = 208 WHERE id = 208;
UPDATE events SET client_id = 209 WHERE id = 209;
UPDATE events SET client_id = 210 WHERE id = 210;
