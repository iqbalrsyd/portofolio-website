# Backend Performance Lab — Runner's Guide

> A portfolio-grade engineering lab that evaluates **performance, scalability, observability, and deployment strategies** of a microservice backend running on Kubernetes.
> This README is the **single entry point** for running the project. Follow the stages in order.

---

## Table of Contents

- [0. Prerequisites](#0-prerequisites)
- [1. Repository Layout](#1-repository-layout)
- [2. Stages Overview](#2-stages-overview)
- [Stage 1 — Bootstrap & Local Services](#stage-1--bootstrap--local-services)
- [Stage 2 — Microservices in Go](#stage-2--microservices-in-go)
- [Stage 3 — Containerize Everything](#stage-3--containerize-everything)
- [Stage 4 — Kubernetes (Minikube)](#stage-4--kubernetes-minikube)
- [Stage 5 — Networking & Ingress](#stage-5--networking--ingress)
- [Stage 6 — Observability Stack](#stage-6--observability-stack)
- [Stage 7 — Performance Experiments](#stage-7--performance-experiments)
- [Stage 8 — Load Testing with K6](#stage-8--load-testing-with-k6)
- [Stage 9 — CI/CD Pipeline](#stage-9--cicd-pipeline)
- [Stage 10 — Benchmark Reports & Blog](#stage-10--benchmark-reports--blog)
- [Quick Reference Commands](#quick-reference-commands)
- [Troubleshooting](#troubleshooting)

---

## 0. Prerequisites

Install these **once** before starting any stage.

| Tool                    | Version | Check                      |
| ----------------------- | ------- | -------------------------- |
| Git                     | 2.30+   | `git --version`            |
| Docker Desktop / Engine | 24+     | `docker --version`         |
| Docker Compose          | v2      | `docker compose version`   |
| Go                      | 1.22+   | `go version`               |
| Minikube                | 1.32+   | `minikube version`         |
| kubectl                 | 1.29+   | `kubectl version --client` |
| Helm                    | 3.14+   | `helm version`             |
| k6                      | 0.49+   | `k6 version`               |
| curl / jq               | any     | `curl --version`           |

Recommended host: **Linux x86_64 or macOS**, 16 GB RAM, 8 vCPU, 50 GB free disk.

Allocate Docker/Minikube at least **8 GB RAM and 4 CPUs**.

```bash
# Verify all tools at once
for cmd in git docker go minikube kubectl helm k6; do
  printf "%-10s -> " "$cmd"; command -v "$cmd" || echo "MISSING"
done
```

---

## 1. Repository Layout

```
backend-performance-lab/
├── docs/               # Architecture diagrams, ADRs, blog drafts
├── benchmarks/         # Experiment results (CSV, MD, charts)
├── load-tests/         # K6 scripts & scenarios
├── dashboards/         # Grafana dashboards (JSON)
├── kubernetes/         # Manifests & Helm charts
│   ├── base/
│   └── overlays/
├── docker/             # Dockerfiles (single-stage, multi-stage, distroless)
├── scripts/            # Bootstrap, teardown, experiment runners
├── services/           # Go microservices
│   ├── api-gateway/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   └── notification-service/
├── configs/            # Postgres init SQL, Redis config, env files
├── .github/            # GitHub Actions workflows
├── docker-compose.yml  # Local stack (Postgres, Redis, services)
└── README.md           # This file
```

---

## 2. Stages Overview

| #   | Stage                      | Outcome                            | Time est. |
| --- | -------------------------- | ---------------------------------- | --------- |
| 1   | Bootstrap & Local Services | Repo + Postgres + Redis up locally | 0.5 day   |
| 2   | Microservices in Go        | 5 services with REST APIs          | 2–3 days  |
| 3   | Containerize Everything    | Optimized Docker images            | 1 day     |
| 4   | Kubernetes (Minikube)      | All services on K8s                | 1 day     |
| 5   | Networking & Ingress       | Ingress + TLS routing              | 0.5 day   |
| 6   | Observability Stack        | Prometheus + Grafana + Loki        | 1 day     |
| 7   | Performance Experiments    | 10 experiments executed            | 3–4 days  |
| 8   | Load Testing with K6       | Repeatable load scripts            | 0.5 day   |
| 9   | CI/CD Pipeline             | GitHub Actions green               | 0.5 day   |
| 10  | Benchmark Reports & Blog   | Published engineering reports      | 1 day     |

Each stage ends with a **green checkpoint** (tests pass + a smoke test). Don't move to the next stage until the checkpoint passes.

---

## Stage 1 — Bootstrap & Local Services

**Goal:** Create the repo, init project files, and run Postgres + Redis locally.

### 1.1 Initialize

```bash
git init backend-performance-lab
cd backend-performance-lab
mkdir -p docs benchmarks load-tests dashboards kubernetes docker scripts configs .github/workflows services
```

### 1.2 Start Postgres & Redis

```bash
docker compose up -d postgres redis
docker compose ps
```

### 1.3 Smoke test

```bash
docker exec -it postgres psql -U lab -d labdb -c "SELECT version();"
docker exec -it redis redis-cli PING
```

Checkpoint: `PONG` and a Postgres version string.

---

## Stage 2 — Microservices in Go

**Goal:** Build 5 Go services that talk to each other.

```
services/
├── api-gateway/         # routes /api/* to the right service
├── user-service/        # GET/POST /users
├── product-service/     # GET/POST /products
├── order-service/       # POST /orders -> calls user + product
└── notification-service # logs/stubs a notification
```

### 2.1 Create a service template

For each service:

```bash
cd services/user-service
go mod init github.com/lab/user-service
go get github.com/gin-gonic/gin
go get gorm.io/gorm gorm.io/driver/postgres
go get github.com/redis/go-redis/v9
go get github.com/prometheus/client_golang/prometheus
```

Minimal `main.go` exposes:

- `GET /healthz`
- `GET /metrics`
- domain CRUD endpoints

Repeat for `product-service`, `order-service`, `notification-service`, `api-gateway`.

### 2.2 Run locally

```bash
docker compose up -d
go run ./services/user-service &
go run ./services/product-service &
go run ./services/order-service &
go run ./services/notification-service &
go run ./services/api-gateway &
```

### 2.3 Smoke test

```bash
curl -s http://localhost:8080/healthz
curl -s http://localhost:8080/api/users
curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"product_id":1,"qty":2}'
```

Checkpoint: All five `/healthz` return 200; an order is created.

---

## Stage 3 — Containerize Everything

**Goal:** Produce 4 Docker image variants per service and compare them.

### 3.1 Variants in `docker/variants/`

| Variant            | Tag suffix          | Base image                                         |
| ------------------ | ------------------- | -------------------------------------------------- |
| Single-stage       | `single`            | `golang:1.22`                                      |
| Multi-stage Alpine | `multi-alpine`      | `golang:1.22` -> `alpine:3.20`                     |
| Distroless (glibc) | `distroless`        | `golang:1.22` -> `gcr.io/distroless/base-debian12` |
| Distroless Static  | `distroless-static` | `golang:1.22` -> `gcr.io/distroless/static`        |

### 3.2 Build & measure

```bash
bash scripts/build-images.sh       # builds 20 images (5 services x 4 variants)
bash scripts/measure-images.sh     # boots each, records startup + RSS
bash scripts/experiments/exp01-images.sh  # the all-in-one experiment runner
```

Outputs land in `benchmarks/exp01/`:

- `build-summary.csv` — build_ms, size_bytes per image
- `runtime-summary.csv` — startup_ms, rss_kb per image
- `all.csv` — merged view
- `results.md` — analysis

### 3.3 Smoke test (all 12 variants)

```bash
bash scripts/smoke-images.sh
```

Checkpoint: 12 / 12 images respond to `/healthz`; `all.csv` and `results.md` populated.

---

## Stage 4 — Kubernetes (Minikube)

**Goal:** Deploy the full system to a local cluster.

### 4.1 Start the cluster

```bash
minikube start --cpus=4 --memory=8g --driver=docker
minikube addons enable metrics-server
minikube addons enable ingress
```

### 4.2 Build images inside Minikube

```bash
eval $(minikube docker-env)
./scripts/build-images.sh
```

### 4.3 Deploy

```bash
kubectl apply -f kubernetes/base/postgres/
kubectl apply -f kubernetes/base/redis/
kubectl apply -f kubernetes/base/services/
kubectl apply -k kubernetes/overlays/dev
```

### 4.4 Verify

```bash
kubectl get pods -n lab
kubectl get svc -n lab
kubectl logs -n lab deploy/user-service --tail=20
```

Checkpoint: All pods `Running`, all services have a `ClusterIP`.

---

## Stage 5 — Networking & Ingress

**Goal:** Expose the system through a single hostname and compare routing strategies.

### 5.1 Enable ingress addon

```bash
minikube addons enable ingress
```

### 5.2 Apply ingress manifests

```bash
kubectl apply -f kubernetes/ingress/
```

### 5.3 Test

```bash
echo "$(minikube ip) lab.local" | sudo tee -a /etc/hosts
curl -s http://lab.local/api/users
curl -s http://lab.local/api/products
```

### 5.4 Comparison experiment

Switch between **ClusterIP + Ingress**, **NodePort**, and **port-forward**, then rerun Stage 8 load tests. Record the trade-offs in `benchmarks/networking.md`.

Checkpoint: `lab.local` resolves and proxies correctly.

---

## Stage 6 — Observability Stack

**Goal:** Full visibility — metrics, logs, and dashboards.

### 6.1 Install kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install kube-prom prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace
```

### 6.2 Install Loki

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm install loki grafana/loki-stack -n monitoring
```

### 6.3 Import dashboards

```bash
kubectl create configmap grafana-dashboards \
  --from-file=dashboards/ -n monitoring --dry-run=client -o yaml | kubectl apply -f -
```

### 6.4 Open Grafana

```bash
kubectl port-forward -n monitoring svc/kube-prom-grafana 3000:80
# login: admin / prom-operator
```

### 6.5 Required dashboards

- Cluster overview (CPU, memory, pod status, node health)
- Per-service latency, RPS, error rate
- Postgres & Redis (via exporters)
- Container restart count

Checkpoint: All five services show up in Prometheus targets; logs are visible in Grafana Explore.

---

## Stage 7 — Performance Experiments

Each experiment is reproducible. Run scripts live in `scripts/experiments/`.

| #   | Experiment                      | Script                   | Output              |
| --- | ------------------------------- | ------------------------ | ------------------- |
| 1   | Docker Image Optimization       | `exp01-images.sh`        | `benchmarks/exp01/` |
| 2   | CPU/Memory Requests & Limits    | `exp02-resources.sh`     | `benchmarks/exp02/` |
| 3   | Replica Scaling (1, 2, 4, 8)    | `exp03-replicas.sh`      | `benchmarks/exp03/` |
| 4   | HPA vs no HPA                   | `exp04-hpa.sh`           | `benchmarks/exp04/` |
| 5   | Redis Cache (off, on, TTLs)     | `exp05-cache.sh`         | `benchmarks/exp05/` |
| 6   | Postgres Indexes                | `exp06-indexes.sql`      | `benchmarks/exp06/` |
| 7   | Deployment Strategies           | `exp07-deploy.sh`        | `benchmarks/exp07/` |
| 8   | Networking: NodePort vs Ingress | `exp08-network.sh`       | `benchmarks/exp08/` |
| 9   | Observability Coverage          | `exp09-observability.sh` | `benchmarks/exp09/` |
| 10  | CI/CD Pipeline Timing           | `exp10-cicd.sh`          | `benchmarks/exp10/` |

### Generic experiment loop

```bash
./scripts/experiments/exp01-images.sh           # run
cat benchmarks/exp01/results.md                 # read
```

Each `results.md` should contain: objective, setup, methodology, raw numbers, table, analysis, trade-offs, conclusion.

Checkpoint: Every experiment folder has a `results.md` with a populated table.

---

## Stage 8 — Load Testing with K6

**Goal:** Generate comparable load across configurations.

### 8.1 Scenarios

```bash
load-tests/
├── smoke.js          # 5 VUs, 30s
├── baseline-50.js    # 50 VUs
├── scale-100.js      # 100 VUs
├── stress-300.js     # 300 VUs
├── peak-500.js       # 500 VUs
└── chaos-1000.js     # 1000 VUs
```

### 8.2 Run

```bash
k6 run --out json=benchmarks/load/50vus.json load-tests/baseline-50.js
```

Or use the helper:

```bash
./scripts/load-all.sh              # runs all 6 scenarios sequentially
./scripts/load-all.sh --only 100,500
```

### 8.3 Capture cluster state

```bash
./scripts/snapshot-cluster.sh >> benchmarks/load/cluster-state.log
```

### 8.4 Metrics recorded

- Average latency, P95, P99
- Requests per second
- Success / error rate
- CPU & memory (per pod, per node)
- Pod restarts during test

Checkpoint: All 6 scenarios produce JSON output + a row in `benchmarks/load/summary.csv`.

---

## Stage 9 — CI/CD Pipeline

**Goal:** Every push triggers lint → test → build → push → (optional) deploy.

### 9.1 Workflow (`.github/workflows/ci.yml`)

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.22' }
      - run: go vet ./...
      - run: go test ./... -race -coverprofile=coverage.out
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: ${{github.actor}}, password: ${{secrets.GITHUB_TOKEN}} }
      - run: docker buildx build --push -t ghcr.io/${{github.repository}}/api-gateway:${{github.sha}} ./services/api-gateway
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: azure/setup-kubectl@v4
      - run: kubectl apply -k kubernetes/overlays/prod
```

### 9.2 Measure pipeline

Record `benchmarks/cicd/timing.csv`:

```
date,run_id,lint_s,test_s,build_s,push_s,deploy_s,status
```

Checkpoint: Pipeline is green on `main`; `timing.csv` is updated automatically.

---

## Stage 10 — Benchmark Reports & Blog

**Goal:** Convert every experiment into a portfolio-grade engineering article.

### 10.1 Folder per experiment

```
benchmarks/expXX/
├── results.md          # raw findings
├── data.csv            # raw measurements
├── chart.png           # visualization
└── blog.md             # public-facing article
```

### 10.2 Article structure

1. Problem Statement
2. System Architecture
3. Experiment Setup
4. Methodology
5. Tools Used
6. Test Environment
7. Results
8. Tables
9. Charts
10. Analysis
11. Trade-offs
12. Lessons Learned
13. Conclusion

### 10.3 Publish

- Commit `blog.md` under `docs/blog/expXX-*.md`
- Render to static site or post to Medium / Dev.to
- Cross-link from the main portfolio site

Checkpoint: At least 10 articles drafted, each with a chart and a table.

---

## Quick Reference Commands

```bash
# full stack up
docker compose up -d
eval $(minikube docker-env)
kubectl apply -k kubernetes/overlays/dev

# full stack down
kubectl delete -k kubernetes/overlays/dev
docker compose down -v

# cluster reset
minikube delete && minikube start --cpus=4 --memory=8g --driver=docker

# run every experiment
for s in scripts/experiments/exp*.sh; do bash "$s"; done

# load test sweep
./scripts/load-all.sh

# regenerate dashboards
./scripts/import-dashboards.sh
```

---

## Troubleshooting

| Symptom                         | Likely cause                        | Fix                                                                                                   |
| ------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `minikube start` hangs on macOS | docker driver not enabled           | `minikube start --driver=docker`                                                                      |
| ImagePullBackOff in K8s         | Built outside `minikube docker-env` | Re-run with `eval $(minikube docker-env)`                                                             |
| Postgres connection refused     | Wait for init container             | `kubectl wait --for=condition=ready pod -l app=postgres`                                              |
| Grafana 401                     | Reset admin password                | `kubectl exec -n monitoring deploy/kube-prom-grafana -- grafana-cli admin reset-admin-password admin` |
| K6 OOM at 1000 VUs              | Not enough host RAM                 | Run on a dedicated host or reduce `vus`                                                               |
| Ingress 404                     | hosts file missing entry            | `echo "$(minikube ip) lab.local" \| sudo tee -a /etc/hosts`                                           |
| CI deploy fails                 | kubeconfig missing                  | Add `KUBECONFIG` secret in repo settings                                                              |

---

## License

MIT — see `LICENSE`.
