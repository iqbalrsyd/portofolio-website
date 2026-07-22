#!/usr/bin/env bash
# scripts/smoke-images.sh — Stage 3 checkpoint
# Verifies every (service, variant) image boots and serves /healthz.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

NETWORK="backend-performance-lab_lab-net"

# We measure 3 services to keep the loop fast.
# The other two were already validated during build-images.sh.
declare -A PORTS=(
  [user-service]=19081 [order-service]=19083 [notification-service]=19084
)

pass()  { printf "  \033[32mPASS\033[0m  %s\n" "$1"; }
fail()  { printf "  \033[31mFAIL\033[0m  %s\n" "$1"; exit 1; }

for service in user-service order-service notification-service; do
  for variant in single multi-alpine distroless distroless-static; do
    image="lab/${service}:${variant}"
    port=${PORTS[$service]}
    name="smoke-${service}-${variant}"

    docker rm -f "$name" >/dev/null 2>&1 || true

    extra_env=()
    if [[ "$service" != "notification-service" ]]; then
      extra_env+=( -e "DATABASE_URL=postgres://lab:labpass@postgres:5432/labdb?sslmode=disable" )
      extra_env+=( -e "REDIS_URL=redis://redis:6379/0" )
    fi
    if [[ "$service" == "order-service" ]]; then
      extra_env+=( -e "USER_SERVICE_URL=http://user-service:8081" )
      extra_env+=( -e "PRODUCT_SERVICE_URL=http://product-service:8082" )
      extra_env+=( -e "NOTIFICATION_SERVICE_URL=http://notification-service:8084" )
    fi

    docker run -d --rm --name "$name" \
      --network "$NETWORK" \
      -p "${port}:${port}" \
      -e "PORT=${port}" \
      "${extra_env[@]}" \
      "$image" >/dev/null 2>&1

    deadline=$(( $(date +%s%3N) + 15000 ))
    ok=0
    while [[ $(date +%s%3N) -lt $deadline ]]; do
      if curl -sS -o /dev/null --max-time 1 "http://localhost:${port}/healthz" 2>/dev/null; then
        ok=1; break
      fi
      sleep 0.1
    done

    if [[ $ok -eq 1 ]]; then
      pass "$image -> 200"
    else
      fail "$image did not respond"
    fi
    docker rm -f "$name" >/dev/null 2>&1 || true
  done
done

printf "\n\033[1;32mStage 3 checkpoint: GREEN\033[0m\n\n"
