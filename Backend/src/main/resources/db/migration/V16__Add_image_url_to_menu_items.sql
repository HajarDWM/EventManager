-- V16__Add_image_url_to_menu_items.sql
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'menu_items' AND column_name = 'image_url');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE menu_items ADD COLUMN image_url VARCHAR(255)', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
