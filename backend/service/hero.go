package service

import (
	"Torchlight/entity"
	"Torchlight/tools"
	"context"
	"encoding/json"
	"log/slog"
	"strconv"
)

func GetHeroInfo(ctx context.Context) ([]entity.Hero, error) {
	dataByte, err := tools.PyRun("tools/scripts/hero.py")
	if err != nil {
		slog.ErrorContext(ctx, "获取英雄数据失败: "+err.Error())
		return nil, err
	}
	var heroData []entity.Hero
	err = json.Unmarshal(dataByte, &heroData)
	if err != nil {
		slog.ErrorContext(ctx, "json解析失败: "+err.Error())
		return nil, err
	}

	// 成功解析，显示结果
	slog.InfoContext(ctx, "成功获取"+strconv.Itoa(len(heroData))+"个英雄数据")

	return heroData, nil
}
