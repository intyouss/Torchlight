package entity

type SkillType string

const (
	Active  SkillType = "active"
	Passive SkillType = "passive"
	Support SkillType = "support"
	Trigger SkillType = "trigger"
)

type ActiveSkill struct {
	ID                 string    `json:"id"`
	Name               string    `json:"name"`
	Type               SkillType `json:"type"`
	Tags               []string  `json:"tags"`
	Desc               string    `json:"description"`
	Icon               string    `json:"icon"`
	ManaCost           string    `json:"mana_cost,omitempty"`
	CastingSpeed       string    `json:"casting_speed,omitempty"`
	DamageMatch        string    `json:"damage_match,omitempty"`
	Cooldown           string    `json:"cooldown,omitempty"`
	WeaponRestrictions []string  `json:"weapon_restrictions,omitempty"`
}

type PassiveSkill struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Type         SkillType `json:"type"`
	Tags         []string  `json:"tags"`
	Desc         string    `json:"description"`
	Icon         string    `json:"icon"`
	MagicSeal    string    `json:"magic_seal,omitempty"`
	CastingSpeed string    `json:"casting_speed,omitempty"`
	DamageMatch  string    `json:"damage_match,omitempty"`
}
