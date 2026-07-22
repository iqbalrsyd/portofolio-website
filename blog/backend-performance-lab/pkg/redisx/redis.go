package redisx

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type Config struct {
	URL         string
	DB          int
	DialTimeout time.Duration
}

func defaults(c *Config) {
	if c.DialTimeout == 0 {
		c.DialTimeout = 3 * time.Second
	}
}

func Open(ctx context.Context, c Config) (*redis.Client, error) {
	defaults(&c)
	opts, err := redis.ParseURL(c.URL)
	if err != nil {
		return nil, fmt.Errorf("parse redis url: %w", err)
	}
	opts.DialTimeout = c.DialTimeout

	client := redis.NewClient(opts)
	pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	if err := client.Ping(pingCtx).Err(); err != nil {
		_ = client.Close()
		return nil, fmt.Errorf("ping: %w", err)
	}
	return client, nil
}
