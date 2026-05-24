package main

import (
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/iqbalrasyad/grpc-rest-go/grpc/server"
	"github.com/iqbalrasyad/grpc-rest-go/internal/storage"
)

func main() {
	// Get port from flag or environment variable
	port := flag.String("port", ":50051", "Port to listen on (e.g., :50051, :50052)")
	flag.Parse()

	// Allow override via environment variable
	if envPort := os.Getenv("GRPC_PORT"); envPort != "" {
		if envPort[0] != ':' {
			*port = ":" + envPort
		} else {
			*port = envPort
		}
	}

	// Initialize repository
	repo := storage.New()
	log.Printf("Repository initialized with %d products", repo.Count())

	// Create gRPC server
	grpcServer := server.New(repo)

	// Channel to handle errors from goroutine
	errChan := make(chan error, 1)

	// Start server in a goroutine
	go func() {
		errChan <- grpcServer.Start(*port)
	}()

	// Wait for either an error or interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-errChan:
		if err != nil {
			log.Fatalf("Server failed to start: %v", err)
		}
	case <-sigChan:
		log.Println("Shutdown signal received, gracefully shutting down...")

		if err := grpcServer.Shutdown(); err != nil {
			log.Printf("Shutdown error: %v", err)
		}

		log.Println("gRPC server stopped")
	}
}
