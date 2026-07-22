-- V3__Super_admin_features.sql
-- Extension du schéma pour l'administration globale (Super-Admin)

-- 1. Ajout des colonnes de rôle et d'abonnement pour les traiteurs
ALTER TABLE caterers ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'TRAITEUR';
ALTER TABLE caterers ADD COLUMN subscription_plan VARCHAR(50) NOT NULL DEFAULT 'FREE';
ALTER TABLE caterers ADD COLUMN subscription_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';

-- Index de recherche pour les administrateurs
CREATE INDEX idx_caterers_role ON caterers(role);

-- 2. Insertion du compte Super-Admin par défaut (Mot de passe: admin12345)
INSERT INTO caterers (business_name, email, password, stripe_customer_id, account_status, role, subscription_plan, subscription_status)
VALUES (
    'Super Admin', 
    'admin@eventmanager.com', 
    '$2a$10$e0rQQtFlODkZ/L/zTlhG1OQeT3l9J9/U.4V5F2O9GfQvD6fC1.qvy', 
    NULL, 
    'ACTIVE', 
    'SUPER_ADMIN', 
    'PREMIUM', 
    'ACTIVE'
);

-- 3. Table des modèles d'invitations
CREATE TABLE IF NOT EXISTS invitation_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertion de quelques modèles par défaut
INSERT INTO invitation_templates (name, subject, content)
VALUES 
('Modèle Mariage Élégant', 'Invitation à notre mariage - {{guest_name}}', 'Bonjour {{guest_name}},\n\nNous avons l''immense joie de vous inviter à célébrer notre mariage.\n\nDate : {{event_date}}\nLieu : {{event_location}}\n\nMerci de nous confirmer votre présence avant le retour de ce mail.\n\nChaleureusement.'),
('Modèle Anniversaire Festif', 'Prêt pour faire la fête ? Invitation Anniversaire', 'Salut {{guest_name}},\n\nC''est bientôt mon anniversaire ! Je t''attends pour faire la fête le {{event_date}} à {{event_location}}.\n\nConfirme-moi vite si tu seras de la partie !\n\nÀ très vite !'),
('Modèle Événement Professionnel', 'Invitation : {{event_title}}', 'Cher(e) {{guest_name}},\n\nNous vous prions de bien vouloir honorer de votre présence notre événement : {{event_title}} qui se déroulera le {{event_date}} à {{event_location}}.\n\nCordialement,\nL''équipe d''organisation.');

-- 4. Table des paramètres de facturation globaux
CREATE TABLE IF NOT EXISTS billing_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vat_rate DOUBLE NOT NULL DEFAULT 20.0,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    subscription_price_standard DOUBLE NOT NULL DEFAULT 29.90,
    subscription_price_premium DOUBLE NOT NULL DEFAULT 59.90,
    billing_contact_email VARCHAR(255) NOT NULL DEFAULT 'billing@eventmanager.com',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertion de la configuration par défaut unique (ID 1)
INSERT INTO billing_settings (id, vat_rate, currency, subscription_price_standard, subscription_price_premium, billing_contact_email)
VALUES (1, 20.0, 'EUR', 29.90, 59.90, 'billing@eventmanager.com');
