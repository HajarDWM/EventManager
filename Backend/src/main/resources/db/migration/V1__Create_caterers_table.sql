CREATE TABLE IF NOT EXISTS caterers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(255),
    account_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_caterers_email ON caterers(email);
CREATE INDEX idx_caterers_account_status ON caterers(account_status);
CREATE INDEX idx_caterers_stripe_customer_id ON caterers(stripe_customer_id);

