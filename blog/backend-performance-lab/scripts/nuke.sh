#!/usr/bin/env bash
# scripts/nuke.sh — DESTRUCTIVE: remove containers + volumes
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose down -v
echo "[nuke] containers and volumes removed"
