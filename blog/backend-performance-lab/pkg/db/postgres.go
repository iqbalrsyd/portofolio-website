package db

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Config struct {
	URL         string
	MaxConns    int32
	MinConns    int32
	MaxConnLife time.Duration
	HealthzPing time.Duration
}

func defaults(c *Config) {
	if c.MaxConns == 0 {
		c.MaxConns = 10
	}
	if c.MinConns == 0 {
		c.MinConns = 1
	}
	if c.MaxConnLife == 0 {
		c.MaxConnLife = time.Hour
	}
	if c.HealthzPing == 0 {
		c.HealthzPing = 2 * time.Second
	}
}

func Open(ctx context.Context, c Config) (*pgxpool.Pool, error) {
	defaults(&c)

	cfg, err := pgxpool.ParseConfig(c.URL)
	if err != nil {
		return nil, fmt.Errorf("parse db url: %w", err)
	}
	cfg.MaxConns = c.MaxConns
	cfg.MinConns = c.MinConns
	cfg.MaxConnLifetime = c.MaxConnLife

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("open pool: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping: %w", err)
	}
	return pool, nil
}
