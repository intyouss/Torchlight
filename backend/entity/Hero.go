package entity

type Hero struct {
	ID     string  `json:"id"`
	Name   string  `json:"name"`
	Desc   string  `json:"desc"`
	Traits []Trait `json:"traits"`
}

type Trait struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Desc        string `json:"desc"`
	UnlockLevel string `json:"unlock_level"`
}
