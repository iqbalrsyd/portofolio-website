package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"

	"github.com/lab/backend-performance-lab/pkg/httpx"
)

type userResp struct {
	ID    int64  `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

type productResp struct {
	ID    int64   `json:"id"`
	SKU   string  `json:"sku"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Stock int     `json:"stock"`
}

func (a *App) healthz(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 1*time.Second)
	defer cancel()
	dbOK := a.pool.Ping(ctx) == nil
	status := http.StatusOK
	body := gin.H{"db": dbOK, "service": serviceName}
	if !dbOK {
		status = http.StatusServiceUnavailable
	}
	c.JSON(status, body)
}

func (a *App) listOrders(c *gin.Context) {
	rows, err := a.pool.Query(c.Request.Context(),
		`SELECT id, user_id, product_id, qty, total, status, created_at
		 FROM orders ORDER BY id DESC LIMIT 100`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	orders := make([]Order, 0, 32)
	for rows.Next() {
		var o Order
		if err := rows.Scan(&o.ID, &o.UserID, &o.ProductID, &o.Qty, &o.Total, &o.Status, &o.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		orders = append(orders, o)
	}
	c.JSON(http.StatusOK, orders)
}

func (a *App) getOrder(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var o Order
	err = a.pool.QueryRow(c.Request.Context(),
		`SELECT id, user_id, product_id, qty, total, status, created_at
		 FROM orders WHERE id = $1`, id,
	).Scan(&o.ID, &o.UserID, &o.ProductID, &o.Qty, &o.Total, &o.Status, &o.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, o)
}

func (a *App) createOrder(c *gin.Context) {
	var in struct {
		UserID    int64 `json:"user_id"    binding:"required,gt=0"`
		ProductID int64 `json:"product_id" binding:"required,gt=0"`
		Qty       int   `json:"qty"        binding:"required,gt=0"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), a.hcTimeout)
	defer cancel()

	// fan-out to user + product
	cli := httpx.NewClient(a.hcTimeout)
	var user userResp
	if err := cli.GetJSON(ctx, fmt.Sprintf("%s/users/%d", a.userURL, in.UserID), &user); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "user-service: " + err.Error()})
		return
	}
	var product productResp
	if err := cli.GetJSON(ctx, fmt.Sprintf("%s/products/%d", a.productURL, in.ProductID), &product); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "product-service: " + err.Error()})
		return
	}
	if product.Stock < in.Qty {
		c.JSON(http.StatusConflict, gin.H{"error": "insufficient stock", "available": product.Stock})
		return
	}

	total := product.Price * float64(in.Qty)

	tx, err := a.pool.Begin(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx,
		`UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2 AND stock >= $1`,
		in.Qty, in.ProductID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "stock changed under us"})
		return
	}

	var o Order
	err = tx.QueryRow(ctx,
		`INSERT INTO orders (user_id, product_id, qty, total, status)
		 VALUES ($1,$2,$3,$4,'confirmed')
		 RETURNING id, user_id, product_id, qty, total, status, created_at`,
		in.UserID, in.ProductID, in.Qty, total,
	).Scan(&o.ID, &o.UserID, &o.ProductID, &o.Qty, &o.Total, &o.Status, &o.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if err := tx.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// best-effort notification; do not block the response
	go a.notify(o, user.Email)

	// invalidate product cache so subsequent reads see the new stock
	go a.invalidateProductCache(o.ProductID)

	c.JSON(http.StatusCreated, o)
}

func (a *App) notify(o Order, email string) {
	payload, _ := json.Marshal(map[string]any{
		"order_id": o.ID,
		"user_id":  o.UserID,
		"email":    email,
		"total":    o.Total,
	})
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, a.notifyURL+"/notify", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	_, _ = io.Copy(io.Discard, resp.Body)
}

func (a *App) invalidateProductCache(productID int64) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, http.MethodDelete,
		fmt.Sprintf("%s/products/%d/cache", a.productURL, productID), nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	_, _ = io.Copy(io.Discard, resp.Body)
}
