package server

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/iqbalrasyad/grpc-rest-go/internal/clock"
)

// TimingMiddleware logs request duration
func TimingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		timer := clock.Start()

		// Process request
		c.Next()

		// Log duration
		duration := timer.ElapsedMillis()
		log.Printf("method=%s path=%s status=%d duration_ms=%.3f", c.Request.Method, c.Request.URL.Path, c.Writer.Status(), duration)
	}
}

// LoggingMiddleware logs request details
func LoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Printf("request_start method=%s path=%s", c.Request.Method, c.Request.URL.Path)
		c.Next()
	}
}
