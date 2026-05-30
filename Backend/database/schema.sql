CREATE DATABASE IF NOT EXISTS monexamen;
USE monexamen;

-- ── Table des promotions ──────────────────────────────────
CREATE TABLE IF NOT EXISTS promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- ── Table des départements ────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ── Table des utilisateurs ────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin', 'superadmin') NOT NULL DEFAULT 'student',
    promotion_id INT DEFAULT NULL,
    department_id INT DEFAULT NULL,
    approved TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ── Table des documents ───────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type ENUM('examen', 'interrogation') NOT NULL,
    subject VARCHAR(100) DEFAULT NULL,
    promotion_id INT DEFAULT NULL,
    department_id INT DEFAULT NULL,
    year VARCHAR(20) DEFAULT NULL,
    session VARCHAR(50) DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    file_url VARCHAR(500) DEFAULT '#',
    file_name VARCHAR(200) DEFAULT NULL,
    file_size VARCHAR(20) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    added_by INT DEFAULT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by INT DEFAULT NULL,
    approved_at DATETIME DEFAULT NULL,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ── Table des logs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL DEFAULT 'info',
    action VARCHAR(500) NOT NULL,
    user VARCHAR(100) NOT NULL DEFAULT 'Système',
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);