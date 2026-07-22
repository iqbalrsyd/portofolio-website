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

func cacheKeyProduct(id int64) string { return fmt.Sprintf("product:%d", id) }
func cacheKeyProductList() string     { return "products:list" }

func (a *App) listProducts(c *gin.Context) {
	ctx := c.Request.Context()
	if cached, err := a.cache.Get(ctx, cacheKeyProductList()).Result(); err == nil && cached != "" {
		observability.CacheOpsTotal.WithLabelValues(serviceName, "hit", "products:list").Inc()
		c.Header("X-Cache", "HIT")
		c.Data(http.StatusOK, "application/json", []byte(cached))
		return
	}
	observability.CacheOpsTotal.WithLabelValues(serviceName, "miss", "products:list").Inc()

	rows, err := a.pool.Query(ctx,
		`SELECT id, sku, name, price, stock, created_at, updated_at FROM products ORDER BY id LIMIT 100`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	products := make([]Product, 0, 32)
	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.SKU, &p.Name, &p.Price, &p.Stock, &p.CreatedAt, &p.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		products = append(products, p)
	}
	body, _ := json.Marshal(products)
	a.cache.Set(ctx, cacheKeyProductList(), body, a.ttl)
	c.Header("X-Cache", "MISS")
	c.Data(http.StatusOK, "application/json", body)
}

func (a *App) createProduct(c *gin.Context) {
	var in struct {
		SKU   string  `json:"sku"   binding:"required,min=1,max=64"`
		Name  string  `json:"name"  binding:"required,min=1,max=255"`
		Price float64 `json:"price" binding:"gte=0"`
		Stock int     `json:"stock" binding:"gte=0"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var p Product
	err := a.pool.QueryRow(c.Request.Context(),
		`INSERT INTO products (sku, name, price, stock) VALUES ($1,$2,$3,$4)
		 RETURNING id, sku, name, price, stock, created_at, updated_at`,
		in.SKU, in.Name, in.Price, in.Stock,
	).Scan(&p.ID, &p.SKU, &p.Name, &p.Price, &p.Stock, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	a.cache.Del(c.Request.Context(), cacheKeyProductList(), cacheKeyProduct(p.ID))
	c.JSON(http.StatusCreated, p)
}

func (a *App) getProduct(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	ctx := c.Request.Context()
	key := cacheKeyProduct(id)

	if cached, err := a.cache.Get(ctx, key).Result(); err == nil && cached != "" {
		observability.CacheOpsTotal.WithLabelValues(serviceName, "hit", "product").Inc()
		c.Header("X-Cache", "HIT")
		c.Data(http.StatusOK, "application/json", []byte(cached))
		return
	}
	observability.CacheOpsTotal.WithLabelValues(serviceName, "miss", "product").Inc()

	var p Product
	err = a.pool.QueryRow(ctx,
		`SELECT id, sku, name, price, stock, created_at, updated_at FROM products WHERE id = $1`, id,
	).Scan(&p.ID, &p.SKU, &p.Name, &p.Price, &p.Stock, &p.CreatedAt, &p.UpdatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	body, _ := json.Marshal(p)
	a.cache.Set(ctx, key, body, a.ttl)
	c.Header("X-Cache", "MISS")
	c.Data(http.StatusOK, "application/json", body)
}

func (a *App) updateProduct(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var in struct {
		Name  *string  `json:"name"`
		Price *float64 `json:"price"`
		Stock *int     `json:"stock"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var p Product
	err = a.pool.QueryRow(c.Request.Context(),
		`UPDATE products SET
		   name  = COALESCE($2, name),
		   price = COALESCE($3, price),
		   stock = COALESCE($4, stock),
		   updated_at = NOW()
		 WHERE id = $1
		 RETURNING id, sku, name, price, stock, created_at, updated_at`,
		id, in.Name, in.Price, in.Stock,
	).Scan(&p.ID, &p.SKU, &p.Name, &p.Price, &p.Stock, &p.CreatedAt, &p.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	a.cache.Del(c.Request.Context(), cacheKeyProduct(id), cacheKeyProductList())
	c.JSON(http.StatusOK, p)
}

func (a *App) deleteProduct(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	tag, err := a.pool.Exec(c.Request.Context(), `DELETE FROM products WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}
	a.cache.Del(c.Request.Context(), cacheKeyProduct(id), cacheKeyProductList())
	c.Status(http.StatusNoContent)
}

func (a *App) invalidateCache(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := a.cache.Del(c.Request.Context(), cacheKeyProduct(id), cacheKeyProductList()).Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	observability.CacheOpsTotal.WithLabelValues(serviceName, "delete", "product").Inc()
	c.Status(http.StatusNoContent)
}
