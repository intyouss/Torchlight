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
	ManaCost           string    `json:"mana_cost,omitempty"`
	CastingSpeed       string    `json:"casting_speed,omitempty"`
	Cooldown           string    `json:"cooldown,omitempty"`
	WeaponRestrictions []string  `json:"weapon_restrictions,omitempty"`
}
