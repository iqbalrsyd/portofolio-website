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

// seed initializes the repository with 1000 sample products with realistic data
func (r *Repository) seed() {
	categories := []models.Category{
		{ID: 1, Name: "Electronics", Slug: "electronics"},
		{ID: 2, Name: "Clothing", Slug: "clothing"},
		{ID: 3, Name: "Home & Garden", Slug: "home-garden"},
		{ID: 4, Name: "Sports & Outdoors", Slug: "sports-outdoors"},
		{ID: 5, Name: "Books", Slug: "books"},
	}

	suppliers := []models.Supplier{
		{ID: 1, Name: "Global Imports Ltd", Email: "info@globalimports.com", Phone: "+1-555-0101", Country: "China"},
		{ID: 2, Name: "Direct Wholesale", Email: "sales@directwholesale.com", Phone: "+1-555-0102", Country: "Vietnam"},
		{ID: 3, Name: "Premium Brands Inc", Email: "contact@premiumbrands.com", Phone: "+1-555-0103", Country: "Germany"},
		{ID: 4, Name: "Local Manufacturers", Email: "export@localmanufacturers.com", Phone: "+1-555-0104", Country: "USA"},
	}

	warehouseNames := []string{"NYC Distribution", "LA Warehouse", "Chicago Hub", "Miami Port", "Seattle Center"}

	for i := 0; i < 1000; i++ {
		id := int32(i + 1)
		category := categories[i%len(categories)]

		// Generate attributes based on category
		attributes := r.generateAttributes(category.Name, id)

		// Generate tags
		tags := r.generateTags(id)

		// Generate suppliers (1-3 per product)
		productSuppliers := make([]models.Supplier, 0)
		supplierCount := (i % 3) + 1
		for j := 0; j < supplierCount; j++ {
			productSuppliers = append(productSuppliers, suppliers[(i+j)%len(suppliers)])
		}

		// Generate inventory records (2-4 warehouses)
		inventory := make([]models.InventoryRecord, 0)
		invCount := (i % 3) + 2
		for j := 0; j < invCount; j++ {
			inventory = append(inventory, models.InventoryRecord{
				WarehouseID:   int32(j + 1),
				WarehouseName: warehouseNames[j%len(warehouseNames)],
				Quantity:      int32(100 + (i+j)%200),
				Reserved:      int32((i + j) % 50),
			})
		}

		// Generate images
		images := make([]string, 0)
		imageCount := (i % 2) + 2
		for j := 0; j < imageCount; j++ {
			images = append(images, fmt.Sprintf("https://cdn.example.com/products/%d/image-%d.jpg", id, j+1))
		}

		product := &models.Product{
			ID:                  id,
			Name:                fmt.Sprintf("Premium Product %d", id),
			Description:         fmt.Sprintf("High-quality product with premium features - Product ID: %d", id),
			DetailedDescription: fmt.Sprintf("This is a premium quality product offering excellent value. Features include durability, reliability, and outstanding performance. Perfect for both personal and professional use. Customer satisfaction guaranteed. Product ID: %d", id),
			Price:               float32(9.99 + float64(i)*0.5),
			DiscountPrice:       float32(9.99+float64(i)*0.5) * 0.85,
			Stock:               int32(100 + i%50),
			Category:            &category,
			Attributes:          attributes,
			Tags:                tags,
			Suppliers:           productSuppliers,
			Inventory:           inventory,
			SKU:                 fmt.Sprintf("SKU-%06d", id),
			Barcode:             fmt.Sprintf("978-3-16-148410-%d", id%10),
			Images:              images,
			Rating:              int32((i % 5) + 1),
			ReviewCount:         int32((i % 100) * 10),
			IsFeatured:          (i % 20) == 0,
			CreatedAt:           "2024-01-01T00:00:00Z",
			UpdatedAt:           "2024-05-24T00:00:00Z",
		}
		r.products[id] = product
		r.nextID.Store(id + 1)
	}
}

func (r *Repository) generateAttributes(category string, productID int32) []models.Attribute {
	attrs := make([]models.Attribute, 0)
	switch category {
	case "Electronics":
		attrs = append(attrs, models.Attribute{Key: "Brand", Value: "TechBrand"})
		attrs = append(attrs, models.Attribute{Key: "Color", Value: "Black"})
		attrs = append(attrs, models.Attribute{Key: "Warranty", Value: "2 Years"})
		attrs = append(attrs, models.Attribute{Key: "Weight", Value: "500g"})
	case "Clothing":
		attrs = append(attrs, models.Attribute{Key: "Size", Value: "M"})
		attrs = append(attrs, models.Attribute{Key: "Color", Value: "Blue"})
		attrs = append(attrs, models.Attribute{Key: "Material", Value: "100% Cotton"})
		attrs = append(attrs, models.Attribute{Key: "Care", Value: "Machine Wash Cold"})
	case "Home & Garden":
		attrs = append(attrs, models.Attribute{Key: "Material", Value: "Stainless Steel"})
		attrs = append(attrs, models.Attribute{Key: "Dimensions", Value: "30x20x15cm"})
		attrs = append(attrs, models.Attribute{Key: "Weight", Value: "2kg"})
		attrs = append(attrs, models.Attribute{Key: "Color", Value: "Silver"})
	case "Sports & Outdoors":
		attrs = append(attrs, models.Attribute{Key: "Type", Value: "Hiking"})
		attrs = append(attrs, models.Attribute{Key: "Material", Value: "Gore-Tex"})
		attrs = append(attrs, models.Attribute{Key: "Size", Value: "42"})
		attrs = append(attrs, models.Attribute{Key: "Weight", Value: "600g"})
	case "Books":
		attrs = append(attrs, models.Attribute{Key: "Author", Value: "John Doe"})
		attrs = append(attrs, models.Attribute{Key: "Pages", Value: "450"})
		attrs = append(attrs, models.Attribute{Key: "Language", Value: "English"})
		attrs = append(attrs, models.Attribute{Key: "Format", Value: "Hardcover"})
	}
	return attrs
}

func (r *Repository) generateTags(productID int32) []models.Tag {
	tags := make([]models.Tag, 0)
	baseTag := int(productID % 10)
	tagList := []string{"best-seller", "new-arrival", "clearance", "flash-sale", "trending", "limited-edition", "eco-friendly", "premium", "budget-friendly", "handmade"}

	tagCount := (int(productID) % 3) + 1
	for i := 0; i < tagCount; i++ {
		tags = append(tags, models.Tag{
			ID:   int32((baseTag + i) % len(tagList)),
			Name: tagList[(baseTag+i)%len(tagList)],
		})
	}
	return tags
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
