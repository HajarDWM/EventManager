-- V35__Add_client_portal_validity_days_to_events.sql
-- Add configurable validity duration (in days after event date) for the client portal link

ALTER TABLE events 
ADD COLUMN client_portal_validity_days INT DEFAULT 7;
