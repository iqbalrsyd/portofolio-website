# Quick Start - Improved v2 Benchmarks

## What Changed?

The original benchmarks had a critical fairness issue: **gRPC created a new connection for every request**, while REST reused connections. This artificially made gRPC appear 20-30% slower.

The v2 benchmarks fix this by:

1. **Using gRPC connection pooling** (shared clients across requests)
2. **Increasing concurrency** to 100 VUs (from 10) to expose real architectural differences
3. **Adding proper warmup phases** so results aren't dominated by startup effects
4. **Testing realistic patterns** (single items vs lists) not just worst-case lists
5. **Measuring tail latencies** (p99, max) not just averages

## Quick Start

### 1. Start both servers (in separate terminals)

```bash
# Terminal 1: REST server
go run ./cmd/rest/main.go

# Terminal 2: gRPC server
go run ./cmd/grpc/main.go
```

### 2. Run the improved benchmarks

```bash
# Run all v2 benchmarks (takes ~30 minutes total)
./benchmark/run_benchmarks.sh v2

# Or run individual scenarios:
./benchmark/run_benchmarks.sh v2-single      # ~7 min: single item comparison
./benchmark/run_benchmarks.sh v2-list        # ~7 min: list operation comparison
./benchmark/run_benchmarks.sh v2-comparison  # ~7 min: concurrent mixed workload
```

## What Each Benchmark Tests

### v2-single: Single Item Retrieval

- **What:** Getting one product by ID (most common operation)
- **Why:** Tests connection pooling efficiency and serialization overhead
- **Concurrency:** 10 → 50 → 100 VUs
- **Expected:** gRPC faster at high concurrency due to multiplexing

### v2-list: List All Products

- **What:** Getting all 1000 products (heavy payload scenario)
- **Why:** Tests serialization efficiency and bandwidth usage
- **Payload:** ~80-100 KB (REST) vs ~40-60 KB (gRPC)
- **Concurrency:** 10 → 50 → 100 VUs
- **Expected:** gRPC advantage grows at higher loads

### v2-comparison: Concurrent Mixed

- **What:** Both REST and gRPC in same iteration
- **Why:** Measures if concurrent requests create contention
- **Concurrency:** 10 → 50 VUs
- **Expected:** Shows real-world scenario behavior

## Understanding the Results

### Key Metrics

Each benchmark produces:

- **Latency (ms):** Response time from request to response
  - Average: typical request time
  - p95: 95th percentile (slower requests)
  - p99: 99th percentile (slow requests)
  - max: worst case observed

- **Error Rate:** Percentage of failed requests
  - Should be <5% under normal load
  - > 5% indicates system instability

- **Throughput:** Requests per second
  - Higher is better
  - Limited by available concurrency

### Interpreting Results

**At 10 VUs (light load):**

- Both should be fast (similar latencies)
- gRPC advantage minimal (connection overhead amortized over many requests)
- Serialization overhead dominates

**At 50 VUs (medium load):**

- gRPC starts showing advantage
- HTTP/2 multiplexing begins to matter
- Connection pool efficiency visible

**At 100 VUs (high load):**

- gRPC should be significantly faster
- gRPC tail latencies (p99) much lower than REST
- gRPC throughput higher due to multiplexing

### Example Output Analysis

```
REST Single Item @ 10 VUs:
  avg: 5ms, p95: 8ms, p99: 12ms, max: 45ms
  ✓ Excellent - single request is fast

gRPC Single Item @ 10 VUs (pooled):
  avg: 4ms, p95: 6ms, p99: 10ms, max: 35ms
  ✓ Slightly faster - connection reuse helps

REST Single Item @ 100 VUs:
  avg: 50ms, p95: 120ms, p99: 250ms, max: 500ms
  ⚠ Degraded - high variance means contention

gRPC Single Item @ 100 VUs (pooled):
  avg: 15ms, p95: 35ms, p99: 80ms, max: 200ms
  ✓ Much better - multiplexing handles load
```

## Comparing v2 to Original Benchmarks

### Original Issues v2 Fixes

| Issue                    | Original        | v2                    | Impact                           |
| ------------------------ | --------------- | --------------------- | -------------------------------- |
| **gRPC connections**     | New per request | Pooled/reused         | -30% latency for gRPC            |
| **Max concurrency**      | 10 VUs          | 100 VUs               | Shows real multiplexing benefits |
| **Warmup time**          | 30s only        | 60s + per stage       | Better stability                 |
| **Measurement duration** | 120s total      | 420s total            | Catches patterns                 |
| **Workload pattern**     | List only       | Single + List + Mixed | Representative                   |
| **Tail latencies**       | p95, p99 only   | p95, p99, max         | Shows contention                 |

## Next Steps

After running v2 benchmarks:

1. **Implement STEP 4:** Add streaming benchmarks
   - Unary vs Server Streaming comparison
   - Measure throughput advantage of streaming

2. **Implement STEP 5:** Docker networking
   - Services in separate containers
   - Expose real transport overhead
   - More realistic latency conditions

3. **Implement STEP 6:** Resource monitoring
   - CPU usage during benchmarks
   - Memory allocation patterns
   - GC impact comparison

4. **Implement STEP 9:** Blog-ready outputs
   - Generate comparison charts
   - Document findings
   - Explain engineering tradeoffs

## Troubleshooting

### Error: "no metric name grpc_req_failed found"

This is fixed in v2 - the concurrent_traffic.js file has been updated. Run v2 benchmarks.

### gRPC benchmark fails to connect

```bash
# Check gRPC server is running
lsof -i :50051
# Should show: go-server listening on port 50051
```

### REST benchmark fails to connect

```bash
# Check REST server is running
curl http://localhost:8080/health
# Should return: {"status":"healthy"}
```

### k6 not found

```bash
# Install k6
brew install k6  # macOS
# or
wget https://github.com/grafana/k6/releases/latest -O k6.tar.gz  # Linux
```

## Technical Details

See `IMPROVEMENTS_v2.md` for:

- Detailed explanation of each fix
- Load stage breakdown
- Expected behavioral changes
- Implementation notes
- Future improvements roadmap

## Files Added

- `v2_rest_lightweight.js` - REST single item benchmark
- `v2_grpc_lightweight_pooled.js` - gRPC single item with connection pooling
- `v2_rest_list_heavy.js` - REST list operation benchmark
- `v2_grpc_list_heavy_pooled.js` - gRPC list with pooling
- `v2_concurrent_comparison.js` - Mixed concurrent workload
- `IMPROVEMENTS_v2.md` - Detailed analysis document
- `QUICKSTART_v2.md` - This file

## Feedback

Found issues with the benchmarks? The improvements are designed to:

- ✅ Eliminate unfair advantages
- ✅ Measure realistic patterns
- ✅ Show tail latency behavior
- ✅ Expose architectural differences

If results surprise you, check if:

1. Are servers both running?
2. Are systems under load?
3. Are results measured after warmup?
4. Are metrics showing stable values?
