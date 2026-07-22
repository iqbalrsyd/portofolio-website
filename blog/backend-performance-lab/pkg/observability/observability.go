package observability

import (
	"log/slog"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	HTTPRequestsTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "http_requests_total",
		Help: "Total HTTP requests partitioned by service, method, route, and status.",
	}, []string{"service", "method", "route", "status"})

	HTTPRequestDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "http_request_duration_seconds",
		Help:    "HTTP request latency in seconds.",
		Buckets: prometheus.ExponentialBuckets(0.001, 2, 14),
	}, []string{"service", "method", "route"})

	CacheOpsTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "cache_ops_total",
		Help: "Cache operations partitioned by op (hit|miss|set|delete) and key namespace.",
	}, []string{"service", "op", "key"})
)

func InitLogger() *slog.Logger {
	h := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})
	return slog.New(h)
}

func PrometheusHandler() gin.HandlerFunc {
	h := promhttp.Handler()
	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

func Instrument(service string) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		route := c.FullPath()
		if route == "" {
			route = "unknown"
		}
		status := statusToString(c.Writer.Status())
		HTTPRequestsTotal.WithLabelValues(service, c.Request.Method, route, status).Inc()
		HTTPRequestDuration.WithLabelValues(service, c.Request.Method, route).Observe(time.Since(start).Seconds())
	}
}

func statusToString(code int) string {
	switch {
	case code >= 500:
		return "5xx"
	case code >= 400:
		return "4xx"
	case code >= 300:
		return "3xx"
	case code >= 200:
		return "2xx"
	default:
		return "1xx"
	}
}
