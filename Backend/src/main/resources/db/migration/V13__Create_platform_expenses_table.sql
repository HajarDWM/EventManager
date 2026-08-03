DROP TABLE IF EXISTS platform_expenses;

CREATE TABLE platform_expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    expense_date DATETIME NOT NULL,
    category VARCHAR(50) NOT NULL
);

-- Seed initial mock expenses with explicit dates to avoid any syntax issues
INSERT INTO platform_expenses (description, amount, expense_date, category) VALUES
('Hébergement Serveur Cloud AWS', 120.00, '2026-07-19 10:00:00', 'SERVER'),
('Abonnement Stripe & Passerelle API', 45.00, '2026-07-14 14:30:00', 'TOOL'),
('Campagne Marketing Réseaux Sociaux', 75.00, '2026-06-19 09:15:00', 'MARKETING'),
('Licence Outil de Monitoring (Datadog)', 30.00, '2026-07-29 16:45:00', 'TOOL');
