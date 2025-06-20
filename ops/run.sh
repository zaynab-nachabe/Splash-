#!/bin/bash
# Start the main stack (frontend on 8080, backend on 8081) in foreground mode

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting main stack (frontend:8080, backend:8081)..."
docker compose -f docker-compose.yml up --build