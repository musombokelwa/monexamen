# DEPLOYMENT ERROR - HOW TO FIX IT

## What Went Wrong?

Your deployment failed with:
```
/docker-entrypoint.sh: exec: line 47: /app/scripts/start.sh: not found
```

**Root Cause:** The old **monolithic Dockerfile** was used instead of Render's multi-service architecture. The Dockerfile combines Frontend + Backend + Nginx into ONE container, which doesn't work properly on Render.

---

## THE FIX (3 Steps)

### STEP 1: Delete Old Service on Render

1. Go to: https://dashboard.render.com
2. Find the **monexamen-backend** service (the broken one)
3. Click the service name
4. Go to `Settings` → Scroll down
5. Click `Delete Service` (red button)
6. Confirm by typing the service name

**Wait 1 minute for deletion to complete.**

---

### STEP 2: Pull Latest Code Locally

Your fixed configuration files have been prepared! Just pull them:

```bash
cd /home/la-mus/Téléchargements/MonExamen
git pull origin master
```

**What was fixed:**
- `render.yaml` - Now properly configured for 3 separate services
- `build.sh` - Enhanced with error checking
- `start.sh` - Correct port binding
- `Frontend/js/data.js` - Better environment detection for Render

---

### STEP 3: Commit & Push

```bash
git add -A
git commit -m "Fix Render deployment: separate services, correct scripts"
git push origin master
```

---

## NOW REDEPLOY (CORRECT WAY)

### SERVICE 1: Create Database

1. On Render Dashboard: `New` → `Database` → `MySQL`
2. Fill in:
   ```
   Name:               monexamen-db
   Region:             Ohio
   MySQL Version:      8.0
   ```
3. Create Database
4. Wait ~1 minute
5. Go to `Connections` tab
6. **COPY the hostname:** `xxxxx-mysql.render.com` (you'll need this!)

---

### SERVICE 2: Create Backend (NEW!)

1. `New` → `Web Service`
2. Connect to: `musombokelwa/monexamen`
3. Branch: `master`
4. Fill in:
   ```
   Name:               monexamen-backend
   Runtime:            Python 3
   Region:             Ohio (SAME as DB!)
   Build:              pip install -r Backend/requirements.txt
   Start:              cd Backend && gunicorn -w 4 -b 0.0.0.0:$PORT app:app
   ```
5. Click `Environment Variables` → Add 6 variables:

   ```
   FLASK_ENV          = production
   DB_HOST             = xxxxx-mysql.render.com  ← Your copied hostname!
   DB_NAME             = monexamenn
   DB_USER             = jenos
   DB_PASSWORD         = 1234
   SECRET_KEY          = <generate below>
   ```

6. Click `Create Web Service`
7. Wait ~5 minutes

**Generate SECRET_KEY (run in terminal once):**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

### SERVICE 3: Create Frontend

1. `New` → `Web Service`
2. Connect to: `musombokelwa/monexamen` (SAME repo!)
3. Branch: `master`
4. Fill in:
   ```
   Name:               monexamen-frontend
   Runtime:            Node
   Region:             Ohio
   Build:              echo "Static frontend"
   Start:              npx serve -s Frontend -l $PORT
   ```
5. Environment Variables: **SKIP** (leave empty)
6. Click `Create Web Service`
7. ⏰ Wait ~2 minutes

---

## ✅ Verify Deployment

On Render Dashboard, check all 3 services show **"LIVE"** (green):

```
✅ monexamen-db       → LIVE
✅ monexamen-backend  → LIVE  
✅ monexamen-frontend → LIVE
```

---

## 🧪 Test It

1. Go to: `https://monexamen-frontend.onrender.com`
2. Open Console (F12)
3. Look for: `🔧 API Configuration:` with your correct API URL
4. Try to **login** with valid credentials
5. If login works: **🎉 SUCCESS!**

---

## 📊 The 3 Keys to Success

| Variable | Value | Where | Why |
|----------|-------|-------|-----|
| **DB_HOST** | `xxxxx-mysql.render.com` | Backend env | Backend finds database |
| **DB_PASSWORD** | `1234` | Backend env | Backend connects to DB |
| **API_BASE_URL** | `https://backend.onrender.com/api` | Frontend data.js | Frontend calls Backend |

---

## 🚨 If It Still Fails

### Backend won't start?
- Check `Logs` tab
- Verify all 6 environment variables are set
- Make sure DB_HOST is the exact hostname (not localhost!)

### Frontend is blank?
- Open Console (F12)
- Check for errors
- Verify `API_BASE_URL` is correct

### "Cannot connect to database"?
- DB_HOST must be the exact Render hostname
- Never use `localhost` on Render!
- Check DB_PASSWORD = 1234

---

## 📞 Reference

Your database values:
- **Database:** monexamenn
- **User:** jenos
- **Password:** 1234
- **Tables:** etudiant, interro, examen, livre

---

## You've Got This!

The deployment is now fixed. Just follow the 3 deployment steps above and you'll be live in ~30 minutes!
