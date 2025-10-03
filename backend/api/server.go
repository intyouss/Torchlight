package api

import (
	"Torchlight/api/router"
	"Torchlight/config"
	"context"
	"github.com/gin-gonic/gin"
	"log/slog"
	"net/http"
	"time"
)

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

	conf := config.NewConfig()
	if err := conf.Load(); err != nil {
		slog.Error("[SERVER] 配置文件加载失败", err)
		return err
	}
	slog.Info("[SERVER] 配置文件加载成功")

	engine := gin.Default()
	apiRouter := engine.Group(routePrefix)
	r := router.NewRouter(apiRouter)

	for _, group := range s.groups {
		sub := r.Group(group.Prefix, group.MiddleWares...)
		for _, endpoint := range group.Endpoints {
			endpoint.Run(sub.Group("/" + endpoint.Name()))
		}
	}

	addr := conf.Server.Host + ":" + conf.Server.Port

	s.server = http.Server{
		Addr:    addr,
		Handler: engine.Handler(),
	}
	slog.Info("[SERVER] 服务器监听地址: " + addr)
	return s.server.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	slog.Info("[SERVER] 服务器正在关闭中...")
	ctx, cancel := context.WithTimeout(ctx, time.Second*30)
	defer cancel()
	if err := s.server.Shutdown(ctx); err != nil {
		slog.Error("[SERVER] 服务器关闭失败", err)
		return err
	}

	slog.Info("[SERVER] 服务器已关闭")
	return nil
}
