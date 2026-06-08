# Multi-stage build pour MonExamen
# Stage 1: Backend Python
FROM python:3.11-slim AS backend-builder

WORKDIR /app

# Copier les requirements et installer les dépendances
COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code backend
COPY Backend/ ./backend/

# Stage 2: Frontend (Nginx + static files)
FROM nginx:alpine

# Installer curl pour health checks
RUN apk add --no-cache curl

# Supprimer la configuration par défaut de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copier la configuration personnalisée de Nginx
COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers statiques du frontend
COPY Frontend/ /usr/share/nginx/html

# Copier les dépendances Python du stage 1
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin/gunicorn /usr/local/bin/gunicorn

# Copier le code backend du stage 1
COPY --from=backend-builder /app/backend /app/backend

# Installer Python dans l'image finale
RUN apk add --no-cache python3 py3-pip

# Créer un script de démarrage qui lance à la fois Nginx et Flask
RUN mkdir -p /app/scripts
RUN printf '#!/bin/sh\ncd /app/backend\ngunicorn -w 4 -b 127.0.0.1:5000 app:app &\nBACKEND_PID=$!\nexec nginx -g "daemon off;"\n' > /app/scripts/start.sh && chmod +x /app/scripts/start.sh

# Exposer les ports
EXPOSE 80 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/api/health || exit 1

# Démarrer les services
CMD ["/bin/sh", "/app/scripts/start.sh"]
