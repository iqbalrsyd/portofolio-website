# STEP 7: Improved Benchmark Methodology & Execution

## Overview

This document describes the final benchmark methodology that combines realistic concurrency, complex payloads, streaming capabilities, and comprehensive metrics collection to produce engineering-grade performance data.

## Benchmark Design Philosophy

### Principles

1. **Fair Comparison** - Both protocols tested under identical conditions
2. **Realistic Workloads** - Multi-stage testing with graduated load
3. **Comprehensive Metrics** - Track latency, throughput, errors, tail behavior
4. **Reproducible Results** - Deterministic seeds, documented environment
5. **Statistical Rigor** - Sufficient duration to capture variance

### Load Testing Stages

All benchmarks follow this pattern (total ~7 minutes):

```
Stage 1: Warmup (0→10 VUs over 60s)
  - Prime connections, JIT compilation, GC stabilization
  - Discard metrics (transient effects)

Stage 2: Baseline (10 VUs sustained for 90s)
  - Single connection behavior
  - Low contention baseline
  - Measure overhead of protocol layer

Stage 3: Medium Load (10→50 VUs ramp over 90s, then sustain 30s)
  - HTTP/2 multiplexing becomes visible
  - Multiple concurrent streams per connection
  - Measure connection efficiency

Stage 4: High Load (50→100 VUs ramp over 120s, then sustain 30s)
  - Peak stress testing
  - Connection pool at capacity
  - Measure scalability and stability

Stage 5: Cooldown (100→0 VUs over 30s)
  - Graceful shutdown
  - Measure connection cleanup overhead
```

## Metrics Collected

### Per-Request Metrics

- **Latency (ms)**
  - Average: Mean response time
  - p95: 95th percentile (most users see this)
  - p99: 99th percentile (worst 1% of users)
  - Max: Maximum observed latency

- **Throughput**
  - req/s: Requests per second (during each stage)
  - Total requests: Cumulative count

- **Errors**
  - Error rate: Failed requests as percentage
  - Error count: Total failures

- **Payload Size** (for list operations)
  - Response size: Bytes received
  - Compression ratio: For JSON vs protobuf

### System Metrics (Via k6)

- Connection pool status
- VU (Virtual User) statistics
- Iteration count per VU

## Benchmark Scenarios

### Scenario 1: Single Item Retrieval (Lightweight)

**Purpose:** Measure protocol overhead when serialization is minimal

**API Calls:**

- REST: `GET /api/products/1`
- gRPC: `GetProduct(1)`

**Expected Characteristics:**

- REST advantage: JSON overhead visible at small scale
- gRPC advantage: Binary efficiency becomes apparent at scale
- Multiplexing benefits: Minimal (simple single-item requests)

**Files:**

- `v2_rest_lightweight.js` - REST implementation
- `v2_grpc_lightweight_pooled.js` - gRPC with connection pooling

### Scenario 2: List Operation (Heavy)

**Purpose:** Measure serialization efficiency and streaming capability

**API Calls:**

- REST: `GET /api/products?limit=1000` (single response)
- gRPC: `ListProducts(page=1, limit=1000)` (streaming)

**Expected Characteristics:**

- REST: Single large response (300KB+)
- gRPC: Multiple small messages (streaming)
- Bandwidth: gRPC should show 5-6x payload reduction
- Memory: gRPC should be more efficient (progressive processing)

**Files:**

- `v2_rest_list_heavy.js` - REST list operation
- `v2_grpc_list_heavy_pooled.js` - gRPC list with pooling
- `v2_grpc_streaming.js` - gRPC streaming operation

### Scenario 3: Mixed Concurrent Workload

**Purpose:** Simulate realistic API traffic patterns

**API Mix:**

- 70% Single item retrieval
- 20% List operations
- 10% Create/Update operations

**Expected Characteristics:**

- Realistic distribution
- Connection multiplexing benefits visible
- Fairness validation across operation types

**File:**

- `v2_concurrent_comparison.js` - Mixed workload

## Key Benchmark Parameters

### Duration Requirements

- **Minimum per stage:** 90 seconds of sustained load
- **Warmup duration:** 60 seconds (minimum, may extend during ramp)
- **Total test time:** 7-8 minutes per scenario

### Concurrency Levels

- **Stage 1 (Warmup):** 0 → 10 VUs (linear ramp, 60s)
- **Stage 2 (Baseline):** 10 VUs sustained (90s)
- **Stage 3 (Medium):** 10 → 50 VUs ramp (90s), sustain (30s)
- **Stage 4 (High):** 50 → 100 VUs ramp (120s), sustain (30s)
- **Stage 5 (Cooldown):** 100 → 0 VUs (30s)

**Justification:**

- 10 VUs: Baseline single connection behavior
- 50 VUs: HTTP/2 multiplexing becomes significant (multiple streams per connection)
- 100 VUs: Peak performance testing, stress conditions

### Response Payload Complexity

**Small Payload (Single Item):**

- REST: ~500-800 bytes (JSON with details)
- gRPC: ~200-300 bytes (protobuf binary)

**Large Payload (List of 1000):**

- REST: ~300-500 KB (JSON)
- gRPC: ~50-80 KB (protobuf)
- Reduction: ~6x smaller with protobuf

## Execution Environment

### Hardware

- **OS:** Linux
- **CPU:** Available system CPU
- **RAM:** Minimum 2GB free
- **Network:** Localhost (to eliminate network variability)

### Servers

- **REST:** Port 8080 (Gin framework)
- **gRPC:** Port 50051 (grpc-go)
- **Data:** In-memory repository (1000 products pre-seeded)

## Measurement Methodology

### Before Each Benchmark

1. Ensure both servers are running and healthy
2. Wait 10 seconds for server stabilization
3. Verify data consistency:
   - REST: `curl http://localhost:8080/api/products/1`
   - gRPC: Manual gRPC client call or k6 test

### During Benchmark

1. Start k6 load test
2. Monitor in real-time:
   - Connection establishment
   - Request success rate
   - Latency trends
   - Error emergence

### After Benchmark

1. Export JSON metrics: `k6 run --out json=results.json ...`
2. Parse JSON to extract:
   - Latency statistics per stage
   - Throughput per stage
   - Error rates
   - Response sizes

## Expected Results Summary

### Single Item Retrieval

| Metric               | REST            | gRPC            | Winner | Reason                |
| -------------------- | --------------- | --------------- | ------ | --------------------- |
| Avg Latency (10 VU)  | 2-3ms           | 1-2ms           | gRPC   | Binary protocol       |
| Avg Latency (100 VU) | 5-10ms          | 3-6ms           | gRPC   | Binary + multiplexing |
| p99 Latency (100 VU) | 15-25ms         | 8-15ms          | gRPC   | Better tail behavior  |
| Throughput (100 VU)  | 1000-2000 req/s | 2000-4000 req/s | gRPC   | Multiplexing          |
| Response Size        | 650 bytes       | 250 bytes       | gRPC   | 2.6x smaller          |

### List Operation (1000 items)

| Metric               | REST          | gRPC          | Winner | Reason                       |
| -------------------- | ------------- | ------------- | ------ | ---------------------------- |
| Avg Latency (10 VU)  | 30-50ms       | 25-40ms       | gRPC   | Streaming starts immediately |
| Avg Latency (100 VU) | 50-100ms      | 40-80ms       | gRPC   | Progressive delivery         |
| p99 Latency (100 VU) | 150-250ms     | 100-180ms     | gRPC   | Better resource usage        |
| Throughput (100 VU)  | 100-150 req/s | 200-300 req/s | gRPC   | More efficient serialization |
| Response Size        | 350KB         | 60KB          | gRPC   | 5.8x smaller                 |
| Memory per req       | 350KB buffer  | Progressive   | gRPC   | Streaming efficiency         |

### Mixed Workload (70% single, 20% list, 10% create)

| Metric               | REST           | gRPC            | Winner         |
| -------------------- | -------------- | --------------- | -------------- |
| Avg Latency (100 VU) | 8-15ms         | 5-10ms          | gRPC           |
| Throughput (100 VU)  | 800-1200 req/s | 1500-2500 req/s | gRPC           |
| Error Rate           | <0.1%          | <0.1%           | Tie (both low) |
| p99 Latency (100 VU) | 20-35ms        | 12-25ms         | gRPC           |

## Why These Results?

### Protobuf Efficiency

- Binary encoding much more compact than JSON
- Reduces serialization CPU cost
- Smaller payloads = better network efficiency

### HTTP/2 Multiplexing

- Multiple concurrent streams over single connection
- Reduces connection overhead per request
- Visible at 50+ VU concurrency

### gRPC Streaming

- Progressive response delivery (not buffered)
- Lower memory usage for large responses
- Better tail latency under load

### Connection Reuse

- REST: Keep-Alive maintained across requests
- gRPC: Long-lived bidirectional connections
- Both benefit from connection pooling at high concurrency

## Validation Checkpoints

1. **Data Consistency** - Ensure both protocols return identical data
2. **Error Rate** - Should be <0.1% for both (test environment)
3. **Latency Trends** - Should show gradual increase as load increases (no sudden jumps)
4. **Throughput Saturation** - Should plateau at high VU counts (not keep increasing linearly)
5. **Response Integrity** - Spot-check responses for correctness

## Limitations

### Localhost Testing

- Network latency nearly zero (~0.1ms round-trip)
- Multiplexing benefits partially hidden
- Real-world would show gRPC advantage more clearly

### k6 gRPC Support

- Connection pooling simulated (not native)
- Some advanced gRPC features not benchmarkable
- gRPC streaming measured via message throughput

### Workload Patterns

- All reads (no write contention)
- Predictable load (no spikes/bursts)
- Unlimited resources (no CPU/memory constraints)

## Recommendations for Interpretation

1. **Focus on trends, not absolute numbers** - Absolute latencies depend heavily on hardware
2. **Pay attention to tail latencies** - p99 matters more than average for user experience
3. **Consider payload efficiency** - Bandwidth savings directly translate to cost reduction
4. **Extrapolate carefully** - Results on localhost may differ in production with real network latency
5. **Test your own workloads** - This suite is representative but may not match your traffic patterns

## Reproduction Instructions

```bash
# Terminal 1: Start servers
make run-both

# Terminal 2: Run v2 benchmarks (all scenarios)
./benchmark/run_benchmarks.sh v2

# Or specific scenarios
./benchmark/run_benchmarks.sh v2-single    # Single item only
./benchmark/run_benchmarks.sh v2-list      # List operation only
./benchmark/run_benchmarks.sh v2-comparison # Mixed workload

# With JSON export for analysis
k6 run --out json=results_rest.json benchmark/v2_rest_lightweight.js
k6 run --out json=results_grpc.json benchmark/v2_grpc_lightweight_pooled.js
```

## Next Steps

After running benchmarks:

1. Collect JSON output files
2. Parse metrics using analysis scripts
3. Generate comparison tables
4. Create blog-ready visualizations
5. Document findings with context
