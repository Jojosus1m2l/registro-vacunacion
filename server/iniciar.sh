#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PORT="${1:-8000}"
URL="http://127.0.0.1:${PORT}/"
VERSION_URL="${URL}__version"

if curl -fsS "$VERSION_URL" >/dev/null 2>&1; then
  echo "La aplicación ya está activa en: $URL"
elif curl -s -o /dev/null "$URL" 2>/dev/null; then
  echo "El puerto $PORT está ocupado por otro servicio o por un preview anterior." >&2
  echo "Cierra ese proceso o prueba con: ./iniciar.sh 8001" >&2
  exit 1
else
  nohup python3 servidor.py "$PORT" \
    > /tmp/registro-vacunacion.log 2>&1 &
  echo $! > /tmp/registro-vacunacion.pid
  sleep 0.8

  if ! curl -fsS "$VERSION_URL" >/dev/null 2>&1; then
    echo "No se pudo iniciar el servidor. Revisa /tmp/registro-vacunacion.log" >&2
    exit 1
  fi

  echo "Aplicación iniciada en: $URL"
  echo "Recarga automática activa: los cambios aparecerán solos en el navegador."
fi

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 || true
fi
