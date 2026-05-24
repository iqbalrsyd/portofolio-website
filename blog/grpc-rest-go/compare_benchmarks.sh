#!/bin/bash

# Benchmark Comparison Script
# Runs same benchmarks on both localhost and Docker, then compares results
# Usage: ./compare_benchmarks.sh [benchmark_name]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BENCHMARK="${1:-v2-single}"
RESULTS_DIR="./benchmark/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Benchmark Comparison: Localhost vs Docker${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Function to run benchmark and save results
run_benchmark_and_save() {
	local env=$1
	local output_file="$RESULTS_DIR/${BENCHMARK}_${env}_${TIMESTAMP}.txt"
	
	echo -e "${YELLOW}Running $BENCHMARK on $env...${NC}"
	echo "Benchmark: $BENCHMARK" > "$output_file"
	echo "Environment: $env" >> "$output_file"
	echo "Timestamp: $(date)" >> "$output_file"
	echo "---" >> "$output_file"
	
	"./benchmark/run_benchmarks.sh" "$BENCHMARK" >> "$output_file" 2>&1 || true
	
	echo -e "${GREEN}✓ Results saved to $output_file${NC}\n"
	echo "$output_file"
}

# Run on localhost
echo -e "${BLUE}PHASE 1: Testing on localhost${NC}"
echo "Make sure local REST and gRPC servers are running!"
echo "Run: go run ./cmd/rest/main.go &"
echo "Run: go run ./cmd/grpc/main.go &"
echo ""
read -p "Press Enter when servers are ready..."
echo ""

LOCALHOST_RESULTS=$(run_benchmark_and_save "localhost")

# Run on Docker
echo -e "${BLUE}PHASE 2: Testing with Docker containers${NC}"
echo "Starting Docker services..."
docker-compose down 2>/dev/null || true
sleep 2
docker-compose up -d 2>/dev/null
sleep 5

# Health check
echo "Checking service health..."
if ! curl -s "http://localhost:8080/health" > /dev/null; then
	echo -e "${RED}REST server not responding${NC}"
	exit 1
fi
echo -e "${GREEN}✓ REST server ready${NC}"

if ! timeout 2 bash -c "echo -n > /dev/tcp/localhost/50051" 2>/dev/null; then
	echo -e "${RED}gRPC server not responding${NC}"
	exit 1
fi
echo -e "${GREEN}✓ gRPC server ready${NC}\n"

DOCKER_RESULTS=$(run_benchmark_and_save "docker")

# Analysis
echo -e "${BLUE}PHASE 3: Comparing results${NC}\n"

echo -e "${YELLOW}Localhost Results:${NC}"
echo "  File: $LOCALHOST_RESULTS"
grep -E "p\(95\)|p\(99\)|duration|throughput|latency" "$LOCALHOST_RESULTS" 2>/dev/null | head -20 || echo "  (parsing results...)"

echo -e "\n${YELLOW}Docker Results:${NC}"
echo "  File: $DOCKER_RESULTS"
grep -E "p\(95\)|p\(99\)|duration|throughput|latency" "$DOCKER_RESULTS" 2>/dev/null | head -20 || echo "  (parsing results...)"

# Generate comparison summary
SUMMARY_FILE="$RESULTS_DIR/comparison_${TIMESTAMP}.txt"
cat > "$SUMMARY_FILE" << EOF
Benchmark Comparison Summary
============================
Benchmark: $BENCHMARK
Date: $(date)

Localhost Results: $LOCALHOST_RESULTS
Docker Results: $DOCKER_RESULTS

Next Steps:
1. Compare latencies in both files
2. Note which protocol performs better
3. Look for differences in tail latencies (p99)
4. Check error rates in both environments
5. Measure throughput differences

Expected Findings:
- Latency increases uniformly with Docker (~2-3ms added)
- gRPC advantage margin remains similar or grows
- Tail latencies show Docker network effects
- Throughput may decrease at high concurrency with Docker
- Error rates should remain stable (<5%)

For detailed analysis:
- View localhost results: cat $LOCALHOST_RESULTS
- View docker results: cat $DOCKER_RESULTS

Analysis Notes:
EOF

echo -e "${GREEN}Comparison summary saved to: $SUMMARY_FILE${NC}\n"

# Clean up Docker
echo -e "${YELLOW}Cleaning up Docker containers...${NC}"
docker-compose down 2>/dev/null || true

echo -e "${GREEN}Comparison complete!${NC}\n"
echo -e "${BLUE}Summary:${NC}"
echo "  Localhost results: $LOCALHOST_RESULTS"
echo "  Docker results: $DOCKER_RESULTS"
echo "  Comparison: $SUMMARY_FILE"
echo ""
echo "To view results:"
echo "  diff <(grep 'latency' $LOCALHOST_RESULTS) <(grep 'latency' $DOCKER_RESULTS)"
