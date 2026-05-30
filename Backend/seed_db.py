import os
import mysql.connector
from database.db import DB_CONFIG
from utils.helpers import hash_password

def seed_database():
    # Se connecter sans spécifier la base de données (pour pouvoir la créer)
    config_no_db = DB_CONFIG.copy()
    config_no_db.pop('database', None)
    
    import time
    conn = None
    for i in range(15):
        try:
            conn = mysql.connector.connect(**config_no_db)
            break
        except Exception as e:
            print(f"Attente de MySQL... ({i+1}/15) : {e}")
            time.sleep(2)
            
    if not conn:
        print("Erreur de connexion MySQL initiale (limite de temps dépassée).")
        return

    cursor = conn.cursor()

    # Create tables from schema
    with open('database/schema.sql', 'r') as f:
        schema = f.read()
        
    for statement in schema.split(';'):
        if statement.strip():
            try:
                cursor.execute(statement)
            except Exception as e:
                print(f"Erreur d'exécution: {e}")

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

    for statement in seed.split(';'):
        if statement.strip():
            try:
                cursor.execute(statement)
            except Exception as e:
                print(f"Erreur seed: {e}")

    conn.commit()
    cursor.close()
    conn.close()
    print("Base de données MySQL (monexamen) initialisée avec succès !")

if __name__ == '__main__':
    seed_database()
