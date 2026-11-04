-- Migration V37: Normalize caterer roles and account statuses for robust enum parsing
UPDATE caterers SET role = 'TRAITEUR' WHERE role = 'ROLE_CATERER' OR role = 'CATERER';
UPDATE caterers SET account_status = 'APPROVED' WHERE account_status = 'ACTIVE';

