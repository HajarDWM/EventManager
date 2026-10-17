-- V14__Add_group_name_to_guests.sql
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'guests' AND column_name = 'group_name');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE guests ADD COLUMN group_name VARCHAR(100)', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
