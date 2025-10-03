package skill

import "Torchlight/api/router"

type Skill struct {
}

func (a *Skill) Name() string {
	return "skill"
}

func (a *Skill) Run(r router.Router) {
	r.GET("active", a.QueryActiveSkillList)
}
