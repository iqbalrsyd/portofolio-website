package clock

import (
	"testing"
	"time"
)

func TestStart(t *testing.T) {
	timer := Start()
	if timer == nil {
		t.Fatal("Timer should not be nil")
	}
}

func TestElapsed(t *testing.T) {
	timer := Start()
	time.Sleep(10 * time.Millisecond)

	elapsed := timer.Elapsed()
	if elapsed < 10*time.Millisecond {
		t.Errorf("Expected at least 10ms, got %v", elapsed)
	}
}

func TestElapsedMillis(t *testing.T) {
	timer := Start()
	time.Sleep(10 * time.Millisecond)

	elapsedMs := timer.ElapsedMillis()
	if elapsedMs < 10.0 {
		t.Errorf("Expected at least 10ms, got %f", elapsedMs)
	}
}

func TestElapsedMicros(t *testing.T) {
	timer := Start()
	time.Sleep(10 * time.Millisecond)

	elapsedMicros := timer.ElapsedMicros()
	if elapsedMicros < 10000 {
		t.Errorf("Expected at least 10000 microseconds, got %d", elapsedMicros)
	}
}
