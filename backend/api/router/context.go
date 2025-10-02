package router

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type Context struct {
	*gin.Context
}

func (c *Context) Success(data interface{}) error {
	c.Context.JSON(http.StatusOK, gin.H{
		"data": data,
	})
	return nil
}

func (c *Context) Error(httpCode int, msg string) error {
	c.Context.JSON(httpCode, gin.H{
		"error": msg,
	})
	return nil
}
