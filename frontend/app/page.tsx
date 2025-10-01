// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Sword, Shield, Zap, Flame, Snowflake, Users, Settings, Calculator, Loader2, Star } from 'lucide-react';
import {Hero, Skill, CharacterStats, EquipmentStats, DamageResult, HeroTrait, TraitSelection, SkillBuild} from './type';
import { apiService } from './lib/api';
import { useData } from './hooks/useData';

export default function TorchlightCalculator() {
    const {heroes, skills, defaultStats, defaultEquipment, loading, error} = useData();

    // 状态管理
    const [selectedHero, setSelectedHero] = useState<string>('');
    const [selectedSkill, setSelectedSkill] = useState<string>('');
    const [selectedTrait, setSelectedTrait] = useState<string>('');
    const [skillLevel, setSkillLevel] = useState<number>(1);
    const [stats, setStats] = useState<CharacterStats | null>(null);
    const [equipment, setEquipment] = useState<EquipmentStats | null>(null);
    const [damageResult, setDamageResult] = useState<DamageResult | null>(null);
    const [calculating, setCalculating] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [traitSelections, setTraitSelections] = useState<{ [key: number]: string }>({});
    const [selectedSupportSlot, setSelectedSupportSlot] = useState<{
        slotType: 'active' | 'passive';
        slotIndex: number;
        supportIndex: number;
    } | null>(null);

    // 获取当前选中的英雄和特性
    const currentHero = heroes.find(h => h.id === selectedHero);
    const currentSkill = skills.find(s => s.id === selectedSkill);
    const currentTrait = currentHero?.traits.find(t => t.id === selectedTrait);

    // 初始化数据
    useEffect(() => {
        if (heroes.length > 0 && !selectedHero) {
            setSelectedHero(heroes[0].id);
            // 默认选择第一个英雄的第一个特性
            if (heroes[0].traits.length > 0) {
                setSelectedTrait(heroes[0].traits[0].id);
            }
        }
        if (skills.length > 0 && !selectedSkill) {
            setSelectedSkill(skills[0].id);
        }
        if (defaultStats && !stats) {
            setStats(defaultStats);
        }
        if (defaultEquipment && !equipment) {
            setEquipment(defaultEquipment);
        }
    }, [heroes, skills, defaultStats, defaultEquipment, selectedHero, selectedSkill, stats, equipment]);

    // 获取当前英雄的特性选择配置
    const getTraitSelectionsForHero = (hero: Hero): TraitSelection[] => {
        const traitsByLevel: { [key: number]: HeroTrait[] } = {};

        hero.traits.forEach(trait => {
            if (!traitsByLevel[trait.unlockLevel]) {
                traitsByLevel[trait.unlockLevel] = [];
            }
            traitsByLevel[trait.unlockLevel].push(trait);
        });

        return Object.entries(traitsByLevel).map(([level, traits]) => ({
            level: parseInt(level),
            availableTraits: traits,
            selectedTraitId: traitSelections[parseInt(level)] || traits.find(t => t.isDefault)?.id
        }));
    };
    // 处理特性选择变化
    const handleTraitSelection = (level: number, traitId: string) => {
        setTraitSelections(prev => ({
            ...prev,
            [level]: traitId
        }));
    };

// 获取当前选择的特性ID列表
    const getSelectedTraitIds = (): string[] => {
        return Object.values(traitSelections).filter(Boolean) as string[];
    };

// 在英雄选择变化时重置特性选择
    const handleHeroChange = (heroId: string) => {
        setSelectedHero(heroId);
        setTraitSelections({}); // 重置特性选择

        const hero = heroes.find(h => h.id === heroId);
        if (hero) {
            // 设置默认特性（1级特性）
            const defaultTrait = hero.traits.find(t => t.unlockLevel === 1 && t.isDefault);
            if (defaultTrait) {
                setTraitSelections(prev => ({
                    ...prev,
                    1: defaultTrait.id
                }));
            }
        }
    };


    // 处理属性变化
    const handleStatChange = (stat: keyof CharacterStats, value: string) => {
        const numValue = parseInt(value) || 0;
        setStats(prev => prev ? {
            ...prev,
            [stat]: numValue
        } : null);
    };

    // 处理装备变化
    const handleEquipmentChange = (field: keyof EquipmentStats, value: any) => {
        setEquipment(prev => prev ? {
            ...prev,
            [field]: value
        } : null);
    };

    // 处理武器伤害变化
    const handleWeaponDamageChange = (field: 'min' | 'max', value: string) => {
        const numValue = parseInt(value) || 0;
        setEquipment(prev => prev ? {
            ...prev,
            weaponDamage: {
                ...prev.weaponDamage,
                [field]: numValue
            }
        } : null);
    };

    // 处理元素伤害变化
    const handleElementalDamageChange = (element: keyof NonNullable<EquipmentStats['elementalDamage']>, value: string) => {
        const numValue = parseInt(value) || 0;
        setEquipment(prev => prev ? {
            ...prev,
            elementalDamage: {
                ...(prev.elementalDamage || {fire: 0, lightning: 0, cold: 0, poison: 0}),
                [element]: numValue
            }
        } : null);
    };

    // 计算伤害
    // 在计算伤害时使用选择的特性
    const calculateDamage = async () => {
        if (!selectedHero || !selectedSkill || !stats || !equipment) {
            return;
        }

        try {
            setCalculating(true);
            const result = await apiService.calculateDamage({
                heroId: selectedHero,
                skillId: selectedSkill,
                skillLevel,
                stats,
                equipment,
                selectedTraits: getSelectedTraitIds(), // 改为传递多个特性
            });
            setDamageResult(result);
        } catch (err) {
            console.error('计算伤害失败:', err);
        } finally {
            setCalculating(false);
        }
    };

    // 保存配置
    const saveConfig = async () => {
        if (!selectedHero || !selectedSkill || !stats || !equipment) {
            return;
        }

        try {
            setSaveLoading(true);
            await apiService.saveConfig({
                heroId: selectedHero,
                skillId: selectedSkill,
                skillLevel,
                stats,
                equipment,
                selectedTrait,
                timestamp: new Date().toISOString(),
            });
            // 这里可以添加成功提示
        } catch (err) {
            console.error('保存配置失败:', err);
        } finally {
            setSaveLoading(false);
        }
    };

    // 在组件状态中添加技能配置
    const [skillBuild, setSkillBuild] = useState<SkillBuild>({
        activeSlots: Array(5).fill(null).map(() => ({mainSkill: null, supportSkills: Array(5).fill(null)})),
        passiveSlots: Array(4).fill(null).map(() => ({mainSkill: null, supportSkills: Array(5).fill(null)})),
        triggerSlots: Array(3).fill(null).map(() => ({mainSkill: null, supportSkills: Array(5).fill(null)}))
    });

    const [selectedSkillType, setSelectedSkillType] = useState<'active' | 'passive' | 'trigger'>('active');
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
    const [isSkillLibraryOpen, setIsSkillLibraryOpen] = useState(false);
    // 打开辅助技能库
    const openSupportSkillLibrary = (slotType: 'active' | 'passive', slotIndex: number, supportIndex: number) => {
        setSelectedSupportSlot({ slotType, slotIndex, supportIndex });
        setIsSkillLibraryOpen(true);
    };

// 过滤可用的技能
    const getAvailableSkills = (slotType: 'active' | 'passive' | 'trigger', slotIndex?: number) => {
        return skills.filter(skill => {
            // 基本类型过滤
            if (skill.type !== slotType && !(slotType === 'active' && skill.type === 'support')) {
                return false;
            }

            // 如果是被动技能，检查是否已经被其他栏位使用
            if (slotType === 'passive' && skill.type === 'passive') {
                const isUsedInOtherSlot = skillBuild.passiveSlots.some((slot, index) =>
                    index !== slotIndex && slot.mainSkill?.id === skill.id
                );
                if (isUsedInOtherSlot) {
                    return false;
                }
            }

            // 英雄限制检查
            if (skill.heroRestrictions && selectedHero && !skill.heroRestrictions.includes(selectedHero)) {
                return false;
            }

            // 武器限制检查
            return !(skill.weaponRestrictions && equipment?.weaponType && !skill.weaponRestrictions.includes(equipment.weaponType));


        });
    };

// 选择主技能
    const selectMainSkill = (skill: Skill, slotType: 'active' | 'passive' | 'trigger', slotIndex: number) => {
        // 如果是被动技能，检查是否已经存在
        if (slotType === 'passive' && skill.type === 'passive') {
            const isAlreadyUsed = skillBuild.passiveSlots.some((slot, index) =>
                index !== slotIndex && slot.mainSkill?.id === skill.id
            );

            if (isAlreadyUsed) {
                // 可以添加提示，比如使用 toast 通知
                alert(`被动技能 "${skill.name}" 已经安装在其他栏位，同一个被动技能只能安装一次。`);
                return;
            }
        }

        setSkillBuild(prev => {
            const newBuild = { ...prev };
            const slotArray = slotType === 'active' ? newBuild.activeSlots :
                slotType === 'passive' ? newBuild.passiveSlots : newBuild.triggerSlots;

            slotArray[slotIndex] = {
                mainSkill: skill,
                supportSkills: Array(5).fill(null)
            };

            return newBuild;
        });
        setIsSkillLibraryOpen(false);
    };


// 选择辅助技能
    const selectSupportSkill = (supportSkill: Skill, slotType: 'active' | 'passive', slotIndex: number, supportIndex: number) => {
        setSkillBuild(prev => {
            const newBuild = { ...prev };
            const slotArray = slotType === 'active' ? newBuild.activeSlots : newBuild.passiveSlots;

            // 确保槽位存在
            if (slotArray[slotIndex]) {
                const newSupportSkills = [...slotArray[slotIndex].supportSkills];
                newSupportSkills[supportIndex] = supportSkill;

                slotArray[slotIndex] = {
                    ...slotArray[slotIndex],
                    supportSkills: newSupportSkills
                };
            }

            return newBuild;
        });

        setIsSkillLibraryOpen(false);
        setSelectedSupportSlot(null);
    };

// 清空技能槽位
    const clearSkillSlot = (slotType: 'active' | 'passive' | 'trigger', slotIndex: number) => {
        setSkillBuild(prev => {
            const newBuild = {...prev};
            const slotArray = slotType === 'active' ? newBuild.activeSlots :
                slotType === 'passive' ? newBuild.passiveSlots : newBuild.triggerSlots;

            slotArray[slotIndex] = {
                mainSkill: null,
                supportSkills: Array(5).fill(null)
            };

            return newBuild;
        });
    };

// 打开技能库
    const openSkillLibrary = (skillType: 'active' | 'passive' | 'trigger', slotIndex: number) => {
        setSelectedSkillType(skillType);
        setSelectedSlotIndex(slotIndex);
        setIsSkillLibraryOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
            {/* 导航栏 */}
            <nav className="bg-gray-800 border-b border-orange-500/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Sword className="h-8 w-8 text-orange-500 mr-3"/>
                            <span
                                className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                火炬之光：无限
              </span>
                            <span className="ml-2 text-gray-300">伤害计算器</span>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={saveConfig}
                                disabled={saveLoading}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 rounded-lg transition-colors flex items-center"
                            >
                                {saveLoading && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}
                                保存配置
                            </button>
                            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                                导入配置
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="w-full px-2 sm:px-4 py-4">
                <div className="space-y-4">
                    {/* 英雄选择 */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
                        <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                            <Users className="mr-2" /> 英雄选择
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {heroes.map(hero => (
                                <button
                                    key={hero.id}
                                    onClick={() => handleHeroChange(hero.id)}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        selectedHero === hero.id
                                            ? 'border-orange-500 bg-orange-500/10'
                                            : 'border-gray-600 bg-gray-700/50 hover:border-orange-400/50'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">{hero.icon}</div>
                                    <div className="font-semibold text-sm">{hero.name}</div>
                                    <div className="text-xs text-gray-400">{hero.type}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 英雄特性选择 */}
                    {currentHero && (
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
                            <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                                <Star className="mr-2"/> 英雄特性选择
                            </h2>

                            <div className="space-y-6">
                                {getTraitSelectionsForHero(currentHero).map((selection) => (
                                    <div key={selection.level} className="border border-gray-600 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-semibold text-orange-300">
                                                {selection.level}级特性
                                            </h3>
                                            <span className="text-sm text-gray-400 px-2 py-1 bg-gray-700 rounded">
              {selection.availableTraits.length === 1 ? '固定特性' : '二选一'}
            </span>
                                        </div>

                                        <div className={`grid gap-3 ${
                                            selection.availableTraits.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                                        }`}>
                                            {selection.availableTraits.map(trait => (
                                                <button
                                                    key={trait.id}
                                                    onClick={() => handleTraitSelection(selection.level, trait.id)}
                                                    disabled={selection.availableTraits.length === 1 && trait.isDefault}
                                                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                                                        selection.selectedTraitId === trait.id
                                                            ? 'border-orange-500 bg-orange-500/10'
                                                            : selection.availableTraits.length === 1 && trait.isDefault
                                                                ? 'border-green-500 bg-green-500/10 cursor-not-allowed'
                                                                : 'border-gray-600 bg-gray-700/50 hover:border-orange-400/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center mb-2">
                                                        <span className="text-xl mr-2">{trait.icon}</span>
                                                        <div>
                                                            <div
                                                                className="font-semibold text-orange-300">{trait.name}</div>
                                                            <div className="text-sm text-gray-400">
                                                                {selection.availableTraits.length === 1 && trait.isDefault ? '默认特性' : '可选特性'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="text-sm text-gray-300 mb-3">{trait.description}</div>
                                                    <div className="space-y-1">
                                                        {trait.effects.map((effect, index) => (
                                                            <div key={index}
                                                                 className="text-xs text-gray-400 flex items-center">
                                                                <div
                                                                    className="w-1 h-1 bg-orange-500 rounded-full mr-2"></div>
                                                                {effect}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 显示当前选择的特性总结 */}
                            {getSelectedTraitIds().length > 0 && (
                                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                    <div className="text-sm font-semibold text-orange-300 mb-2">已选择特性:</div>
                                    <div className="space-y-2">
                                        {getSelectedTraitIds().map(traitId => {
                                            const trait = currentHero.traits.find(t => t.id === traitId);
                                            return trait ? (
                                                <div key={trait.id} className="flex items-center text-sm">
                                                    <span className="text-orange-400 mr-2">{trait.icon}</span>
                                                    <span className="text-gray-300">
                  Lv.{trait.unlockLevel} {trait.name}
                </span>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 技能配置 */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
                        <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                            <Sword className="mr-2" /> 技能配置
                        </h2>

                        {/* 技能类型切换 */}
                        <div className="flex space-x-2 mb-4">
                            <button
                                onClick={() => setSelectedSkillType('active')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    selectedSkillType === 'active'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                主动技能 (5)
                            </button>
                            <button
                                onClick={() => setSelectedSkillType('passive')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    selectedSkillType === 'passive'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                被动技能 (4)
                            </button>
                        </div>

                        {/* 主动技能槽位 - 改为单行 */}
                        {selectedSkillType === 'active' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-orange-300">主动技能栏位</h3>
                                <div className="grid grid-cols-5 gap-3">
                                    {skillBuild.activeSlots.map((slot, index) => (
                                        <div key={index} className="border border-gray-600 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-sm">栏位 {index + 1}</h4>
                                                {slot.mainSkill && (
                                                    <button
                                                        onClick={() => clearSkillSlot('active', index)}
                                                        className="text-xs text-red-400 hover:text-red-300"
                                                    >
                                                        清空
                                                    </button>
                                                )}
                                            </div>

                                            {/* 主技能选择 */}
                                            <div className="mb-3">
                                                {slot.mainSkill ? (
                                                    <div className="flex items-center space-x-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/30">
                                                        <span className="text-xl">{slot.mainSkill.icon}</span>
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-orange-300 text-sm">{slot.mainSkill.name}</div>
                                                            <div className="text-xs text-gray-400 truncate">{slot.mainSkill.description}</div>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {slot.mainSkill.tags.map(tag => (
                                                                    <span key={tag} className="px-1 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                          {tag}
                        </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => openSkillLibrary('active', index)}
                                                        className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg hover:border-orange-400/50 transition-colors text-gray-400 hover:text-gray-300 text-sm"
                                                    >
                                                        + 选择技能
                                                    </button>
                                                )}
                                            </div>

                                            {/* 辅助技能槽位 */}
                                            {slot.mainSkill && (
                                                <div className="space-y-2">
                                                    <div className="text-xs font-medium text-gray-300">辅助技能:</div>
                                                    <div className="space-y-1">
                                                        {slot.supportSkills.map((supportSkill, supportIndex) => (
                                                            <button
                                                                key={supportIndex}
                                                                onClick={() => {
                                                                    if (!supportSkill) {
                                                                        openSupportSkillLibrary('active', index, supportIndex);
                                                                    }
                                                                }}
                                                                className={`w-full p-2 rounded border transition-all text-left ${
                                                                    supportSkill
                                                                        ? 'border-green-500 bg-green-500/10'
                                                                        : 'border-gray-600 bg-gray-700/50 hover:border-orange-400/50'
                                                                }`}
                                                            >
                                                                {supportSkill ? (
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="text-lg">{supportSkill.icon}</span>
                                                                        <div className="flex-1">
                                                                            <div className="text-sm font-medium text-gray-300">{supportSkill.name}</div>
                                                                            <div className="text-xs text-gray-400 truncate">{supportSkill.description}</div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center space-x-2 text-gray-400">
                                                                        <span className="text-lg">+</span>
                                                                        <span className="text-sm">选择辅助技能</span>
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 被动技能槽位 - 改为单行 */}
                        {selectedSkillType === 'passive' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-orange-300">被动技能栏位</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {skillBuild.passiveSlots.map((slot, index) => {
                                        const isDuplicate = slot.mainSkill &&
                                            skillBuild.passiveSlots.some((otherSlot, otherIndex) =>
                                                otherIndex !== index && otherSlot.mainSkill?.id === slot.mainSkill?.id
                                            );

                                        return (
                                            <div key={index} className={`border rounded-lg p-3 ${
                                                isDuplicate ? 'border-red-500 bg-red-500/10' : 'border-gray-600'
                                            }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-sm">栏位 {index + 1}</h4>
                                                    <div className="flex items-center gap-1">
                                                        {isDuplicate && (
                                                            <span className="text-xs text-red-400">重复</span>
                                                        )}
                                                        {slot.mainSkill && (
                                                            <button
                                                                onClick={() => clearSkillSlot('passive', index)}
                                                                className="text-xs text-red-400 hover:text-red-300"
                                                            >
                                                                清空
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 主技能选择 */}
                                                <div className="mb-3">
                                                    {slot.mainSkill ? (
                                                        <div className={`flex items-center space-x-2 p-2 rounded-lg border ${
                                                            isDuplicate
                                                                ? 'bg-red-500/10 border-red-500/30'
                                                                : 'bg-blue-500/10 border-blue-500/30'
                                                        }`}>
                                                            <span className="text-xl">{slot.mainSkill.icon}</span>
                                                            <div className="flex-1">
                                                                <div className={`font-semibold text-sm ${
                                                                    isDuplicate ? 'text-red-300' : 'text-blue-300'
                                                                }`}>
                                                                    {slot.mainSkill.name}
                                                                </div>
                                                                <div className="text-xs text-gray-400 truncate">{slot.mainSkill.description}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => openSkillLibrary('passive', index)}
                                                            className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-400/50 transition-colors text-gray-400 hover:text-gray-300 text-sm"
                                                        >
                                                            + 选择技能
                                                        </button>
                                                    )}
                                                </div>

                                                {/* 被动技能的辅助技能槽位 */}
                                                {slot.mainSkill && (
                                                    <div className="space-y-2">
                                                        <div className="text-xs font-medium text-gray-300">辅助技能:</div>
                                                        <div className="space-y-1">
                                                            {slot.supportSkills.map((supportSkill, supportIndex) => (
                                                                <button
                                                                    key={supportIndex}
                                                                    onClick={() => {
                                                                        if (!supportSkill) {
                                                                            openSupportSkillLibrary('passive', index, supportIndex);
                                                                        }
                                                                    }}
                                                                    className={`w-full p-2 rounded border transition-all text-left ${
                                                                        supportSkill
                                                                            ? 'border-green-500 bg-green-500/10'
                                                                            : 'border-gray-600 bg-gray-700/50 hover:border-orange-400/50'
                                                                    }`}
                                                                >
                                                                    {supportSkill ? (
                                                                        <div className="flex items-center space-x-2">
                                                                            <span className="text-lg">{supportSkill.icon}</span>
                                                                            <div className="flex-1">
                                                                                <div className="text-sm font-medium text-gray-300">{supportSkill.name}</div>
                                                                                <div className="text-xs text-gray-400 truncate">{supportSkill.description}</div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center space-x-2 text-gray-400">
                                                                            <span className="text-lg">+</span>
                                                                            <span className="text-sm">选择辅助技能</span>
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    {/* 技能库弹窗 */}
                        {isSkillLibraryOpen && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 rounded-xl border border-orange-500/20 p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <h3 className="text-xl font-bold text-orange-400 mb-4">
                                        {selectedSupportSlot ? '选择辅助技能' : `选择${selectedSkillType === 'active' ? '主动' : '被动'}技能`}
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {skills.filter(skill => selectedSupportSlot ? skill.type === 'support' : skill.type === selectedSkillType).map(skill => (
                                            <button
                                                key={skill.id}
                                                onClick={() => {
                                                    if (selectedSupportSlot) {
                                                        selectSupportSkill(skill, selectedSupportSlot.slotType, selectedSupportSlot.slotIndex, selectedSupportSlot.supportIndex);
                                                    } else {
                                                        selectMainSkill(skill, selectedSkillType, selectedSlotIndex!);
                                                    }
                                                }}
                                                className="p-3 rounded-lg border-2 border-gray-600 bg-gray-700/50 hover:border-orange-400/50 transition-all text-left"
                                            >
                                                <div className="text-2xl mb-2">{skill.icon}</div>
                                                <div className="font-semibold text-orange-300 text-sm">{skill.name}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {skill.type === 'support' ? '辅助' :
                                                        skill.type === 'passive' ? '被动' : '主动'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => {
                                            setIsSkillLibraryOpen(false);
                                            setSelectedSupportSlot(null);
                                        }}
                                        className="w-full mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        )}

                    {/* 属性配置 */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
                        <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                            <Settings className="mr-2"/> 属性配置
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats && (Object.keys(stats) as Array<keyof CharacterStats>).map((stat) => (
                                <div key={stat} className="bg-gray-700/30 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                                        {stat}
                                    </label>
                                    <input
                                        type="number"
                                        value={stats[stat]}
                                        onChange={(e) => handleStatChange(stat, e.target.value)}
                                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 装备配置 */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
                        <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                            <Shield className="mr-2"/> 装备配置
                        </h2>
                        {equipment && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            武器伤害
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="number"
                                                value={equipment.weaponDamage.min}
                                                onChange={(e) => handleWeaponDamageChange('min', e.target.value)}
                                                className="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                                placeholder="最小伤害"
                                            />
                                            <span className="self-center text-gray-400">-</span>
                                            <input
                                                type="number"
                                                value={equipment.weaponDamage.max}
                                                onChange={(e) => handleWeaponDamageChange('max', e.target.value)}
                                                className="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                                placeholder="最大伤害"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            攻击速度
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={equipment.attackSpeed}
                                            onChange={(e) => handleEquipmentChange('attackSpeed', parseFloat(e.target.value) || 0)}
                                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            暴击几率 (%)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={equipment.critChance}
                                            onChange={(e) => handleEquipmentChange('critChance', parseFloat(e.target.value) || 0)}
                                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            暴击伤害 (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={equipment.critMultiplier}
                                            onChange={(e) => handleEquipmentChange('critMultiplier', parseInt(e.target.value) || 0)}
                                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                        />
                                    </div>

                                    {/* 元素伤害配置 */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                火焰伤害
                                            </label>
                                            <input
                                                type="number"
                                                value={equipment.elementalDamage?.fire || 0}
                                                onChange={(e) => handleElementalDamageChange('fire', e.target.value)}
                                                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                闪电伤害
                                            </label>
                                            <input
                                                type="number"
                                                value={equipment.elementalDamage?.lightning || 0}
                                                onChange={(e) => handleElementalDamageChange('lightning', e.target.value)}
                                                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                冰冷伤害
                                            </label>
                                            <input
                                                type="number"
                                                value={equipment.elementalDamage?.cold || 0}
                                                onChange={(e) => handleElementalDamageChange('cold', e.target.value)}
                                                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                毒素伤害
                                            </label>
                                            <input
                                                type="number"
                                                value={equipment.elementalDamage?.poison || 0}
                                                onChange={(e) => handleElementalDamageChange('poison', e.target.value)}
                                                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 结果面板 */}
                <div className="space-y-6">
                    {/* 伤害结果 */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
                        <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center justify-center">
                            <Calculator className="mr-2" /> 伤害计算结果
                        </h2>

                        {damageResult ? (
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-4 border border-orange-500/30 text-center">
                                    <div className="text-sm text-gray-300">总伤害</div>
                                    <div className="text-3xl font-bold text-orange-400">
                                        {damageResult.total.toLocaleString()}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                                        <div className="text-sm text-gray-300">物理伤害</div>
                                        <div className="text-xl font-semibold text-white">
                                            {damageResult.physical.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                                        <div className="text-sm text-gray-300">元素伤害</div>
                                        <div className="text-xl font-semibold text-blue-400">
                                            {damageResult.elemental.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                                        <div className="text-sm text-gray-300">DPS (每秒伤害)</div>
                                        <div className="text-2xl font-bold text-green-400">
                                            {damageResult.dps.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                                        <div className="text-sm text-gray-300">暴击几率</div>
                                        <div className="text-xl font-semibold text-yellow-400">
                                            {damageResult.critChance.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>

                                {/* 特性加成显示 */}
                                {currentTrait && (
                                    <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/30 text-center">
                                        <div className="text-sm text-orange-300">特性加成</div>
                                        <div className="text-lg font-semibold text-orange-400">
                                            {currentTrait.name}
                                        </div>
                                        <div className="text-xs text-gray-300 mt-1">{currentTrait.description}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400">
                                点击"计算伤害"按钮查看结果
                            </div>
                        )}

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={calculateDamage}
                                disabled={calculating || !selectedHero || !selectedSkill || !stats || !equipment}
                                className="w-full max-w-md py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
                            >
                                {calculating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        计算中...
                                    </>
                                ) : (
                                    '计算伤害'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 伤害分布 */}
                    {damageResult && (
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
                            <h3 className="text-lg font-bold text-orange-400 mb-3 text-center">伤害分布</h3>
                            <div className="space-y-3">
                                {Object.entries(damageResult.damageDistribution).map(([type, percentage]) => (
                                    percentage > 0 && (
                                        <div key={type}>
                                            <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300 capitalize">
                    {type === 'physical' ? '物理' :
                        type === 'fire' ? '火焰' :
                            type === 'lightning' ? '闪电' :
                                type === 'cold' ? '冰冷' : '毒素'}伤害
                  </span>
                                                <span className="text-white">{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        type === 'physical' ? 'bg-gray-400' :
                                                            type === 'fire' ? 'bg-red-500' :
                                                                type === 'lightning' ? 'bg-yellow-400' :
                                                                    type === 'cold' ? 'bg-blue-400' : 'bg-green-500'
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </div>
    );
}
