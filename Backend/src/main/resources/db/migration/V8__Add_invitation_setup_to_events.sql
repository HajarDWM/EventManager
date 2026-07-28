ALTER TABLE events ADD COLUMN digital_template_id BIGINT;
ALTER TABLE events ADD COLUMN invitation_token VARCHAR(255);
ALTER TABLE events ADD COLUMN invitation_title VARCHAR(255);
ALTER TABLE events ADD COLUMN invitation_date TIMESTAMP NULL;
ALTER TABLE events ADD COLUMN invitation_location VARCHAR(255);
