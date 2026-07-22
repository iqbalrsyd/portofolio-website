package main

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/lab/backend-performance-lab/pkg/observability"
)

const serviceName = "notification-service"

type App struct {
	log *slog.Logger
}

func main() {
	log := observability.InitLogger()
	slog.SetDefault(log)
	app := &App{log: log}

	addr := envOr("PORT", "8084")
	r := gin.New()
	r.Use(gin.Recovery(), observability.Instrument(serviceName))
	r.GET("/healthz", app.healthz)
	r.GET("/metrics", observability.PrometheusHandler())
	r.POST("/notify", app.notify)

	if err := run(r, ":"+addr); err != nil {
		log.Error("server stopped", "err", err)
		os.Exit(1)
	}
}

func (a *App) healthz(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"service": serviceName, "ts": time.Now().UTC()})
}

func (a *App) notify(c *gin.Context) {
	var in map[string]any
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	a.log.Info("notification received", "payload", in)
	c.JSON(http.StatusAccepted, gin.H{"accepted": true})
}
