package api

import "github.com/gin-gonic/gin"

var Engine *gin.Engine

func NewEngine() {
	Engine = gin.Default()
}

func Run() error {
	return Engine.Run(":8080")
}
