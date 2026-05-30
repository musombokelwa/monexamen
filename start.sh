#!/bin/bash
# Script de démarrage pour Render

cd Backend
gunicorn -w 4 -b 0.0.0.0:${PORT:-5000} app:app
