CREATE TABLE IF NOT EXISTS clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    access_link_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SET @exist_client_col := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'events' AND column_name = 'client_id');
SET @sql_client_col := IF(@exist_client_col = 0, 'ALTER TABLE events ADD COLUMN client_id BIGINT', 'SELECT 1');
PREPARE stmt_client_col FROM @sql_client_col;
EXECUTE stmt_client_col;
DEALLOCATE PREPARE stmt_client_col;

SET @exist_fk := (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'events' AND constraint_name = 'fk_event_client');
SET @sql_fk := IF(@exist_fk = 0, 'ALTER TABLE events ADD CONSTRAINT fk_event_client FOREIGN KEY (client_id) REFERENCES clients(id)', 'SELECT 1');
PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;
