-- V22: Add invitation_subtitle to events table for dynamic customizable event type headers
ALTER TABLE events ADD COLUMN invitation_subtitle VARCHAR(255) NULL;
