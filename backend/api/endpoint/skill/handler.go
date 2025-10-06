package skill

import (
	"Torchlight/api/router"
	"Torchlight/service"
	"net/http"
)

func (a *Skill) QueryActiveSkillList(c *router.Context) {
	data, err := service.GetActiveSkills(c)
	if err != nil {
		c.Error(http.StatusInternalServerError, err.Error())
		return
	}
	c.Success(data)
}

func (a *Skill) QueryPassiveSkillList(c *router.Context) {
	data, err := service.GetPassiveSkills(c)
	if err != nil {
		c.Error(http.StatusInternalServerError, err.Error())
		return
	}
	c.Success(data)
}
