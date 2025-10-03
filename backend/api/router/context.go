package router

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type Context struct {
	*gin.Context
}

func (c *Context) Success(data interface{}) {
	c.Context.JSON(http.StatusOK, data)
}

func (c *Context) Error(httpCode int, msg string) {
	c.Context.JSON(httpCode, gin.H{
		"error": msg,
	})
}
