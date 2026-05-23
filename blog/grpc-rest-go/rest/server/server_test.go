package server

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/iqbalrasyad/grpc-rest-go/internal/storage"
)

func TestHealthEndpoint(t *testing.T) {
	repo := storage.New()
	srv := New(repo)

	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()

	srv.router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var resp map[string]string
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["status"] != "healthy" {
		t.Errorf("Expected status 'healthy', got %s", resp["status"])
	}
}

func TestCreateProduct(t *testing.T) {
	repo := storage.New()
	srv := New(repo)

	payload := []byte(`{
		"name": "Test Product",
		"description": "Test Description",
		"price": 19.99,
		"stock": 100
	}`)

	req, _ := http.NewRequest("POST", "/api/products", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	srv.router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status 201, got %d", w.Code)
	}

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["name"] != "Test Product" {
		t.Errorf("Expected name 'Test Product', got %v", resp["name"])
	}
}

func TestGetProduct(t *testing.T) {
	repo := storage.New()
	srv := New(repo)

	req, _ := http.NewRequest("GET", "/api/products/1", nil)
	w := httptest.NewRecorder()

	srv.router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["id"] != float64(1) {
		t.Errorf("Expected id 1, got %v", resp["id"])
	}
}

func TestListProducts(t *testing.T) {
	repo := storage.New()
	srv := New(repo)

	req, _ := http.NewRequest("GET", "/api/products", nil)
	w := httptest.NewRecorder()

	srv.router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["count"] != float64(1000) {
		t.Errorf("Expected count 1000, got %v", resp["count"])
	}
}

func TestUpdateProduct(t *testing.T) {
	repo := storage.New()
	srv := New(repo)

	payload := []byte(`{
		"name": "Updated Product",
		"description": "Updated Description",
		"price": 29.99,
		"stock": 50
	}`)

	req, _ := http.NewRequest("PUT", "/api/products/1", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	srv.router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["name"] != "Updated Product" {
		t.Errorf("Expected name 'Updated Product', got %v", resp["name"])
	}
}

func TestDeleteProduct(t *testing.T) {
	repo := storage.New()
	srv := New(repo)

	req, _ := http.NewRequest("DELETE", "/api/products/1", nil)
	w := httptest.NewRecorder()

	srv.router.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("Expected status 204, got %d", w.Code)
	}

	// Verify product is deleted
	req, _ = http.NewRequest("GET", "/api/products/1", nil)
	w = httptest.NewRecorder()
	srv.router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}
}

func TestInvalidProductID(t *testing.T) {
	repo := storage.New()
	srv := New(repo)

	req, _ := http.NewRequest("GET", "/api/products/invalid", nil)
	w := httptest.NewRecorder()

	srv.router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestProductNotFound(t *testing.T) {
	repo := storage.New()
	srv := New(repo)

	req, _ := http.NewRequest("GET", "/api/products/9999", nil)
	w := httptest.NewRecorder()

	srv.router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}
}
