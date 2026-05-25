#!/bin/bash

# Benchmark Result Collector and Analysis Script
# Runs all v2 benchmarks and collects results

set -e

BENCHMARK_DIR="./benchmark"
RESULTS_DIR="./benchmark/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create results directory
mkdir -p "$RESULTS_DIR/raw_json/$TIMESTAMP"
mkdir -p "$RESULTS_DIR/analysis/$TIMESTAMP"

echo "========================================"
echo "REST vs gRPC Benchmark Suite - v2"
echo "Timestamp: $TIMESTAMP"
echo "========================================"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to run benchmark and collect metrics
run_benchmark_scenario() {
    local script=$1
    local scenario_name=$2
    local rest_or_grpc=$3
    
    local output_file="$RESULTS_DIR/raw_json/$TIMESTAMP/${scenario_name}_${rest_or_grpc}.json"
    local summary_file="$RESULTS_DIR/analysis/$TIMESTAMP/${scenario_name}_${rest_or_grpc}_summary.txt"
    
    echo -e "\n${YELLOW}=== Running: $scenario_name ($rest_or_grpc) ===${NC}"
    echo "Script: $script"
    echo "Output: $output_file"
    
    # Run k6 benchmark with JSON output
    if k6 run --out json="$output_file" "$BENCHMARK_DIR/$script" 2>&1 | tee "$summary_file"; then
        echo -e "${GREEN}✓ Completed: $scenario_name ($rest_or_grpc)${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed: $scenario_name ($rest_or_grpc)${NC}"
        return 1
    fi
}

# Benchmark scenarios to run
echo -e "\n${YELLOW}Starting Benchmark Suite...${NC}\n"

# Single Item Retrieval (Lightweight)
echo "1. Single Item Retrieval Benchmark"
run_benchmark_scenario "v2_rest_lightweight.js" "single_item" "rest"
sleep 2
run_benchmark_scenario "v2_grpc_lightweight_pooled.js" "single_item" "grpc"

# List Operation (Heavy)
echo -e "\n2. List Operation Benchmark"
run_benchmark_scenario "v2_rest_list_heavy.js" "list_operation" "rest"
sleep 2
run_benchmark_scenario "v2_grpc_list_heavy_pooled.js" "list_operation" "grpc"

# Mixed Concurrent Workload
echo -e "\n3. Mixed Concurrent Workload"
run_benchmark_scenario "v2_concurrent_comparison.js" "mixed_workload" "combined"

# Optional: Streaming benchmarks
echo -e "\n4. Streaming Benchmarks (Optional)"
run_benchmark_scenario "v2_grpc_streaming.js" "streaming" "grpc"
sleep 2
run_benchmark_scenario "v2_rest_bulk.js" "bulk_operation" "rest"

echo -e "\n${GREEN}========================================"
echo "All Benchmarks Completed!"
echo "========================================"
echo "Results stored in: $RESULTS_DIR"
echo "Raw JSON: $RESULTS_DIR/raw_json/$TIMESTAMP"
echo "Summaries: $RESULTS_DIR/analysis/$TIMESTAMP"
echo -e "========================================${NC}"

# Print summary of files
echo -e "\n${YELLOW}Generated Files:${NC}"
ls -lh "$RESULTS_DIR/raw_json/$TIMESTAMP" | grep -v "^total"
echo ""
ls -lh "$RESULTS_DIR/analysis/$TIMESTAMP" | grep -v "^total"

# Create index file
cat > "$RESULTS_DIR/LATEST_RUN.txt" << EOF
Latest Benchmark Run
====================
Timestamp: $TIMESTAMP
Directory: $TIMESTAMP

Scenarios Run:
1. Single Item Retrieval (REST + gRPC)
2. List Operation (REST + gRPC)
3. Mixed Concurrent Workload
4. Streaming Operations (gRPC + REST bulk)

To analyze results:
  python3 analyze_benchmarks.py $TIMESTAMP

See ANALYSIS_INSTRUCTIONS.md for detailed analysis
EOF

cat "$RESULTS_DIR/LATEST_RUN.txt"
