# MonExamen — Plateforme Académique

Bienvenue sur le projet **MonExamen**, une plateforme académique complète conçue pour centraliser, gérer et partager les examens et interrogations universitaires. Le système est construit avec une architecture moderne, séparant clairement le Frontend (interface utilisateur) du Backend (API et base de données).

---

## Fonctionnalités Principales

- **Organisation Structurée :** Les documents sont triés par type (examen ou interrogation), par promotion (Préparatoire, Bac 1 à Master 2) et par département d'ingénierie.
- **Accès Sécurisé par Rôle :**
  - **Étudiants :** Accèdent uniquement aux documents approuvés correspondants à leur promotion et leur département.
  - **Administrateurs :** Peuvent soumettre de nouveaux documents et visualiser l'état de validation de leurs propres ajouts.
  - **Super Administrateurs :** Gèrent l'intégralité du contenu (validation/refus des documents), les comptes utilisateurs (étudiants et admins) et visualisent le journal système.
- **Circuit de Validation :** Tout document soumis par un administrateur doit être "Validé" par un super administrateur avant d'être visible par les étudiants.
- **Tableaux de Bord Dynamiques :** Interfaces de gestion réactives avec des statistiques en temps réel.
- **Gestion de Session Persistante :** Utilisation de `localStorage` pour maintenir la session active même après actualisation de la page ou réouverture du navigateur.
- **Inscription Fluide :** Redirection et connexion automatique de l'étudiant directement après la création de son compte.
- **Détection Intelligente des Identifiants :** En cas d'erreur de mot de passe ou d'utilisateur inexistant à la connexion, l'utilisateur est automatiquement réorienté vers l'onglet d'inscription avec son email pré-rempli.

---

## Architecture du Projet

Le projet est divisé en deux grandes parties :

1. **Frontend (`/Frontend`)** : 
   - Développé en HTML, CSS (Vanilla) et JavaScript.
   - Agit comme une Single Page Application (SPA) pour l'administration et les pages publiques dynamiques.
   - Communique avec le Backend via des requêtes AJAX (fetch) asynchrones.
   - L'adresse de l'API est dynamique : elle bascule automatiquement sur l'API locale (`localhost:5000`) lors du développement classique, ou utilise le reverse-proxy Nginx en mode Docker.
   - Barre de navigation globale et dynamique gérée centralement par `js/student.js`.

2. **Backend (`/Backend`)** :
   - Propulsé par **Python** et le micro-framework **Flask**.
   - Fournit une API RESTful (`/api/...`) qui gère la logique d'authentification, les documents, l'administration et le téléchargement de fichiers.
   - Connecté à une base de données **MySQL** pour assurer un stockage sécurisé et relationnel.
   - Les mots de passe sont hachés et sécurisés via `bcrypt`.

---

## Déploiement Rapide avec Docker (Recommandé)

Docker permet de lancer l'intégralité de l'application (Frontend Nginx, Backend Flask et Base MySQL) sans aucun conflit de versions ou de dépendances système.

### Prérequis
- Avoir **Docker** et **Docker Compose** installés sur votre machine.

### Lancement
1. Ouvrez votre terminal à la racine du projet (`MonExamen`) et exécutez la commande suivante pour construire et lancer les conteneurs :
   ```bash
   docker-compose up --build -d
   ```
2. Une fois les conteneurs démarrés, initialisez la base de données (ce script attend automatiquement que MySQL soit prêt) :
   ```bash
   docker-compose exec backend python seed_db.py
   ```
3. Accédez à l'application dans votre navigateur à l'adresse suivante : **`http://localhost:8080`**.

---

## Lancement Local Classique (Alternative)

Si vous préférez tester le projet sans Docker en exécutant les services directement sur votre machine locale.

### Prérequis
- Avoir installé **Python 3**.
- Avoir un serveur **MySQL** actif sur votre machine (via XAMPP, WAMP, ou directement installé).
- Avoir configuré les accès à la base de données dans `Backend/database/db.py` (ou via les variables d'environnement `DB_HOST`, `DB_USER`, `DB_PASSWORD`).

### Étape 1 : Initialiser la Base de Données
1. Ouvrez votre terminal et naviguez dans le dossier `Backend` :
   ```bash
   cd Backend
   ```
2. Installez les dépendances Python requises :
   ```bash
   pip install -r requirements.txt
   ```
3. Exécutez le script d'initialisation de la base de données MySQL :
   ```bash
   python seed_db.py
   ```

### Étape 2 : Lancer le Serveur Backend (API)
Depuis le dossier `Backend`, exécutez :
```bash
python app.py
```
*(Le serveur s'exécute sur `http://localhost:5000`)*

### Étape 3 : Ouvrir l'Interface Utilisateur (Frontend)
1. Ouvrez le dossier `Frontend` de votre projet.
2. Double-cliquez sur le fichier **`index.html`** (ou lancez un serveur local comme Live Server) pour l'ouvrir dans votre navigateur.

---

## Comptes de Test Par Défaut

Voici les identifiants de test générés automatiquement lors de l'initialisation de la base de données :

- **Super Administrateur :**
  - Email : `superadmin@monexamen.cd`
  - Mot de passe : `superadmin123`
- **Administrateur (Soumission de documents) :**
  - Email : `admin@monexamen.cd`
  - Mot de passe : `admin123`
- **Étudiant (Consultation Bac 2 / Informatique) :**
  - Email : `student@monexamen.cd`
  - Mot de passe : `student123`

*(Note : Depuis l'interface web, vous pouvez créer de nouveaux comptes étudiants en utilisant l'onglet "Créer un compte").*
# MonExamen
