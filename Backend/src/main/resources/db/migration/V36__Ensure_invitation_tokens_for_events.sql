-- Ensure all events with an active digital template have an invitation_token generated
UPDATE events 
SET invitation_token = LOWER(REPLACE(UUID(), '-', '')) 
WHERE (invitation_token IS NULL OR invitation_token = '') AND digital_template_id IS NOT NULL;
