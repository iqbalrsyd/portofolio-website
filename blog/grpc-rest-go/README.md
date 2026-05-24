# REST vs gRPC Benchmark Suite

A comprehensive Golang project for benchmarking and comparing REST API (Gin) vs gRPC (grpc-go) performance across various load scenarios.

## Overview

This project demonstrates architectural patterns, performance characteristics, and best practices for building both REST and gRPC services in Go. It serves as a reference implementation for technical blog content and hands-on learning.

**Key Objectives:**

- Performance comparison under different load patterns
- Identical business logic across both implementations
- Reproducible benchmarking environment
- Real-world architectural insights

## Project Structure

```
project/
├── cmd/                          # Application entry points
│   ├── rest/main.go             # REST server entry point
│   └── grpc/main.go             # gRPC server entry point
│
├── internal/                     # Private application code (not importable)
│   ├── models/
│   │   ├── product.go           # Domain model for products
│   │   └── errors.go            # Custom error types
│   ├── storage/
│   │   └── repository.go        # In-memory product repository
│   └── clock/
│       └── timer.go             # Request timing utilities
│
├── rest/                         # REST API implementation (Gin)
│   └── server/
│       ├── server.go            # REST server setup and routes
│       ├── middleware.go        # Request logging and timing middleware
│       └── server_test.go       # REST server tests
│
├── grpc/                         # gRPC implementation
│   └── server/
│       ├── server.go            # gRPC server setup
│       ├── interceptor.go       # Request timing interceptor
│       └── server_test.go       # gRPC server tests
│
├── proto/                        # Protocol Buffer definitions
│   ├── product.proto            # Product message definitions
│   ├── product_service.proto    # Service definitions
│   └── pb/                      # Generated protobuf code
│       ├── product.pb.go
│       └── product_service_grpc.pb.go
│
├── benchmark/                    # k6 benchmark scripts
│   ├── rest_small_payload.js    # REST single product request
│   ├── rest_large_payload.js    # REST list all products
│   ├── grpc_small_payload.js    # gRPC single product request
│   ├── grpc_large_payload.js    # gRPC list all products
│   ├── concurrent_traffic.js    # Mixed REST/gRPC requests
│   ├── stress_test.js           # High-load stress test
│   ├── run_benchmarks.sh        # Benchmark runner script
│   └── README.md                # Detailed benchmark documentation
│
├── scripts/                      # Utility scripts
│
├── go.mod                        # Go module definition
├── go.sum                        # Go module checksums
├── Makefile                      # Build and run targets
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Docker Compose orchestration
├── .dockerignore                 # Docker build context exclusions
├── start_benchmark.sh            # Quick start script for benchmarks
└── README.md                     # This file
```

## Domain Model: Product Service

This project implements a simple Product Service with CRUD operations.

### Product Fields

```go
type Product struct {
    ID          int32   `json:"id"`
    Name        string  `json:"name"`
    Description string  `json:"description"`
    Price       float32 `json:"price"`
    Stock       int32   `json:"stock"`
}
```

### Supported Operations

1. **Create Product** - POST/gRPC - Create a new product
2. **Get Product** - GET/gRPC - Retrieve a product by ID
3. **List Products** - GET (pagination)/gRPC stream - List all products
4. **Update Product** - PUT/gRPC - Update product details
5. **Delete Product** - DELETE/gRPC - Delete a product
6. **Health Check** - GET - REST server health status

### Storage

All data is stored in-memory using a thread-safe repository with map-based storage. The system automatically seeds 1000 products on startup.

## API Specifications

### REST API (Gin) - Port 8080

#### Create Product

```http
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product Description",
  "price": 29.99,
  "stock": 100
}

Response: 201 Created
{
  "id": 1,
  "name": "Product Name",
  "description": "Product Description",
  "price": 29.99,
  "stock": 100
}
```

#### Get Product

```http
GET /api/products/{id}

Response: 200 OK
{
  "id": 1,
  "name": "Product Name",
  "description": "Product Description",
  "price": 29.99,
  "stock": 100
}
```

#### List Products

```http
GET /api/products?page=1&limit=50

Response: 200 OK
{
  "products": [...],
  "total": 1000,
  "page": 1,
  "limit": 50
}
```

#### Update Product

```http
PUT /api/products/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated Description",
  "price": 39.99,
  "stock": 150
}

Response: 200 OK
{
  "id": 1,
  "name": "Updated Name",
  "description": "Updated Description",
  "price": 39.99,
  "stock": 150
}
```

#### Delete Product

```http
DELETE /api/products/{id}

Response: 204 No Content
```

#### Health Check

```http
GET /health

Response: 200 OK
{
  "status": "healthy"
}
```

### gRPC API - Port 50051

#### Unary RPCs

```protobuf
service ProductService {
  // Unary RPCs
  rpc CreateProduct(CreateProductRequest) returns (Product);
  rpc GetProduct(GetProductRequest) returns (Product);
  rpc ListProducts(ListProductsRequest) returns (ListProductsResponse);
  rpc UpdateProduct(UpdateProductRequest) returns (Product);
  rpc DeleteProduct(DeleteProductRequest) returns (google.protobuf.Empty);

  // Server Streaming RPC
  rpc StreamProducts(StreamProductsRequest) returns (stream Product);
}
```

#### Message Types

```protobuf
message Product {
  int32 id = 1;
  string name = 2;
  string description = 3;
  float price = 4;
  int32 stock = 5;
}

message CreateProductRequest {
  string name = 1;
  string description = 2;
  float price = 3;
  int32 stock = 4;
}

message GetProductRequest {
  int32 id = 1;
}

message ListProductsRequest {
  int32 page = 1;
  int32 limit = 2;
}

message ListProductsResponse {
  repeated Product products = 1;
  int32 total = 2;
  int32 page = 3;
  int32 limit = 4;
}

message UpdateProductRequest {
  int32 id = 1;
  string name = 2;
  string description = 3;
  float price = 4;
  int32 stock = 5;
}

message DeleteProductRequest {
  int32 id = 1;
}

message StreamProductsRequest {
  int32 batch_size = 1;
}
```

## Getting Started

### Prerequisites

- **Go 1.22+** - [Install Go](https://golang.org/doc/install)
- **k6** - [Install k6](https://k6.io/docs/getting-started/installation/) (for benchmarking)
- **Docker & Docker Compose** (optional - for containerized setup)
- **protoc** (optional - if regenerating protobuf code)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd grpc-rest-go
```

2. **Download dependencies**

```bash
go mod download
```

3. **Verify setup**

```bash
go build ./cmd/rest
go build ./cmd/grpc
```

## Running the Servers

### Option 1: Local Development

**Terminal 1 - REST Server:**

```bash
go run ./cmd/rest/main.go
# Output: REST server listening on port 8080
```

**Terminal 2 - gRPC Server:**

```bash
go run ./cmd/grpc/main.go
# Output: gRPC server listening on port 50051
```

**Terminal 3 - Health Check:**

```bash
curl http://localhost:8080/health
```

### Option 2: Using Make

```bash
# Run both servers
make run-both

# Or separately
make run-rest    # Terminal 1
make run-grpc    # Terminal 2
```

### Option 3: Docker Compose

```bash
# Start both servers
docker-compose up

# Start specific service
docker-compose up rest-server
docker-compose up grpc-server

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

### Option 4: Quick Start Script

```bash
# Start both servers in background
./start_benchmark.sh both

# Stop servers
./start_benchmark.sh stop

# View logs
tail -f /tmp/rest.log
tail -f /tmp/grpc.log
```

## Testing

### Run All Tests

```bash
make test
# or
go test -v ./...
```

### Run Specific Tests

```bash
# REST server tests
go test -v ./rest/server

# gRPC server tests
go test -v ./grpc/server

# Repository tests
go test -v ./internal/storage

# Timer tests
go test -v ./internal/clock
```

### Test Coverage

```bash
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## Building

### Build Binaries

```bash
make build
# Creates: bin/rest-server, bin/grpc-server
```

### Build Docker Images

```bash
# Build both images
docker-compose build

# Build specific image
docker build -t grpc-rest-go:rest --target rest-server .
docker build -t grpc-rest-go:grpc --target grpc-server .
```

## Code Quality

### Format Code

```bash
make fmt
# or
go fmt ./...
```

### Lint Code

```bash
make lint
# or
go vet ./...
```

## Benchmarking

### Benchmark Improvements (v2)

**Important:** Version 2.0 introduces significantly improved benchmarking methodology. The original benchmarks had a critical fairness issue where gRPC created a new connection for every request, while REST reused connections. **v2 fixes this and many other issues.**

**Recommended: Start with v2 benchmarks**

```bash
# Run improved v2 benchmarks (recommended)
./benchmark/run_benchmarks.sh v2           # All v2 benchmarks
./benchmark/run_benchmarks.sh v2-single    # Single item comparison
./benchmark/run_benchmarks.sh v2-list      # List operation comparison

# See detailed analysis
cat benchmark/QUICKSTART_v2.md       # Quick start guide
cat benchmark/IMPROVEMENTS_v2.md     # Technical improvements
```

### Benchmark Setup

The project includes k6 benchmarks with multiple scenarios:

1. **Small Payload Tests** - Single product retrieval
2. **Large Payload Tests** - List all 1000 products
3. **Concurrent Traffic** - Mixed REST/gRPC requests
4. **Stress Test** - High-load ramp-up test

### Original vs v2 Benchmarks

| Aspect                   | Original                 | v2 (Improved)         |
| ------------------------ | ------------------------ | --------------------- |
| **Max concurrency**      | 10 VUs                   | 100 VUs               |
| **gRPC connections**     | New per request (unfair) | Pooled/reused (fair)  |
| **Warmup time**          | 30s                      | 60s+ per stage        |
| **Measurement duration** | 120s                     | 420s+                 |
| **Workload patterns**    | List only                | Single + List + Mixed |
| **Tail latencies**       | p95, p99                 | p95, p99, max         |
| **Fair comparison**      | ❌ No                    | ✅ Yes                |

### Quick Benchmark Run

```bash
# Terminal 1 - Start servers
make run-both

# Terminal 2 - Run v2 benchmarks (recommended)
./benchmark/run_benchmarks.sh v2

# Or run original benchmarks
./benchmark/run_benchmarks.sh all
```

### Individual Benchmarks

**v2 Improved Benchmarks:**

```bash
./benchmark/run_benchmarks.sh v2-single      # Single item retrieval
./benchmark/run_benchmarks.sh v2-list        # List all products
./benchmark/run_benchmarks.sh v2-comparison  # Concurrent mixed
```

**Original Benchmarks:**

```bash
# REST tests
./benchmark/run_benchmarks.sh rest-small
./benchmark/run_benchmarks.sh rest-large

# gRPC tests
./benchmark/run_benchmarks.sh grpc-small
./benchmark/run_benchmarks.sh grpc-large

# Comparison tests
./benchmark/run_benchmarks.sh concurrent
./benchmark/run_benchmarks.sh stress
```

### Using k6 Directly

```bash
# Run with custom load
k6 run -u 50 -d 30s benchmark/rest_small_payload.js

# Output to JSON
k6 run --out json=results.json benchmark/rest_small_payload.js

# Output to CSV
k6 run -o csv=results.csv benchmark/rest_small_payload.js

# Multiple formats
k6 run --out json=results.json -o csv=results.csv benchmark/rest_small_payload.js
```

### Docker Compose Benchmark

```bash
# Start servers
docker-compose up rest-server grpc-server &

# Run benchmarks inside container
docker-compose run --rm k6-benchmark k6 run /scripts/rest_small_payload.js

# Stop servers
docker-compose down
```

## Expected Benchmark Results

### Small Payload (Single Product)

```
REST:  ~0.5-2ms latency, ~2KB response
gRPC:  ~0.1-1ms latency, ~0.2KB response
```

**Analysis:**

- gRPC has lower latency due to binary protocol
- REST has JSON serialization overhead
- gRPC more efficient for simple requests

### Large Payload (1000 Products)

```
REST:  ~5-20ms latency, ~300KB response
gRPC:  ~3-10ms latency, ~50KB response
```

**Analysis:**

- gRPC significantly smaller payload (6x reduction)
- Better throughput with gRPC
- Network bandwidth favors gRPC

### Concurrent Traffic (100 VUs)

```
REST:  100-200 req/s
gRPC:  500-1000 req/s
```

**Analysis:**

- gRPC handles more concurrent connections
- Binary protocol more efficient at scale
- gRPC better for high-throughput scenarios

### Stress Test (50→100 VUs)

```
REST: Stable up to 50VU, degradation after
gRPC: Linear scaling, handles high load better
```

**Analysis:**

- gRPC maintains better performance under stress
- gRPC protocol overhead is negligible
- Binary encoding reduces CPU usage

## Key Implementation Details

### Identical Business Logic

Both REST and gRPC implementations:

- Use the same `Product` model
- Share the same in-memory repository
- Have identical validation logic
- Return identical data structures

### Performance Monitoring

**REST Middleware:**

```go
// Logs request timing for all endpoints
- Request start time
- Response status
- Duration (milliseconds)
```

**gRPC Interceptor:**

```go
// Unary RPC timing
- Request start time
- Response error status
- Duration (milliseconds)
```

### Thread Safety

The in-memory repository uses `sync.RWMutex` for thread-safe concurrent access.

### Graceful Shutdown

Both servers implement graceful shutdown:

- Handle SIGINT/SIGTERM signals
- Drain in-flight requests
- Close connections cleanly

## Technical Decisions

### Why In-Memory Storage?

- **Eliminates database latency** - Pure application performance
- **Reproducible results** - No external dependencies
- **Fast iteration** - No migrations or setup
- **Focus on protocol comparison** - Isolates network protocol overhead

### Why Protocol Buffers?

- **Language-agnostic** - Can add other languages
- **Binary efficiency** - Smaller payloads
- **Schema evolution** - Easy to extend
- **gRPC requirement** - Native integration

### Why Multi-Stage Docker?

- **Optimized images** - Smaller size (~10MB)
- **Build environment separate** - No build tools in runtime
- **Security** - Reduced attack surface
- **Performance** - Faster container startup

### Why k6 for Benchmarks?

- **Protocol support** - Native gRPC support
- **Load patterns** - Flexible ramp-up/down
- **Real-time results** - Console output during test
- **Multiple formats** - JSON/CSV export

## Architecture Comparison

### REST API (Gin)

**Advantages:**

- Simple to understand
- Easy to debug (JSON/HTTP)
- Wide tool support
- Stateless by design
- Browser-friendly
- Better for caching

**Disadvantages:**

- Verbose JSON payloads
- Higher latency
- More CPU for serialization
- More bandwidth usage

### gRPC

**Advantages:**

- Binary protocol (compact)
- Lower latency
- Efficient multiplexing
- Bidirectional streaming
- Built-in protobuf schema
- Better performance at scale

**Disadvantages:**

- Steeper learning curve
- Requires protobuf knowledge
- Less tooling for debugging
- Not browser-friendly (HTTP/2)
- Requires native clients

## When to Use Each

### Use REST When:

- Building public APIs
- Need broad tool/language support
- Simple request-response patterns
- Caching is important
- Team familiar with REST
- Browser clients needed

### Use gRPC When:

- Building microservices
- High performance needed
- Many concurrent connections
- Bidirectional communication
- Polyglot microservices
- Internal service communication

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8080
lsof -i :50051

# Kill process
kill -9 <PID>
```

### Proto Compilation Errors

```bash
# Regenerate proto files
protoc --go_out=. --go-grpc_out=. proto/*.proto

# Install tools if needed
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

### High Error Rate in Benchmarks

```bash
# Reduce concurrent users
k6 run -u 5 -d 10s benchmark/rest_small_payload.js

# Increase system limits
ulimit -n 10000

# Check server logs
tail -f /tmp/rest.log
tail -f /tmp/grpc.log
```

### Docker Build Fails

```bash
# Clear cache
docker-compose build --no-cache

# Check Docker daemon
docker info

# Rebuild images
docker-compose build --pull
```

## Development Workflow

### Adding New Features

1. **Update proto definition** (if gRPC endpoint)
2. **Generate proto code** - `protoc --go_out=. --go-grpc_out=. proto/*.proto`
3. **Update repository** - Add business logic
4. **Implement REST handler** - Add Gin route
5. **Implement gRPC handler** - Add service method
6. **Add tests** - Test new functionality
7. **Update benchmarks** - Add load tests
8. **Document changes** - Update README

### Code Style

- Follow Go idioms
- Use `gofmt` for formatting
- Keep packages focused
- Minimize exported surface
- Write table-driven tests
- Document public APIs

## References

### Documentation

- [Go Documentation](https://golang.org/doc/)
- [Gin Web Framework](https://github.com/gin-gonic/gin)
- [gRPC Go](https://github.com/grpc/grpc-go)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)
- [k6 Load Testing](https://k6.io/docs/)

### Learning Resources

- [Effective Go](https://golang.org/doc/effective_go)
- [gRPC Best Practices](https://grpc.io/docs/guides/performance-best-practices/)
- [REST Best Practices](https://restfulapi.net/)

### Related Projects

- [gRPC Examples](https://github.com/grpc/grpc-go/tree/master/examples)
- [Gin Examples](https://github.com/gin-gonic/gin#example)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions:

1. Check existing issues
2. Create a detailed issue report
3. Include reproduction steps
4. Share benchmark results if relevant

## Changelog

### Version 2.0.0 - Improved Benchmarking Methodology

**Major improvements to benchmark fairness and realism:**

- ✅ Fixed critical gRPC fairness issue: connection pooling now properly simulated
- ✅ Increased max concurrency from 10 VUs to 100 VUs
- ✅ Added proper warmup phases for stable measurements
- ✅ Implemented multi-workload testing (single items vs lists)
- ✅ Enhanced product model with realistic nested structures
- ✅ Added tail latency metrics (p95, p99, max)
- ✅ Created v2 improved benchmark scripts
- ✅ Comprehensive improvement documentation

**New v2 Benchmarks:**

- `v2_rest_lightweight.js` - Single item retrieval (REST)
- `v2_grpc_lightweight_pooled.js` - Single item retrieval (gRPC with connection pooling)
- `v2_rest_list_heavy.js` - List operation (REST, large payload)
- `v2_grpc_list_heavy_pooled.js` - List operation (gRPC with pooling)
- `v2_concurrent_comparison.js` - Mixed concurrent workload

**Quick start with v2:**

```bash
./benchmark/run_benchmarks.sh v2        # Run all improved benchmarks
./benchmark/run_benchmarks.sh v2-single # Single item comparison
./benchmark/run_benchmarks.sh v2-list   # List operation comparison
```

**See:**

- `benchmark/IMPROVEMENTS_v2.md` - Technical deep-dive into improvements
- `benchmark/QUICKSTART_v2.md` - User guide for v2 benchmarks
- `benchmark/PROJECT_STATUS.md` - Full project status and roadmap

### Version 1.0.0

- Initial release
- REST API implementation (Gin)
- gRPC implementation (grpc-go)
- k6 benchmark suite
- Docker support
- Comprehensive documentation

---

**Built with ❤️ for learning and benchmarking REST vs gRPC architectures.**
