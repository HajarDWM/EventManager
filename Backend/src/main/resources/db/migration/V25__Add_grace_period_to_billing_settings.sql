-- V25__Add_grace_period_to_billing_settings.sql
-- Ajout de la durée de période de grâce (en jours) aux paramètres de facturation globaux
ALTER TABLE billing_settings ADD COLUMN grace_period_days INT NOT NULL DEFAULT 10;
