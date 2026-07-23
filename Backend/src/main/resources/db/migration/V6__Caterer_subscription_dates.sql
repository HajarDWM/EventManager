ALTER TABLE caterers ADD COLUMN subscription_start_date DATETIME DEFAULT NULL;
ALTER TABLE caterers ADD COLUMN subscription_end_date DATETIME DEFAULT NULL;

-- Initialiser les dates pour les traiteurs déjà existants à 30 jours
UPDATE caterers 
SET subscription_start_date = NOW(), 
    subscription_end_date = DATE_ADD(NOW(), INTERVAL 30 DAY) 
WHERE subscription_start_date IS NULL;
