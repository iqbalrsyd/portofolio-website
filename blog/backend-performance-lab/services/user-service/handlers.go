package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/redis/go-redis/v9"

	"github.com/lab/backend-performance-lab/pkg/observability"
)

func (a *App) healthz(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 1*time.Second)
	defer cancel()

	dbOK := a.pool.Ping(ctx) == nil
	redisOK := a.cache.Ping(ctx).Err() == nil

	status := http.StatusOK
	body := gin.H{"db": dbOK, "redis": redisOK, "service": serviceName}
	if !dbOK || !redisOK {
		status = http.StatusServiceUnavailable
	}
	c.JSON(status, body)
}

func cacheKeyUser(id int64) string { return fmt.Sprintf("user:%d", id) }
func cacheKeyUserList() string     { return "users:list" }

func (a *App) listUsers(c *gin.Context) {
	ctx := c.Request.Context()
	if cached, err := a.cache.Get(ctx, cacheKeyUserList()).Result(); err == nil && cached != "" {
		observability.CacheOpsTotal.WithLabelValues(serviceName, "hit", "users:list").Inc()
		c.Header("X-Cache", "HIT")
		c.Data(http.StatusOK, "application/json", []byte(cached))
		return
	}
	observability.CacheOpsTotal.WithLabelValues(serviceName, "miss", "users:list").Inc()

	rows, err := a.pool.Query(ctx, `SELECT id, email, name, created_at, updated_at FROM users ORDER BY id LIMIT 100`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	users := make([]User, 0, 32)
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt, &u.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		users = append(users, u)
	}
	body, _ := json.Marshal(users)
	a.cache.Set(ctx, cacheKeyUserList(), body, a.ttl)
	c.Header("X-Cache", "MISS")
	c.Data(http.StatusOK, "application/json", body)
}

func (a *App) createUser(c *gin.Context) {
	var in struct {
		Email string `json:"email" binding:"required,email"`
		Name  string `json:"name"  binding:"required,min=1,max=255"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var u User
	err := a.pool.QueryRow(c.Request.Context(),
		`INSERT INTO users (email, name) VALUES ($1, $2)
		 RETURNING id, email, name, created_at, updated_at`,
		in.Email, in.Name,
	).Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	a.cache.Del(c.Request.Context(), cacheKeyUserList(), cacheKeyUser(u.ID))
	c.JSON(http.StatusCreated, u)
}

func (a *App) getUser(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	ctx := c.Request.Context()
	key := cacheKeyUser(id)

	if cached, err := a.cache.Get(ctx, key).Result(); err == nil && cached != "" {
		observability.CacheOpsTotal.WithLabelValues(serviceName, "hit", "user").Inc()
		c.Header("X-Cache", "HIT")
		c.Data(http.StatusOK, "application/json", []byte(cached))
		return
	}
	observability.CacheOpsTotal.WithLabelValues(serviceName, "miss", "user").Inc()

	var u User
	err = a.pool.QueryRow(ctx,
		`SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1`, id,
	).Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt, &u.UpdatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	body, _ := json.Marshal(u)
	a.cache.Set(ctx, key, body, a.ttl)
	c.Header("X-Cache", "MISS")
	c.Data(http.StatusOK, "application/json", body)
}

func (a *App) updateUser(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var in struct {
		Email string `json:"email" binding:"omitempty,email"`
		Name  string `json:"name"  binding:"omitempty,min=1,max=255"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var u User
	err = a.pool.QueryRow(c.Request.Context(),
		`UPDATE users SET
		   email      = COALESCE(NULLIF($2,''), email),
		   name       = COALESCE(NULLIF($3,''), name),
		   updated_at = NOW()
		 WHERE id = $1
		 RETURNING id, email, name, created_at, updated_at`,
		id, in.Email, in.Name,
	).Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt, &u.UpdatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	a.cache.Del(c.Request.Context(), cacheKeyUser(id), cacheKeyUserList())
	c.JSON(http.StatusOK, u)
}

func (a *App) deleteUser(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	tag, err := a.pool.Exec(c.Request.Context(), `DELETE FROM users WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	a.cache.Del(c.Request.Context(), cacheKeyUser(id), cacheKeyUserList())
	c.Status(http.StatusNoContent)
}

// helper used by smoke tests
var _ = redis.Nil
