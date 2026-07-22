package main

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/lab/backend-performance-lab/pkg/observability"
)

const serviceName = "api-gateway"

type route struct {
	Prefix string
	Target string
}

type App struct {
	routes    []route
	hcTimeout time.Duration
}

func main() {
	log := observability.InitLogger()
	slog.SetDefault(log)

	addr := envOr("PORT", "8080")
	hcTimeout, _ := time.ParseDuration(envOr("UPSTREAM_TIMEOUT", "5s"))

	app := &App{
		hcTimeout: hcTimeout,
		routes: []route{
			{"/api/users", envOr("USER_SERVICE_URL", "http://localhost:8081")},
			{"/api/products", envOr("PRODUCT_SERVICE_URL", "http://localhost:8082")},
			{"/api/orders", envOr("ORDER_SERVICE_URL", "http://localhost:8083")},
			{"/api/notifications", envOr("NOTIFICATION_SERVICE_URL", "http://localhost:8084")},
		},
	}

	r := gin.New()
	r.Use(gin.Recovery(), observability.Instrument(serviceName))
	r.GET("/healthz", app.healthz)
	r.GET("/metrics", observability.PrometheusHandler())

	for _, rt := range app.routes {
		rt := rt
		proxy := newProxy(rt.Target, app.hcTimeout)
		upstreamRoot := strings.TrimPrefix(rt.Prefix, "/api")
		handler := func(c *gin.Context) {
			suffix := strings.TrimPrefix(c.Request.URL.Path, rt.Prefix)
			c.Request.URL.Path = upstreamRoot + suffix
			proxy.ServeHTTP(c.Writer, c.Request)
		}
		// Wildcard form handles /api/users, /api/users/, /api/users/123
		r.Any(rt.Prefix+"/*proxyPath", handler)
		// Exact prefix form (no trailing slash, no extra path)
		r.Any(rt.Prefix, handler)
	}

	if err := run(r, ":"+addr); err != nil {
		log.Error("server stopped", "err", err)
		os.Exit(1)
	}
}

func (a *App) healthz(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"service": serviceName, "routes": len(a.routes)})
}

func newProxy(target string, timeout time.Duration) *httputil.ReverseProxy {
	tu, _ := url.Parse(target)
	p := httputil.NewSingleHostReverseProxy(tu)
	p.Transport = &http.Transport{
		ResponseHeaderTimeout: timeout,
		MaxIdleConns:          200,
		MaxIdleConnsPerHost:   100,
		IdleConnTimeout:       90 * time.Second,
	}
	original := p.Director
	p.Director = func(r *http.Request) {
		original(r)
		r.Host = tu.Host
	}
	p.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		slog.Error("upstream error", "target", target, "err", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		_, _ = io.WriteString(w, `{"error":"upstream unavailable"}`)
	}
	return p
}
