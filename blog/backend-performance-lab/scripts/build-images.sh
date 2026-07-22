#!/usr/bin/env bash
# scripts/build-images.sh — Stage 3 / Experiment 01
# Builds 4 variants of every service and tags them as
#   lab/<service>:<variant>
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SERVICES=(user-service product-service order-service notification-service api-gateway)
VARIANTS=(single multi-alpine distroless distroless-static)
VARIANT_DIR="$ROOT/docker/variants"

# sanity: docker available
command -v docker >/dev/null || { echo "docker not found" >&2; exit 1; }

# BuildKit produces nicer caching and is on by default in modern docker,
# but export explicitly for clarity.
export DOCKER_BUILDKIT=1

# Total wall time
TOTAL_START=$(date +%s)

declare -A VARIANT_DOCKERFILE=(
  [single]="$VARIANT_DIR/Dockerfile.single"
  [multi-alpine]="$VARIANT_DIR/Dockerfile.multi-alpine"
  [distroless]="$VARIANT_DIR/Dockerfile.distroless"
  [distroless-static]="$VARIANT_DIR/Dockerfile.distroless-static"
)

# Clean previous lab/* images so size measurement is accurate
docker images --format '{{.Repository}}:{{.Tag}}' \
  | grep -E '^lab/' \
  | xargs -r docker rmi -f >/dev/null 2>&1 || true

mkdir -p "$ROOT/benchmarks/exp01"
LOG="$ROOT/benchmarks/exp01/build.log"
: > "$LOG"

for service in "${SERVICES[@]}"; do
  for variant in "${VARIANTS[@]}"; do
    df="${VARIANT_DOCKERFILE[$variant]}"
    tag="lab/${service}:${variant}"
    printf "  building %-45s ... " "$tag"
    start=$(date +%s%3N)
    if docker build \
        -f "$df" \
        --build-arg "SERVICE=$service" \
        -t "$tag" \
        "$ROOT" >>"$LOG" 2>&1; then
      end=$(date +%s%3N)
      ms=$((end - start))
      size=$(docker image inspect "$tag" --format='{{.Size}}')
      size_mb=$(awk -v b="$size" 'BEGIN{printf "%.2f", b/1024/1024}')
      printf "ok  build=%4dms  size=%6sMB\n" "$ms" "$size_mb"
      echo "$service,$variant,${ms},$size" >> "$ROOT/benchmarks/exp01/build-summary.csv"
    else
      printf "FAIL (see %s)\n" "$LOG"
      tail -20 "$LOG"
      exit 1
    fi
  done
done

TOTAL_END=$(date +%s)
TOTAL=$((TOTAL_END - TOTAL_START))
printf "\n  all variants built in %ds. summary -> benchmarks/exp01/build-summary.csv\n\n" "$TOTAL"

# emit a header if the csv is brand new
if ! head -1 "$ROOT/benchmarks/exp01/build-summary.csv" 2>/dev/null | grep -q service; then
  # shelljoin of fields
  { echo "service,variant,build_ms,size_bytes"; cat "$ROOT/benchmarks/exp01/build-summary.csv"; } \
    > "$ROOT/benchmarks/exp01/build-summary.csv.tmp"
  mv "$ROOT/benchmarks/exp01/build-summary.csv.tmp" "$ROOT/benchmarks/exp01/build-summary.csv"
fi
