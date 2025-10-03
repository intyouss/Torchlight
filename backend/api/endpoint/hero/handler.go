package hero

import (
	"Torchlight/api/router"
	"Torchlight/service"
	"net/http"
)

func (h *Hero) QueryHeroList(c *router.Context) {
	data, err := service.GetHeroInfo(c)
	if err != nil {
		c.Error(http.StatusInternalServerError, err.Error())
		return
	}
	c.Success(data)
}
