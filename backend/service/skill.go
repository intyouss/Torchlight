package service

import (
	"Torchlight/entity"
	"Torchlight/tools"
	"context"
	"encoding/json"
	"log/slog"
	"strconv"
)

func GetActiveSkills(ctx context.Context) ([]entity.ActiveSkill, error) {
	dataByte, err := tools.PyRun("tools/scripts/active_skill.py")
	if err != nil {
		slog.ErrorContext(ctx, "获取技能数据失败: "+err.Error())
		return nil, err
	}
	var skillData []entity.ActiveSkill
	err = json.Unmarshal(dataByte, &skillData)
	if err != nil {
		slog.ErrorContext(ctx, "json解析失败: "+err.Error())
		return nil, err
	}

	// 成功解析，显示结果
	slog.InfoContext(ctx, "成功获取"+strconv.Itoa(len(skillData))+"个主动技能数据")

	return skillData, nil
}

func GetPassiveSkills(ctx context.Context) ([]entity.PassiveSkill, error) {
	dataByte, err := tools.PyRun("tools/scripts/passive_skill.py")
	if err != nil {
		slog.ErrorContext(ctx, "获取技能数据失败: "+err.Error())
		return nil, err
	}
	var skillData []entity.PassiveSkill
	err = json.Unmarshal(dataByte, &skillData)
	if err != nil {
		slog.ErrorContext(ctx, "json解析失败: "+err.Error())
		return nil, err
	}

	// 成功解析，显示结果
	slog.InfoContext(ctx, "成功获取"+strconv.Itoa(len(skillData))+"个被动技能数据")

	return skillData, nil
}

func GetSupportSkills(ctx context.Context) ([]entity.SupportSkill, error) {
	dataByte, err := tools.PyRun("tools/scripts/support_skill.py")
	if err != nil {
		slog.ErrorContext(ctx, "获取技能数据失败: "+err.Error())
		return nil, err
	}
	var skillData []entity.SupportSkill
	err = json.Unmarshal(dataByte, &skillData)
	if err != nil {
		slog.ErrorContext(ctx, "json解析失败: "+err.Error())
		return nil, err
	}

	// 成功解析，显示结果
	slog.InfoContext(ctx, "成功获取"+strconv.Itoa(len(skillData))+"个辅助技能数据")

	return skillData, nil
}

func GetActivationMediumSkills(ctx context.Context) ([]entity.ActivationMediumSkill, error) {
	dataByte, err := tools.PyRun("tools/scripts/activation_medium_skill.py")
	if err != nil {
		slog.ErrorContext(ctx, "获取技能数据失败: "+err.Error())
		return nil, err
	}
	var skillData []entity.ActivationMediumSkill
	err = json.Unmarshal(dataByte, &skillData)
	if err != nil {
		slog.ErrorContext(ctx, "json解析失败: "+err.Error())
		return nil, err
	}

	// 成功解析，显示结果
	slog.InfoContext(ctx, "成功获取"+strconv.Itoa(len(skillData))+"个触媒技能数据")

	return skillData, nil
}
