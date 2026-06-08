import os
import psycopg2
from database.db import DB_CONFIG, DATABASE_URL
from utils.helpers import hash_password

def seed_database():
    import time
    conn = None
    
    for i in range(15):
        try:
            if DATABASE_URL:
                conn = psycopg2.connect(DATABASE_URL, sslmode='require')
            else:
                conn = psycopg2.connect(**DB_CONFIG)
            break
        except Exception as e:
            print(f"Attente de PostgreSQL... ({i+1}/15) : {e}")
            time.sleep(2)
            
    if not conn:
        print("Erreur de connexion PostgreSQL initiale (limite de temps dépassée).")
        return

    conn.autocommit = True
    cursor = conn.cursor()

    # Create tables from schema
    with open('database/schema.sql', 'r') as f:
        schema = f.read()
        
    try:
        cursor.execute(schema)
        print("Schema créé avec succès.")
    except Exception as e:
        print(f"Erreur schema: {e}")

    # Hash passwords
    superadmin_pass = hash_password('superadmin123')
    admin_pass = hash_password('admin123')
    student_pass = hash_password('student123')

    # Read seed data and replace placeholders
    with open('database/seed.sql', 'r') as f:
        seed = f.read()
        
    seed = seed.replace('$2b$12$SEED_PLACEHOLDER_SUPERADMIN', superadmin_pass)
    seed = seed.replace('$2b$12$SEED_PLACEHOLDER_ADMIN', admin_pass)
    seed = seed.replace('$2b$12$SEED_PLACEHOLDER_STUDENT', student_pass)

    try:
        cursor.execute(seed)
        print("Données de seed insérées avec succès.")
    except Exception as e:
        print(f"Erreur seed: {e}")

    cursor.close()
    conn.close()
    print("Base de données PostgreSQL (monexamen) initialisée avec succès !")

if __name__ == '__main__':
    seed_database()
