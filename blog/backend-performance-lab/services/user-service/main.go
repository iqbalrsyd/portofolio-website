package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"

	"github.com/lab/backend-performance-lab/pkg/db"
	"github.com/lab/backend-performance-lab/pkg/observability"
	"github.com/lab/backend-performance-lab/pkg/redisx"
)

const serviceName = "user-service"

type User struct {
	ID        int64     `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type App struct {
	pool  *pgxpool.Pool
	cache *redis.Client
	log   *slog.Logger
	ttl   time.Duration
}

func main() {
	log := observability.InitLogger()
	slog.SetDefault(log)

	addr := envOr("PORT", "8081")
	dbURL := envOr("DATABASE_URL", "postgres://lab:labpass@localhost:55432/labdb?sslmode=disable")
	redisURL := envOr("REDIS_URL", "redis://localhost:56379/0")
	ttlStr := envOr("CACHE_TTL", "5m")
	ttl, _ := time.ParseDuration(ttlStr)

	ctx := context.Background()
	pool, err := db.Open(ctx, db.Config{URL: dbURL})
	if err != nil {
		log.Error("db open", "err", err)
		os.Exit(1)
	}
	defer pool.Close()

	cache, err := redisx.Open(ctx, redisx.Config{URL: redisURL})
	if err != nil {
		log.Error("redis open", "err", err)
		os.Exit(1)
	}
	defer cache.Close()

	app := &App{pool: pool, cache: cache, log: log, ttl: ttl}

	r := gin.New()
	r.Use(gin.Recovery(), observability.Instrument(serviceName))
	r.GET("/healthz", app.healthz)
	r.GET("/metrics", observability.PrometheusHandler())

	v1 := r.Group("/users")
	{
		v1.GET("", app.listUsers)
		v1.POST("", app.createUser)
		v1.GET("/:id", app.getUser)
		v1.PUT("/:id", app.updateUser)
		v1.DELETE("/:id", app.deleteUser)
	}

	httpserverAddr := ":" + addr
	if err := run(r, httpserverAddr); err != nil {
		log.Error("server stopped", "err", err)
		os.Exit(1)
	}
}
