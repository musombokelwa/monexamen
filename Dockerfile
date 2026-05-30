# Build stage pour le Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY Frontend/ .

# Stage final - Nginx avec Frontend
FROM nginx:alpine

# Supprimer la configuration par défaut de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copier la configuration personnalisée de Nginx
COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers statiques du frontend
COPY Frontend/ /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx en arrière-plan (comportement par défaut de l'image)
CMD ["nginx", "-g", "daemon off;"]
