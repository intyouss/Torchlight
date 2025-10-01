package hero

import "github.com/gin-gonic/gin"

type Hero struct {
}

func (h *Hero) Name() string {
	return "Hero"
}

func (h *Hero) Run(r *gin.Engine) {}
