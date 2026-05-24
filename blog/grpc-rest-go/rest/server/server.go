package server

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/iqbalrasyad/grpc-rest-go/internal/models"
	"github.com/iqbalrasyad/grpc-rest-go/internal/storage"
)

// Server represents the REST API server
type Server struct {
	router *gin.Engine
	repo   *storage.Repository
	srv    *http.Server
}

// New creates a new REST server instance
func New(repo *storage.Repository) *Server {
	// Set Gin to release mode for benchmarking
	gin.SetMode(gin.ReleaseMode)

	engine := gin.New()

	s := &Server{
		router: engine,
		repo:   repo,
	}

	// Register middleware
	s.router.Use(TimingMiddleware())
	s.router.Use(LoggingMiddleware())

	// Register routes
	s.registerRoutes()

	return s
}

// registerRoutes sets up all API routes
func (s *Server) registerRoutes() {
	// Health check
	s.router.GET("/health", s.Health)

	// Product routes
	s.router.POST("/api/products", s.CreateProduct)
	s.router.GET("/api/products/:id", s.GetProduct)
	s.router.GET("/api/products", s.ListProducts)
	s.router.PUT("/api/products/:id", s.UpdateProduct)
	s.router.DELETE("/api/products/:id", s.DeleteProduct)
}

// Start starts the REST server
func (s *Server) Start(addr string) error {
	s.srv = &http.Server{
		Addr:    addr,
		Handler: s.router,
	}

	log.Printf("Starting REST server on %s", addr)
	if err := s.srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return err
	}
	return nil
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown(ctx context.Context) error {
	if s.srv != nil {
		return s.srv.Shutdown(ctx)
	}
	return nil
}

// Health returns the health status
func (s *Server) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
	})
}

// CreateProduct creates a new product
func (s *Server) CreateProduct(c *gin.Context) {
	var req struct {
		Name        string  `json:"name" binding:"required"`
		Description string  `json:"description"`
		Price       float32 `json:"price" binding:"required"`
		Stock       int32   `json:"stock" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	product, err := s.repo.Create(&models.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, product)
}

// GetProduct retrieves a product by ID
func (s *Server) GetProduct(c *gin.Context) {
	id, err := parseID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid product id",
		})
		return
	}

	// Check if simplified product is requested (for lightweight benchmarks)
	// Default to lightweight (5 fields) to match gRPC proto definition
	includeDetails := c.DefaultQuery("include_details", "false") == "true"

	product, err := s.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	// If lightweight response requested, return only basic fields
	if !includeDetails {
		c.JSON(http.StatusOK, gin.H{
			"id":          product.ID,
			"name":        product.Name,
			"description": product.Description,
			"price":       product.Price,
			"stock":       product.Stock,
		})
		return
	}

	c.JSON(http.StatusOK, product)
}

// ListProducts returns all products
func (s *Server) ListProducts(c *gin.Context) {
	// Check if simplified products are requested (for lightweight benchmarks)
	// Default to lightweight (5 fields) to match gRPC proto definition
	includeDetails := c.DefaultQuery("include_details", "false") == "true"

	products := s.repo.List()

	if !includeDetails {
		// Return lightweight response with only basic fields
		type SimpleProduct struct {
			ID          int32   `json:"id"`
			Name        string  `json:"name"`
			Description string  `json:"description"`
			Price       float32 `json:"price"`
			Stock       int32   `json:"stock"`
		}

		simplified := make([]SimpleProduct, len(products))
		for i, p := range products {
			simplified[i] = SimpleProduct{
				ID:          p.ID,
				Name:        p.Name,
				Description: p.Description,
				Price:       p.Price,
				Stock:       p.Stock,
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"products": simplified,
			"count":    len(simplified),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"products": products,
		"count":    len(products),
	})
}

// UpdateProduct updates an existing product
func (s *Server) UpdateProduct(c *gin.Context) {
	id, err := parseID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid product id",
		})
		return
	}

	var req struct {
		Name        string  `json:"name" binding:"required"`
		Description string  `json:"description"`
		Price       float32 `json:"price" binding:"required"`
		Stock       int32   `json:"stock" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	product, err := s.repo.Update(id, &models.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
	})

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, product)
}

// DeleteProduct deletes a product
func (s *Server) DeleteProduct(c *gin.Context) {
	id, err := parseID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid product id",
		})
		return
	}

	err = s.repo.Delete(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.Status(http.StatusNoContent)
}

// parseID parses a string ID to int32
func parseID(idStr string) (int32, error) {
	var id int32
	_, err := fmt.Sscanf(idStr, "%d", &id)
	return id, err
}
