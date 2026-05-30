# Documentation de la Base de Données `monexamen`

Ce projet contient la structure et les scripts nécessaires pour gérer la base de données MySQL `monexamen`. Il est composé de plusieurs fichiers : un script d'initialisation SQL, un script de seed et un module Python pour interagir avec les données.

## 1. La Base de Données (`monexamen`)
La base de données a été restructurée pour gérer de manière professionnelle et sécurisée le flux d'informations autour des utilisateurs, de leurs évaluations (examens et interrogations), ainsi que la journalisation des actions. Elle est composée de 5 tables distinctes :

- **`users`** : Stocke les informations des utilisateurs. Elle gère à la fois les étudiants, les administrateurs et les super administrateurs (nom, email, mot de passe haché, rôle, promotion, département).
- **`documents`** : Unifie les examens et les interrogations. Elle enregistre les documents avec leur type (`examen` ou `interrogation`), le sujet, l'année, la session, le département, la promotion ciblée, ainsi que leur statut de validation (`pending`, `approved`, `rejected`).
- **`promotions`** : Gère la liste des promotions (Niveau 0 à Niveau 5, etc.).
- **`departments`** : Gère la liste des départements d'ingénierie (Génie Informatique, Génie Électrique, etc.).
- **`logs`** : Enregistre l'historique des actions effectuées par les administrateurs et super administrateurs sur la plateforme pour la traçabilité.

## 2. Le Fichier `schema.sql`
Ce fichier est le **script de structure** (Data Definition Language - DDL).
Sa fonction est de configurer la base de données vierge. 

**Ce qu'il fait :**
- Il crée la base de données `monexamen` si elle n'existe pas encore.
- Il sélectionne cette base pour les opérations suivantes.
- Il crée les 5 tables en définissant précisément les colonnes, les types de données (INT, VARCHAR, ENUM), les clés primaires (`id` avec auto-incrémentation), et les clés étrangères (relations entre les tables).

**Comment l'utiliser :**
Pour initialiser votre base de données dans MySQL, vous pouvez importer ce fichier via votre terminal :
```bash
mysql -u root -p < schema.sql
```

## 3. Le Fichier `seed.sql` et `seed_db.py`
Ces fichiers permettent d'insérer les **données initiales** dans la base de données.
`seed.sql` contient les requêtes SQL, mais comme les mots de passe doivent être hachés (bcrypt), un script Python `seed_db.py` a été créé pour automatiser ce processus.

**Comment l'utiliser :**
À la racine du dossier Backend, exécutez le script Python pour exécuter le schéma et insérer les données avec les mots de passe sécurisés :
```bash
python seed_db.py
```
Cela créera les comptes par défaut (superadmin, admin, student).

## 4. Le Fichier `db.py`
Ce fichier est le **module d'interaction Python**.
Il sert de pont (ou d'interface) entre votre application Python et la base de données MySQL. Il utilise la bibliothèque `mysql-connector-python`.

**Ce qu'il fait :**
- **Connexion** : La fonction `get_connection()` se charge de se connecter à la base de données avec les identifiants configurés dans `config.py`.
- **Fonction `execute_query`** : Une fonction utilitaire centralisée qui gère les exécutions de requêtes et les commits, simplifiant grandement le code.
- **Fonctions CRUD (Create, Read, Update, Delete)** : Pour chaque entité, les classes "Models" (`user_model.py`, `document_model.py`, etc.) utilisent `db.py` pour interagir avec les tables respectives.
- **Sécurité et Gestion des erreurs** : Le script utilise des requêtes paramétrées (`%s`) pour éviter les injections SQL, et gère proprement les ressources MySQL.

## 5. Résumé de la Migration vers MySQL
Le projet a été migré du `localStorage` (et d'un schéma SQLite initial) vers une base de données MySQL robuste. Les modifications incluent :
- Un schéma unifié pour les rôles (superadmin, admin, student).
- Une gestion asynchrone des requêtes côté Frontend via l'API.
- Une authentification par jeton JWT.
- Le hachage des mots de passe en base de données.
