// types/index.ts
export interface HeroTrait {
    id: string;
    name: string;
    description: string;
    icon: string;
    effects: string[];
}

export interface Hero {
    id: string;
    name: string;
    type: string;
    icon: string;
    description?: string;
    baseStats: CharacterStats;
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
    description: string;
    icon: string;
    effects: string[];
    unlockLevel: number; // 解锁等级
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