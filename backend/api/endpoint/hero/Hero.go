package hero

import (
	"Torchlight/api/router"
)

type Hero struct {
}

func (h *Hero) Name() string {
	return "hero"
}

func (h *Hero) Run(r router.Router) {
	r.GET("", h.QueryHeroList)
}
