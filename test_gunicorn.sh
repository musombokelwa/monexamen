#!/bin/bash
cd Backend
source ../venv/bin/activate 2>/dev/null || source venv/bin/activate 2>/dev/null
gunicorn -w 1 -b 127.0.0.1:5000 app:app &
PID=$!
sleep 3
curl -s http://127.0.0.1:5000/api/health
kill $PID
