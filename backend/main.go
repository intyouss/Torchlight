package main

import (
	"Torchlight/api"
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	ctx := context.Background()
	s := api.NewServer()
	go func() {
		if err := s.Run("/api/v1/"); err != nil {
			slog.ErrorContext(ctx, "failed to run server", slog.Any("err", err))
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	s.Shutdown(ctx)
}
