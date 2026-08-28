-- V26__Add_subscription_dates_to_transactions.sql
ALTER TABLE transactions ADD COLUMN start_date DATETIME NULL;
ALTER TABLE transactions ADD COLUMN end_date DATETIME NULL;
