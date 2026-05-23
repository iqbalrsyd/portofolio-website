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

	// Start server in a goroutine
	go func() {
		if err := restServer.Start(":8080"); err != nil {
			log.Printf("Server error: %v", err)
		}
	}()

	// Wait for interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	log.Println("Shutdown signal received, gracefully shutting down...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := restServer.Shutdown(ctx); err != nil {
		log.Printf("Shutdown error: %v", err)
	}

	log.Println("REST server stopped")
}
