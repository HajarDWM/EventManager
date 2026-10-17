-- V26__Add_subscription_dates_to_transactions.sql
SET @exist_start := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'transactions' AND column_name = 'start_date');
SET @sql_start := IF(@exist_start = 0, 'ALTER TABLE transactions ADD COLUMN start_date DATETIME NULL, ADD COLUMN end_date DATETIME NULL', 'SELECT 1');
PREPARE stmt_v26 FROM @sql_start;
EXECUTE stmt_v26;
DEALLOCATE PREPARE stmt_v26;
