# 🚨 CRITICAL ENVIRONMENT VARIABLES - MUST HAVE

## The 3 Variables That MUST Be Perfect

If these 3 are wrong, your deployment WILL FAIL:

```
1. DB_HOST          ← Backend must find the database
2. DB_PASSWORD      ← Backend must connect to the database  
3. SECRET_KEY       ← JWT authentication must work
```

---

## 1️⃣ DB_HOST (Backend)

**What it is:**
The hostname of your MySQL database on Render.

**Your value:**
```
xxxxx-mysql.render.com
```

**Where to find it:**
1. Go to Render Dashboard
2. Click on `monexamen-db` (Database)
3. Go to `Connections` tab
4. Copy the hostname (looks like: `srv-xxxxx-mysql.render.com`)

**Where to set it:**
1. Go to `monexamen-backend` service
2. Click `Environment`
3. Find `DB_HOST`
4. Paste your copied hostname

⚠️ **CRITICAL:** Use the exact hostname from Connections tab!
- ✅ Correct: `srv-xxxxx-mysql.render.com`
- ❌ Wrong: `localhost` (doesn't work on Render!)
- ❌ Wrong: `127.0.0.1` (doesn't work on Render!)
- ❌ Wrong: `monexamen-db.render.internal` (might not resolve)

---

## 2️⃣ DB_PASSWORD (Backend)

**Your value:**
```
1234
```

**Where to set it:**
1. Go to `monexamen-backend` service
2. Click `Environment`
3. Find `DB_PASSWORD`
4. Set to: `1234`

⚠️ **CRITICAL:** This MUST match `MYSQL_PASSWORD` on database!

**Check it:**
- Database `MYSQL_PASSWORD` = `1234` ✅
- Backend `DB_PASSWORD` = `1234` ✅
- If different → Backend can't connect!

---

## 3️⃣ SECRET_KEY (Backend)

**What it is:**
A random cryptographic key for JWT tokens.

**Generate it (do this ONCE):**

Open your terminal and run:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

You'll get something like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Where to set it:**
1. Go to `monexamen-backend` service
2. Click `Environment`
3. Find `SECRET_KEY`
4. Paste your generated value

⚠️ **CRITICAL:** 
- Generate it ONCE
- Never change it (or all user sessions break!)
- Never commit it to GitHub
- Don't share it with anyone

---

## All 6 Backend Variables (Reference)

```
FLASK_ENV           = production
DB_HOST             = xxxxx-mysql.render.com  ← From Database Connections
DB_NAME             = monexamenn
DB_USER             = jenos
DB_PASSWORD         = 1234
SECRET_KEY          = <your generated key>    ← Generate once
```

---

## Database Variables (Reference)

When creating the MySQL database:

```
MYSQL_DATABASE      = monexamenn
MYSQL_USER          = jenos
MYSQL_PASSWORD      = 1234
MYSQL_ROOT_PASSWORD = 1234
```

---

## Quick Checklist ✅

Before you deploy:

- [ ] DB_HOST = Exact hostname from Database Connections tab
- [ ] DB_PASSWORD = 1234 (matches MYSQL_PASSWORD)
- [ ] SECRET_KEY = Generated with Python (not empty!)
- [ ] All 6 Backend variables = Set correctly
- [ ] All 4 Database variables = Set correctly
- [ ] Frontend Environment = Empty (no variables needed)

---

## 🚨 Troubleshooting

### Backend won't start: "cannot connect to database"
→ Check `DB_HOST` is exactly correct (copy/paste from Connections tab!)

### Backend won't start: "access denied"
→ Check `DB_PASSWORD = 1234` matches `MYSQL_PASSWORD = 1234`

### Users can't login
→ Check `SECRET_KEY` is not empty

### Services keep crashing
→ Check all 6 Backend variables in Render Dashboard

---

## ✨ When You're Done

All 3 critical variables set correctly = **Deployment will work!** 🚀
