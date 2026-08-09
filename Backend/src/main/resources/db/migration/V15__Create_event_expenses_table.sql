CREATE TABLE event_expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    provider_name VARCHAR(100),
    expense_date DATETIME NOT NULL,
    CONSTRAINT fk_event_expenses_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX idx_event_expenses_event_id ON event_expenses(event_id);
