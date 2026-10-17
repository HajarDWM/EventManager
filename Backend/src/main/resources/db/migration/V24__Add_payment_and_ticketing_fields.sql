-- V24__Add_payment_and_ticketing_fields.sql

-- Add payment and ticketing fields to events table if missing
SET @exist_paid := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'events' AND column_name = 'is_paid_event');
SET @sql_event := IF(@exist_paid = 0, 'ALTER TABLE events ADD COLUMN is_paid_event BOOLEAN NOT NULL DEFAULT FALSE, ADD COLUMN ticket_price DECIMAL(10,2) DEFAULT 0.00, ADD COLUMN currency VARCHAR(10) DEFAULT ''MAD''', 'SELECT 1');
PREPARE stmt1 FROM @sql_event;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- Add payment and ticketing fields to guests table if missing
SET @exist_guest := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'guests' AND column_name = 'payment_status');
SET @sql_guest := IF(@exist_guest = 0, 'ALTER TABLE guests ADD COLUMN payment_status VARCHAR(50) DEFAULT ''NOT_REQUIRED'', ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0.00, ADD COLUMN payment_reference VARCHAR(255), ADD COLUMN payment_date DATETIME', 'SELECT 1');
PREPARE stmt2 FROM @sql_guest;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
