#!/usr/bin/env bash
# scripts/smoke.sh — Stage 1 checkpoint
set -euo pipefail
cd "$(dirname "$0")/.."

pass()  { printf "  \033[32mPASS\033[0m  %s\n" "$1"; }
fail()  { printf "  \033[31mFAIL\033[0m  %s\n" "$1"; exit 1; }
head()  { printf "\n\033[1m%s\033[0m\n" "$1"; }

head "Stage 1 — Smoke test"

# --- postgres ---
PG_VERSION=$(docker compose exec -T postgres psql -U "${POSTGRES_USER:-lab}" -d "${POSTGRES_DB:-labdb}" -tAc "SELECT version();" 2>/dev/null || true)
if [[ -z "$PG_VERSION" ]]; then
  fail "Postgres not reachable"
fi
pass "postgres reachable: ${PG_VERSION%%,*}"

USERS_COUNT=$(docker compose exec -T postgres psql -U "${POSTGRES_USER:-lab}" -d "${POSTGRES_DB:-labdb}" -tAc "SELECT count(*) FROM users;" 2>/dev/null | tr -d '[:space:]')
PRODUCTS_COUNT=$(docker compose exec -T postgres psql -U "${POSTGRES_USER:-lab}" -d "${POSTGRES_DB:-labdb}" -tAc "SELECT count(*) FROM products;" 2>/dev/null | tr -d '[:space:]')
[[ "$USERS_COUNT"    -gt 0 ]] && pass "users seeded ($USERS_COUNT rows)"    || fail "users table empty"
[[ "$PRODUCTS_COUNT" -gt 0 ]] && pass "products seeded ($PRODUCTS_COUNT rows)" || fail "products table empty"

# --- redis ---
PONG=$(docker compose exec -T redis redis-cli PING 2>/dev/null | tr -d '[:space:]')
[[ "$PONG" == "PONG" ]] && pass "redis responded PONG" || fail "redis did not respond (got: $PONG)"

docker compose exec -T redis redis-cli SET lab:smoke "ok" EX 60 >/dev/null
GOT=$(docker compose exec -T redis redis-cli GET lab:smoke | tr -d '[:space:]')
[[ "$GOT" == "ok" ]] && pass "redis set/get works" || fail "redis set/get failed (got: $GOT)"

printf "\n\033[1;32mStage 1 checkpoint: GREEN\033[0m\n\n"
