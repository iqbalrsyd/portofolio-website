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
elif [ "$1" == "v2" ]; then
    echo -e "${GREEN}Running improved v2 benchmarks (recommended)...${NC}\n"
    run_benchmark "v2_rest_lightweight.js" "v2: REST Single Item (Improved)"
    run_benchmark "v2_grpc_lightweight_pooled.js" "v2: gRPC Single Item (Improved, Pooled)"
    run_benchmark "v2_rest_list_heavy.js" "v2: REST List (Heavy Payload)"
    run_benchmark "v2_grpc_list_heavy_pooled.js" "v2: gRPC List (Heavy Payload, Pooled)"
    run_benchmark "v2_concurrent_comparison.js" "v2: Concurrent Comparison"
elif [ "$1" == "v2-single" ]; then
    echo -e "${GREEN}Running v2 single-item comparison...${NC}\n"
    run_benchmark "v2_rest_lightweight.js" "REST Single Item"
    run_benchmark "v2_grpc_lightweight_pooled.js" "gRPC Single Item (Pooled)"
elif [ "$1" == "v2-list" ]; then
    echo -e "${GREEN}Running v2 list comparison...${NC}\n"
    run_benchmark "v2_rest_list_heavy.js" "REST List"
    run_benchmark "v2_grpc_list_heavy_pooled.js" "gRPC List (Pooled)"
elif [ "$1" == "v2-comparison" ]; then
    run_benchmark "v2_concurrent_comparison.js" "Concurrent Comparison"
elif [ "$1" == "v2-streaming" ]; then
    echo -e "${GREEN}Running v2 streaming benchmarks...${NC}\n"
    run_benchmark "v2_rest_bulk.js" "REST Bulk Fetch"
    run_benchmark "v2_grpc_streaming.js" "gRPC Server Streaming"
    run_benchmark "v2_streaming_comparison.js" "Direct Streaming Comparison"
elif [ "$1" == "v2-bulk" ]; then
    run_benchmark "v2_rest_bulk.js" "REST Bulk Fetch"
elif [ "$1" == "v2-stream" ]; then
    run_benchmark "v2_grpc_streaming.js" "gRPC Server Streaming"
elif [ "$1" == "v2-stream-compare" ]; then
    run_benchmark "v2_streaming_comparison.js" "Streaming Comparison"
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
    echo ""
    echo "  IMPROVED v2 BENCHMARKS (Recommended):"
    echo "    v2                - Run all improved benchmarks"
    echo "    v2-single         - Single-item comparison (REST vs gRPC pooled)"
    echo "    v2-list           - List comparison (REST vs gRPC pooled)"
    echo "    v2-comparison     - Concurrent request comparison"
    echo "    v2-streaming      - Streaming comparison (REST bulk vs gRPC stream)"
    echo "    v2-bulk           - REST bulk fetch only"
    echo "    v2-stream         - gRPC streaming only"
    echo "    v2-stream-compare - Direct streaming vs bulk comparison"
    echo ""
    echo "  ORIGINAL BENCHMARKS:"
    echo "    rest-small        - REST API with small payloads"
    echo "    rest-large        - REST API with large payloads (1000 items)"
    echo "    grpc-small        - gRPC with small payloads"
    echo "    grpc-large        - gRPC with large payloads (1000 items)"
    echo "    concurrent        - Concurrent REST and gRPC traffic"
    echo "    stress            - High-load stress test"
    echo "    all               - Run all original benchmarks"
    exit 1
fi

echo -e "${GREEN}Benchmark suite completed!${NC}"
