-- Migration V21: Add parking location to events
ALTER TABLE events ADD COLUMN parking_location VARCHAR(255);
