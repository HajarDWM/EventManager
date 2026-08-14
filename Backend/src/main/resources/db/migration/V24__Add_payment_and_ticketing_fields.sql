-- Add payment and ticketing fields to events table
ALTER TABLE events 
ADD COLUMN is_paid_event BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN ticket_price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN currency VARCHAR(10) DEFAULT 'MAD';

-- Add payment and ticketing fields to guests table
ALTER TABLE guests 
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'NOT_REQUIRED',
ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN payment_reference VARCHAR(255),
ADD COLUMN payment_date DATETIME;
