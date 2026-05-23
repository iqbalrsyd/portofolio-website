package storage

import (
	"fmt"
	"sync"
	"sync/atomic"

	"github.com/iqbalrasyad/grpc-rest-go/internal/models"
)

// Repository provides thread-safe product storage operations
type Repository struct {
	mu       sync.RWMutex
	products map[int32]*models.Product
	nextID   atomic.Int32
}

// New creates a new Repository instance and seeds it with products
func New() *Repository {
	r := &Repository{
		products: make(map[int32]*models.Product),
	}
	r.seed()
	return r
}

// seed initializes the repository with 1000 sample products
func (r *Repository) seed() {
	for i := 0; i < 1000; i++ {
		id := int32(i + 1)
		product := &models.Product{
			ID:          id,
			Name:        fmt.Sprintf("Product %d", id),
			Description: fmt.Sprintf("High-quality product with premium features - ID: %d", id),
			Price:       float32(9.99 + float64(i)*0.5),
			Stock:       int32(100 + i%50),
		}
		r.products[id] = product
		r.nextID.Store(id + 1)
	}
}

// Create adds a new product to the repository
func (r *Repository) Create(product *models.Product) (*models.Product, error) {
	if err := product.Validate(); err != nil {
		return nil, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	id := r.nextID.Add(1)
	product.ID = id
	r.products[id] = product

	return product, nil
}

// GetByID retrieves a product by its ID
func (r *Repository) GetByID(id int32) (*models.Product, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	product, exists := r.products[id]
	if !exists {
		return nil, models.ErrProductNotFound
	}

	// Return a copy to prevent external mutations
	return &models.Product{
		ID:          product.ID,
		Name:        product.Name,
		Description: product.Description,
		Price:       product.Price,
		Stock:       product.Stock,
	}, nil
}

// List retrieves all products
func (r *Repository) List() []*models.Product {
	r.mu.RLock()
	defer r.mu.RUnlock()

	products := make([]*models.Product, 0, len(r.products))
	for _, product := range r.products {
		// Return copies to prevent external mutations
		products = append(products, &models.Product{
			ID:          product.ID,
			Name:        product.Name,
			Description: product.Description,
			Price:       product.Price,
			Stock:       product.Stock,
		})
	}

	return products
}

// Update modifies an existing product
func (r *Repository) Update(id int32, updates *models.Product) (*models.Product, error) {
	if err := updates.Validate(); err != nil {
		return nil, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	product, exists := r.products[id]
	if !exists {
		return nil, models.ErrProductNotFound
	}

	// Update fields
	product.Name = updates.Name
	product.Description = updates.Description
	product.Price = updates.Price
	product.Stock = updates.Stock

	// Return a copy
	return &models.Product{
		ID:          product.ID,
		Name:        product.Name,
		Description: product.Description,
		Price:       product.Price,
		Stock:       product.Stock,
	}, nil
}

// Delete removes a product by its ID
func (r *Repository) Delete(id int32) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, exists := r.products[id]
	if !exists {
		return models.ErrProductNotFound
	}

	delete(r.products, id)
	return nil
}

// Count returns the number of products in the repository
func (r *Repository) Count() int {
	r.mu.RLock()
	defer r.mu.RUnlock()

	return len(r.products)
}
