-- Migration V20: Add primary and secondary font sizes to digital invitation templates
ALTER TABLE digital_invitation_templates ADD COLUMN primary_font_size VARCHAR(30) DEFAULT '36px';
ALTER TABLE digital_invitation_templates ADD COLUMN secondary_font_size VARCHAR(30) DEFAULT '16px';
