# MonExamen - Guide Quick Start Render

## Déployer en 3 étapes

### Connexion à Render
1. Allez sur https://render.com
2. Cliquez **"New Web Service"**
3. Connectez votre GitHub (autorisez Render)

### Configuration (Copier-coller les valeurs)

```
Name:                monexamen
Language:            Docker
Branch:              master
Region:              Ohio ou Oregon
Root Directory:      (vide)
Instance:            Free
```

### Variables d'environnement

Cliquez **"Add Environment Variable"** et remplissez :

```
DB_HOST        → your-database-host
DB_NAME        → monexamen
DB_USER        → jenos
DB_PASSWORD    → votre-mot-de-passe
SECRET_KEY     → (générez: python3 -c "import secrets; print(secrets.token_urlsafe(32))")
```

### Cliquez "Create Web Service"

---

## Documentation complète

Voir [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

---

## Configuration locale (pour tester)

```bash
# Backend
cd Backend
pip install -r requirements.txt
python app.py

# Frontend (autre terminal)
cd Frontend
python3 -m http.server 8000
```

Visitez: http://localhost:8000

---

## 🐳 Docker local

```bash
docker-compose up
```

Visitez: http://localhost:8080
