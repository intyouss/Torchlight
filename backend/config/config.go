package config

import (
	"fmt"
	"gopkg.in/yaml.v3"
	"os"
)

type Config struct {
	Server Server
}

type Server struct {
	Host string `yaml:"host" validate:"required"`
	Port string `yaml:"port" validate:"required"`
}

func NewConfig() *Config {
	return &Config{}
}

func (c *Config) Load() error {

	data, err := os.ReadFile("config/config.yaml")
	if err != nil {
		return fmt.Errorf("读取配置文件失败: %w", err)
	}
	if err = yaml.Unmarshal(data, c); err != nil {
		return fmt.Errorf("解析配置文件失败: %w", err)
	}
	return nil
}
