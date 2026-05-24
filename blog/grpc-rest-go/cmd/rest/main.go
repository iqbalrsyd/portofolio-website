package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/iqbalrasyad/grpc-rest-go/internal/storage"
	"github.com/iqbalrasyad/grpc-rest-go/rest/server"
)

func main() {
	// Initialize repository
	repo := storage.New()
	log.Printf("Repository initialized with %d products", repo.Count())

	// Create REST server
	restServer := server.New(repo)

	// Channel to handle errors from goroutine
	errChan := make(chan error, 1)

	// Start server in a goroutine
	go func() {
		errChan <- restServer.Start(":8080")
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

		// Graceful shutdown with timeout
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := restServer.Shutdown(ctx); err != nil {
			log.Printf("Shutdown error: %v", err)
		}

		log.Println("REST server stopped")
	}
}
