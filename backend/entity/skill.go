package entity

type SkillType string

const (
	Active  SkillType = "active"
	Passive SkillType = "passive"
	Support SkillType = "support"
	Trigger SkillType = "trigger"
)

type Skill struct {
	ID                 string    `json:"id"`
	Name               string    `json:"name"`
	Type               SkillType `json:"type"`
	Tags               []string  `json:"tags"`
	Desc               string    `json:"description"`
	Icon               string    `json:"icon"`
	ManaCost           int       `json:"mana_cost,omitempty"`
	CastingSpeed       int       `json:"casting_speed,omitempty"`
	Cooldown           int       `json:"cooldown,omitempty"`
	WeaponRestrictions []string  `json:"weapon_restrictions,omitempty"`
}
