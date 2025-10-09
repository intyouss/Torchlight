// api.ts - 修改API服务，分别获取不同类型的技能
import {CharacterStats, DamageResult, EquipmentStats, Hero, HeroTrait, Skill, TalentBook} from '../type';

// API基础配置
const API_BASE_URL = 'http://localhost:8080/api/v1';

// 请求拦截器
const apiClient = {
    async get<T>(url: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    async post<T>(url: string, data: any): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
};

// 数据转换函数
function transformTraits(traits: any[]): HeroTrait[] {
    return traits.map(trait => ({
        id: trait.id || trait.name || '',
        name: trait.name || '',
        icon: trait.icon || '',
        desc: trait.desc || trait.description || '',
        unlock_level: parseInt(trait.unlock_level),
        isDefault: parseInt(trait.unlock_level) === 1
    }));
}

function transformHeroData(heroData: any): Hero {
    return {
        id: heroData.id || '',
        name: heroData.name || '',
        icon: heroData.icon || '',
        desc: heroData.desc || '',
        traits: transformTraits(heroData.traits || [])
    };
}

function transformSkillData(skillData: any): Skill {
    return {
        id: skillData.id || '',
        name: skillData.name || '未知技能',
        description: skillData.description || '',
        type: skillData.type || '',
        icon: skillData.icon || '❓',
        tags: skillData.tags || [],
        manaCost: skillData.mana_cost || "",
        mainAttribute: skillData.main_attribute || "",
        manaCostMatch: skillData.mana_cost_match || "",
        castingSpeed: skillData.casting_speed || "",
        cooldown: skillData.cooldown || "",
        magicSeal: skillData.magic_seal || "",
        damageMatch: skillData.damage_match || "",
        weaponRestrictions: skillData.weapon_restrictions || []
    };
}

// 前端伤害计算逻辑（移到外部）
const calculateDamageFrontend = (params: {
    heroId: string;
    skillId: string;
    skillLevel: number;
    stats: CharacterStats;
    equipment: EquipmentStats;
    selectedTraits?: string[];
}): DamageResult => {
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

    // 特性加成计算
    if (params.selectedTraits && params.selectedTraits.length > 0) {
        const defaultHeroes = getDefaultHeroes();
        const hero = defaultHeroes.find(h => h.id === params.heroId);
        params.selectedTraits.forEach(traitId => {
            const trait = hero?.traits.find(t => t.id === traitId);
            if (trait) {
                // 根据特性ID应用不同的加成
                switch (trait.id) {
                    case 'rage':
                        traitMultiplier *= 1.15;
                        critBonus += 5;
                        attackSpeedBonus += 0.1;
                        break;
                    case 'berserker_rage':
                        traitMultiplier *= 1.25;
                        critBonus += 8;
                        break;
                    // ... 其他特性加成
                    default:
                        traitMultiplier *= 1.1;
                }
            }
        });
    }

    // 计算最终伤害
    const baseTotalDamage = baseDamage + statBonus + skillBonus;
    const traitEnhancedDamage = baseTotalDamage * traitMultiplier;

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

    // 计算DPS
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
};

export const apiService = {
    // 获取英雄列表
    async getHeroes(): Promise<Hero[]> {
        try {
            const rawHeroes = await apiClient.get<Hero[]>('/hero');
            return rawHeroes.map(heroData => transformHeroData(heroData));
        } catch (error) {
            console.error('获取英雄列表失败，使用默认数据:', error);
            return getDefaultHeroes();
        }
    },

    // api.ts - 在 API 方法中添加调试
    async getActiveSkills(): Promise<Skill[]> {
        try {
            const rawSkills = await apiClient.get<any[]>('/skill/active');
            return rawSkills.map(skillData => transformSkillData(skillData));
        } catch (error) {
            console.error('获取主动技能列表失败，使用默认数据:', error);
            return getDefaultActiveSkills();
        }
    },

    async getPassiveSkills(): Promise<Skill[]> {
        try {
            const rawSkills = await apiClient.get<any[]>('/skill/passive');
            return rawSkills.map(skillData => transformSkillData(skillData));
        } catch (error) {
            console.error('获取被动技能列表失败，使用默认数据:', error);
            return getDefaultPassiveSkills();
        }
    },

    async getSupportSkills(): Promise<Skill[]> {
        try {
            const rawSkills = await apiClient.get<any[]>('/skill/support');
            return rawSkills.map(skillData => transformSkillData(skillData));
        } catch (error) {
            console.error('获取辅助技能列表失败，使用默认数据:', error);
            return getDefaultSupportSkills();
        }
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

    async getDefaultEquipment(): Promise<EquipmentStats> {
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
            weaponType: 'sword',
        };
    },



    // 计算伤害
    async calculateDamage(params: {
        heroId: string;
        skillId: string;
        skillLevel: number;
        stats: CharacterStats;
        equipment: EquipmentStats;
        selectedTraits?: string[];
    }): Promise<DamageResult> {
        try {
            // 如果后端有计算API，可以在这里调用
            // return await apiClient.post<DamageResult>('/calculate', params);

            // 使用前端的计算逻辑作为后备
            return calculateDamageFrontend(params);
        } catch (error) {
            console.error('计算伤害API失败，使用前端计算:', error);
            return calculateDamageFrontend(params);
        }
    },

    // 获取天赋数据
    async getTalentBooks(): Promise<TalentBook[]> {
        try {
            // 如果后端有天赋API，可以在这里调用
            // return await apiClient.get<TalentBook[]>('/talent-books');

            // 使用默认天赋数据
            return getDefaultTalentBooks();
        } catch (error) {
            console.error('获取天赋数据失败，使用默认数据:', error);
            return getDefaultTalentBooks();
        }
    },

    // 保存配置
    async saveConfig(config: any): Promise<void> {
        try {
            // 如果后端有保存API，可以在这里调用
            // await apiClient.post('/save-config', config);
            console.log('保存配置:', config);
            // 可以添加本地存储作为后备
            localStorage.setItem('torchlight-config', JSON.stringify(config));
        } catch (error) {
            console.error('保存配置失败:', error);
            // 使用本地存储作为后备
            localStorage.setItem('torchlight-config', JSON.stringify(config));
        }
    },

    // 加载配置
    async loadConfig(): Promise<any> {
        try {
            // 如果后端有加载API，可以在这里调用
            // return await apiClient.get('/load-config');

            // 使用本地存储作为后备
            const config = localStorage.getItem('torchlight-config');
            return config ? JSON.parse(config) : null;
        } catch (error) {
            console.error('加载配置失败:', error);
            const config = localStorage.getItem('torchlight-config');
            return config ? JSON.parse(config) : null;
        }
    }
};

// 默认数据函数 - 分别定义不同类型的技能
const getDefaultActiveSkills = (): Skill[] => [
    {
        id: 'whirlwind',
        name: '旋风斩',
        type: 'active',
        description: '快速旋转攻击周围敌人，造成物理伤害',
        icon: '🌪️',
        tags: ['attack', 'physical', 'area'],
        manaCost: "15",
        cooldown: "2"
    },
    {
        id: 'fireball',
        name: '火球术',
        type: 'active',
        description: '发射火球攻击敌人，造成火焰伤害并附加灼烧',
        icon: '🔥',
        tags: ['spell', 'fire', 'projectile'],
        manaCost: "25",
        cooldown: "3"
    },
    // ... 其他主动技能
];

const getDefaultPassiveSkills = (): Skill[] => [
    {
        id: 'iron_skin',
        name: '铁皮肤',
        type: 'passive',
        description: '提升物理防御和元素抗性',
        icon: '🛡️',
        tags: ['defense', 'survival'],
    },
    {
        id: 'critical_strike',
        name: '致命一击',
        type: 'passive',
        description: '提升暴击几率和暴击伤害',
        icon: '🎯',
        tags: ['offense', 'critical'],
    },
    // ... 其他被动技能
];

const getDefaultSupportSkills = (): Skill[] => [
    {
        id: 'empower',
        name: '强化',
        type: 'support',
        description: '增强主动技能的伤害',
        icon: '⚡',
        tags: ['enhance', 'damage'],
    },
    {
        id: 'multiple_projectiles',
        name: '多重投射物',
        type: 'support',
        description: '使投射物技能发射多个投射物',
        icon: '🎯',
        tags: ['projectile', 'multiple'],
    },
    // ... 其他辅助技能
];

const getDefaultHeroes = (): Hero[] => [
    {
        id: 'rehan',
        name: '雷恩',
        desc: '近战/战士',
        icon: '⚔️',
        baseStats: { strength: 120, dexterity: 60, intelligence: 40, vitality: 100 },
        traits: [
            {
                id: 'rage',
                name: '怒火',
                desc: '通过攻击或受击积攒怒气，提升攻速；怒气满后进入暴气状态',
                icon: '🔥',
                unlock_level: 1,
                isDefault: true
            },
            {
                id: 'berserker_rage',
                name: '狂战士之怒',
                desc: '生命值越低，造成的伤害越高',
                icon: '💢',
                unlock_level: 45
            },
            // ... 其他特性
        ]
    },
    // ... 其他英雄数据
];

const getDefaultTalentBooks = (): TalentBook[] => [
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
                    // ... 其他天赋节点
                ]
            },
            // ... 其他天赋页
        ]
    },
    // ... 其他天赋书
];