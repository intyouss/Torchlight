package api

import (
	"Torchlight/api/router"
	"context"
	"github.com/gin-gonic/gin"
	"log/slog"
	"net/http"
	"time"
)

const ADDR = ":8080"

type Server struct {
	server http.Server
	groups []router.Group
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) Register(group ...router.Group) {
	s.groups = append(s.groups, group...)
}

func (s *Server) Run(routePrefix string) error {
	s.registerAll()
	engine := gin.Default()
	apiRouter := engine.Group(routePrefix)
	r := router.NewRouter(apiRouter)

	for _, group := range s.groups {
		sub := r.Group(group.Prefix, group.MiddleWares...)
		for _, endpoint := range group.Endpoints {
			endpoint.Run(sub.Group("/" + endpoint.Name()))
		}
	}

	s.server = http.Server{
		Addr:    ADDR,
		Handler: engine.Handler(),
	}
	slog.Info("[server] listening and serving HTTP on " + ADDR)
	return s.server.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	slog.Info("[server] waiting for server shutdown...")
	ctx, cancel := context.WithTimeout(ctx, time.Second*30)
	defer cancel()
	if err := s.server.Shutdown(ctx); err != nil {
		slog.Error("[server] failed to shutdown", err)
		return err
	}

	slog.Info("[server] server shutdown")
	return nil
}
