package hero

import (
	"Torchlight/api/router"
	"Torchlight/service"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Hero) QueryHeroList(c *router.Context) {
	data, err := service.GetHeroInfo(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, data)
}
