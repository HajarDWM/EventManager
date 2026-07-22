-- Update Super-Admin password hash to match "admin12345"
UPDATE caterers 
SET password = '$2a$10$TYS1DMKQ6vvKcGxfLqwepexO96ElXSQmIHB920F2gt0CHVwC6S.9W' 
WHERE email = 'admin@eventmanager.com';
