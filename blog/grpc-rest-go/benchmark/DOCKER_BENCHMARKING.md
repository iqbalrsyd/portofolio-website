# STEP 5: Docker Networking - Realistic Benchmark Environment

## Overview

Running benchmarks on `localhost` masks realistic network effects. Services in separate containers expose:

- Network latency (1-5ms vs <1ms on localhost)
- TCP behavior (segment bundling, congestion)
- Docker networking overhead
- More realistic performance characteristics

## Current Setup

The project already includes:

- ✅ Multi-stage `Dockerfile` with REST and gRPC targets
- ✅ `docker-compose.yml` with bridge network
- ✅ Health checks for both services
- ✅ Proper port exposure

## Why Docker Matters for Benchmarking

### Localhost Pathology

**On localhost (current v2):**

```
Client → [OS loopback] → Server
Latency: <1ms (pure CPU noise)
Network effects: Hidden
Serialization dominates measurement
```

**Result:** Can't distinguish protocol overhead from network overhead

### Docker Bridge Network (More Realistic)

**With Docker networking:**

```
Client Container → [Docker Bridge] → Server Container
Latency: 1-5ms (realistic network)
Network effects: Visible
Protocol differences become measurable
```

**Result:** Real architectural differences become apparent

### Comparison

| Aspect                     | Localhost  | Docker Bridge | Real Network |
| -------------------------- | ---------- | ------------- | ------------ |
| **Latency**                | <1ms       | 1-5ms         | 10-100ms     |
| **Jitter**                 | Minimal    | ~0.5ms        | Variable     |
| **Bandwidth**              | Unlimited  | Full NIC      | Limited      |
| **Congestion**             | Impossible | Possible      | Common       |
| **Serialization visible**  | Yes        | Yes           | Yes          |
| **Protocol diff visible**  | Partial    | Yes           | Yes          |
| **Connection pool stress** | Low        | Medium        | High         |
| **Realism**                | Poor       | Good          | Excellent    |

## Getting Started with Docker Benchmarks

### Prerequisite: Docker Installation

```bash
# Check if Docker is installed
docker --version
docker-compose --version

# If not installed:
# - Mac: brew install docker-desktop
# - Linux: sudo apt install docker.io docker-compose
# - Windows: Docker Desktop from docker.com
```

### Starting Services in Docker

```bash
# Start all services (REST server, gRPC server, k6)
docker-compose up -d

# Verify services are running
docker-compose ps
# Should show:
# grpc-rest-go-rest    Running on port 8080
# grpc-rest-go-grpc    Running on port 50051

# Check service health
curl http://localhost:8080/health
# Should return: {"status":"healthy"}

# Verify gRPC server is responsive
echo -n > /dev/tcp/localhost/50051 && echo "gRPC OK" || echo "gRPC failed"
```

### Running Benchmarks Against Docker Services

The benchmarks are designed to work with both localhost and Docker. When services run in Docker, they're accessed via localhost:8080 and localhost:50051 (ports mapped by docker-compose).

```bash
# All v2 benchmarks against Docker services
./benchmark/run_benchmarks.sh v2

# Specific benchmarks
./benchmark/run_benchmarks.sh v2-single
./benchmark/run_benchmarks.sh v2-list
./benchmark/run_benchmarks.sh v2-streaming

# Or run k6 directly from host machine
k6 run benchmark/v2_rest_lightweight.js
k6 run benchmark/v2_grpc_lightweight_pooled.js
```

### Running Benchmarks Inside Docker

For truly isolated benchmarks (k6 and servers in separate containers):

```bash
# Start background services only
docker-compose up -d rest-server grpc-server

# Run k6 benchmark in Docker
docker-compose run --rm k6-benchmark k6 run /scripts/v2_rest_lightweight.js

# Or interactive shell in benchmark container
docker-compose run --rm k6-benchmark sh
k6 run /scripts/v2_grpc_lightweight_pooled.js
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f rest-server
docker-compose logs -f grpc-server
```

## Expected Differences: Localhost vs Docker

### Latency Changes

**Single Item Retrieval @ 10 VUs:**

Localhost (current v2):

```
REST:  3-5ms
gRPC:  2-4ms
```

Docker Bridge:

```
REST:  5-8ms  (+ 2-3ms network)
gRPC:  4-6ms  (+ 2-3ms network, but more efficient multiplexing visible)
```

**Large List @ 100 VUs:**

Localhost (current v2):

```
REST:  20-50ms
gRPC:  8-20ms
```

Docker Bridge:

```
REST:  40-80ms  (+ network adds up with contention)
gRPC:  15-35ms  (+ network, but connection reuse helps more)
Ratio: gRPC ~2.5x better (was 2.5x better on localhost too)
```

**Key insight:** Architectural differences remain visible; network adds uniform latency increase.

### Throughput Changes

**Single Item @ 50 VUs:**

Localhost:

```
REST:  ~1000 req/s
gRPC:  ~1500 req/s (1.5x better)
```

Docker Bridge:

```
REST:  ~700-800 req/s (network limits)
gRPC:  ~1200-1300 req/s (multiplexing helps more with latency)
Ratio: gRPC ~1.6x better (advantage slightly larger)
```

**Why:** Docker network adds jitter; gRPC handles it better.

### Tail Latency

**p99 latency @ 100 VUs:**

Localhost:

```
REST p99:  100ms
gRPC p99:  35ms
```

Docker Bridge:

```
REST p99:  200ms  (network jitter adds up)
gRPC p99:  60ms   (more stable multiplexing)
```

**Why:** gRPC's HTTP/2 multiplexing handles congestion better.

## Practical Considerations

### Network Modes

```yaml
# Current: Bridge network (recommended)
networks:
  grpc-rest-network:
    driver: bridge
```

Other options (if needed):

```yaml
# Host network (same as localhost, no isolation)
networks:
  grpc-rest-network:
    driver: host  # More latency visible, less CPU overhead

# Custom bridge with settings
networks:
  grpc-rest-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: gbench
      com.docker.network.bridge.enable_ip_masquerade: "true"
```

### Performance Tuning

For more realistic network conditions:

```bash
# Add network latency via tc (traffic control)
docker exec grpc-rest-go-grpc tc qdisc add dev eth0 root netem delay 10ms
# Adds 10ms latency to gRPC server

# Add packet loss
docker exec grpc-rest-go-grpc tc qdisc replace dev eth0 root netem delay 10ms loss 0.1%
# Adds 10ms latency + 0.1% packet loss

# Restore (remove traffic control)
docker exec grpc-rest-go-grpc tc qdisc del dev eth0 root
```

### Container Optimization

The Dockerfile uses multi-stage builds for small images:

- Builder stage: ~680 MB (Go build tools)
- Runtime stages: ~20 MB each (lean Alpine Linux + binary)

```bash
# Check image sizes
docker images grpc-rest-go
# Should show small runtime images (~20 MB each)
```

## Benchmarking with Docker: Complete Workflow

### Step 1: Build Images

```bash
# First time only - build both REST and gRPC
docker-compose build

# Verify images
docker images | grep grpc-rest-go
```

### Step 2: Start Services

```bash
# Start in background
docker-compose up -d

# Verify health
docker-compose ps
sleep 2  # Wait for services
curl http://localhost:8080/health
```

### Step 3: Run Benchmarks

```bash
# Option A: From host machine (requires k6 installed locally)
./benchmark/run_benchmarks.sh v2-single

# Option B: From Docker container
docker-compose run --rm k6-benchmark k6 run /scripts/v2_grpc_lightweight_pooled.js

# Option C: Multiple benchmarks in sequence
for bench in single list streaming; do
  echo "Running v2-$bench..."
  ./benchmark/run_benchmarks.sh v2-$bench
  sleep 30  # Cool down between benchmarks
done
```

### Step 4: Collect Results

```bash
# k6 outputs results to stdout
# Save results to file for analysis
./benchmark/run_benchmarks.sh v2-single > results_docker.txt 2>&1

# Or use k6 with JSON output
k6 run --out json=results.json benchmark/v2_rest_lightweight.js
```

### Step 5: Clean Up

```bash
# Stop services
docker-compose down

# Remove images (if needed)
docker rmi grpc-rest-go:latest
```

## Comparing Results: Localhost vs Docker

### Expected Findings

After running same benchmarks on localhost and Docker:

1. **Latency increases uniformly** (~2-3ms added)
   - Both protocols affected equally
   - gRPC advantage margin similar

2. **Throughput decreases** (especially at high concurrency)
   - Docker network congestion visible
   - gRPC multiplexing advantage grows

3. **Tail latencies increase more** (p99 > p95 increase)
   - Network jitter effects
   - gRPC handles better

4. **Error rates stable** (both <5%)
   - Good DNS resolution
   - Network stable

### Analysis Template

```bash
# Collect data
echo "=== LOCALHOST RESULTS ===" > comparison.txt
./benchmark/run_benchmarks.sh v2-single >> comparison.txt 2>&1

# Stop localhost servers and start Docker
docker-compose up -d

echo -e "\n=== DOCKER RESULTS ===" >> comparison.txt
./benchmark/run_benchmarks.sh v2-single >> comparison.txt 2>&1

# Stop Docker
docker-compose down

# Analyze
cat comparison.txt | grep -E "latency|duration|throughput"
```

## Troubleshooting

### Services Won't Start

```bash
# Check if ports are in use
lsof -i :8080
lsof -i :50051

# If in use, either:
# 1. Kill existing processes
# 2. Change ports in docker-compose.yml (e.g., 8081:8080)
```

### Benchmarks Show Same Results as Localhost

```bash
# Verify containers are actually running
docker ps

# Check inter-container connectivity
docker exec grpc-rest-go-rest ping grpc-rest-go-grpc
# Should see pings working

# Verify latency between containers
docker exec grpc-rest-go-rest ping -c 3 grpc-rest-go-grpc
# Should show 1-5ms latency
```

### High Latency in Docker

```bash
# Check if system is under load
top  # Or: Activity Monitor (Mac)

# Check Docker daemon performance
docker stats

# Try resource limits
docker-compose down
# Edit docker-compose.yml to add CPU/memory limits
# Re-run: docker-compose up -d
```

## Performance Monitoring in Docker

### Real-time Container Metrics

```bash
# Watch container stats
docker stats --no-stream grpc-rest-go-rest grpc-rest-go-grpc

# Example output:
# CONTAINER              CPU %   MEM USAGE
# grpc-rest-go-rest      1.2%    15 MiB
# grpc-rest-go-grpc      0.8%    12 MiB
```

### Container Logs

```bash
# View service logs in real-time
docker-compose logs -f rest-server
docker-compose logs -f grpc-server

# See last 100 lines
docker-compose logs --tail=100 rest-server
```

### Network Traffic

```bash
# Monitor network between containers
docker exec grpc-rest-go-rest iftop -n
# Shows live network traffic (if iftop installed)

# Or use tc to see packet stats
docker exec grpc-rest-go-grpc tc -s qdisc show dev eth0
```

## Next Steps

After establishing Docker-based benchmarks:

1. **STEP 6:** Add resource metrics (CPU, memory, GC)
   - Monitor both containers during tests
   - Compare resource efficiency
   - Identify bottlenecks

2. **STEP 8:** Fairness verification
   - Confirm same data in Docker
   - Verify identical behavior
   - Document any differences

3. **STEP 9:** Blog-ready outputs
   - Create comparison: localhost vs Docker
   - Show when Docker insights matter
   - Document setup for reproducibility

## Summary

| Aspect                      | Localhost     | Docker                 | Real Network          |
| --------------------------- | ------------- | ---------------------- | --------------------- |
| **Ease of use**             | Easiest       | Easy                   | Complex               |
| **Realism**                 | Low           | Medium                 | High                  |
| **Network effects visible** | No            | Yes                    | Yes                   |
| **Reproducibility**         | High          | Very High              | Medium                |
| **Recommended for**         | Quick testing | Engineering benchmarks | Production comparison |

**Recommendation:** Run v2 benchmarks on both localhost (quick validation) and Docker (comprehensive analysis).
