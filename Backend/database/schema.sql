-- ══════════════════════════════════════════════════════════
-- MonExamen — Schema PostgreSQL
-- ══════════════════════════════════════════════════════════

-- ── Types ENUM personnalisés ──────────────────────────────
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'admin', 'superadmin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE doc_type AS ENUM ('examen', 'interrogation');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE doc_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Table des promotions ──────────────────────────────────
CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- ── Table des départements ────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ── Table des utilisateurs ────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    promotion_id INT DEFAULT NULL,
    department_id INT DEFAULT NULL,
    approved SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ── Table des documents ───────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type doc_type NOT NULL,
    subject VARCHAR(100) DEFAULT NULL,
    promotion_id INT DEFAULT NULL,
    department_id INT DEFAULT NULL,
    year VARCHAR(20) DEFAULT NULL,
    session VARCHAR(50) DEFAULT NULL,
    status doc_status NOT NULL DEFAULT 'pending',
    file_url VARCHAR(500) DEFAULT '#',
    file_name VARCHAR(200) DEFAULT NULL,
    file_size VARCHAR(20) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    added_by INT DEFAULT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by INT DEFAULT NULL,
    approved_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ── Table des logs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL DEFAULT 'info',
    action VARCHAR(500) NOT NULL,
    "user" VARCHAR(100) NOT NULL DEFAULT 'Système',
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);