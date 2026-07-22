package main

import (
	"os"

	"github.com/gin-gonic/gin"

	"github.com/lab/backend-performance-lab/pkg/httpserver"
)

func run(r *gin.Engine, addr string) error {
	return httpserver.Run(r, httpserver.Options{Addr: addr, ServiceName: serviceName})
}

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
