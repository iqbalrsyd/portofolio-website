#!/usr/bin/env bash
# scripts/measure-images.sh — Stage 3 / Experiment 01
# For every (service, variant) image:
#   - record size (already in build-summary.csv)
#   - measure container startup time
#   - measure peak memory (RSS)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SERVICES=(user-service order-service notification-service)  # exclude product+gateway (covered by other services)
VARIANTS=(single multi-alpine distroless distroless-static)

declare -A PORTS=(
  [user-service]=18081 [order-service]=18083 [notification-service]=18084
)

NETWORK="backend-performance-lab_lab-net"
OUT="$ROOT/benchmarks/exp01/runtime-summary.csv"
LOG="$ROOT/benchmarks/exp01/runtime.log"
: > "$LOG"

echo "service,variant,startup_ms,rss_kb" > "$OUT"

for service in "${SERVICES[@]}"; do
  for variant in "${VARIANTS[@]}"; do
    image="lab/${service}:${variant}"
    port=${PORTS[$service]}
    name="lab-measure-${service}-${variant}"

    docker rm -f "$name" >/dev/null 2>&1 || true

    extra_env=()
    if [[ "$service" != "notification-service" ]]; then
      extra_env+=( -e "DATABASE_URL=postgres://lab:labpass@postgres:5432/labdb?sslmode=disable" )
      extra_env+=( -e "REDIS_URL=redis://redis:6379/0" )
    fi
    if [[ "$service" == "order-service" ]]; then
      # dummy upstream URLs; we never trigger the order path, only /healthz
      extra_env+=( -e "USER_SERVICE_URL=http://user-service:8081" )
      extra_env+=( -e "PRODUCT_SERVICE_URL=http://product-service:8082" )
      extra_env+=( -e "NOTIFICATION_SERVICE_URL=http://notification-service:8084" )
    fi

    start=$(date +%s%3N)
    docker run -d --rm --name "$name" \
      --network "$NETWORK" \
      -p "${port}:${port}" \
      -e "PORT=${port}" \
      "${extra_env[@]}" \
      "$image" >>"$LOG" 2>&1

    # Probe via the host-mapped port (works for all variants including distroless
    # which has no shell, so docker exec wget is impossible).
    ok=0
    deadline=$(( $(date +%s%3N) + 15000 ))
    while [[ $(date +%s%3N) -lt $deadline ]]; do
      if curl -sS -o /dev/null --max-time 1 "http://localhost:${port}/healthz" 2>/dev/null; then
        ok=1; break
      fi
      sleep 0.1
    done

    if [[ $ok -eq 0 ]]; then
      printf "  %-45s FAIL (no /healthz within 15s)\n" "$image"
      docker logs --tail=10 "$name" >>"$LOG" 2>&1 || true
      docker rm -f "$name" >/dev/null 2>&1 || true
      echo "$service,$variant,NA,NA" >> "$OUT"
      continue
    fi

    end=$(date +%s%3N)
    startup=$((end - start))

    # tiny load to settle the runtime — fire from the host
    for i in 1 2 3 4 5 6 7 8 9 10; do
      curl -sS -o /dev/null "http://localhost:${port}/healthz" 2>/dev/null || true
    done

    # RSS from docker stats
    raw=$(docker stats "$name" --no-stream --format '{{.MemUsage}}' 2>/dev/null || echo "")
    if echo "$raw" | grep -q MiB; then
      rss_kb=$(echo "$raw" | awk '{print $1}' | sed 's/MiB//' | awk '{printf "%d", $1*1024}')
    elif echo "$raw" | grep -q KiB; then
      rss_kb=$(echo "$raw" | awk '{print $1}' | sed 's/KiB//' | awk '{printf "%d", $1}')
    elif echo "$raw" | grep -q GiB; then
      rss_kb=$(echo "$raw" | awk '{print $1}' | sed 's/GiB//' | awk '{printf "%d", $1*1024*1024}')
    else
      rss_kb=NA
    fi

    printf "  %-45s startup=%5dms rss=%sKB\n" "$image" "$startup" "$rss_kb"
    echo "$service,$variant,$startup,$rss_kb" >> "$OUT"

    docker rm -f "$name" >/dev/null 2>&1 || true
  done
done

printf "\n  summary -> %s\n\n" "$OUT"
