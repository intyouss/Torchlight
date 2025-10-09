export interface Hero {
    id: string;
    name: string;
    icon: string;
    desc: string;
    baseStats?: CharacterStats;
    traits: HeroTrait[];
}

export interface HeroTrait {
    id: string;
    name: string;
    desc: string;
    icon: string;
    unlock_level: number;
    isDefault?: boolean;
}

export interface Skill {
    id: string;
    name: string;
    type: 'active' | 'passive' | 'support';
    description: string;
    icon: string;
    tags: string[];
    mainAttribute?: string;
    manaCost?: string;
    manaCostMatch?: string;
    castingSpeed?: string;
    cooldown?: string;
    magicSeal?: string;
    damageMatch?: string;
    weaponRestrictions?: string[];
}

export interface SkillSlot {
    mainSkill: Skill | null;
    supportSkills: (Skill | null)[];
}

export interface SkillBuild {
    activeSlots: SkillSlot[];
    passiveSlots: SkillSlot[];
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

export interface TalentNode {
    id: string;
    name: string;
    icon: string;
    description: string;
    type: 'minor' | 'medium' | 'legendary';
    position: { x: number; y: number };
    connections: string[];
    requirements?: string[];
    maxPoints: number;
    currentPoints: number;
    columnRequirement: number;
}

export interface TalentPage {
    id: string;
    name: string;
    icon: string;
    description: string;
    talentTree: TalentNode[];
    startingNode: string;
}

export interface TalentBook {
    id: string;
    name: string;
    icon: string;
    description: string;
    pages: TalentPage[];
}

export interface TalentBuild {
    selectedPages: TalentPage[];
    isComplete: boolean;
}