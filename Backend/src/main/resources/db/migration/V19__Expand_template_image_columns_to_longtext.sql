-- Migration V19: Expand template image and background image columns to LONGTEXT to support Base64 data URLs and high-res assets
ALTER TABLE digital_invitation_templates MODIFY COLUMN background_image_url LONGTEXT;
ALTER TABLE digital_invitation_templates MODIFY COLUMN image_url LONGTEXT;
ALTER TABLE digital_invitation_templates MODIFY COLUMN description LONGTEXT;
ALTER TABLE digital_invitation_templates MODIFY COLUMN html_content LONGTEXT;
