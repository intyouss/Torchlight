package api

import (
	"Torchlight/api/endpoint/hero"
	"Torchlight/api/middleware"
	"Torchlight/api/router"
)

func (s *Server) registerAll() {
	groups := []router.Group{
		{
			Endpoints: []router.Endpoint{
				&hero.Hero{},
			},
			MiddleWares: []router.HandlerFunc{
				middleware.Cors,
			},
		},
	}
	s.Register(groups...)
}
