.PHONY: help build test clean lint fmt proto proto-gen run-rest run-grpc run-both

help:
	@echo "Available targets:"
	@echo "  make proto          - Generate protobuf code"
	@echo "  make build          - Build the project"
	@echo "  make test           - Run tests"
	@echo "  make fmt            - Format code"
	@echo "  make lint           - Run linter"
	@echo "  make clean          - Clean build artifacts"
	@echo "  make run-rest       - Run REST server"
	@echo "  make run-grpc       - Run gRPC server"
	@echo "  make run-both       - Run both servers"

proto-gen:
	@echo "Generating protobuf code..."
	protoc --go_out=. --go-grpc_out=. proto/*.proto

build: proto-gen
	@echo "Building project..."
	go build -o bin/rest-server ./cmd/rest
	go build -o bin/grpc-server ./cmd/grpc

test:
	@echo "Running tests..."
	go test -v ./...

fmt:
	@echo "Formatting code..."
	go fmt ./...

lint:
	@echo "Running linter..."
	go vet ./...

clean:
	@echo "Cleaning build artifacts..."
	rm -rf bin/
	rm -f proto/*.pb.go

run-rest:
	@echo "Running REST server on port 8080..."
	go run ./cmd/rest/main.go

run-grpc:
	@echo "Running gRPC server on port 50051..."
	go run ./cmd/grpc/main.go

run-both:
	@echo "Running both servers..."
	(go run ./cmd/rest/main.go &) && (go run ./cmd/grpc/main.go &) && wait
