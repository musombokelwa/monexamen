# Dockerfile unifié pour MonExamen (Frontend Nginx + Backend Gunicorn)
# Render fournit $PORT dynamiquement — Nginx doit écouter sur $PORT
FROM python:3.11-slim

# Installer Nginx, curl et gettext (pour envsubst)
RUN apt-get update && apt-get install -y nginx curl gettext-base && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les requirements et installer les dépendances Backend
COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code backend
COPY Backend/ ./backend/

# Supprimer la config Nginx par défaut
RUN rm -f /etc/nginx/sites-enabled/default

# Copier le template Nginx (avec $PORT comme variable)
COPY Frontend/nginx.conf /etc/nginx/templates/monexamen.conf.template

# Copier les fichiers statiques du frontend
RUN rm -rf /usr/share/nginx/html/*
COPY Frontend/ /usr/share/nginx/html/

# Créer le répertoire d'uploads
RUN mkdir -p /app/backend/uploads/documents

# Script de démarrage qui :
# 1. Remplace $PORT dans le template nginx
# 2. Lance Gunicorn en arrière-plan
# 3. Lance Nginx au premier plan
RUN mkdir -p /app/scripts
RUN printf '#!/bin/sh\n\
set -e\n\
\n\
# Port fourni par Render (ou 10000 par défaut)\n\
export PORT=${PORT:-10000}\n\
echo "=== MonExamen Unified Server ==="\n\
echo "Render PORT=$PORT"\n\
\n\
# Générer la config Nginx avec le bon port\n\
envsubst '"'"'$PORT'"'"' < /etc/nginx/templates/monexamen.conf.template > /etc/nginx/conf.d/monexamen.conf\n\
echo "Nginx configuré pour écouter sur le port $PORT"\n\
\n\
# Démarrer Gunicorn (backend) en arrière-plan sur le port interne 5000\n\
cd /app/backend\n\
echo "Démarrage de Gunicorn sur 127.0.0.1:5000..."\n\
gunicorn -w 4 -b 127.0.0.1:5000 --timeout 120 --access-logfile - --error-logfile - app:app &\n\
GUNICORN_PID=$!\n\
\n\
# Attendre que Gunicorn soit prêt\n\
echo "Attente du démarrage de Gunicorn..."\n\
for i in $(seq 1 30); do\n\
  if curl -sf http://127.0.0.1:5000/api/health > /dev/null 2>&1; then\n\
    echo "Gunicorn est prêt!"\n\
    break\n\
  fi\n\
  sleep 1\n\
done\n\
\n\
# Démarrer Nginx au premier plan\n\
echo "Démarrage de Nginx sur le port $PORT..."\n\
exec nginx -g "daemon off;"\n' > /app/scripts/start.sh && chmod +x /app/scripts/start.sh

# Render écoute sur $PORT — on ne EXPOSE pas en dur
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT:-10000}/api/health || exit 1

# Démarrer les services
CMD ["/app/scripts/start.sh"]
