# Dockerfile unifié pour MonExamen (Frontend + Backend)
FROM python:3.11-slim

# Installer Nginx et curl
RUN apt-get update && apt-get install -y nginx curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les requirements et installer les dépendances Backend
COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code backend
COPY Backend/ ./backend/

# Configurer Nginx
RUN rm -f /etc/nginx/sites-enabled/default
COPY Frontend/nginx.conf /etc/nginx/conf.d/monexamen.conf

# Copier les fichiers statiques du frontend
RUN rm -rf /usr/share/nginx/html/*
COPY Frontend/ /usr/share/nginx/html/

# Créer un script de démarrage qui lance Gunicorn et Nginx
RUN mkdir -p /app/scripts
RUN printf '#!/bin/sh\n\
cd /app/backend\n\
echo "Démarrage du Backend..."\n\
gunicorn -w 4 -b 127.0.0.1:5000 app:app &\n\
echo "Démarrage de Nginx..."\n\
exec nginx -g "daemon off;"\n' > /app/scripts/start.sh && chmod +x /app/scripts/start.sh

# Exposer le port 80 pour Render
EXPOSE 80

# Health check (Optionnel mais recommandé)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/api/health || exit 1

# Démarrer les services
CMD ["/app/scripts/start.sh"]
