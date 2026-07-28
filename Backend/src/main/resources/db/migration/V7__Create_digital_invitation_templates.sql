CREATE TABLE IF NOT EXISTS digital_invitation_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(2000),
    html_content TEXT
);

-- Insert some default/sample visual templates
INSERT INTO digital_invitation_templates (title, category, description, image_url, html_content) VALUES
('Fleurs de Coton', 'Mariage', 'Un faire-part poétique aux illustrations florales douces et coton.', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500', '<h1>Fleurs de Coton</h1>'),
('Or & Velours', 'Mariage', 'Un design luxueux avec dorures géométriques et typographie élégante.', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500', '<h1>Or & Velours</h1>'),
('Séminaire Impérial', 'Corporate', 'Un faire-part professionnel épuré pour conférences et galas.', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500', '<h1>Séminaire Impérial</h1>');
