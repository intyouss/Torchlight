package skill

import "Torchlight/api/router"

type Skill struct {
}

func (a *Skill) Name() string {
	return "skill"
}

func (a *Skill) Run(r router.Router) {
	r.GET("active", a.QueryActiveSkillList)
	r.GET("passive", a.QueryPassiveSkillList)

	r = r.Group("support")
	{
		r.GET("", a.QuerySupportSkillList)
		r.GET("activation_medium", a.QueryActivationMediumSkillList)
	}

}
