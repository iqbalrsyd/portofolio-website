#!/bin/bash

# Benchmark runner script for REST vs gRPC comparison
# Usage: ./run_benchmarks.sh [test_name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REST_URL="http://localhost:8080"
GRPC_ADDR="localhost:50051"
BENCHMARK_DIR="./benchmark"

echo -e "${GREEN}REST vs gRPC Benchmark Suite${NC}\n"

# Health checks
echo -e "${YELLOW}Performing health checks...${NC}"

if ! curl -s "$REST_URL/health" > /dev/null 2>&1; then
    echo -e "${RED}✗ REST server not responding at $REST_URL${NC}"
    echo "Start REST server with: go run ./cmd/rest/main.go"
    exit 1
fi
echo -e "${GREEN}✓ REST server healthy${NC}"

if ! timeout 2 bash -c "echo -n > /dev/tcp/localhost/50051" 2>/dev/null; then
    echo -e "${RED}✗ gRPC server not responding at $GRPC_ADDR${NC}"
    echo "Start gRPC server with: go run ./cmd/grpc/main.go"
    exit 1
fi
echo -e "${GREEN}✓ gRPC server healthy${NC}\n"

# Function to run a benchmark
run_benchmark() {
    local script=$1
    local name=$2
    
    echo -e "${YELLOW}Running: $name${NC}"
    echo "Script: $script"
    echo "---"
    
    if [ -f "$BENCHMARK_DIR/$script" ]; then
        k6 run "$BENCHMARK_DIR/$script"
        echo -e "${GREEN}✓ $name completed${NC}\n"
    else
        echo -e "${RED}✗ Script not found: $BENCHMARK_DIR/$script${NC}\n"
    fi
}

# Run benchmarks based on argument
if [ "$1" == "" ] || [ "$1" == "all" ]; then
    echo -e "${GREEN}Running all benchmarks...${NC}\n"
    run_benchmark "rest_small_payload.js" "REST Small Payload"
    run_benchmark "rest_large_payload.js" "REST Large Payload"
    run_benchmark "grpc_small_payload.js" "gRPC Small Payload"
    run_benchmark "grpc_large_payload.js" "gRPC Large Payload"
    run_benchmark "concurrent_traffic.js" "Concurrent Traffic"
    run_benchmark "stress_test.js" "Stress Test"
elif [ "$1" == "rest-small" ]; then
    run_benchmark "rest_small_payload.js" "REST Small Payload"
elif [ "$1" == "rest-large" ]; then
    run_benchmark "rest_large_payload.js" "REST Large Payload"
elif [ "$1" == "grpc-small" ]; then
    run_benchmark "grpc_small_payload.js" "gRPC Small Payload"
elif [ "$1" == "grpc-large" ]; then
    run_benchmark "grpc_large_payload.js" "gRPC Large Payload"
elif [ "$1" == "concurrent" ]; then
    run_benchmark "concurrent_traffic.js" "Concurrent Traffic"
elif [ "$1" == "stress" ]; then
    run_benchmark "stress_test.js" "Stress Test"
else
    echo -e "${RED}Unknown benchmark: $1${NC}"
    echo ""
    echo "Available benchmarks:"
    echo "  rest-small      - REST API with small payloads"
    echo "  rest-large      - REST API with large payloads (1000 items)"
    echo "  grpc-small      - gRPC with small payloads"
    echo "  grpc-large      - gRPC with large payloads (1000 items)"
    echo "  concurrent      - Concurrent REST and gRPC traffic"
    echo "  stress          - High-load stress test"
    echo "  all             - Run all benchmarks (default)"
    exit 1
fi

echo -e "${GREEN}Benchmark suite completed!${NC}"
