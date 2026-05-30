FROM python:3.10-slim

WORKDIR /app

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers requirements.txt
COPY requirements.txt .

# Installer les dépendances python
RUN pip install --no-cache-dir -r requirements.txt

# Copier les sources du backend
COPY . .

# Exposer le port de l'application Flask
EXPOSE 5000

# Commande par défaut pour démarrer le serveur
CMD ["python", "app.py"]
