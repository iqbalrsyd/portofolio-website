package models

import "errors"

// Error definitions for product operations
var (
	ErrInvalidProductName = errors.New("product name cannot be empty")
	ErrInvalidPrice       = errors.New("price cannot be negative")
	ErrInvalidStock       = errors.New("stock cannot be negative")
	ErrProductNotFound    = errors.New("product not found")
)
