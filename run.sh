#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if ! python3 -c "import flask, PIL" 2>/dev/null; then
  echo "Installing dependencies..."
  pip3 install -r requirements.txt -q
fi

echo ""
echo "  AstroVault → http://localhost:5000"
echo "  Press Ctrl+C to stop."
echo ""
python3 app.py
