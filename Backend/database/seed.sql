USE monexamen;

-- ── Promotions ────────────────────────────────────────────
INSERT INTO promotions (name) VALUES
('Préparatoire'),
('Bac 1'),
('Bac 2'),
('Bac 3'),
('Master 1'),
('Master 2');

-- ── Départements ──────────────────────────────────────────
INSERT INTO departments (name) VALUES
('Génie Informatique'),
('Génie Électrique'),
('Génie Civil'),
('Génie des Procédés');

-- ── Utilisateurs ──────────────────────────────────────────
-- Mots de passe hashés avec bcrypt (valeurs réelles, générées par le backend)
-- Pour le seed initial on met des placeholders — le script Python de seed les génèrera correctement
-- Placeholder passwords ci-dessous sont juste pour référence :
--   superadmin123, admin123, student123

INSERT INTO users (fullname, email, password, role, promotion_id, department_id, approved) VALUES
('Jenos Mbayo', 'superadmin@monexamen.cd', '$2b$12$SEED_PLACEHOLDER_SUPERADMIN', 'superadmin', NULL, NULL, 1),
('Prof. Ngozi Amara', 'admin@monexamen.cd', '$2b$12$SEED_PLACEHOLDER_ADMIN', 'admin', NULL, NULL, 1),
('Jean-Paul Mwamba', 'student@monexamen.cd', '$2b$12$SEED_PLACEHOLDER_STUDENT', 'student', 3, 1, 1);
-- promotion_id=3 → Bac 2, department_id=1 → Génie Informatique

-- ── Documents exemples ────────────────────────────────────
INSERT INTO documents (title, type, subject, promotion_id, department_id, year, session, status, file_url, file_name, file_size, description, added_by, added_at, approved_by, approved_at) VALUES
('Examen Final — Algorithmique et Structures de Données', 'examen', 'Algorithmique', 2, 1, '2024-2025', 'Juin 2025', 'approved', '#', 'algo_examen_bac1_2025.pdf', '1.2 MB', 'Examen final couvrant les algorithmes de tri, les arbres binaires et les graphes.', 2, '2025-06-10 09:00:00', 1, '2025-06-11 10:30:00'),

('Interrogation N°1 — Bases de Données Relationnelles', 'interrogation', 'Bases de Données', 3, 1, '2024-2025', 'Novembre 2024', 'approved', '#', 'bdd_interro1_bac2_2024.pdf', '850 KB', 'Première interrogation portant sur le modèle entité-association et les requêtes SQL de base.', 2, '2025-01-15 10:00:00', 1, '2025-01-16 09:00:00'),

('Examen — Électrotechnique Générale', 'examen', 'Électrotechnique', 3, 2, '2024-2025', 'Janvier 2025', 'approved', '#', 'electro_examen_bac2_2025.pdf', '2.1 MB', 'Examen couvrant les circuits en courant alternatif, les transformateurs et les machines électriques.', 2, '2025-02-01 11:00:00', 1, '2025-02-02 08:30:00'),

('Interrogation — Mathématiques Avancées (Analyse)', 'interrogation', 'Mathématiques', 1, NULL, '2024-2025', 'Octobre 2024', 'approved', '#', 'maths_interro_prep_2024.pdf', '640 KB', 'Interrogation sur les limites, la continuité et les dérivées de fonctions à une variable.', 2, '2025-01-20 09:00:00', 1, '2025-01-21 10:00:00'),

('Examen — Résistance des Matériaux', 'examen', 'Résistance des Matériaux', 4, 3, '2024-2025', 'Juin 2025', 'approved', '#', 'rdm_examen_bac3_2025.pdf', '1.8 MB', 'Examen final couvrant la résistance des matériaux, les contraintes normales et de cisaillement.', 2, '2025-06-15 10:00:00', 1, '2025-06-16 08:00:00'),

('Examen — Réseaux Informatiques', 'examen', 'Réseaux', 4, 1, '2023-2024', 'Juin 2024', 'pending', '#', 'reseaux_examen_bac3_2024.pdf', '1.5 MB', 'Examen couvrant les protocoles TCP/IP, le routage et la sécurité réseau.', 2, '2025-05-10 09:00:00', NULL, NULL);

-- ── Log initial ───────────────────────────────────────────
INSERT INTO logs (type, action, user, date) VALUES
('system', 'Démarrage système', 'Système', '2025-09-01 08:00:00');
