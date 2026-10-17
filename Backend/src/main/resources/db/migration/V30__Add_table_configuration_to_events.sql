-- V30__Add_table_configuration_to_events.sql
SET @exist_shape := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'events' AND column_name = 'table_shape');
SET @sql_shape := IF(@exist_shape = 0, 'ALTER TABLE events ADD COLUMN table_shape VARCHAR(50) DEFAULT ''ROUND'', ADD COLUMN table_capacity INT DEFAULT 10, ADD COLUMN tables_count INT DEFAULT NULL', 'SELECT 1');
PREPARE stmt_v30 FROM @sql_shape;
EXECUTE stmt_v30;
DEALLOCATE PREPARE stmt_v30;
