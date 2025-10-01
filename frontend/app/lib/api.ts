// lib/api.ts
import {Hero, Skill, CharacterStats, EquipmentStats, DamageResult, HeroTrait, TalentPage, TalentBook} from '../type';

export const apiService = {
    // 获取英雄列表（包含特性）
    async getHeroes(): Promise<Hero[]> {
        return [
            {
                id: 'rehan',
                name: '雷恩',
                type: '近战/战士',
                icon: '⚔️',
                baseStats: { strength: 120, dexterity: 60, intelligence: 40, vitality: 100 },
                traits: [
                    {
                        id: 'rage',
                        name: '怒火',
                        description: '通过攻击或受击积攒怒气，提升攻速；怒气满后进入暴气状态',
                        icon: '🔥',
                        effects: ['攻击速度提升20%', '暴击率提升10%', '怒气满时进入暴气状态'],
                        unlockLevel: 1,
                        isDefault: true
                    },
                    {
                        id: 'berserker_rage',
                        name: '狂战士之怒',
                        description: '生命值越低，造成的伤害越高',
                        icon: '💢',
                        effects: ['低生命时伤害提升', '攻击速度随生命降低而提升'],
                        unlockLevel: 45
                    },
                    {
                        id: 'ancestral_call',
                        name: '先祖召唤',
                        description: '召唤先祖之灵协助战斗',
                        icon: '👻',
                        effects: ['召唤先祖之灵', '先祖提供伤害加成', '协同攻击'],
                        unlockLevel: 45
                    },
                    {
                        id: 'war_cry',
                        name: '战吼',
                        description: '强大的战吼技能，提升自身和队友能力',
                        icon: '📢',
                        effects: ['战吼范围扩大', '提供护甲和抗性', '嘲讽敌人'],
                        unlockLevel: 60
                    },
                    {
                        id: 'battle_fury',
                        name: '战斗狂怒',
                        description: '连续攻击时获得额外增益',
                        icon: '⚡',
                        effects: ['连击增益效果', '攻击速度叠加', '伤害逐步提升'],
                        unlockLevel: 60
                    },
                    {
                        id: 'indomitable',
                        name: '不屈意志',
                        description: '濒死时获得强大生存能力',
                        icon: '🛡️',
                        effects: ['濒死时无敌', '生命恢复提升', '伤害减免'],
                        unlockLevel: 75
                    },
                    {
                        id: 'rampage',
                        name: '狂暴突进',
                        description: '冲锋技能获得强化，可连续使用',
                        icon: '💨',
                        effects: ['冲锋无冷却', '冲锋伤害提升', '击退效果增强'],
                        unlockLevel: 75
                    }
                ]
            },
            {
                id: 'carino',
                name: '卡里诺',
                type: '远程/游侠',
                icon: '🏹',
                baseStats: { strength: 60, dexterity: 120, intelligence: 50, vitality: 80 },
                traits: [
                    {
                        id: 'glory_ranger',
                        name: '荣光游侠',
                        description: '通过装填特殊弹药，有几率触发魔术射击',
                        icon: '🎯',
                        effects: ['特殊弹药系统', '魔术射击触发', '高连击效果'],
                        unlockLevel: 1,
                        isDefault: true
                    },
                    {
                        id: 'trick_shot',
                        name: '诡计射击',
                        description: '子弹可以弹射多个目标',
                        icon: '🔄',
                        effects: ['子弹弹射', '多目标伤害', '穿透效果'],
                        unlockLevel: 45
                    },
                    {
                        id: 'sniper_focus',
                        name: '狙击专注',
                        description: '站立不动时获得精准和伤害加成',
                        icon: '🎯',
                        effects: ['站立伤害加成', '暴击率提升', '穿透力增强'],
                        unlockLevel: 45
                    },
                    {
                        id: 'rapid_fire',
                        name: '快速射击',
                        description: '大幅提升攻击速度',
                        icon: '💨',
                        effects: ['攻击速度大幅提升', '装填速度加快', '移动射击'],
                        unlockLevel: 60
                    },
                    {
                        id: 'explosive_arrow',
                        name: '爆炸箭矢',
                        description: '箭矢命中后产生爆炸效果',
                        icon: '💥',
                        effects: ['箭矢爆炸', '范围伤害', '击退效果'],
                        unlockLevel: 60
                    },
                    {
                        id: 'piercing_shot',
                        name: '穿透射击',
                        description: '箭矢可以穿透多个敌人',
                        icon: '➰',
                        effects: ['无限穿透', '伤害不衰减', '连锁反应'],
                        unlockLevel: 75
                    },
                    {
                        id: 'elemental_arrow',
                        name: '元素箭矢',
                        description: '箭矢附带随机元素效果',
                        icon: '🌈',
                        effects: ['随机元素伤害', '元素异常状态', '伤害类型转换'],
                        unlockLevel: 75
                    }
                ]
            },
            {
                id: 'yosa',
                name: '尤莎',
                type: '法师/元素',
                icon: '🔮',
                baseStats: { strength: 40, dexterity: 60, intelligence: 140, vitality: 70 },
                traits: [
                    {
                        id: 'ice_fire',
                        name: '冰焰',
                        description: '引导元素之力，通过切换冰霜与火焰形态获得不同增益',
                        icon: '❄️',
                        effects: ['冰火形态切换', '元素之力引导', '形态专属增益'],
                        unlockLevel: 1,
                        isDefault: true
                    },
                    {
                        id: 'elemental_mastery',
                        name: '元素精通',
                        description: '提升所有元素伤害',
                        icon: '🌟',
                        effects: ['全元素伤害提升', '元素抗性穿透', '元素异常增强'],
                        unlockLevel: 45
                    },
                    {
                        id: 'arcane_power',
                        name: '奥术能量',
                        description: '法力值越高，伤害越高',
                        icon: '💫',
                        effects: ['高法力伤害加成', '法力恢复提升', '技能消耗降低'],
                        unlockLevel: 45
                    },
                    {
                        id: 'spell_echo',
                        name: '法术回响',
                        description: '法术有几率重复释放',
                        icon: '📝',
                        effects: ['法术重复释放', '不消耗额外法力', '伤害叠加'],
                        unlockLevel: 60
                    },
                    {
                        id: 'elemental_fusion',
                        name: '元素融合',
                        description: '混合元素产生新效果',
                        icon: '⚗️',
                        effects: ['元素混合效果', '新技能解锁', '伤害类型组合'],
                        unlockLevel: 60
                    },
                    {
                        id: 'arcane_storm',
                        name: '奥术风暴',
                        description: '召唤强大的奥术风暴',
                        icon: '🌪️',
                        effects: ['奥术风暴召唤', '持续范围伤害', '控制效果'],
                        unlockLevel: 75
                    },
                    {
                        id: 'elemental_avatar',
                        name: '元素化身',
                        description: '变身为纯元素形态',
                        icon: '🔥',
                        effects: ['元素形态变身', '技能全面强化', '免疫相应元素'],
                        unlockLevel: 75
                    }
                ]
            },
            // 其他英雄数据类似，省略以节省空间...
        ];
    },

    // 获取技能列表
    async getSkills(): Promise<Skill[]> {
        return [
            // 主动技能
            {
                id: 'whirlwind',
                name: '旋风斩',
                type: 'active',
                description: '快速旋转攻击周围敌人，造成物理伤害',
                icon: '🌪️',
                tags: ['attack', 'physical', 'area'],
                manaCost: 15,
                cooldown: 2
            },
            {
                id: 'fireball',
                name: '火球术',
                type: 'active',
                description: '发射火球攻击敌人，造成火焰伤害并附加灼烧',
                icon: '🔥',
                tags: ['spell', 'fire', 'projectile'],
                manaCost: 25,
                cooldown: 3
            },
            {
                id: 'ice_teleport',
                name: '寒冰传送',
                type: 'active',
                description: '传送至目标位置，并在原地留下冰霜区域',
                icon: '❄️',
                tags: ['spell', 'cold', 'movement'],
                manaCost: 30,
                cooldown: 8
            },
            {
                id: 'composite_spring',
                name: '复合源泉',
                type: 'active',
                description: '恢复自身生命值和法力值',
                icon: '💧',
                tags: ['healing', 'support'],
                cooldown: 10
            },

            // 位移技能 (新增)
            {
                id: 'step_slash',
                name: '踏前斩',
                type: 'active',
                description: '向前冲刺并攻击路径上的敌人',
                icon: '💨',
                tags: ['movement', 'attack', 'physical'],
                weaponRestrictions: ['one_hand_sword', 'one_hand_axe', 'staff'],
                cooldown: 5
            },
            {
                id: 'spinning_blade',
                name: '回旋之刃',
                type: 'active',
                description: '向前冲刺并根据攻速造成多次伤害',
                icon: '🌀',
                tags: ['movement', 'attack', 'chaos'],
                weaponRestrictions: ['claw', 'dagger', 'one_hand_sword'],
                cooldown: 6
            },
            {
                id: 'flash_bow',
                name: '瞬闪弓',
                type: 'active',
                description: '向后跳跃同时向前发射穿透投射物',
                icon: '🏹',
                tags: ['movement', 'attack', 'projectile'],
                weaponRestrictions: ['bow', 'crossbow'],
                cooldown: 4
            },

            // 被动技能
            {
                id: 'elemental_enhance',
                name: '元素强化',
                type: 'passive',
                description: '提升所有元素伤害',
                icon: '🌟',
                tags: ['elemental', 'enhancement'],
                healthCost: 10
            },
            {
                id: 'defense_aura',
                name: '防御光环',
                type: 'passive',
                description: '提升周围友方单位的护甲和抗性',
                icon: '🛡️',
                tags: ['aura', 'defense'],
                manaCost: 20
            },

            // 辅助技能
            {
                id: 'high_scatter',
                name: '高阶散射',
                type: 'support',
                description: '增加被辅助技能的投射物数量',
                icon: '🎯',
                tags: ['projectile', 'enhancement']
            },
            {
                id: 'energy_saving',
                name: '节能施法',
                type: 'support',
                description: '减少被辅助技能的法力消耗',
                icon: '💡',
                tags: ['spell', 'efficiency']
            },
            {
                id: 'range_expand',
                name: '范围扩大',
                type: 'support',
                description: '增加被辅助技能的作用范围',
                icon: '📏',
                tags: ['area', 'enhancement']
            },
            {
                id: 'additional_cold_damage',
                name: '附加冰冷伤害',
                type: 'support',
                description: '为被辅助技能附加冰冷伤害',
                icon: '🧊',
                tags: ['cold', 'elemental']
            },
            {
                id: 'multiple_projectiles',
                name: '多重投射物',
                type: 'support',
                description: '增加被辅助技能的投射物数量',
                icon: '➰',
                tags: ['projectile', 'enhancement']
            },

            // 触发技能
            {
                id: 'critical_trigger',
                name: '暴击触发',
                type: 'trigger',
                description: '暴击时自动施放链接的技能',
                icon: '⚡',
                tags: ['trigger', 'critical']
            }
        ];
    },

    // 获取默认属性
    async getDefaultStats(): Promise<CharacterStats> {
        return {
            strength: 100,
            dexterity: 50,
            intelligence: 50,
            vitality: 80,
        };
    },

    // 获取默认装备
    async getDefaultEquipment(): Promise<{
        weaponDamage: { min: number; max: number };
        attackSpeed: number;
        critChance: number;
        critMultiplier: number;
        elementalDamage: { fire: number; lightning: number; cold: number; poison: number }
    }> {
        return {
            weaponDamage: { min: 50, max: 100 },
            attackSpeed: 1.2,
            critChance: 5,
            critMultiplier: 150,
            elementalDamage: {
                fire: 0,
                lightning: 0,
                cold: 0,
                poison: 0,
            },
        };
    },

    // 计算伤害（包含特性影响）
    // lib/api.ts - 完整的calculateDamage函数
    // lib/api.ts - 修正后的calculateDamage函数
    async calculateDamage(params: {
        heroId: string;
        skillId: string;
        skillLevel: number;
        stats: CharacterStats;
        equipment: EquipmentStats; // 确保这个参数存在
        selectedTraits?: string[];
    }): Promise<DamageResult> {
        // 基础伤害计算
        const baseDamage = (params.equipment.weaponDamage.min + params.equipment.weaponDamage.max) / 2;
        const statBonus = params.stats.strength * 0.5 + params.stats.intelligence * 0.3;
        const skillBonus = params.skillLevel * 10;

        let traitMultiplier = 1;
        let critBonus = 0;
        let attackSpeedBonus = 0;
        let elementalBonus = {
            fire: 0,
            lightning: 0,
            cold: 0,
            poison: 0
        };

        // 多个特性加成计算
        if (params.selectedTraits && params.selectedTraits.length > 0) {
            const heroes = await this.getHeroes();
            const hero = heroes.find(h => h.id === params.heroId);

            params.selectedTraits.forEach(traitId => {
                const trait = hero?.traits.find(t => t.id === traitId);
                if (trait) {
                    // 根据特性ID应用不同的加成
                    switch (trait.id) {
                        // 雷恩的特性
                        case 'rage':
                            traitMultiplier *= 1.15;
                            critBonus += 5;
                            attackSpeedBonus += 0.1;
                            break;
                        case 'berserker_rage':
                            traitMultiplier *= 1.25;
                            critBonus += 8;
                            break;
                        case 'ancestral_call':
                            traitMultiplier *= 1.20;
                            elementalBonus.fire += 20;
                            elementalBonus.lightning += 20;
                            break;
                        case 'war_cry':
                            traitMultiplier *= 1.18;
                            critBonus += 3;
                            break;
                        case 'battle_fury':
                            traitMultiplier *= 1.22;
                            attackSpeedBonus += 0.15;
                            break;
                        case 'indomitable':
                            traitMultiplier *= 1.16;
                            break;
                        case 'rampage':
                            traitMultiplier *= 1.24;
                            critBonus += 6;
                            break;

                        // 卡里诺的特性
                        case 'glory_ranger':
                            traitMultiplier *= 1.20;
                            critBonus += 10;
                            break;
                        case 'trick_shot':
                            traitMultiplier *= 1.18;
                            break;
                        case 'sniper_focus':
                            traitMultiplier *= 1.25;
                            critBonus += 15;
                            break;
                        case 'rapid_fire':
                            traitMultiplier *= 1.15;
                            attackSpeedBonus += 0.25;
                            break;
                        case 'explosive_arrow':
                            traitMultiplier *= 1.22;
                            elementalBonus.fire += 30;
                            break;
                        case 'piercing_shot':
                            traitMultiplier *= 1.20;
                            break;
                        case 'elemental_arrow':
                            traitMultiplier *= 1.18;
                            elementalBonus.fire += 15;
                            elementalBonus.lightning += 15;
                            elementalBonus.cold += 15;
                            break;

                        // 尤莎的特性
                        case 'ice_fire':
                            traitMultiplier *= 1.15;
                            elementalBonus.fire += 25;
                            elementalBonus.cold += 25;
                            break;
                        case 'elemental_mastery':
                            traitMultiplier *= 1.25;
                            elementalBonus.fire += 20;
                            elementalBonus.lightning += 20;
                            elementalBonus.cold += 20;
                            break;
                        case 'arcane_power':
                            traitMultiplier *= 1.22;
                            break;
                        case 'spell_echo':
                            traitMultiplier *= 1.30;
                            break;
                        case 'elemental_fusion':
                            traitMultiplier *= 1.20;
                            elementalBonus.fire += 15;
                            elementalBonus.lightning += 15;
                            elementalBonus.cold += 15;
                            break;
                        case 'arcane_storm':
                            traitMultiplier *= 1.28;
                            elementalBonus.lightning += 40;
                            break;
                        case 'elemental_avatar':
                            traitMultiplier *= 1.35;
                            elementalBonus.fire += 25;
                            elementalBonus.lightning += 25;
                            elementalBonus.cold += 25;
                            break;

                        default:
                            traitMultiplier *= 1.1;
                    }
                }
            });
        }

        // 计算最终伤害
        const baseTotalDamage = baseDamage + statBonus + skillBonus;
        const traitEnhancedDamage = baseTotalDamage * traitMultiplier;

        // 计算元素伤害（确保equipment.elementalDamage存在）
        const elementalDamageFromEquipment = params.equipment.elementalDamage || {
            fire: 0,
            lightning: 0,
            cold: 0,
            poison: 0
        };

        const totalElementalDamage =
            elementalDamageFromEquipment.fire + elementalBonus.fire +
            elementalDamageFromEquipment.lightning + elementalBonus.lightning +
            elementalDamageFromEquipment.cold + elementalBonus.cold +
            elementalDamageFromEquipment.poison + elementalBonus.poison;

        const totalDamage = Math.round(traitEnhancedDamage + totalElementalDamage);

        // 计算物理和元素伤害分配
        const physicalDamage = Math.round(traitEnhancedDamage * 0.7);
        const elementalDamage = Math.round(traitEnhancedDamage * 0.3 + totalElementalDamage);

        // 计算DPS（考虑攻击速度加成）
        const finalAttackSpeed = params.equipment.attackSpeed + attackSpeedBonus;
        const dps = Math.round(totalDamage * finalAttackSpeed);

        // 计算最终暴击率
        const finalCritChance = Math.min(
            params.equipment.critChance + params.stats.dexterity * 0.1 + critBonus,
            95
        );

        // 计算伤害分布
        const physicalPercentage = Math.round((physicalDamage / totalDamage) * 100);
        const firePercentage = Math.round(((elementalDamageFromEquipment.fire + elementalBonus.fire) / totalDamage) * 100);
        const lightningPercentage = Math.round(((elementalDamageFromEquipment.lightning + elementalBonus.lightning) / totalDamage) * 100);
        const coldPercentage = Math.round(((elementalDamageFromEquipment.cold + elementalBonus.cold) / totalDamage) * 100);
        const poisonPercentage = Math.round(((elementalDamageFromEquipment.poison + elementalBonus.poison) / totalDamage) * 100);

        // 确保总和为100%
        const totalPercentage = physicalPercentage + firePercentage + lightningPercentage + coldPercentage + poisonPercentage;
        const adjustment = 100 - totalPercentage;

        return {
            total: totalDamage,
            physical: physicalDamage,
            elemental: elementalDamage,
            dps: dps,
            critChance: finalCritChance,
            damageDistribution: {
                physical: Math.max(0, Math.min(100, physicalPercentage + (adjustment > 0 ? adjustment : 0))),
                fire: Math.max(0, Math.min(100, firePercentage)),
                lightning: Math.max(0, Math.min(100, lightningPercentage)),
                cold: Math.max(0, Math.min(100, coldPercentage)),
                poison: Math.max(0, Math.min(100, poisonPercentage))
            },
            breakdown: {
                baseDamage: Math.round(baseDamage),
                statBonus: Math.round(statBonus),
                skillBonus: Math.round(skillBonus),
                elementalBonus: Math.round(totalElementalDamage),
                critBonus: Math.round(critBonus)
            }
        };
    },

    // lib/api.ts - 添加天赋数据
    async getTalentBooks(): Promise<TalentBook[]> {
        return [
            {
                id: 'warrior_book',
                name: '战士圣典',
                icon: '⚔️',
                description: '战士之道的力量源泉',
                pages: [
                    {
                        id: 'warrior_might',
                        name: '战士之力',
                        icon: '💪',
                        description: '强化物理攻击和生存能力',
                        startingNode: 'physical_power',
                        talentTree: [
                            {
                                id: 'physical_power',
                                name: '物理力量',
                                icon: '💪',
                                description: '每点+5% 物理伤害',
                                type: 'minor',
                                position: { x: 0, y: 0 },
                                connections: ['attack_speed'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 0
                            },
                            {
                                id: 'attack_speed',
                                name: '攻击速度',
                                icon: '⚡',
                                description: '每点+5% 攻击速度',
                                type: 'medium',
                                position: { x: 1, y: 0 },
                                connections: ['physical_power'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 3
                            },{
                                id: 'critical_strike',
                                name: '致命打击',
                                icon: '🎯',
                                description: '每点+5% 暴击率',
                                type: 'minor',
                                position: { x: 2, y: 0 },
                                connections: ['berserker'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 6
                            },{
                                id: 'berserker',
                                name: '狂战士',
                                icon: '💢',
                                description: '生命低于30%时 +50% 伤害，+30% 攻击速度',
                                type: 'medium',
                                position: { x: 3, y: 0 },
                                connections: ['critical_strike', 'warrior_rage'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 9
                            },{
                                id: 'warrior_rage',
                                name: '战士之怒',
                                icon: '🔥',
                                description: '每点+10% 怒气获取速度',
                                type: 'legendary',
                                position: { x: 4, y: 0 },
                                connections: ['berserker'],
                                requirements: ['berserker'],
                                maxPoints: 1,
                                currentPoints: 0,
                                columnRequirement: 12
                            },
                            {
                                id: 'vitality',
                                name: '活力',
                                icon: '❤️',
                                description: '每点+5% 最大生命值',
                                type: 'minor',
                                position: { x: 0, y: 1 },
                                connections: ['defense'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 0
                            },

                            {
                                id: 'defense',
                                name: '防御',
                                icon: '🛡️',
                                description: '每点+10% 护甲',
                                type: 'medium',
                                position: { x: 1, y: 1 },
                                connections: ['vitality'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 3
                            },

                            {
                                id: 'endurance',
                                name: '耐力',
                                icon: '🔋',
                                description: '每点+10% 生命恢复',
                                type: 'minor',
                                position: { x: 1, y: 2 },
                                connections: ['unbreakable'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 3
                            },
                            {
                                id: 'unbreakable',
                                name: '不屈意志',
                                icon: '🌟',
                                description: '受到致命伤害时免疫死亡，恢复50%生命，冷却120秒',
                                type: 'medium',
                                position: { x: 2, y: 2 },
                                connections: ['endurance', 'final_stand'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 6
                            },

                            {
                                id: 'final_stand',
                                name: '最终立场',
                                icon: '⚔️',
                                description: '生命低于20%时，所有伤害+100%，护甲+100%，持续8秒',
                                type: 'legendary',
                                position: { x: 3, y: 2 },
                                connections: ['unbreakable'],
                                requirements: ['unbreakable'],
                                maxPoints: 1,
                                currentPoints: 0,
                                columnRequirement: 9
                            }]
                    },
                    {
                        id: 'berserker_rage',
                        name: '狂战士之怒',
                        icon: '💢',
                        description: '低生命时获得强大增益',
                        startingNode: 'rage_core',
                        talentTree: [
                            {
                                id: 'physical_power',
                                name: '物理力量',
                                icon: '💪',
                                description: '每点+5% 物理伤害',
                                type: 'minor',
                                position: { x: 0, y: 0 },
                                connections: ['attack_speed'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 0
                            },
                            {
                                id: 'attack_speed',
                                name: '攻击速度',
                                icon: '⚡',
                                description: '每点+5% 攻击速度',
                                type: 'medium',
                                position: { x: 1, y: 0 },
                                connections: ['physical_power'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 3
                            },{
                                id: 'critical_strike',
                                name: '致命打击',
                                icon: '🎯',
                                description: '每点+5% 暴击率',
                                type: 'minor',
                                position: { x: 2, y: 0 },
                                connections: ['berserker'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 6
                            },{
                                id: 'berserker',
                                name: '狂战士',
                                icon: '💢',
                                description: '生命低于30%时 +50% 伤害，+30% 攻击速度',
                                type: 'medium',
                                position: { x: 3, y: 0 },
                                connections: ['critical_strike', 'warrior_rage'],
                                maxPoints: 1,
                                currentPoints: 0,
                                columnRequirement: 9
                            },{
                                id: 'warrior_rage',
                                name: '战士之怒',
                                icon: '🔥',
                                description: '每点+10% 怒气获取速度',
                                type: 'legendary',
                                position: { x: 4, y: 0 },
                                connections: ['berserker'],
                                requirements: ['berserker'],
                                maxPoints: 1,
                                currentPoints: 0,
                                columnRequirement: 12
                            },
                            {
                                id: 'vitality',
                                name: '活力',
                                icon: '❤️',
                                description: '每点+5% 最大生命值',
                                type: 'minor',
                                position: { x: 0, y: 1 },
                                connections: ['defense'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 0
                            },

                            {
                                id: 'defense',
                                name: '防御',
                                icon: '🛡️',
                                description: '每点+10% 护甲',
                                type: 'medium',
                                position: { x: 1, y: 1 },
                                connections: ['vitality'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 3
                            },

                            {
                                id: 'endurance',
                                name: '耐力',
                                icon: '🔋',
                                description: '每点+10% 生命恢复',
                                type: 'minor',
                                position: { x: 1, y: 2 },
                                connections: ['unbreakable'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 3
                            },
                            {
                                id: 'unbreakable',
                                name: '不屈意志',
                                icon: '🌟',
                                description: '受到致命伤害时免疫死亡，恢复50%生命，冷却120秒',
                                type: 'medium',
                                position: { x: 2, y: 2 },
                                connections: ['endurance', 'final_stand'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 6
                            },

                            {
                                id: 'final_stand',
                                name: '最终立场',
                                icon: '⚔️',
                                description: '生命低于20%时，所有伤害+100%，护甲+100%，持续8秒',
                                type: 'legendary',
                                position: { x: 3, y: 2 },
                                connections: ['unbreakable'],
                                requirements: ['unbreakable'],
                                maxPoints: 1,
                                currentPoints: 0,
                                columnRequirement: 9
                            }]
                    },
                    {
                        id: 'defensive_stance',
                        name: '防御姿态',
                        icon: '🛡️',
                        description: '提升防御和生存能力',
                        startingNode: 'rage_core',
                        talentTree: [
                            {
                                id: 'physical_power',
                                name: '物理力量',
                                icon: '💪',
                                description: '每点+5% 物理伤害',
                                type: 'minor',
                                position: { x: 0, y: 0 },
                                connections: ['attack_speed'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 0
                            },
                            {
                                id: 'attack_speed',
                                name: '攻击速度',
                                icon: '⚡',
                                description: '每点+5% 攻击速度',
                                type: 'medium',
                                position: { x: 1, y: 0 },
                                connections: ['physical_power'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 3
                            },{
                                id: 'critical_strike',
                                name: '致命打击',
                                icon: '🎯',
                                description: '每点+5% 暴击率',
                                type: 'minor',
                                position: { x: 2, y: 0 },
                                connections: ['berserker'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 6
                            },{
                                id: 'berserker',
                                name: '狂战士',
                                icon: '💢',
                                description: '生命低于30%时 +50% 伤害，+30% 攻击速度',
                                type: 'medium',
                                position: { x: 3, y: 0 },
                                connections: ['critical_strike', 'warrior_rage'],
                                maxPoints: 1,
                                currentPoints: 0,
                                columnRequirement: 9
                            },{
                                id: 'warrior_rage',
                                name: '战士之怒',
                                icon: '🔥',
                                description: '每点+10% 怒气获取速度',
                                type: 'legendary',
                                position: { x: 4, y: 0 },
                                connections: ['berserker'],
                                requirements: ['berserker'],
                                maxPoints: 1,
                                currentPoints: 0,
                                columnRequirement: 12
                            },
                            {
                                id: 'vitality',
                                name: '活力',
                                icon: '❤️',
                                description: '每点+5% 最大生命值',
                                type: 'minor',
                                position: { x: 0, y: 1 },
                                connections: ['defense'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 0
                            },

                            {
                                id: 'defense',
                                name: '防御',
                                icon: '🛡️',
                                description: '每点+10% 护甲',
                                type: 'medium',
                                position: { x: 1, y: 1 },
                                connections: ['vitality'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 3
                            },

                            {
                                id: 'endurance',
                                name: '耐力',
                                icon: '🔋',
                                description: '每点+10% 生命恢复',
                                type: 'minor',
                                position: { x: 1, y: 2 },
                                connections: ['unbreakable'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 3
                            },
                            {
                                id: 'unbreakable',
                                name: '不屈意志',
                                icon: '🌟',
                                description: '受到致命伤害时免疫死亡，恢复50%生命，冷却120秒',
                                type: 'medium',
                                position: { x: 2, y: 2 },
                                connections: ['endurance', 'final_stand'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 6
                            },

                            {
                                id: 'final_stand',
                                name: '最终立场',
                                icon: '⚔️',
                                description: '生命低于20%时，所有伤害+100%，护甲+100%，持续8秒',
                                type: 'legendary',
                                position: { x: 3, y: 2 },
                                connections: ['unbreakable'],
                                requirements: ['unbreakable'],
                                maxPoints: 1,
                                currentPoints: 0,
                                columnRequirement: 9
                            }]
                    },
                    {
                        id: 'battle_cry',
                        name: '战吼强化',
                        icon: '📢',
                        description: '增强战吼技能效果',
                        startingNode: 'rage_core',
                        talentTree: [
                            {
                                id: 'physical_power',
                                name: '物理力量',
                                icon: '💪',
                                description: '每点+5% 物理伤害',
                                type: 'minor',
                                position: { x: 0, y: 0 },
                                connections: ['attack_speed'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 0
                            },
                            {
                                id: 'attack_speed',
                                name: '攻击速度',
                                icon: '⚡',
                                description: '每点+5% 攻击速度',
                                type: 'medium',
                                position: { x: 1, y: 0 },
                                connections: ['physical_power'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 3
                            },{
                                id: 'critical_strike',
                                name: '致命打击',
                                icon: '🎯',
                                description: '每点+5% 暴击率',
                                type: 'minor',
                                position: { x: 2, y: 0 },
                                connections: ['berserker'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 6
                            },{
                                id: 'berserker',
                                name: '狂战士',
                                icon: '💢',
                                description: '生命低于30%时 +50% 伤害，+30% 攻击速度',
                                type: 'medium',
                                position: { x: 3, y: 0 },
                                connections: ['critical_strike', 'warrior_rage'],
                                maxPoints: 1,
                                currentPoints: 0,
                                columnRequirement: 9
                            },{
                                id: 'warrior_rage',
                                name: '战士之怒',
                                icon: '🔥',
                                description: '每点+10% 怒气获取速度',
                                type: 'legendary',
                                position: { x: 4, y: 0 },
                                connections: ['berserker'],
                                requirements: ['berserker'],
                                maxPoints: 1,
                                currentPoints: 0,
                                columnRequirement: 12
                            },
                            {
                                id: 'vitality',
                                name: '活力',
                                icon: '❤️',
                                description: '每点+5% 最大生命值',
                                type: 'minor',
                                position: { x: 0, y: 1 },
                                connections: ['defense'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 0
                            },

                            {
                                id: 'defense',
                                name: '防御',
                                icon: '🛡️',
                                description: '每点+10% 护甲',
                                type: 'medium',
                                position: { x: 1, y: 1 },
                                connections: ['vitality'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 3
                            },

                            {
                                id: 'endurance',
                                name: '耐力',
                                icon: '🔋',
                                description: '每点+10% 生命恢复',
                                type: 'minor',
                                position: { x: 1, y: 2 },
                                connections: ['unbreakable'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 3
                            },
                            {
                                id: 'unbreakable',
                                name: '不屈意志',
                                icon: '🌟',
                                description: '受到致命伤害时免疫死亡，恢复50%生命，冷却120秒',
                                type: 'medium',
                                position: { x: 2, y: 2 },
                                connections: ['endurance', 'final_stand'],
                                maxPoints: 3,
                                currentPoints: 0,
                                columnRequirement: 6
                            },

                            {
                                id: 'final_stand',
                                name: '最终立场',
                                icon: '⚔️',
                                description: '生命低于20%时，所有伤害+100%，护甲+100%，持续8秒',
                                type: 'legendary',
                                position: { x: 3, y: 2 },
                                connections: ['unbreakable'],
                                requirements: ['unbreakable'],
                                maxPoints: 1,
                                currentPoints: 0,
                                columnRequirement: 9
                            }]
                    },
                    {
                        id: 'weapon_mastery',
                        name: '武器精通',
                        icon: '🗡️',
                        description: '精通各类武器的使用',
                        startingNode: 'rage_core',
                        talentTree: []
                    }
                ]
            },
            {
                id: 'mage_book',
                name: '法师宝典',
                icon: '🔮',
                description: '魔法艺术的终极指南',
                pages: [
                    {
                        id: 'elemental_mastery',
                        name: '元素精通',
                        icon: '🔥',
                        description: '提升元素伤害和元素异常效果',
                        startingNode: 'rage_core',
                        talentTree: []
                    },
                    { id: 'arcane_power', name: '奥术能量', icon: '💫', description: '强化法术和法力系统',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'spell_weaving', name: '法术编织', icon: '🕸️', description: '多重法术的完美结合',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'mana_surge', name: '法力涌动', icon: '🌀', description: '爆发性的法力输出',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'elemental_fusion', name: '元素融合', icon: '⚗️', description: '混合元素产生新效果',
                        startingNode: 'rage_core',
                        talentTree: [] }
                ]
            },
            {
                id: 'rogue_book',
                name: '刺客秘卷',
                icon: '🗡️',
                description: '暗影中的致命艺术',
                pages: [
                    { id: 'shadow_arts', name: '暗影技艺', icon: '🌑', description: '增强潜行和暴击能力',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'critical_strike', name: '致命一击', icon: '🎯', description: '强化暴击伤害和暴击率',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'agile_movement', name: '灵巧移动', icon: '💨', description: '提升移动和闪避能力',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'poison_mastery', name: '毒药精通', icon: '☠️', description: '精通各类毒药的使用',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'assassination', name: '暗杀技巧', icon: '⚰️', description: '一击必杀的致命艺术',
                        startingNode: 'rage_core',
                        talentTree: [] }
                ]
            },
            {
                id: 'ranger_book',
                name: '游侠手册',
                icon: '🏹',
                description: '远程射击的精湛技艺',
                pages: [
                    { id: 'precision_aiming', name: '精准瞄准', icon: '🎯', description: '提升远程攻击和命中',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'projectile_mastery', name: '投射物精通', icon: '➰', description: '强化所有投射物技能',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'trap_expertise', name: '陷阱专家', icon: '🕳️', description: '精通各类陷阱的布置' ,
                        startingNode: 'rage_core',
                        talentTree: []},
                    { id: 'beast_companion', name: '野兽伙伴', icon: '🐺', description: '强化动物伙伴的能力',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'wilderness_survival', name: '荒野生存', icon: '🌲', description: '在野外环境中的生存技巧',
                        startingNode: 'rage_core',
                        talentTree: [] }
                ]
            },
            {
                id: 'summoner_book',
                name: '召唤师典籍',
                icon: '👥',
                description: '召唤生物的掌控之道',
                pages: [
                    { id: 'summoner_power', name: '召唤之力', icon: '👥', description: '强化召唤物和宠物',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'minion_enhancement', name: '仆从强化', icon: '🤖', description: '全面提升仆从属性',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'necromancy', name: '死灵法术', icon: '💀', description: '操控亡者的黑暗艺术',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'golem_crafting', name: '傀儡制造', icon: '⚙️', description: '制造强大的魔法傀儡',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'spirit_binding', name: '灵魂绑定', icon: '🔗', description: '与灵体建立强大连接' ,
                        startingNode: 'rage_core',
                        talentTree: []}
                ]
            },
            {
                id: 'support_book',
                name: '辅助圣书',
                icon: '✨',
                description: '支援与保护的圣洁力量',
                pages: [
                    { id: 'divine_protection', name: '神圣庇护', icon: '✨', description: '获得神圣力量的保护',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'healing_light', name: '治愈之光', icon: '💡', description: '强大的治疗和恢复能力' ,
                        startingNode: 'rage_core',
                        talentTree: []},
                    { id: 'blessing_aura', name: '祝福光环', icon: '💫', description: '为队友提供增益效果',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'guardian_spirit', name: '守护之灵', icon: '👼', description: '召唤守护灵保护队友',
                        startingNode: 'rage_core',
                        talentTree: [] },
                    { id: 'purification', name: '净化之力', icon: '💧', description: '清除负面状态和诅咒',
                        startingNode: 'rage_core',
                        talentTree: [] }
                ]
            }
        ];
    },

    // 保存配置
    async saveConfig(config: any): Promise<void> {
        console.log('保存配置:', config);
        return Promise.resolve();
    },

    // 加载配置
    async loadConfig(configId: string): Promise<any> {
        return Promise.resolve(null);
    },
};