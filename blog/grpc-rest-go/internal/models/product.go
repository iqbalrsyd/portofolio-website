package models

// Product represents a product in the system
type Product struct {
	ID                  int32             `json:"id"`
	Name                string            `json:"name"`
	Description         string            `json:"description"`
	DetailedDescription string            `json:"detailed_description"`
	Price               float32           `json:"price"`
	DiscountPrice       float32           `json:"discount_price"`
	Stock               int32             `json:"stock"`
	Category            *Category         `json:"category"`
	Attributes          []Attribute       `json:"attributes"`
	Tags                []Tag             `json:"tags"`
	Suppliers           []Supplier        `json:"suppliers"`
	Inventory           []InventoryRecord `json:"inventory"`
	SKU                 string            `json:"sku"`
	Barcode             string            `json:"barcode"`
	Images              []string          `json:"images"`
	Rating              int32             `json:"rating"`
	ReviewCount         int32             `json:"review_count"`
	IsFeatured          bool              `json:"is_featured"`
	CreatedAt           string            `json:"created_at"`
	UpdatedAt           string            `json:"updated_at"`
}

// Category represents product category
type Category struct {
	ID   int32  `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

// Attribute represents a product attribute
type Attribute struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// Tag represents a product tag
type Tag struct {
	ID   int32  `json:"id"`
	Name string `json:"name"`
}

// Supplier represents a product supplier
type Supplier struct {
	ID      int32  `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Country string `json:"country"`
}

// InventoryRecord represents stock information
type InventoryRecord struct {
	WarehouseID   int32  `json:"warehouse_id"`
	WarehouseName string `json:"warehouse_name"`
	Quantity      int32  `json:"quantity"`
	Reserved      int32  `json:"reserved"`
}

// Validate checks if a product has valid data
func (p *Product) Validate() error {
	if p.Name == "" {
		return ErrInvalidProductName
	}
	if p.Price < 0 {
		return ErrInvalidPrice
	}
	if p.Stock < 0 {
		return ErrInvalidStock
	}
	return nil
}
