package httpserver

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

type Options struct {
	Addr            string
	ServiceName     string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	ShutdownTimeout time.Duration
}

func defaults(o *Options) {
	if o.Addr == "" {
		o.Addr = ":8080"
	}
	if o.ReadTimeout == 0 {
		o.ReadTimeout = 5 * time.Second
	}
	if o.WriteTimeout == 0 {
		o.WriteTimeout = 10 * time.Second
	}
	if o.ShutdownTimeout == 0 {
		o.ShutdownTimeout = 15 * time.Second
	}
}

func Run(r *gin.Engine, o Options) error {
	defaults(&o)

	gin.SetMode(gin.ReleaseMode)
	r.Use(serviceTag(o.ServiceName))

	srv := &http.Server{
		Addr:         o.Addr,
		Handler:      r,
		ReadTimeout:  o.ReadTimeout,
		WriteTimeout: o.WriteTimeout,
	}

	errs := make(chan error, 1)
	go func() {
		slog.Info("http server starting", "service", o.ServiceName, "addr", o.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errs <- err
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-errs:
		return err
	case sig := <-quit:
		slog.Info("shutdown signal received", "signal", sig.String())
	}

	ctx, cancel := context.WithTimeout(context.Background(), o.ShutdownTimeout)
	defer cancel()
	return srv.Shutdown(ctx)
}

func serviceTag(name string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("X-Service", name)
		c.Next()
	}
}
