#!/bin/bash
echo "Démarrage du projet MonExamen en local..."

# Obtenir le chemin absolu du projet
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Fonction pour fermer les processus enfants à la fermeture du script
cleanup() {
    echo ""
    echo "Fermeture des serveurs..."
    kill $(jobs -p) 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

echo "[1/2] Lancement du Backend (API) sur le port 5000..."
cd "$PROJECT_ROOT/Backend"
source venv/bin/activate
python app.py &

echo "[2/2] Lancement du Frontend (Interface) sur le port 3000..."
cd "$PROJECT_ROOT/Frontend"
python3 -m http.server 3000 
echo "TOUT EST PRÊT !"
echo "Ouvrez votre navigateur sur : http://localhost:3000"

# Attendre que les processus en arrière-plan se terminent
wait
