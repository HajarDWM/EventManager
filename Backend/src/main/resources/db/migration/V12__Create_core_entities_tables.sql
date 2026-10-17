-- V12__Create_core_entities_tables.sql
-- Baseline schema for guests, menu_items, event_tasks, and billing_settings

CREATE TABLE IF NOT EXISTS guests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    table_number VARCHAR(50),
    dietary_requirements VARCHAR(255),
    group_name VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'NOT_REQUIRED',
    paid_amount DOUBLE DEFAULT 0.0,
    payment_reference VARCHAR(255),
    payment_date DATETIME,
    invitation_token VARCHAR(255) UNIQUE,
    invitation_expiry DATETIME
);

CREATE TABLE IF NOT EXISTS menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'STARTER',
    price_per_person DECIMAL(10,2),
    dietary_tag VARCHAR(100),
    description VARCHAR(500),
    image_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS event_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    due_date DATE,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    assigned_to VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS billing_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grace_period_days INT NOT NULL DEFAULT 10
);
