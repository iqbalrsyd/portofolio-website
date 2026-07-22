package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/lab/backend-performance-lab/pkg/db"
	"github.com/lab/backend-performance-lab/pkg/observability"
)

const serviceName = "order-service"

type Order struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	ProductID int64     `json:"product_id"`
	Qty       int       `json:"qty"`
	Total     float64   `json:"total"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type App struct {
	pool       *pgxpool.Pool
	userURL    string
	productURL string
	notifyURL  string
	hcTimeout  time.Duration
}

func main() {
	log := observability.InitLogger()
	slog.SetDefault(log)

	addr := envOr("PORT", "8083")
	dbURL := envOr("DATABASE_URL", "postgres://lab:labpass@localhost:55432/labdb?sslmode=disable")
	userURL := envOr("USER_SERVICE_URL", "http://localhost:8081")
	productURL := envOr("PRODUCT_SERVICE_URL", "http://localhost:8082")
	notifyURL := envOr("NOTIFICATION_SERVICE_URL", "http://localhost:8084")
	hcTimeout, _ := time.ParseDuration(envOr("UPSTREAM_TIMEOUT", "3s"))

	pool, err := db.Open(slogContext(), db.Config{URL: dbURL})
	if err != nil {
		log.Error("db open", "err", err)
		os.Exit(1)
	}
	defer pool.Close()

	app := &App{
		pool:       pool,
		userURL:    userURL,
		productURL: productURL,
		notifyURL:  notifyURL,
		hcTimeout:  hcTimeout,
	}

	r := gin.New()
	r.Use(gin.Recovery(), observability.Instrument(serviceName))
	r.GET("/healthz", app.healthz)
	r.GET("/metrics", observability.PrometheusHandler())

	v1 := r.Group("/orders")
	{
		v1.GET("", app.listOrders)
		v1.POST("", app.createOrder)
		v1.GET("/:id", app.getOrder)
	}

	if err := run(r, ":"+addr); err != nil {
		log.Error("server stopped", "err", err)
		os.Exit(1)
	}
}

// slogContext avoids pulling context into main for the db open
func slogContext() context.Context { return context.Background() }
