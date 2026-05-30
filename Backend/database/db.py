"""
MON EXAMEN — Database Connection Module (MySQL)
Provides get_connection() for raw MySQL access and get_db() for model compatibility.
"""

import os
import mysql.connector
from mysql.connector import Error

# ── Configuration ──────────────────────────────────────────
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'database': os.environ.get('DB_NAME', 'monexamen'),
    'user': os.environ.get('DB_USER', 'jenos'),
    'password': os.environ.get('DB_PASSWORD', 'Api@12345'),
}


def get_connection():
    """Get a raw MySQL connection."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Erreur lors de la connexion : {e}")
        return None


def get_db():
    """
    Get a MySQL connection suitable for the models layer.
    Returns a connection object. Models should create their own cursors.
    """
    conn = get_connection()
    if not conn:
        raise Exception("Impossible de se connecter à la base de données MySQL.")
    return conn


# ── Helper: execute query and return results ───────────────
def execute_query(query, params=None, fetch_one=False, fetch_all=False, commit=False):
    """
    Generic query executor.
    Returns: dict (fetch_one), list of dicts (fetch_all), lastrowid (commit), or None.
    """
    conn = get_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())

        if commit:
            conn.commit()
            return cursor.lastrowid
        elif fetch_one:
            return cursor.fetchone()
        elif fetch_all:
            return cursor.fetchall() or []
        return None
    except Error as e:
        print(f"Erreur SQL : {e}")
        if commit:
            conn.rollback()
        return [] if fetch_all else None
    finally:
        cursor.close()
        conn.close()


# ══════════════════════════════════════════════════════════
#  CRUD Functions — used by models and controllers
# ══════════════════════════════════════════════════════════

# ── Users ──────────────────────────────────────────────────
def get_user_by_email(email):
    return execute_query("SELECT * FROM users WHERE email = %s", (email,), fetch_one=True)

def get_user_by_id(user_id):
    return execute_query("SELECT * FROM users WHERE id = %s", (user_id,), fetch_one=True)

def get_all_users():
    return execute_query(
        "SELECT id, fullname, email, role, promotion_id, department_id, approved, created_at FROM users",
        fetch_all=True
    )

def create_user(fullname, email, hashed_password, role='student', promotion_id=None, department_id=None):
    return execute_query(
        "INSERT INTO users (fullname, email, password, role, promotion_id, department_id) VALUES (%s, %s, %s, %s, %s, %s)",
        (fullname, email, hashed_password, role, promotion_id, department_id),
        commit=True
    )

def update_user(user_id, updates):
    """Update user fields. `updates` is a dict of column→value."""
    if not updates:
        return
    set_clause = ', '.join(f"{k} = %s" for k in updates.keys())
    values = list(updates.values()) + [user_id]
    execute_query(f"UPDATE users SET {set_clause} WHERE id = %s", values, commit=True)

def delete_user(user_id):
    execute_query("DELETE FROM users WHERE id = %s", (user_id,), commit=True)


# ── Documents ──────────────────────────────────────────────
def get_all_documents():
    return execute_query("SELECT * FROM documents ORDER BY added_at DESC", fetch_all=True)

def get_document_by_id(doc_id):
    return execute_query("SELECT * FROM documents WHERE id = %s", (doc_id,), fetch_one=True)

def get_documents_by_promotion(promotion_id):
    return execute_query(
        "SELECT * FROM documents WHERE promotion_id = %s AND status = 'approved' ORDER BY added_at DESC",
        (promotion_id,), fetch_all=True
    )

def get_documents_by_user(user_id):
    return execute_query(
        "SELECT * FROM documents WHERE added_by = %s ORDER BY added_at DESC",
        (user_id,), fetch_all=True
    )

def get_documents_by_status(status):
    return execute_query(
        "SELECT * FROM documents WHERE status = %s ORDER BY added_at DESC",
        (status,), fetch_all=True
    )

def get_documents_by_type(doc_type):
    return execute_query(
        "SELECT * FROM documents WHERE type = %s ORDER BY added_at DESC",
        (doc_type,), fetch_all=True
    )

def create_document(title, doc_type, subject, promotion_id, department_id, year, session, file_url, file_name, file_size, description, added_by):
    return execute_query(
        """INSERT INTO documents 
        (title, type, subject, promotion_id, department_id, year, session, file_url, file_name, file_size, description, added_by) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (title, doc_type, subject, promotion_id, department_id, year, session, file_url, file_name, file_size, description, added_by),
        commit=True
    )

def update_document_status(doc_id, status, approved_by=None):
    if status == 'approved' and approved_by:
        execute_query(
            "UPDATE documents SET status = %s, approved_by = %s, approved_at = NOW() WHERE id = %s",
            (status, approved_by, doc_id), commit=True
        )
    else:
        execute_query("UPDATE documents SET status = %s WHERE id = %s", (status, doc_id), commit=True)

def delete_document(doc_id):
    execute_query("DELETE FROM documents WHERE id = %s", (doc_id,), commit=True)


# ── Promotions ─────────────────────────────────────────────
def get_all_promotions():
    return execute_query("SELECT * FROM promotions ORDER BY id", fetch_all=True)

def create_promotion(name):
    return execute_query("INSERT INTO promotions (name) VALUES (%s)", (name,), commit=True)


# ── Departments ────────────────────────────────────────────
def get_all_departments():
    return execute_query("SELECT * FROM departments ORDER BY id", fetch_all=True)

def create_department(name):
    return execute_query("INSERT INTO departments (name) VALUES (%s)", (name,), commit=True)


# ── Logs ───────────────────────────────────────────────────
def get_all_logs():
    return execute_query("SELECT * FROM logs ORDER BY date DESC LIMIT 100", fetch_all=True)

def add_log(action, log_type='info', user_name='Système'):
    execute_query(
        "INSERT INTO logs (type, action, user) VALUES (%s, %s, %s)",
        (log_type, action, user_name), commit=True
    )

def clear_logs():
    execute_query("DELETE FROM logs", commit=True)


# ── Self-test ──────────────────────────────────────────────
if __name__ == '__main__':
    print("--- Test de la base de données ---")
    conn = get_connection()
    if conn:
        print("Connexion réussie à la base 'monexamen' !")
        conn.close()
    else:
        print("Échec de la connexion.")
