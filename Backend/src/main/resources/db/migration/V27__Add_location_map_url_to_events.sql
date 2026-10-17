-- V27__Add_location_map_url_to_events.sql
SET @exist_map := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'events' AND column_name = 'location_map_url');
SET @sql_map := IF(@exist_map = 0, 'ALTER TABLE events ADD COLUMN location_map_url VARCHAR(1024)', 'SELECT 1');
PREPARE stmt_v27 FROM @sql_map;
EXECUTE stmt_v27;
DEALLOCATE PREPARE stmt_v27;
