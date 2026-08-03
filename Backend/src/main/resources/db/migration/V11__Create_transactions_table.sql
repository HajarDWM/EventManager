CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY,
    caterer_id BIGINT,
    business_name VARCHAR(255) NOT NULL,
    subscription_plan VARCHAR(50) NOT NULL,
    amount_paid DECIMAL(19, 2) NOT NULL,
    vat_rate DECIMAL(19, 2) NOT NULL,
    payment_date DATETIME NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_transaction_caterer FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE SET NULL
);

CREATE INDEX idx_transactions_caterer_id ON transactions(caterer_id);
