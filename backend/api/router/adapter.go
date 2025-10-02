package router

import (
	"github.com/gin-gonic/gin"
)

type adapterRouter struct {
	gin.IRouter
}

func (a adapterRouter) Use(middleware ...HandlerFunc) {
	a.IRouter.Use(a.combineHandlers(middleware...)...)
}

func (a adapterRouter) Handle(httpMethod, relativePath string, handlers ...HandlerFunc) {
	a.IRouter.Handle(httpMethod, relativePath, a.combineHandlers(handlers...)...)
}

func (a adapterRouter) Any(s string, handlers ...HandlerFunc) {
	a.IRouter.Any(s, a.combineHandlers(handlers...)...)
}

func (a adapterRouter) GET(s string, handlers ...HandlerFunc) {
	a.IRouter.GET(s, a.combineHandlers(handlers...)...)
}

func (a adapterRouter) POST(s string, handlers ...HandlerFunc) {
	a.IRouter.POST(s, a.combineHandlers(handlers...)...)
}

func (a adapterRouter) DELETE(s string, handlers ...HandlerFunc) {
	a.IRouter.DELETE(s, a.combineHandlers(handlers...)...)
}

func (a adapterRouter) PATCH(s string, handlers ...HandlerFunc) {
	a.IRouter.PATCH(s, a.combineHandlers(handlers...)...)
}

func (a adapterRouter) PUT(s string, handlers ...HandlerFunc) {
	a.IRouter.PUT(s, a.combineHandlers(handlers...)...)
}

func (a adapterRouter) OPTIONS(s string, handlers ...HandlerFunc) {
	a.IRouter.OPTIONS(s, a.combineHandlers(handlers...)...)
}

func (a adapterRouter) HEAD(s string, handlers ...HandlerFunc) {
	a.IRouter.HEAD(s, a.combineHandlers(handlers...)...)
}

func (a adapterRouter) Group(relativePath string, handlers ...HandlerFunc) Router {
	return &adapterRouter{a.IRouter.Group(relativePath, a.combineHandlers(handlers...)...)}
}

func (a adapterRouter) combineHandlers(handlerFunc ...HandlerFunc) (funcs []gin.HandlerFunc) {
	for _, f := range handlerFunc {
		funcs = append(funcs, func(ctx *gin.Context) {
			f(&Context{Context: ctx})
		})
	}
	return
}
