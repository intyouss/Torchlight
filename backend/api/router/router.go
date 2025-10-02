package router

import (
	"github.com/gin-gonic/gin"
)

type Route interface{}
type HandlerFunc func(ctx *Context)

type Endpoint interface {
	Name() string
	Run(r Router)
}

type Routes interface {
	Use(...HandlerFunc)

	Handle(string, string, ...HandlerFunc)
	Any(string, ...HandlerFunc)
	GET(string, ...HandlerFunc)
	POST(string, ...HandlerFunc)
	DELETE(string, ...HandlerFunc)
	PATCH(string, ...HandlerFunc)
	PUT(string, ...HandlerFunc)
	OPTIONS(string, ...HandlerFunc)
	HEAD(string, ...HandlerFunc)
}

type Group struct {
	Prefix      string
	Endpoints   []Endpoint
	MiddleWares []HandlerFunc
}

type Router interface {
	Routes
	Group(string, ...HandlerFunc) Router
}

func NewRouter(router gin.IRouter) Router {
	return &adapterRouter{router}
}
