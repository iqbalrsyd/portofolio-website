package storage

import (
	"sync"
	"testing"

	"github.com/iqbalrasyad/grpc-rest-go/internal/models"
)

func TestNew(t *testing.T) {
	repo := New()
	if repo == nil {
		t.Fatal("Repository should not be nil")
	}
	if repo.Count() != 1000 {
		t.Errorf("Expected 1000 seeded products, got %d", repo.Count())
	}
}

func TestCreate(t *testing.T) {
	repo := New()
	initialCount := repo.Count()

	product := &models.Product{
		Name:        "New Product",
		Description: "A new product",
		Price:       19.99,
		Stock:       50,
	}

	created, err := repo.Create(product)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if created.ID == 0 {
		t.Error("Product ID should be assigned")
	}

	if repo.Count() != initialCount+1 {
		t.Errorf("Expected %d products, got %d", initialCount+1, repo.Count())
	}
}

func TestCreateInvalid(t *testing.T) {
	repo := New()

	tests := []struct {
		name    string
		product *models.Product
		err     error
	}{
		{
			name: "empty name",
			product: &models.Product{
				Name:  "",
				Price: 10.0,
				Stock: 5,
			},
			err: models.ErrInvalidProductName,
		},
		{
			name: "negative price",
			product: &models.Product{
				Name:  "Product",
				Price: -1.0,
				Stock: 5,
			},
			err: models.ErrInvalidPrice,
		},
		{
			name: "negative stock",
			product: &models.Product{
				Name:  "Product",
				Price: 10.0,
				Stock: -1,
			},
			err: models.ErrInvalidStock,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := repo.Create(tt.product)
			if err != tt.err {
				t.Errorf("Expected error %v, got %v", tt.err, err)
			}
		})
	}
}

func TestGetByID(t *testing.T) {
	repo := New()

	// Get existing product
	product, err := repo.GetByID(1)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if product.ID != 1 {
		t.Errorf("Expected product ID 1, got %d", product.ID)
	}

	// Get non-existent product
	_, err = repo.GetByID(9999)
	if err != models.ErrProductNotFound {
		t.Errorf("Expected ErrProductNotFound, got %v", err)
	}
}

func TestGetByIDIsCopy(t *testing.T) {
	repo := New()

	product1, _ := repo.GetByID(1)
	originalName := product1.Name

	// Modify the returned copy
	product1.Name = "Modified"

	// Get the product again
	product2, _ := repo.GetByID(1)

	if product2.Name != originalName {
		t.Errorf("Repository data was modified. Expected %s, got %s", originalName, product2.Name)
	}
}

func TestList(t *testing.T) {
	repo := New()

	products := repo.List()
	if len(products) != 1000 {
		t.Errorf("Expected 1000 products, got %d", len(products))
	}

	// Verify all products are unique
	seen := make(map[int32]bool)
	for _, p := range products {
		if seen[p.ID] {
			t.Errorf("Duplicate product ID: %d", p.ID)
		}
		seen[p.ID] = true
	}
}

func TestUpdate(t *testing.T) {
	repo := New()

	updates := &models.Product{
		Name:        "Updated Name",
		Description: "Updated Description",
		Price:       29.99,
		Stock:       75,
	}

	updated, err := repo.Update(1, updates)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if updated.Name != "Updated Name" {
		t.Errorf("Expected name 'Updated Name', got %s", updated.Name)
	}

	if updated.ID != 1 {
		t.Errorf("Expected ID to remain 1, got %d", updated.ID)
	}

	// Verify the update persisted
	retrieved, _ := repo.GetByID(1)
	if retrieved.Name != "Updated Name" {
		t.Errorf("Update did not persist")
	}
}

func TestUpdateNonExistent(t *testing.T) {
	repo := New()

	updates := &models.Product{
		Name:  "Product",
		Price: 10.0,
		Stock: 5,
	}

	_, err := repo.Update(9999, updates)
	if err != models.ErrProductNotFound {
		t.Errorf("Expected ErrProductNotFound, got %v", err)
	}
}

func TestDelete(t *testing.T) {
	repo := New()
	initialCount := repo.Count()

	err := repo.Delete(1)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if repo.Count() != initialCount-1 {
		t.Errorf("Expected %d products, got %d", initialCount-1, repo.Count())
	}

	// Verify product is gone
	_, err = repo.GetByID(1)
	if err != models.ErrProductNotFound {
		t.Errorf("Expected ErrProductNotFound, got %v", err)
	}
}

func TestDeleteNonExistent(t *testing.T) {
	repo := New()

	err := repo.Delete(9999)
	if err != models.ErrProductNotFound {
		t.Errorf("Expected ErrProductNotFound, got %v", err)
	}
}

func TestConcurrentReads(t *testing.T) {
	repo := New()
	numGoroutines := 100
	operationsPerGoroutine := 100

	var wg sync.WaitGroup
	wg.Add(numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < operationsPerGoroutine; j++ {
				id := int32((j % 500) + 1)
				_, _ = repo.GetByID(id)
			}
		}()
	}

	wg.Wait()
}

func TestConcurrentWrites(t *testing.T) {
	repo := New()
	numGoroutines := 50
	operationsPerGoroutine := 20

	var wg sync.WaitGroup
	wg.Add(numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < operationsPerGoroutine; j++ {
				product := &models.Product{
					Name:  "Concurrent Product",
					Price: 10.0,
					Stock: 5,
				}
				_, _ = repo.Create(product)
			}
		}()
	}

	wg.Wait()

	// Verify all products were created
	finalCount := repo.Count()
	expectedCount := 1000 + (numGoroutines * operationsPerGoroutine)
	if finalCount != expectedCount {
		t.Errorf("Expected %d products, got %d", expectedCount, finalCount)
	}
}

func TestConcurrentReadWrite(t *testing.T) {
	repo := New()
	numReaders := 50
	numWriters := 10
	operationsPerGoroutine := 50

	var wg sync.WaitGroup
	wg.Add(numReaders + numWriters)

	// Readers
	for i := 0; i < numReaders; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < operationsPerGoroutine; j++ {
				id := int32((j % 500) + 1)
				_, _ = repo.GetByID(id)
			}
		}()
	}

	// Writers
	for i := 0; i < numWriters; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < operationsPerGoroutine; j++ {
				product := &models.Product{
					Name:  "Concurrent Product",
					Price: 10.0,
					Stock: 5,
				}
				_, _ = repo.Create(product)
			}
		}()
	}

	wg.Wait()

	// Verify repository is still consistent
	count := repo.Count()
	if count <= 1000 {
		t.Errorf("Expected more than 1000 products after writes, got %d", count)
	}
}
