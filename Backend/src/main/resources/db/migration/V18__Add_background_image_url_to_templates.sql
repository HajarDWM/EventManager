-- Migration V18: Add background_image_url to digital_invitation_templates for full card asset overlays
ALTER TABLE digital_invitation_templates ADD COLUMN background_image_url VARCHAR(2000);
