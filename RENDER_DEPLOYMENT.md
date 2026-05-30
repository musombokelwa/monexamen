# Guide de Déploiement MonExamen sur Render

## Option 1 : Déploiement avec Docker (Recommandé) ⭐

### Avantages
- Configuration unifiée (Backend + Frontend)
- Pas besoin de configurer les commandes manuellement
- Plus fiable et reproductible

### Configuration sur Render

1. **Allez à Render Dashboard** → New → Web Service
2. **Connectez votre repository GitHub** `musombokelwa/monexamen`
3. **Remplissez comme suit :**

| Champ | Valeur |
|-------|--------|
| Name | `monexamen` ou `monexamen-backend` |
| Language | **Docker** |
| Branch | `master` |
| Region | Ohio (US East) ou Oregon (US West) |
| Root Directory | (laissez vide) |
| Instance Type | Free (pour tester) ou Starter ($7/mois) |

4. **Ajoutez les variables d'environnement :**

```
DB_HOST=your-mysql-server.render.com
DB_NAME=monexamen
DB_USER=jenos
DB_PASSWORD=your-secure-password
SECRET_KEY=generate-a-long-random-string
FLASK_ENV=production
```

### Générer SECRET_KEY
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

5. **Cliquez "Create Web Service"**
6. **Attendez le déploiement** (environ 5-10 minutes)

---

## Option 2 : Déploiement avec Python 3 (Alternative)

### Configuration sur Render

1. **Allez à Render Dashboard** → New → Web Service
2. **Connectez votre repository GitHub** `musombokelwa/monexamen`
3. **Remplissez comme suit :**

| Champ | Valeur |
|-------|--------|
| Name | `monexamen-backend` |
| Language | **Python 3** |
| Branch | `master` |
| Region | Ohio (US East) |
| Root Directory | `Backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn -w 4 -b 0.0.0.0:$PORT app:app` |
| Instance Type | Free (pour tester) ou Starter ($7/mois) |

4. **Ajoutez les variables d'environnement :**

```
DB_HOST=your-mysql-server.render.com
DB_NAME=monexamen
DB_USER=jenos
DB_PASSWORD=your-secure-password
SECRET_KEY=generate-a-long-random-string
FLASK_ENV=production
PORT=10000
```

5. **Cliquez "Create Web Service"**

---

## Configuration de la Base de Données MySQL

### Option A : MySQL sur Render
1. **Dashboard** → New → PostgreSQL (ou recherchez MySQL)
2. **Remplissez les informations**
3. **Notez la connection string**
4. **Utilisez comme `DB_HOST`** dans votre service Web

### Option B : Base de données externe
- **AWS RDS**
- **Digital Ocean Managed MySQL**
- **PlanetScale** (MySQL compatible)

---

## Frontend (HTML/CSS/JS statique)

Le Frontend est servi automatiquement :
- Via Nginx si vous utilisez Docker
- Vous devez créer un service Web séparé pour le servir

### Pour déployer le Frontend seul sur Render :

1. **New Web Service**
2. **Repo:** `musombokelwa/monexamen`
3. **Language:** Node.js
4. **Root Directory:** `Frontend`
5. **Build Command:** `echo "Static files - no build needed"`
6. **Start Command:** `python3 -m http.server 80` ou `npx http-server -p 80`

---

## Vérification après déploiement

### 1. Test de l'API
```bash
curl https://your-monexamen-service.onrender.com/api/health
```

**Réponse attendue:**
```json
{
  "status": "healthy",
  "service": "monexamen-api"
}
```

### 2. Test du Frontend
Visitez : `https://your-monexamen-service.onrender.com/`

### 3. Vérifier les logs
Dans Render Dashboard → Your Service → Logs

---

## Dépannage courant

### ❌ Erreur: "pip install: command not found"
- Assurez-vous que **Language = Python 3** ou **Docker**

### ❌ Erreur: "Cannot find main:app"
- Vérifiez que le **Root Directory = Backend**
- Vérifiez la commande Start

### ❌ Erreur de connexion à la base de données
- Vérifiez `DB_HOST`, `DB_USER`, `DB_PASSWORD`
- Assurez-vous que MySQL accepte les connexions externes
- Ajoutez l'IP de Render aux règles de firewall

### ❌ Service spin-down (instance Free)
- Passez à une instance payante (Starter: $7/mois)

---

## Variables d'environnement détaillées

```env
# Database
DB_HOST=votre-serveur-mysql.com
DB_NAME=monexamen
DB_USER=jenos
DB_PASSWORD=votre-mot-de-passe-securise

# Flask
FLASK_ENV=production
SECRET_KEY=une-clé-très-longue-et-aléatoire

# Render
PORT=10000 (défaut)
```

---

## Mise à jour et redéploiement

**Chaque fois que vous poussez vers GitHub :**
1. Render détecte automatiquement les changements
2. Lance un nouveau build
3. Redéploie le service

Aucune action manuelle requise ! ✅

---

## Support et Documentation

- **Render Docs:** https://docs.render.com
- **Flask Deployment:** https://docs.render.com/deploy-flask
- **Docker Deployment:** https://docs.render.com/docker

---

**Besoin d'aide ?** Contactez le support Render ou consultez leurs docs détaillées.
