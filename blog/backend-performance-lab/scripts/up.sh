#!/usr/bin/env bash
# scripts/up.sh — bring up Postgres + Redis for Stage 1
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env && -f configs/env.example ]]; then
  cp configs/env.example .env
  echo "[up] created .env from configs/env.example"
fi

docker compose up -d postgres redis

echo "[up] waiting for services to become healthy..."
for i in {1..30}; do
  if docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-lab}" >/dev/null 2>&1 \
     && docker compose exec -T redis redis-cli ping >/dev/null 2>&1; then
     echo "[up] services are healthy"
     exit 0
  fi
  sleep 2
done

echo "[up] services did not become healthy in time" >&2
docker compose ps
exit 1
