#!/bin/bash

# Docker Benchmarking Helper Script
# Simplifies running benchmarks against Docker-based services
# Usage: ./docker_benchmark.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
REST_PORT=8080
GRPC_PORT=50051
BENCHMARK_DIR="./benchmark"

# Functions

show_help() {
	cat << 'EOF'
Docker Benchmarking Helper

Usage: ./docker_benchmark.sh [command]

COMMANDS:
  start             - Start Docker services (REST and gRPC)
  stop              - Stop Docker services
  restart           - Restart Docker services
  status            - Show service status
  logs              - Show service logs (live)
  health            - Check service health
  build             - Build Docker images
  
  bench [test]      - Run benchmark against Docker services
  bench-all         - Run all v2 benchmarks
  bench-single      - Run single-item benchmark
  bench-list        - Run list benchmark
  bench-streaming   - Run streaming benchmarks
  
  clean             - Stop and remove containers
  clean-all         - Remove containers and images

EXAMPLES:
  ./docker_benchmark.sh start
  ./docker_benchmark.sh bench-single
  ./docker_benchmark.sh logs
  ./docker_benchmark.sh stop
EOF
}

start_services() {
	echo -e "${BLUE}Starting Docker services...${NC}"
	if ! docker-compose up -d; then
		echo -e "${RED}Failed to start services${NC}"
		exit 1
	fi
	
	echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
	sleep 3
	
	# Check health
	if curl -s "http://localhost:${REST_PORT}/health" > /dev/null; then
		echo -e "${GREEN}✓ REST server healthy (port ${REST_PORT})${NC}"
	else
		echo -e "${RED}✗ REST server not responding${NC}"
		exit 1
	fi
	
	if timeout 2 bash -c "echo -n > /dev/tcp/localhost/${GRPC_PORT}" 2>/dev/null; then
		echo -e "${GREEN}✓ gRPC server healthy (port ${GRPC_PORT})${NC}"
	else
		echo -e "${RED}✗ gRPC server not responding${NC}"
		exit 1
	fi
	
	echo -e "${GREEN}Services started successfully!${NC}\n"
}

stop_services() {
	echo -e "${BLUE}Stopping Docker services...${NC}"
	docker-compose stop
	echo -e "${GREEN}Services stopped${NC}\n"
}

restart_services() {
	echo -e "${BLUE}Restarting Docker services...${NC}"
	docker-compose restart
	sleep 3
	echo -e "${GREEN}Services restarted${NC}\n"
}

show_status() {
	echo -e "${BLUE}Docker Services Status:${NC}\n"
	docker-compose ps
	echo ""
}

show_logs() {
	echo -e "${BLUE}Following Docker service logs (Ctrl+C to stop)...${NC}\n"
	docker-compose logs -f
}

check_health() {
	echo -e "${BLUE}Checking service health...${NC}\n"
	
	# REST health
	echo -n "REST server (localhost:${REST_PORT}): "
	if curl -s "http://localhost:${REST_PORT}/health" > /dev/null 2>&1; then
		echo -e "${GREEN}✓${NC}"
	else
		echo -e "${RED}✗${NC}"
	fi
	
	# gRPC health
	echo -n "gRPC server (localhost:${GRPC_PORT}): "
	if timeout 2 bash -c "echo -n > /dev/tcp/localhost/${GRPC_PORT}" 2>/dev/null; then
		echo -e "${GREEN}✓${NC}"
	else
		echo -e "${RED}✗${NC}"
	fi
	
	echo ""
}

build_images() {
	echo -e "${BLUE}Building Docker images...${NC}"
	if docker-compose build; then
		echo -e "${GREEN}Build successful${NC}\n"
	else
		echo -e "${RED}Build failed${NC}"
		exit 1
	fi
}

run_benchmark() {
	local test=$1
	
	if [ -z "$test" ]; then
		test="v2"
	fi
	
	echo -e "${YELLOW}Running benchmark: $test${NC}\n"
	
	if ! "${BENCHMARK_DIR}/run_benchmarks.sh" "$test"; then
		echo -e "${RED}Benchmark failed${NC}"
		exit 1
	fi
	
	echo ""
}

clean_services() {
	echo -e "${YELLOW}Stopping and removing containers...${NC}"
	docker-compose down
	echo -e "${GREEN}Cleaned${NC}\n"
}

clean_all() {
	echo -e "${YELLOW}Removing containers and images...${NC}"
	docker-compose down
	docker rmi grpc-rest-go:rest-server grpc-rest-go:grpc-server 2>/dev/null || true
	echo -e "${GREEN}Fully cleaned${NC}\n"
}

# Main logic

if [ $# -eq 0 ]; then
	show_help
	exit 0
fi

case "$1" in
	start)
		start_services
		;;
	stop)
		stop_services
		;;
	restart)
		restart_services
		;;
	status)
		show_status
		;;
	logs)
		show_logs
		;;
	health)
		check_health
		;;
	build)
		build_images
		;;
	bench)
		start_services
		run_benchmark "$2"
		;;
	bench-all)
		start_services
		run_benchmark "v2"
		;;
	bench-single)
		start_services
		run_benchmark "v2-single"
		;;
	bench-list)
		start_services
		run_benchmark "v2-list"
		;;
	bench-streaming)
		start_services
		run_benchmark "v2-streaming"
		;;
	clean)
		clean_services
		;;
	clean-all)
		clean_all
		;;
	*)
		echo -e "${RED}Unknown command: $1${NC}"
		echo ""
		show_help
		exit 1
		;;
esac
