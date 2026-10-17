-- V25__Add_grace_period_to_billing_settings.sql
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'billing_settings' AND column_name = 'grace_period_days');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE billing_settings ADD COLUMN grace_period_days INT NOT NULL DEFAULT 10', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
