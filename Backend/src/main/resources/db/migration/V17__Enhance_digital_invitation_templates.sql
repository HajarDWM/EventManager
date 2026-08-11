-- Migration V17: Enhance digital invitation templates with decorative layers and theme attributes
ALTER TABLE digital_invitation_templates ADD COLUMN template_key VARCHAR(255);
ALTER TABLE digital_invitation_templates ADD COLUMN decorative_frame VARCHAR(255);
ALTER TABLE digital_invitation_templates ADD COLUMN accent_color VARCHAR(50);
ALTER TABLE digital_invitation_templates ADD COLUMN background_color VARCHAR(50);

-- Update existing default templates
UPDATE digital_invitation_templates 
SET template_key = 'fleurs-de-coton', 
    decorative_frame = 'floral-frame', 
    accent_color = '#d4af37', 
    background_color = '#faf6ee' 
WHERE title LIKE '%Fleurs de Coton%';

UPDATE digital_invitation_templates 
SET template_key = 'or-et-velours', 
    decorative_frame = 'gold-border', 
    accent_color = '#d4af37', 
    background_color = '#0b0b0b' 
WHERE title LIKE '%Or & Velours%';

UPDATE digital_invitation_templates 
SET template_key = 'corporate-professional', 
    decorative_frame = 'geometric-frame', 
    accent_color = '#2b4c7e', 
    background_color = '#f8f9fa' 
WHERE title LIKE '%Séminaire Impérial%';

-- Insert additional rich visual templates with distinct layers
INSERT INTO digital_invitation_templates (title, category, description, image_url, template_key, decorative_frame, accent_color, background_color, html_content) VALUES
('Élégance Minimaliste', 'Corporate', 'Un faire-part contemporain et épuré avec des lignes fines et un contraste moderne.', 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500', 'luxury-minimal', 'minimal-edge', '#1a1a1a', '#ffffff', '<h1>Élégance Minimaliste</h1>'),
('Bohème Floral & Romantique', 'Mariage', 'Un thème chaleureux aux tons poudrés et illustrations botaniques champêtres.', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500', 'boheme-chic', 'floral-frame', '#c27ba0', '#fff9f5', '<h1>Bohème Floral</h1>');
