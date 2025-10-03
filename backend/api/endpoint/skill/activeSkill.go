package skill

import "Torchlight/api/router"

type ActiveSkill struct {
}

func (a *ActiveSkill) Name() string {
	return "active_skill"
}

func (a *ActiveSkill) Run(r router.Router) {
	r.GET("", a.QueryActiveSkillList)
}
