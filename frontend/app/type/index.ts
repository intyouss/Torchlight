// types/index.ts
export interface Hero {
    id: string;
    name: string;
    icon?: string;
    desc: string;
    baseStats?: CharacterStats;
    traits: HeroTrait[];
}

// 其他接口保持不变...
export interface Skill {
    id: string;
    name: string;
    type: 'active' | 'passive' | 'support' | 'trigger';
    description: string;
    icon: string;
    tags: string[]; // 技能标签，用于技能链接
    manaCost?: number;
    healthCost?: number;
    cooldown?: number;
    heroRestrictions?: string[]; // 英雄使用限制
    weaponRestrictions?: string[]; // 武器使用限制
}

export interface SkillSlot {
    mainSkill: Skill | null;
    supportSkills: (Skill | null)[];
}

export interface SkillBuild {
    activeSlots: SkillSlot[];
    passiveSlots: SkillSlot[];
    triggerSlots: SkillSlot[];
}

export interface HeroTrait {
    id: string;
    name: string;
    desc: string;
    icon?: string;
    unlock_level: number; // 解锁等级
    isDefault?: boolean; // 是否为默认特性
}

export interface TraitSelection {
    level: number;
    availableTraits: HeroTrait[];
    selectedTraitId?: string;
}

export interface CharacterStats {
    strength: number;
    dexterity: number;
    intelligence: number;
    vitality: number;
}

export interface EquipmentStats {
    weaponDamage: {
        min: number;
        max: number;
    };
    attackSpeed: number;
    critChance: number;
    critMultiplier: number;
    elementalDamage?: {
        fire: number;
        lightning: number;
        cold: number;
        poison: number;
    };
    weaponType: string;
}

export interface DamageResult {
    total: number;
    physical: number;
    elemental: number;
    dps: number;
    critChance: number;
    damageDistribution: {
        physical: number;
        fire: number;
        lightning: number;
        cold: number;
        poison: number;
    };
    breakdown?: {
        baseDamage: number;
        statBonus: number;
        skillBonus: number;
        elementalBonus: number;
        critBonus: number;
    };
}

export interface CalculationParams {
    heroId: string;
    skillId: string;
    skillLevel: number;
    stats: CharacterStats;
    equipment: EquipmentStats;
    selectedTrait?: string;
}

// types/index.ts - 添加天赋相关类型
export interface TalentPage {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export interface TalentBook {
    id: string;
    name: string;
    icon: string;
    description: string;
    pages: TalentPage[];
}

export interface TalentBuild {
    selectedPages: TalentPage[]; // 已选择的4个天赋页
    isComplete: boolean; // 是否选择完成
}

// types/index.ts - 添加小天赋点类型
export interface TalentNode {
    id: string;
    name: string;
    icon: string;
    description: string;
    type: 'minor' | 'medium' | 'legendary'; // 小型/中型/传奇天赋
    position: { x: number; y: number };
    connections: string[];
    requirements?: string[];
    maxPoints: number; // 最大点数
    currentPoints: number; // 当前点数
    columnRequirement: number; // 列要求点数
}

export interface TalentPage {
    id: string;
    name: string;
    icon: string;
    description: string;
    talentTree: TalentNode[]; // 天赋树
    startingNode: string; // 起始天赋点ID
}