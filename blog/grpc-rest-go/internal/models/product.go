package models

// Product represents a product in the system
type Product struct {
	ID          int32   `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float32 `json:"price"`
	Stock       int32   `json:"stock"`
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
