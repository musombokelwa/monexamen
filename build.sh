#!/bin/bash
# Script de build pour Render

# Installer les dépendances du Backend
echo "Installing Backend dependencies..."
cd Backend
pip install -r requirements.txt
cd ..

echo "Build completed successfully!"
