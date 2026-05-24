# Benchmark Suite: REST vs gRPC

This directory contains k6 benchmark scripts for comparing REST API (Gin) vs gRPC performance.

## Prerequisites

- Both servers running:
  - REST server: `go run ./cmd/rest/main.go` (port 8080)
  - gRPC server: `go run ./cmd/grpc/main.go` (port 50051)
- k6 installed: https://k6.io/docs/getting-started/installation/

## Benchmark Scripts

### Small Payload Tests

- **rest_small_payload.js** - GET single product (REST)
- **grpc_small_payload.js** - GET single product (gRPC)
- Load: 10 concurrent users for 2 minutes
- Metrics: Latency, response time, success rate

### Large Payload Tests

- **rest_large_payload.js** - List all 1000 products (REST)
- **grpc_large_payload.js** - List all 1000 products (gRPC)
- Load: 10 concurrent users for 2 minutes
- Metrics: Throughput, response time, payload size

### Concurrent Traffic

- **concurrent_traffic.js** - Mixed REST and gRPC requests
- Load: 20 concurrent users for 2 minutes
- Tests: Both small (GET) and large (LIST) payloads simultaneously

### Stress Test

- **stress_test.js** - High-load test with ramp-up
- Load: 50→100 concurrent users for 4 minutes
- Tests: Random product selection, mixed small/large requests

## Usage

### Run All Benchmarks

```bash
./benchmark/run_benchmarks.sh all
```

### Run Individual Benchmark

```bash
# REST tests
./benchmark/run_benchmarks.sh rest-small
./benchmark/run_benchmarks.sh rest-large

# gRPC tests
./benchmark/run_benchmarks.sh grpc-small
./benchmark/run_benchmarks.sh grpc-large

# Mixed tests
./benchmark/run_benchmarks.sh concurrent
./benchmark/run_benchmarks.sh stress
```

### Run with k6 Directly

```bash
# Custom load profile
k6 run -u 20 -d 10s benchmark/rest_small_payload.js

# With output format
k6 run --out json=results.json benchmark/rest_small_payload.js

# With CSV summary
k6 run -o csv=results.csv benchmark/rest_small_payload.js
```

## Metrics Analyzed

### Response Time (Duration)

- **Min**: Minimum request latency
- **Max**: Maximum request latency
- **Avg**: Average request latency
- **p95**: 95th percentile latency
- **p99**: 99th percentile latency

### Request Rate

- **req/s**: Requests per second
- **bytes/s**: Bytes per second (throughput)

### Success Rate

- **Success Rate**: Percentage of successful requests
- **Failed Requests**: Count of failed requests
- **Error Rate**: Percentage of errors

### Payload Size

- **Request Size**: Size of sent data
- **Response Size**: Size of received data

## Expected Results

### Small Payload (Single Product GET)

```
REST:  ~0.5-2ms latency, ~2KB response
gRPC:  ~0.1-1ms latency, ~0.2KB response
```

### Large Payload (List 1000 Products)

```
REST:  ~5-20ms latency, ~300KB response
gRPC:  ~3-10ms latency, ~50KB response (binary)
```

### Concurrent (Mixed Traffic)

- REST: 100-200 req/s
- gRPC: 500-1000 req/s

### Stress Test (100 users)

- REST: Better stability at lower load
- gRPC: Better throughput under high load

## Thresholds

Each benchmark includes thresholds for pass/fail:

### Small Payload

- p95 response time: < 200ms
- p99 response time: < 500ms
- Error rate: < 10%

### Large Payload

- p95 response time: < 500ms
- p99 response time: < 1000ms
- Error rate: < 10%

### Concurrent

- p95 response time: < 300ms
- Error rate: < 10%

### Stress

- p95 response time: < 500ms
- Error rate: < 20%

## Output Files

k6 can save results in multiple formats:

```bash
# JSON output for analysis
k6 run --out json=results.json benchmark/rest_small_payload.js

# CSV for spreadsheet analysis
k6 run -o csv=results.csv benchmark/rest_small_payload.js

# Summary view (default)
k6 run benchmark/rest_small_payload.js
```

## Comparison Tips

1. **Run sequentially**: Test REST first, then gRPC (separately)
2. **Warm up**: First 30s is warm-up, stable period is 1m30s
3. **Multiple runs**: Run each benchmark 3 times for consistent results
4. **Monitor servers**: Check CPU/memory while running benchmarks
5. **Same network**: Run tests from the same machine as servers

## Interpretation Guide

### Latency Comparison

- gRPC typically has lower latency (binary protocol)
- REST overhead from JSON serialization/deserialization

### Throughput Comparison

- gRPC handles more concurrent connections
- Binary format uses less bandwidth

### Payload Size Impact

- REST JSON: More verbose, larger responses
- gRPC protobuf: More compact, binary encoding

### Scaling Patterns

- REST: Linear scaling degradation with load
- gRPC: Better scaling up to high loads

## Troubleshooting

### Connection Refused

- Ensure both servers are running
- Check port availability (8080 for REST, 50051 for gRPC)

### Proto Load Error (gRPC)

- Ensure working directory is project root
- Proto files must be in `./proto/` directory

### High Error Rates

- Reduce concurrent users (`-u` flag)
- Increase system limits: `ulimit -n 10000`
- Check server logs for errors

## Advanced Usage

### Custom Load Patterns

Edit the `options.stages` array in any script:

```javascript
export const options = {
	stages: [
		{ duration: '1m', target: 50 }, // 1 minute ramp up
		{ duration: '5m', target: 50 }, // 5 minutes at 50 users
		{ duration: '1m', target: 0 } // 1 minute ramp down
	]
};
```

### Custom Metrics

Add custom metrics to track specific behavior:

```javascript
const myCounter = new Counter('my_counter');
const myGauge = new Gauge('my_gauge');

myCounter.add(1);
myGauge.set(42);
```

## References

- [k6 Documentation](https://k6.io/docs/)
- [k6 HTTP API](https://k6.io/docs/javascript-api/k6-http/)
- [k6 gRPC API](https://k6.io/docs/javascript-api/k6-net-grpc/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)
