#!/usr/bin/env bash
# scripts/down.sh — stop containers (keep volumes)
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose down
echo "[down] containers stopped (volumes preserved)"
