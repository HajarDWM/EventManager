-- V33__Add_mask_guest_last_name_to_events.sql
SET @exist_mask := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'events' AND column_name = 'mask_guest_last_name');
SET @sql_mask := IF(@exist_mask = 0, 'ALTER TABLE events ADD COLUMN mask_guest_last_name BOOLEAN NOT NULL DEFAULT FALSE', 'SELECT 1');
PREPARE stmt_v33 FROM @sql_mask;
EXECUTE stmt_v33;
DEALLOCATE PREPARE stmt_v33;
