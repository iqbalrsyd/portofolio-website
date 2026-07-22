#!/usr/bin/env bash
# scripts/experiments/exp01-images.sh — Stage 3 / Experiment 01
# Docker Image Optimization
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

mkdir -p benchmarks/exp01
echo "service,variant,build_ms,size_bytes" > benchmarks/exp01/build-summary.csv

bash scripts/build-images.sh
bash scripts/measure-images.sh

# Merge build + runtime into one tidy csv
python3 - <<'PY'
import csv
b = { (r["service"], r["variant"]): r for r in csv.DictReader(open("benchmarks/exp01/build-summary.csv")) }
r = { (r["service"], r["variant"]): r for r in csv.DictReader(open("benchmarks/exp01/runtime-summary.csv")) }
keys = sorted(b.keys())
out = open("benchmarks/exp01/all.csv","w")
w = csv.writer(out)
w.writerow(["service","variant","build_ms","size_bytes","size_mb","startup_ms","rss_kb"])
for k in keys:
    br, rr = b[k], r.get(k, {})
    size_b = int(br["size_bytes"])
    w.writerow([br["service"], br["variant"], br["build_ms"], size_b, f"{size_b/1024/1024:.2f}", rr.get("startup_ms",""), rr.get("rss_kb","")])
out.close()
print("wrote benchmarks/exp01/all.csv")
PY

echo
echo "Done. Artifacts:"
ls -la benchmarks/exp01/
