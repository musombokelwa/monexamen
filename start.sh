#!/bin/bash
set -e

echo "🚀 Starting MonExamen Backend on Render..."
echo ""

# Get port from environment or default to 5000
PORT=${PORT:-5000}
echo "📡 Starting Gunicorn on port $PORT"
echo ""

# Start the Flask application with Gunicorn
cd Backend && exec gunicorn -w 4 -b 0.0.0.0:$PORT app:app
