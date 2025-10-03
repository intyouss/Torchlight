package service

import (
	"Torchlight/entity"
	"Torchlight/tools"
	"context"
	"encoding/json"
	"log/slog"
	"strconv"
)

func GetActiveSkills(ctx context.Context) ([]entity.Skill, error) {
	dataByte, err := tools.PyRun("tools/scripts/active_skill.py")
	if err != nil {
		slog.ErrorContext(ctx, "获取技能数据失败: "+err.Error())
		return nil, err
	}
	var skillData []entity.Skill
	err = json.Unmarshal(dataByte, &skillData)
	if err != nil {
		slog.ErrorContext(ctx, "json解析失败: "+err.Error())
		return nil, err
	}

	// 成功解析，显示结果
	slog.InfoContext(ctx, "成功获取"+strconv.Itoa(len(skillData))+"个主动技能数据")

	return skillData, nil
}
