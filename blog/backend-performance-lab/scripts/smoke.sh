#!/usr/bin/env bash
# scripts/smoke.sh — Stage 2 smoke test
# Verifies all services healthy, CRUD works through the gateway, and a full order flow succeeds.
set -euo pipefail
cd "$(dirname "$0")/.."

GATEWAY="${GATEWAY:-http://localhost:8080}"
pass()  { printf "  \033[32mPASS\033[0m  %s\n" "$1"; }
fail()  { printf "  \033[31mFAIL\033[0m  %s\n" "$1"; exit 1; }
head()  { printf "\n\033[1m%s\033[0m\n" "$1"; }

# helpers
http() {
  local method=$1 url=$2; shift 2
  curl -sS -o /tmp/resp.body -w "%{http_code}" -X "$method" "$url" "$@"
}
body() { cat /tmp/resp.body; }

# ----------------------------------------------------------------
# 1) healthz of every service through the gateway
# ----------------------------------------------------------------
head "Stage 2 — Service health"
# Gateway has its own /healthz; downstream services' /healthz are on the docker network
# and not exposed through the gateway by design.
for path in /healthz; do
  code=$(http GET "$GATEWAY$path")
  if [[ "$code" == "200" ]]; then pass "gateway$path -> 200"
  else fail "gateway$path -> $code ($(body))"
  fi
done
# Direct container reachability via docker network (each service binds its own PORT)
declare -A ports=( [user-service]=8081 [product-service]=8082 [order-service]=8083 [notification-service]=8084 )
for svc in user-service product-service order-service notification-service; do
  port=${ports[$svc]}
  body=$(docker exec "lab-$svc" wget -qO- "http://localhost:$port/healthz" 2>/dev/null || true)
  if echo "$body" | grep -q "\"service\":\"$svc\""; then
    pass "$svc /healthz responds on :$port"
  else
    fail "$svc /healthz did not respond (got: $body)"
  fi
done

# ----------------------------------------------------------------
# 2) user CRUD
# ----------------------------------------------------------------
head "Stage 2 — user-service CRUD"
code=$(http POST "$GATEWAY/api/users" -H 'Content-Type: application/json' \
  -d '{"email":"alice@lab.local","name":"Alice"}')
[[ "$code" == "201" ]] || fail "create user -> $code ($(body))"
USER_ID=$(body | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
pass "user created id=$USER_ID"

code=$(http GET "$GATEWAY/api/users/$USER_ID")
[[ "$code" == "200" ]] && pass "get user id=$USER_ID" || fail "get user -> $code"

code=$(http PUT "$GATEWAY/api/users/$USER_ID" -H 'Content-Type: application/json' \
  -d '{"name":"Alice Updated"}')
[[ "$code" == "200" ]] && pass "user updated" || fail "update user -> $code"

# ----------------------------------------------------------------
# 3) product CRUD
# ----------------------------------------------------------------
head "Stage 2 — product-service CRUD"
code=$(http POST "$GATEWAY/api/products" -H 'Content-Type: application/json' \
  -d '{"sku":"SKU-LAB-001","name":"Lab Widget","price":9.99,"stock":100}')
[[ "$code" == "201" ]] || fail "create product -> $code ($(body))"
PRODUCT_ID=$(body | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
pass "product created id=$PRODUCT_ID stock=100"

# ----------------------------------------------------------------
# 4) end-to-end order
# ----------------------------------------------------------------
head "Stage 2 — end-to-end order"
code=$(http POST "$GATEWAY/api/orders" -H 'Content-Type: application/json' \
  -d "{\"user_id\":$USER_ID,\"product_id\":$PRODUCT_ID,\"qty\":3}")
[[ "$code" == "201" ]] || fail "create order -> $code ($(body))"
ORDER_ID=$(body | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
pass "order created id=$ORDER_ID"

# verify stock decremented — read directly from the DB to bypass product cache TTL
NEW_STOCK=$(docker exec lab-postgres psql -U lab -d labdb -tAc "SELECT stock FROM products WHERE id=$PRODUCT_ID;" | tr -d '[:space:]')
[[ "$NEW_STOCK" == "97" ]] && pass "product stock decremented 100 -> $NEW_STOCK" \
                            || fail "expected stock=97, got $NEW_STOCK"

# fetch order
code=$(http GET "$GATEWAY/api/orders/$ORDER_ID")
[[ "$code" == "200" ]] && pass "get order id=$ORDER_ID" || fail "get order -> $code"

# ----------------------------------------------------------------
# 5) error paths
# ----------------------------------------------------------------
head "Stage 2 — error handling"
code=$(http GET "$GATEWAY/api/users/9999999")
[[ "$code" == "404" ]] && pass "missing user -> 404" || fail "expected 404, got $code"

code=$(http POST "$GATEWAY/api/orders" -H 'Content-Type: application/json' \
  -d "{\"user_id\":$USER_ID,\"product_id\":$PRODUCT_ID,\"qty\":9999}")
[[ "$code" == "409" ]] && pass "insufficient stock -> 409" || fail "expected 409, got $code ($(body))"

# ----------------------------------------------------------------
# 6) metrics endpoint
# ----------------------------------------------------------------
head "Stage 2 — observability"
# /metrics lives on each service's root
declare -A ports=( [user-service]=8081 [product-service]=8082 [order-service]=8083 [notification-service]=8084 )
for svc in user-service product-service order-service notification-service; do
  port=${ports[$svc]}
  body=$(docker exec "lab-$svc" wget -qO- "http://localhost:$port/metrics" 2>/dev/null || true)
  if echo "$body" | grep -q "http_requests_total"; then
    pass "$svc exposes Prometheus metrics on :$port"
  else
    fail "$svc metrics missing on :$port"
  fi
done

printf "\n\033[1;32mStage 2 checkpoint: GREEN\033[0m\n\n"
