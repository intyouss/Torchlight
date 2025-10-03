'use client';

import { useState, useEffect } from 'react';
import { Sword, Loader2 } from 'lucide-react';
import { useData } from './hooks/useData';
import { apiService } from './lib/api';
import HeroSelection from './components/HeroSelection';
import TraitSelection from './components/TraitSelection';
import StatsConfiguration from './components/StatsConfiguration';
import EquipmentConfiguration from './components/EquipmentConfiguration';
import SkillConfiguration from './components/SkillConfiguration';
import TalentSystem from './components/TalentSystem';
import DamageResults from './components/DamageResults';
import { CharacterStats, EquipmentStats, DamageResult } from './type';

export default function TorchlightCalculator() {
    const {
        heroes,
        activeSkills,
        passiveSkills,
        supportSkills,
        defaultStats,
        defaultEquipment,
        loading,
        error
    } = useData();

    const [selectedHero, setSelectedHero] = useState<string>('');
    const [selectedSkill, setSelectedSkill] = useState<string>('');
    const [skillLevel, setSkillLevel] = useState<number>(1);
    const [stats, setStats] = useState<CharacterStats | null>(null);
    const [equipment, setEquipment] = useState<EquipmentStats | null>(null);
    const [damageResult, setDamageResult] = useState<DamageResult | null>(null);
    const [calculating, setCalculating] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [traitSelections, setTraitSelections] = useState<{ [key: number]: string }>({});

    const currentHero = heroes.find(h => h.id === selectedHero);

    // 初始化数据
    useEffect(() => {
        if (heroes.length > 0 && !selectedHero) {
            setSelectedHero(heroes[0].id);
            // 设置默认特性（1级特性）
            const defaultTrait = heroes[0].traits.find(t => t.unlock_level === 1 && t.isDefault);
            if (defaultTrait) {
                setTraitSelections(prev => ({
                    ...prev,
                    1: defaultTrait.id
                }));
            }
        }

        // 设置默认技能（如果有主动技能）
        if (activeSkills.length > 0 && !selectedSkill) {
            setSelectedSkill(activeSkills[0].id);
        }

        if (defaultStats && !stats) {
            setStats(defaultStats);
        }
        if (defaultEquipment && !equipment) {
            setEquipment(defaultEquipment);
        }
    }, [
        heroes,
        activeSkills,
        defaultStats,
        defaultEquipment,
        selectedHero,
        selectedSkill,
        stats,
        equipment
    ]);

    const handleHeroChange = (heroId: string) => {
        setSelectedHero(heroId);
        setTraitSelections({});

        const hero = heroes.find(h => h.id === heroId);
        if (hero) {
            const defaultTrait = hero.traits.find(t => t.unlock_level === 1 && t.isDefault);
            if (defaultTrait) {
                setTraitSelections(prev => ({ ...prev, 1: defaultTrait.id }));
            }
        }
    };

    const handleTraitSelection = (level: number, traitId: string) => {
        setTraitSelections(prev => ({ ...prev, [level]: traitId }));
    };

    const handleStatChange = (stat: keyof CharacterStats, value: string) => {
        const numValue = parseInt(value) || 0;
        setStats(prev => prev ? { ...prev, [stat]: numValue } : null);
    };

    const getSelectedTraitIds = (): string[] => {
        return Object.values(traitSelections).filter(Boolean) as string[];
    };

    const calculateDamage = async () => {
        if (!selectedHero || !selectedSkill || !stats || !equipment) return;

        try {
            setCalculating(true);
            const result = await apiService.calculateDamage({
                heroId: selectedHero,
                skillId: selectedSkill,
                skillLevel,
                stats,
                equipment,
                selectedTraits: getSelectedTraitIds(),
            });
            setDamageResult(result);
        } catch (err) {
            console.error('计算伤害失败:', err);
        } finally {
            setCalculating(false);
        }
    };

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
                selectedTraits: getSelectedTraitIds(),
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
            console.error('保存配置失败:', err);
        } finally {
            setSaveLoading(false);
        }
    };

    // 获取所有技能的合并列表（用于向后兼容）
    const getAllSkills = () => {
        return [...activeSkills, ...passiveSkills, ...supportSkills];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="text-red-400 text-center">
                    <div>数据加载失败</div>
                    <div className="text-sm text-gray-400 mt-2">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
            {/* 导航栏 */}
            <nav className="sticky top-0 z-50 bg-gray-800 border-b border-orange-500/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Sword className="h-8 w-8 text-orange-500 mr-3"/>
                            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
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
                        </div>
                    </div>
                </div>
            </nav>

            <div className="w-full px-2 sm:px-4 py-4 space-y-4">
                <HeroSelection
                    heroes={heroes}
                    selectedHero={selectedHero}
                    onHeroChange={handleHeroChange}
                />

                {currentHero && (
                    <TraitSelection
                        hero={currentHero}
                        traitSelections={traitSelections}
                        onTraitSelection={handleTraitSelection}
                    />
                )}

                <SkillConfiguration
                    activeSkills={activeSkills}
                    passiveSkills={passiveSkills}
                    supportSkills={supportSkills}
                    selectedHero={selectedHero}
                    equipment={equipment}
                />

                <TalentSystem />

                {stats && (
                    <StatsConfiguration
                        stats={stats}
                        onStatChange={handleStatChange}
                    />
                )}

                {equipment && (
                    <EquipmentConfiguration
                        equipment={equipment}
                        onEquipmentChange={setEquipment}
                    />
                )}

                <DamageResults
                    damageResult={damageResult}
                    calculating={calculating}
                    onCalculate={calculateDamage}
                    disabled={!selectedHero || !selectedSkill || !stats || !equipment}
                />
            </div>
        </div>
    );
}