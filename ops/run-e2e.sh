#!/bin/bash
# Start the E2E stack, run Playwright tests, and stop containers after tests finish

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting E2E stack and running Playwright tests..."
docker compose -f docker-compose.e2e.yml up --build --abort-on-container-exit

echo "E2E tests finished. Stopping containers..."
docker compose -f docker-compose.e2e.yml down