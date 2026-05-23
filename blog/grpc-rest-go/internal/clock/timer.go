package clock

import (
	"time"
)

// Timer measures elapsed time for request handling
type Timer struct {
	start time.Time
}

// Start creates a new timer and records the start time
func Start() *Timer {
	return &Timer{
		start: time.Now(),
	}
}

// Elapsed returns the duration since the timer was started
func (t *Timer) Elapsed() time.Duration {
	return time.Since(t.start)
}

// ElapsedMillis returns the elapsed time in milliseconds
func (t *Timer) ElapsedMillis() float64 {
	return float64(t.Elapsed().Microseconds()) / 1000.0
}

// ElapsedMicros returns the elapsed time in microseconds
func (t *Timer) ElapsedMicros() int64 {
	return t.Elapsed().Microseconds()
}
