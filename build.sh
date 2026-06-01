#!/bin/bash
set -e

echo "🔨 Building MonExamen for Render..."
echo ""

# Verify Python availability
echo "✅ Python version:"
python3 --version
echo ""

# Install Backend dependencies
echo "📦 Installing Backend dependencies..."
if [ -f "Backend/requirements.txt" ]; then
    pip install --no-cache-dir -r Backend/requirements.txt
    echo "✅ Backend dependencies installed successfully!"
else
    echo "❌ Backend/requirements.txt not found!"
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""
