# Streaming Benchmarks - STEP 4 Implementation

## Overview

Streaming benchmarks compare two fundamentally different approaches to bulk data transfer:

1. **REST Bulk Fetch** - Single large HTTP request/response
2. **gRPC Server Streaming** - Multiple small messages over single connection

## Why Streaming Matters

### The Problem REST Solves

REST is great for simple request-response patterns. But for large bulk transfers, clients must:

1. Make a single request for all data
2. Wait for server to prepare entire response
3. Wait for entire response to arrive
4. Parse entire response in memory
5. Process data

**Latency:** End-to-end (full data transfer)  
**Memory:** O(n) - entire response buffered  
**Throughput:** Limited by response size

### The Problem gRPC Streaming Solves

gRPC server streaming allows:

1. Client makes request
2. Server sends data in chunks (messages)
3. Client processes each chunk as it arrives
4. Low memory overhead
5. Early processing possible

**Latency:** Time to first chunk (much lower)  
**Memory:** O(1) - one message at a time  
**Throughput:** Unbounded by single message size

## Benchmark Scenarios

### Scenario 1: REST Bulk Fetch (`v2_rest_bulk.js`)

**What it measures:**

- Time to fetch all 1000 products in single HTTP request
- Full response latency (all data transferred)
- JSON serialization of large payload
- HTTP headers overhead

**Key metrics:**

- `rest_bulk_latency_ms` - Total fetch time
- `rest_bulk_ttfb_ms` - Time to first byte (waiting for server)
- `rest_bulk_payload_bytes` - Full response size (~80-100 KB JSON)
- `rest_bulk_errors` - Connection/processing errors

**Load stages:**

- 10 VUs: baseline
- 50 VUs: medium load
- 100 VUs: high load

**Expected behavior:**

- Latency increases with VUs (connection contention)
- All data transferred in one large response
- Payload size constant (~85 KB)

### Scenario 2: gRPC Server Streaming (`v2_grpc_streaming.js`)

**What it measures:**

- Time to stream all 1000 products from server
- Streaming efficiency with connection pooling
- Protobuf serialization efficiency
- Message frame overhead

**Key metrics:**

- `grpc_stream_latency_ms` - Total stream transfer time
- `grpc_stream_messages` - Number of messages received (~1000)
- `grpc_stream_bytes` - Total bytes transferred
- `grpc_stream_errors` - Streaming errors

**Load stages:**

- 10 VUs: baseline
- 50 VUs: medium load
- 100 VUs: high load

**Expected behavior:**

- Lower latency than REST bulk at high concurrency
- Stable message count (always ~1000)
- Smaller total payload (protobuf efficiency)
- Better connection reuse

### Scenario 3: Direct Comparison (`v2_streaming_comparison.js`)

**What it measures:**

- Side-by-side latency comparison
- Same iteration, one REST request and one gRPC stream
- Resource contention under mixed workload

**Structure:**

- Both requests in same iteration
- REST first (to avoid blocking on gRPC)
- gRPC second (to measure overlap impact)

**Metrics:**

- Separate latency trends for each protocol
- Shows relative performance under same VU concurrency
- Realistic pattern (both protocols used simultaneously)

## Key Insights from Streaming Benchmarks

### Insight 1: Time to First Byte vs Full Completion

**REST Bulk:**

```
[Request] ----30ms----> [Wait] ----40ms----> [Full Response] ----30ms----> Done
                        TTFB            Data Transfer       Processing
          Total Latency: ~100ms (end-to-end)
```

**gRPC Streaming:**

```
[Request] ----10ms----> [First Msg] ----1ms----> [Process Msg 1]
                        TTFB            Message 1
          ----1ms----> [Msg 2] ----0.1ms----> [Process]
          Message 2   Latency per message: ~1.1ms
          Total time for all: ~100ms, but progressive
```

### Insight 2: Memory Efficiency

**REST Bulk:**

- Server: Must buffer all 85 KB in memory before sending
- Client: Must receive and buffer all 85 KB before parsing
- Memory peak: 85 KB + parsing overhead

**gRPC Streaming:**

- Server: Sends one message (~85 bytes) at a time
- Client: Processes one message at a time
- Memory peak: ~200 bytes

**Impact:** gRPC better for large datasets, memory-constrained clients

### Insight 3: Connection Pool Efficiency

**REST:**

- Each bulk fetch ties up connection during full data transfer
- At 100 VUs: many connections waiting for large response
- Connection pool becomes bottleneck

**gRPC with Streaming:**

- Each VU can multiplex multiple streams on HTTP/2
- Connection pool handles more concurrent operations
- Better resource utilization

### Insight 4: Error Resilience

**REST Bulk:**

- Network error after 50ms? Entire transfer fails, retry from start
- Resume/checkpoint difficult
- All-or-nothing

**gRPC Streaming:**

- Network error on message 500? Restart from checkpoint
- Can implement resumable transfers
- Partial success possible

## Expected Results

### Single VU (10 VUs total)

```
REST Bulk:
  - Latency: 50-60ms (server prep 30ms + network 20ms + parsing 10ms)
  - Payload: ~85 KB
  - TTFB: ~35ms

gRPC Streaming:
  - Latency: 45-55ms (time to send all 1000 messages)
  - Payload: ~50 KB (40% smaller, protobuf)
  - TTFB: ~10ms (first message faster)
  - Winner: Similar, gRPC slightly faster TTFB
```

### Medium Load (50 VUs)

```
REST Bulk:
  - Latency: 100-150ms (connection contention visible)
  - Payload: ~85 KB
  - Variance: High (connection pool exhaustion)

gRPC Streaming:
  - Latency: 60-80ms (multiplexing helps)
  - Payload: ~50 KB
  - Variance: Low (better connection handling)
  - Winner: gRPC (2x better latency)
```

### High Load (100 VUs)

```
REST Bulk:
  - Latency: 300-500ms (severe contention)
  - p99: ~800ms
  - Payload: ~85 KB
  - Many timeouts/errors possible

gRPC Streaming:
  - Latency: 100-150ms (graceful degradation)
  - p99: ~250ms
  - Payload: ~50 KB
  - Stable operation
  - Winner: gRPC (3-5x better)
```

## Running Streaming Benchmarks

### Run All Streaming Tests

```bash
./benchmark/run_benchmarks.sh v2-streaming
```

### Run Individual Tests

```bash
# REST bulk fetch only
./benchmark/run_benchmarks.sh v2-bulk

# gRPC streaming only
./benchmark/run_benchmarks.sh v2-stream

# Direct side-by-side comparison
./benchmark/run_benchmarks.sh v2-stream-compare
```

### Full v2 Suite (Includes Streaming)

```bash
./benchmark/run_benchmarks.sh v2
```

## Implementation Notes

### k6 Streaming Limitation

k6's gRPC client (v0.43+) has a limitation: streaming responses are buffered. In real gRPC libraries:

- Messages arrive individually
- Can process as they arrive
- Memory constant

In k6:

- All messages buffered until response complete
- Similar latency characteristics
- Not ideal representation of true streaming benefits

However, this fairly represents:

- Connection efficiency comparison
- Protobuf serialization benefit
- Multiplexing capability
- Reasonable latency patterns

### Fair Comparison Methodology

Both benchmarks:

- Use connection pooling (gRPC explicit, REST implicit)
- Same load patterns (10→50→100 VUs)
- Identical warmup (60s)
- Sustained measurement (90s per stage)
- Proper cool-down
- Custom metrics for analysis

### Future Improvements

For even more accurate streaming measurements:

- Implement custom gRPC client in Go
- Measure per-message latency
- Track memory allocation
- Monitor CPU usage
- Measure connection efficiency

## Streaming Use Cases

### When Streaming Wins

1. **Large bulk exports** (>10 MB data)
   - Memory efficiency critical
   - Processing can be pipelined
   - gRPC streaming 50-100x better

2. **Real-time feeds** (continuous data)
   - Low-latency requirements
   - Unbounded data size
   - gRPC streaming only option

3. **File transfers** (large files)
   - Resume capability needed
   - Chunked processing
   - gRPC streaming required

4. **Event streams** (IoT, metrics)
   - High volume messages
   - Low latency per message
   - gRPC streaming 10-100x throughput

### When Bulk Fetch Wins

1. **Small datasets** (<100 KB)
   - Simple request-response better
   - REST easier to debug/test
   - Latency similar

2. **Simple list operations**
   - Pagination preferred
   - REST more familiar
   - Ecosystem support better

3. **One-off queries**
   - No streaming protocol setup
   - Lower complexity
   - REST sufficient

## Interpretation Guide

### Latency Analysis

- **10 VUs latency similar?** - Both protocols equally capable at low concurrency
- **50 VUs gRPC faster?** - Multiplexing advantage emerging
- **100 VUs gRPC much faster?** - Connection pool efficiency critical
- **High variance in REST at 100 VUs?** - Connection contention creating tail latencies

### Payload Analysis

- **gRPC 40-50% smaller?** - Protobuf efficiency working
- **Payload consistent across VUs?** - No compression differences
- **REST payload larger with more VUs?** - Possible HTTP headers overhead

### Error Analysis

- **Errors at 100 VUs in REST?** - Connection pool exhaustion
- **gRPC stable?** - Better resource handling
- **Both stable?** - System overhead not yet critical

## Next Steps

After analyzing streaming results:

1. **Implement STEP 5:** Docker networking
   - Add latency conditions
   - More realistic transport overhead
   - Bandwidth limitations

2. **Implement STEP 6:** Resource monitoring
   - CPU usage comparison
   - Memory allocation tracking
   - GC impact measurement

3. **Combine findings:** Blog-ready analysis
   - Show when streaming matters
   - Document trade-offs
   - Provide recommendations

## References

- gRPC Streaming: https://grpc.io/docs/what-is-grpc/core-concepts/#server-streaming-rpc
- HTTP/2 Multiplexing: RFC 7540 - Section 5.1
- Protocol Buffers Encoding: https://developers.google.com/protocol-buffers/docs/encoding
- k6 gRPC: https://k6.io/docs/javascript-api/k6-net-grpc/
