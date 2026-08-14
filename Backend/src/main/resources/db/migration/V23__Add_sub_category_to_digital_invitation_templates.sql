-- Migration V23: Add sub_category to digital_invitation_templates and initialize hierarchical taxonomy
ALTER TABLE digital_invitation_templates ADD COLUMN sub_category VARCHAR(100) NULL;

-- 1. Update Existing Default Templates with exact Main Category and Subcategory
UPDATE digital_invitation_templates 
SET category = 'Célébrations Traditionnelles & Culturelles',
    sub_category = 'Mariage'
WHERE title LIKE '%Fleurs de Coton%' OR title LIKE '%Or & Velours%';

UPDATE digital_invitation_templates 
SET category = 'Événements & Fêtes de Famille',
    sub_category = 'Anniversaire'
WHERE title LIKE '%Bohème Floral%' OR title LIKE '%Anniversaire%';

UPDATE digital_invitation_templates 
SET category = 'Événements Corporate & Professionnels',
    sub_category = 'Conférence & Séminaire'
WHERE title LIKE '%Séminaire Impérial%' OR title LIKE '%Conférence%';

UPDATE digital_invitation_templates 
SET category = 'Événements Corporate & Professionnels',
    sub_category = 'Dîner d\'Affaires'
WHERE title LIKE '%Élégance Minimaliste%';

-- 2. Insert Complete Showcase Templates for All Categories & Subcategories
INSERT INTO digital_invitation_templates 
(title, category, sub_category, description, image_url, template_key, decorative_frame, accent_color, background_color, primary_font, primary_font_size, secondary_font, secondary_font_size, secondary_font_color, html_content)
VALUES
-- Traditional: Fiançailles
('Fiançailles Royales & Dorées', 'Célébrations Traditionnelles & Culturelles', 'Fiançailles', 
 'Un design étincelant aux nuances or champagne et motifs d\'arabesques royales pour des fiançailles mémorables.',
 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500', 
 'fiancailles-royales', 'gold-border', '#d4af37', '#0b0b0b', 'Great Vibes', '38px', 'Cinzel', '16px', '#e8d8b0', '<h1>Fiançailles Royales</h1>'),

-- Traditional: Circoncision
('Célébration Tahara & Émeraude', 'Célébrations Traditionnelles & Culturelles', 'Circoncision', 
 'Une invitation pleine de noblesse aux tons vert émeraude et dorures raffinées pour la fête de circoncision.',
 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500', 
 'tahara-emeraude', 'floral-frame', '#2e7d32', '#faf6ee', 'Alex Brush', '36px', 'Cinzel', '16px', '#1e293b', '<h1>Célébration Tahara</h1>'),

-- Family: Baby Shower & Naissance
('Douceur Pastel & Ciel Doré', 'Événements & Fêtes de Famille', 'Baby Shower & Naissance', 
 'Une ambiance chaleureuse et feutrée aux teintes poudrées pour célébrer l\'arrivée d\'un nouveau-né.',
 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500', 
 'douceur-pastel', 'floral-frame', '#c27ba0', '#fff9f5', 'Dancing Script', '36px', 'Cormorant Garamond', '15px', '#2c1810', '<h1>Baby Shower</h1>'),

-- Family: Remise de Diplôme
('Prestige & Réussite Académique', 'Événements & Fêtes de Famille', 'Remise de Diplôme', 
 'Un design académique distingué souligné de lignes élégantes pour honorer une remise de diplôme.',
 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500', 
 'prestige-diplome', 'geometric-frame', '#1e3a8a', '#f8f9fa', 'Playfair Display', '34px', 'Montserrat', '15px', '#1e293b', '<h1>Remise de Diplôme</h1>'),

-- Corporate: Lancement de Produit
('Innovation & Lancement Exclusif', 'Événements Corporate & Professionnels', 'Lancement de Produit', 
 'Un modèle avant-gardiste aux contrastes sombres et accents métallisés pour présenter votre nouveau projet.',
 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500', 
 'lancement-innovation', 'minimal-edge', '#2563eb', '#0f172a', 'Montserrat', '32px', 'Plus Jakarta Sans', '15px', '#e2e8f0', '<h1>Lancement Exclusif</h1>'),

-- Seasonal & Social: Réveillon & Nouvel An
('Gala Étincelant du Réveillon', 'Événements Saisonniers & Sociaux', 'Réveillon & Nouvel An', 
 'Une pluie de paillettes et de dorures festives pour célébrer la nouvelle année en beauté.',
 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500', 
 'gala-reveillon', 'gold-border', '#fbbf24', '#050505', 'Playfair Display', '36px', 'Cinzel', '16px', '#f0dd9e', '<h1>Soirée du Réveillon</h1>'),

-- Seasonal & Social: Gala Caritatif
('Bienfaisance & Cœur d\'Or', 'Événements Saisonniers & Sociaux', 'Événement Caritatif', 
 'Une esthétique sobre et solennelle pour vos réceptions de charité, galas de mécénat et collectes de fonds.',
 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500', 
 'gala-bienfaisance', 'geometric-frame', '#d97706', '#fdfbf7', 'Cormorant Garamond', '36px', 'Montserrat', '15px', '#1e293b', '<h1>Gala de Bienfaisance</h1>');
