// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Sword, Shield, Zap, Flame, Snowflake, Users, Settings, Calculator, Loader2, Star } from 'lucide-react';
import {
    Hero,
    Skill,
    CharacterStats,
    EquipmentStats,
    DamageResult,
    HeroTrait,
    TraitSelection,
    SkillBuild,
    TalentBuild, TalentPage,
    TalentBook, TalentNode
} from './type';
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
    // app/page.tsx - 添加天赋状态管理
    const [talentBuild, setTalentBuild] = useState<TalentBuild>({
        selectedPages: [],
        isComplete: false
    });

    const [talentBooks, setTalentBooks] = useState<TalentBook[]>([]);
    const [selectedBook, setSelectedBook] = useState<TalentBook | null>(null);
    const [isBookSelectionOpen, setIsBookSelectionOpen] = useState(false);
    const [isPageSelectionOpen, setIsPageSelectionOpen] = useState(false);
    // app/page.tsx - 添加天赋树弹窗状态
    const [selectedTalentPage, setSelectedTalentPage] = useState<TalentPage | null>(null);
    const [isTalentTreeOpen, setIsTalentTreeOpen] = useState(false);
    const [allocatedTalents, setAllocatedTalents] = useState<Set<string>>(new Set());
    // 新增：存储每个天赋页的分配结果（key：天赋页ID，value：分配数据）
    const [talentAllocations, setTalentAllocations] = useState<{
        [pageId: string]: {
            allocatedNodes: Set<string>; // 已分配的天赋节点ID
            talentTree: TalentNode[]; // 该天赋页的天赋树（含当前点数）
        }
    }>({});
    // 新增：用于管理天赋树内部节点的预览框
    const [nodeTooltip, setNodeTooltip] = useState<{
        isVisible: boolean;
        position: { x: number; y: number };
        node: TalentNode | null;
    }>({
        isVisible: false,
        position: { x: 0, y: 0 },
        node: null,
    });

    // 获取当前选中的英雄和特性
    const currentHero = heroes.find(h => h.id === selectedHero);
    const currentSkill = skills.find(s => s.id === selectedSkill);
    const currentTrait = currentHero?.traits.find(t => t.id === selectedTrait);
// 获取天赋数据
    useEffect(() => {
        const fetchTalentBooks = async () => {
            const books = await apiService.getTalentBooks();
            setTalentBooks(books);
        };
        fetchTalentBooks().then(r => {});
    }, []);

    /**
     * 根据天赋树的分配情况，计算属性加成。
     * @param talentTree 包含当前点数分配的天赋树
     * @returns 一个包含各种属性加成的对象
     */
    const calculateTalentBonuses = (talentTree: TalentNode[]): {
        strength: number;
        dexterity: number;
        intelligence: number;
        vitality: number;
        physicalDamage: number;
        elementalDamage: number;
        critChance: number;
        critMultiplier: number;
    } => {
        // 初始化所有加成
        const bonuses = {
            strength: 0,
            dexterity: 0,
            intelligence: 0,
            vitality: 0,
            physicalDamage: 0,
            elementalDamage: 0,
            critChance: 0,
            critMultiplier: 0,
        };

        // 遍历所有天赋节点
        talentTree.forEach(node => {
            // 只有已分配点数的节点才计算加成
            if (node.currentPoints > 0) {
                // 这里的逻辑是一个示例。实际的加成值需要从天赋节点的数据中解析。
                // 假设天赋的 description 字段包含了加成信息，例如 "力量 +2" 或 "物理伤害 +5%"
                // 我们可以通过简单的字符串匹配来提取数值。

                const description = node.description.toLowerCase();
                const points = node.currentPoints;

                // 检查力量加成
                if (description.includes('力量')) {
                    const match = description.match(/力量\s*\+?(\d+)/);
                    if (match && match[1]) {
                        bonuses.strength += parseInt(match[1]) * points;
                    }
                }
                // 检查敏捷加成
                if (description.includes('敏捷')) {
                    const match = description.match(/敏捷\s*\+?(\d+)/);
                    if (match && match[1]) {
                        bonuses.dexterity += parseInt(match[1]) * points;
                    }
                }
                // 检查智力加成
                if (description.includes('智力')) {
                    const match = description.match(/智力\s*\+?(\d+)/);
                    if (match && match[1]) {
                        bonuses.intelligence += parseInt(match[1]) * points;
                    }
                }
                // 检查活力加成
                if (description.includes('活力')) {
                    const match = description.match(/活力\s*\+?(\d+)/);
                    if (match && match[1]) {
                        bonuses.vitality += parseInt(match[1]) * points;
                    }
                }
                // 检查物理伤害加成 (百分比)
                if (description.includes('物理伤害')) {
                    const match = description.match(/物理伤害\s*\+?(\d+)%/);
                    if (match && match[1]) {
                        bonuses.physicalDamage += parseInt(match[1]) * points;
                    }
                }
                // 检查元素伤害加成 (百分比)
                if (description.includes('元素伤害')) {
                    const match = description.match(/元素伤害\s*\+?(\d+)%/);
                    if (match && match[1]) {
                        bonuses.elementalDamage += parseInt(match[1]) * points;
                    }
                }
                // 检查暴击几率加成 (百分比)
                if (description.includes('暴击几率')) {
                    const match = description.match(/暴击几率\s*\+?(\d+)%/);
                    if (match && match[1]) {
                        bonuses.critChance += parseInt(match[1]) * points;
                    }
                }
                // 检查暴击伤害加成 (百分比)
                if (description.includes('暴击伤害')) {
                    const match = description.match(/暴击伤害\s*\+?(\d+)%/);
                    if (match && match[1]) {
                        bonuses.critMultiplier += parseInt(match[1]) * points;
                    }
                }
            }
        });

        return bonuses;
    };

    // 新增：用于管理天赋加成预览框
    const [talentPreview, setTalentPreview] = useState<{
        isVisible: boolean;
        position: { x: number; y: number };
        bonuses: ReturnType<typeof calculateTalentBonuses>;
    }>({
        isVisible: false,
        position: { x: 0, y: 0 },
        bonuses: calculateTalentBonuses([]), // 初始化为空
    });

    const openTalentTree = (talentPage: TalentPage) => {
        setSelectedTalentPage(talentPage);
        // 读取已保存的分配数据，无数据则初始化
        const savedAllocation = talentAllocations[talentPage.id];
        if (savedAllocation) {
            setAllocatedTalents(savedAllocation.allocatedNodes);
            // 用保存的天赋树覆盖当前页的天赋树（含点数）
            setSelectedTalentPage(prev => prev
                ? { ...prev, talentTree: savedAllocation.talentTree }
                : null
            );
        } else {
            // 无历史数据，初始化天赋树（重置点数）
            const resetTree = talentPage.talentTree.map(node => ({
                ...node,
                currentPoints: 0
            }));
            setAllocatedTalents(new Set());
            setSelectedTalentPage({ ...talentPage, talentTree: resetTree });
        }
        setIsTalentTreeOpen(true);
    };

// 计算列要求是否满足
    const isColumnRequirementMet = (column: number) => {
        return getTotalAllocatedPoints() >= column;
    };

// 分配天赋点
    // app/page.tsx - 添加空值检查
// 计算总分配点数
    const getTotalAllocatedPoints = () => {
        if (!selectedTalentPage) return 0;

        let total = 0;
        allocatedTalents.forEach(talentId => {
            const talent = selectedTalentPage.talentTree.find(node => node.id === talentId);
            if (talent) {
                total += talent.currentPoints;
            }
        });
        return total;
    };

// 分配天赋点
    const allocateTalent = (nodeId: string) => {
        if (!selectedTalentPage?.talentTree) return;

        const node = selectedTalentPage.talentTree.find(n => n.id === nodeId);
        if (!node) return;

        // 如果已经点满，则不减点
        if (node.currentPoints >= node.maxPoints) {
            return;
        }

        // 如果是首次点击这个天赋
        const isFirstPointInNode = node.currentPoints === 0;

        // 更新状态
        setAllocatedTalents(prev => {
            const newAllocated = new Set(prev);
            newAllocated.add(nodeId);
            return newAllocated;
        });

        setSelectedTalentPage(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                talentTree: prev.talentTree.map(n => {
                    if (n.id === nodeId) {
                        // 如果是首次点击，并且是中型或传奇天赋
                        if (isFirstPointInNode && ['medium', 'legendary'].includes(n.type)) {
                            // 自动为其所有连接的小型/中型天赋点满
                            autoMaxConnectedNodes(n);
                        }
                        return { ...n, currentPoints: n.currentPoints + 1 };
                    }
                    return n;
                })
            };
        });
    };

    /**
     * 检查一个天赋节点的所有连接节点是否都已达到最大点数。
     * @param node 要检查的天赋节点
     * @returns 如果所有连接节点都已点满，则返回 true；否则返回 false。
     */
    const areAllConnectedNodesMaxed = (node: TalentNode): boolean => {
        if (!node.connections || node.connections.length === 0) {
            return true; // 如果没有连接节点，则默认满足条件
        }

        // 过滤掉传奇天赋作为前置，因为规则只针对小型和中型
        const validConnections = node.connections.filter(connId => {
            const connectedNode = selectedTalentPage?.talentTree?.find(n => n.id === connId);
            return connectedNode && ['minor', 'medium'].includes(connectedNode.type);
        });

        if (validConnections.length === 0) {
            return true; // 如果没有有效的小型/中型连接节点，则满足条件
        }

        // 检查所有有效的连接节点是否都已点满
        return validConnections.every(connId => {
            const connectedNode = selectedTalentPage?.talentTree?.find(n => n.id === connId);
            return connectedNode && connectedNode.currentPoints >= connectedNode.maxPoints;
        });
    };

    /**
     * 自动将一个天赋节点连接的所有小型/中型天赋点满。
     * @param node 触发此操作的天赋节点（中型或传奇）
     */
    const autoMaxConnectedNodes = (node: TalentNode) => {
        if (!node.connections || !selectedTalentPage?.talentTree) return;

        node.connections.forEach(connId => {
            const connectedNode = selectedTalentPage.talentTree.find(n => n.id === connId);
            // 只处理小型和中型天赋
            if (connectedNode && ['minor', 'medium'].includes(connectedNode.type)) {
                // 如果该连接节点还未点满
                if (connectedNode.currentPoints < connectedNode.maxPoints) {
                    // 将其标记为已分配
                    setAllocatedTalents(prev => {
                        const newAllocated = new Set(prev);
                        newAllocated.add(connectedNode.id);
                        return newAllocated;
                    });

                    // 将其点数直接设为最大值
                    setSelectedTalentPage(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            talentTree: prev.talentTree.map(n =>
                                n.id === connectedNode.id
                                    ? { ...n, currentPoints: n.maxPoints }
                                    : n
                            )
                        };
                    });
                }
            }
        });
    };


// 重置天赋点分配时也要检查空值
    const resetTalentAllocation = () => {
        if (!selectedTalentPage) return;

        // 重置当前天赋树（点数归零）
        const resetTree = selectedTalentPage.talentTree.map(node => ({
            ...node,
            currentPoints: 0
        }));
        const emptyAllocated = new Set<string>();

        // 更新临时状态
        setAllocatedTalents(emptyAllocated);
        setSelectedTalentPage({ ...selectedTalentPage, talentTree: resetTree });

        // 同步更新存储的分配数据
        setTalentAllocations(prev => ({
            ...prev,
            [selectedTalentPage.id]: {
                allocatedNodes: emptyAllocated,
                talentTree: resetTree
            }
        }));
    };

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

    // 打开天赋库
    const openBookSelection = () => {
        setIsBookSelectionOpen(true);
    };

// 选择天赋书
    const selectBook = (book: TalentBook) => {
        setSelectedBook(book);
        setIsBookSelectionOpen(false);
        setIsPageSelectionOpen(true);
    };

// 选择天赋页
    const selectTalentPage = (talentPage: TalentPage) => {
        if (talentBuild.selectedPages.length >= 4) {
            alert('最多只能选择4个天赋页');
            return;
        }

        setTalentBuild(prev => {
            const newSelectedPages = [...prev.selectedPages, talentPage];
            return {
                selectedPages: newSelectedPages,
                isComplete: newSelectedPages.length === 4
            };
        });

        setIsPageSelectionOpen(false);
        setSelectedBook(null);
    };

// 移除天赋页
    const removeTalentPage = (pageId: string) => {
        setTalentBuild(prev => ({
            selectedPages: prev.selectedPages.filter(page => page.id !== pageId),
            isComplete: false
        }));
    };

// 重置天赋选择
    const resetTalentBuild = () => {
        setTalentBuild({
            selectedPages: [],
            isComplete: false
        });
    };

    // 获取当前英雄的特性选择配置
    const getTraitSelectionsForHero = (hero: Hero): TraitSelection[] => {
        const traitsByLevel: { [key: number]: HeroTrait[] } = {};

        hero.traits.forEach(trait => {
            if (!traitsByLevel[trait.unlock_level]) {
                traitsByLevel[trait.unlock_level] = [];
            }
            traitsByLevel[trait.unlock_level].push(trait);
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
            const defaultTrait = hero.traits.find(t => t.unlock_level === 1 && t.isDefault);
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
                                    <div className="text-xs text-gray-400">{hero.desc}</div>
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
                                                        className="text-sm text-gray-300 mb-3">{trait.desc}</div>
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
                  Lv.{trait.unlock_level} {trait.name}
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
                        {/* 天赋选择 */}
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
                            <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                                <Star className="mr-2" /> 天赋选择
                            </h2>

                            {talentBuild.isComplete ? (
                                // 选择完成后的总览界面
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-orange-300">天赋总览</h3>
                                        <button
                                            onClick={resetTalentBuild}
                                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                                        >
                                            重新选择
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {talentBuild.selectedPages.map((talentPage, index) => {
                                            // 从我们之前创建的 talentAllocations 状态中获取该页的分配数据
                                            const allocation = talentAllocations[talentPage.id];
                                            // 获取该页的天赋树（如果有分配数据，则使用已分配的；否则使用原始的）
                                            const currentTree = allocation ? allocation.talentTree : talentPage.talentTree;
                                            // 计算该页的属性加成
                                            const bonuses = calculateTalentBonuses(currentTree);

                                            return (
                                                <button
                                                    key={talentPage.id}
                                                    onClick={() => openTalentTree(talentPage)}
                                                    // --- 新增鼠标事件 ---
                                                    onMouseEnter={(e) => {
                                                        // 当鼠标移入时，显示预览框
                                                        setTalentPreview({
                                                            isVisible: true,
                                                            // 设置预览框位置在鼠标右下方
                                                            position: { x: e.clientX + 10, y: e.clientY + 10 },
                                                            bonuses: bonuses,
                                                        });
                                                    }}
                                                    onMouseMove={(e) => {
                                                        // 鼠标移动时，更新预览框位置
                                                        setTalentPreview(prev => ({
                                                            ...prev,
                                                            position: { x: e.clientX + 10, y: e.clientY + 10 },
                                                        }));
                                                    }}
                                                    onMouseLeave={() => {
                                                        // 当鼠标移出时，隐藏预览框
                                                        setTalentPreview(prev => ({ ...prev, isVisible: false }));
                                                    }}
                                                    // --- 事件结束 ---
                                                    className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30 hover:border-purple-400 transition-colors text-left relative"
                                                >
                                                    <span className="text-2xl">{talentPage.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-purple-300">{talentPage.name}</div>
                                                        <div className="text-xs text-gray-400">{talentPage.description}</div>
                                                    </div>
                                                    <div className="text-sm text-gray-400">#{index + 1}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                // 选择天赋页界面
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-orange-300">选择天赋页</h3>
                                        <div className="text-sm text-gray-400">
                                            已选择: {talentBuild.selectedPages.length}/4
                                        </div>
                                    </div>

                                    <button
                                        onClick={openBookSelection}
                                        className="w-full p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-400/50 transition-colors text-gray-400 hover:text-gray-300 mb-4"
                                    >
                                        <div className="text-3xl mb-2">📚</div>
                                        <div className="text-lg">选择六神天赋</div>
                                    </button>

                                    {/* 已选择的天赋页预览 */}
                                    {talentBuild.selectedPages.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-gray-300">已选择的天赋页:</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {talentBuild.selectedPages.map((page, index) => (
                                                    <div key={page.id} className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-lg">{page.icon}</span>
                                                            <div>
                                                                <div className="text-sm font-medium text-purple-300">{page.name}</div>
                                                                <div className="text-xs text-gray-400">{page.description}</div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeTalentPage(page.id)}
                                                            className="text-xs text-red-400 hover:text-red-300"
                                                        >
                                                            移除
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 天赋书选择弹窗 */}
                        {isBookSelectionOpen && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 rounded-xl border border-orange-500/20 p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <h3 className="text-xl font-bold text-orange-400 mb-4">选择六神天赋</h3>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {talentBooks.map(book => (
                                            <button
                                                key={book.id}
                                                onClick={() => selectBook(book)}
                                                className="p-4 rounded-lg border-2 border-gray-600 bg-gray-700/50 hover:border-purple-400/50 transition-all text-left"
                                            >
                                                <div className="text-3xl mb-2">{book.icon}</div>
                                                <div className="font-semibold text-purple-300">{book.name}</div>
                                                <div className="text-xs text-gray-400 mt-1">{book.description}</div>
                                                <div className="text-xs text-gray-500 mt-2">{book.pages.length} 个天赋页</div>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setIsBookSelectionOpen(false)}
                                        className="w-full mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 天赋页选择弹窗 */}
                        {isPageSelectionOpen && selectedBook && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 rounded-xl border border-orange-500/20 p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <h3 className="text-xl font-bold text-orange-400 mb-4">
                                        选择天赋页 - {selectedBook.name}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {selectedBook.pages.map(page => (
                                            <button
                                                key={page.id}
                                                onClick={() => selectTalentPage(page)}
                                                disabled={talentBuild.selectedPages.some(selected => selected.id === page.id)}
                                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                    talentBuild.selectedPages.some(selected => selected.id === page.id)
                                                        ? 'border-gray-500 bg-gray-600/50 cursor-not-allowed opacity-50'
                                                        : 'border-gray-600 bg-gray-700/50 hover:border-purple-400/50'
                                                }`}
                                            >
                                                <div className="text-2xl mb-2">{page.icon}</div>
                                                <div className="font-semibold text-purple-300">{page.name}</div>
                                                <div className="text-xs text-gray-400 mt-1">{page.description}</div>
                                                {talentBuild.selectedPages.some(selected => selected.id === page.id) && (
                                                    <div className="text-xs text-red-400 mt-2">已选择</div>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => {
                                            setIsPageSelectionOpen(false);
                                            setSelectedBook(null);
                                        }}
                                        className="w-full mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                    >
                                        返回
                                    </button>
                                </div>
                            </div>
                        )}

                        {isTalentTreeOpen && selectedTalentPage && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 rounded-xl border border-orange-500/20 p-6 max-w-[700px] overflow-hidden">
                                    {/* 头部信息 */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-orange-400">{selectedTalentPage?.name || '未知天赋页'}</h3>
                                            <p className="text-gray-400 text-sm">{selectedTalentPage?.description || ''}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={resetTalentAllocation}
                                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                                            >
                                                重置
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selectedTalentPage) {
                                                        // 保存当前天赋页的分配数据
                                                        setTalentAllocations(prev => ({
                                                            ...prev,
                                                            [selectedTalentPage.id]: {
                                                                allocatedNodes: new Set(allocatedTalents), // 深拷贝Set
                                                                talentTree: [...selectedTalentPage.talentTree] // 深拷贝天赋树
                                                            }
                                                        }));
                                                    }
                                                    // 关闭弹窗并重置临时状态
                                                    setIsTalentTreeOpen(false);
                                                    setSelectedTalentPage(null);
                                                }}
                                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                                            >
                                                关闭
                                            </button>
                                        </div>
                                    </div>

                                    {/* 天赋树画布 */}
                                    <div className="relative bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                                        {/* 列要求显示 - 作为第一行 */}
                                        <div className="relative mb-2" style={{ width: '560px', height: '40px', margin: '0 auto' }}>
                                            {[0, 3, 6, 9, 12, 15].map((requirement, index) => {
                                                // 6列布局，每列80px
                                                const columnWidth = 80;
                                                const startX = 60;
                                                const x = startX + (index * columnWidth);
                                                const y = 20;

                                                return (
                                                    <div
                                                        key={index}
                                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                                                        style={{
                                                            left: `${x}px`,
                                                            top: `${y}px`,
                                                            zIndex: 10
                                                        }}
                                                    >
                                                        {/* 装饰性竖线 */}
                                                        <div className="absolute -top-4 w-0.5 h-3 bg-gradient-to-b from-transparent to-gray-500"></div>

                                                        {/* 数字 */}
                                                        <div className={`text-xs font-bold px-2 py-1 rounded-full border ${
                                                            getTotalAllocatedPoints() >= requirement
                                                                ? 'text-green-400 border-green-400 bg-green-400/10'
                                                                : 'text-gray-400 border-gray-600 bg-gray-700/50'
                                                        }`}>
                                                            {requirement}
                                                        </div>

                                                        {/* 装饰性竖线 */}
                                                        <div className="absolute -bottom-4 w-0.5 h-3 bg-gradient-to-t from-transparent to-gray-500"></div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* 天赋点画布 - 5行6列 */}
                                        <div className="relative" style={{ width: '560px', height: '400px', margin: '0 auto' }}>
                                            {selectedTalentPage?.talentTree?.map(node => {
                                                const isAllocated = allocatedTalents.has(node.id);
                                                const canAllocate =
                                                    (!node.requirements || node.requirements.every(req => allocatedTalents.has(req))) &&
                                                    isColumnRequirementMet(node.columnRequirement) &&
                                                    // 对于中型和传奇天赋，额外检查其连接的前置天赋是否已点满
                                                    (['medium', 'legendary'].includes(node.type) ? areAllConnectedNodesMaxed(node) : true);

                                                // 5行6列布局
                                                const columnWidth = 80;
                                                const rowHeight = 80;
                                                const startX = 60;
                                                const startY = 60;

                                                const x = startX + (node.position.x * columnWidth);
                                                const y = startY + (node.position.y * rowHeight);

                                                const isOutOfBounds = x < 0 || x > 560 || y < 0 || y > 400;

                                                const getTalentColor = () => {
                                                    switch (node.type) {
                                                        case 'minor':
                                                            return isAllocated ? 'bg-blue-500 border-blue-400 shadow-blue-500/50' : 'bg-blue-600 border-blue-400';
                                                        case 'medium':
                                                            return isAllocated ? 'bg-purple-500 border-purple-400 shadow-purple-500/50' : 'bg-purple-600 border-purple-400';
                                                        case 'legendary':
                                                            return isAllocated ? 'bg-orange-500 border-orange-400 shadow-orange-500/50' : 'bg-orange-600 border-orange-400';
                                                        default:
                                                            return isAllocated ? 'bg-green-500 border-green-400 shadow-green-500/50' : 'bg-purple-600 border-purple-400';
                                                    }
                                                };

                                                const adjustedX = Math.max(20, Math.min(x, 540));
                                                const adjustedY = Math.max(20, Math.min(y, 380));

                                                return (
                                                    <div key={node.id}>
                                                        {/* 天赋点 */}
                                                        <div
                                                            // --- 将鼠标事件从 button 移到这里 ---
                                                            onMouseEnter={(e) => {
                                                                const rect = e.currentTarget.getBoundingClientRect(); // e.currentTarget 现在指向这个 div
                                                                setNodeTooltip({
                                                                    isVisible: true,
                                                                    position: {
                                                                        x: rect.right + 10,
                                                                        y: rect.top
                                                                    },
                                                                    node: node,
                                                                });
                                                            }}
                                                            onMouseMove={(e) => {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                setNodeTooltip(prev => ({
                                                                    ...prev,
                                                                    position: {
                                                                        x: rect.right + 10,
                                                                        y: rect.top
                                                                    },
                                                                }));
                                                            }}
                                                            onMouseLeave={() => {
                                                                setNodeTooltip(prev => ({ ...prev, isVisible: false }));
                                                            }}

                                                            // 给这个 div 一个和按钮一样的尺寸和位置，确保鼠标能正确地与之交互
                                                            className="absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 cursor-default" // 增加 cursor-default 样式
                                                            style={{
                                                                left: `${adjustedX}px`,
                                                                top: `${adjustedY}px`,
                                                                // 确保这个 div 在按钮下方，不影响按钮的 z-index
                                                                zIndex: 9
                                                            }}
                                                        >
                                                            {/* 原来的 button 元素保持不变，但移除了 onMouseXXX 事件 */}
                                                            <button
                                                                onClick={() => allocateTalent(node.id)}
                                                                disabled={!canAllocate && !isAllocated}
                                                                className={`absolute inset-0 rounded-full border-2 flex flex-col items-center justify-center transition-all shadow-lg ${ // 使用 inset-0 让按钮填满父 div
                                                                    isAllocated
                                                                        ? `${getTalentColor()} text-white scale-105`
                                                                        : canAllocate
                                                                            ? `${getTalentColor()} text-white hover:scale-110 hover:shadow-xl`
                                                                            : 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                                                                } ${isOutOfBounds ? 'border-red-500' : ''}`}
                                                                style={{
                                                                    // 按钮现在相对于父 div 定位，所以 left 和 top 是 0
                                                                    zIndex: 10
                                                                }}
                                                            >
                                                                <span className="text-lg">{node.icon}</span>
                                                                {isAllocated && (
                                                                    <div className="text-xs font-bold mt-0.5">
                                                                        {node.currentPoints}/{node.maxPoints}
                                                                    </div>
                                                                )}
                                                            </button>
                                                        </div>

                                                        {/* 连接线 */}
                                                        {node.connections?.map(connectionId => {
                                                            const targetNode = selectedTalentPage.talentTree.find(n => n.id === connectionId);
                                                            if (!targetNode) return null;

                                                            const targetX = startX + (targetNode.position.x * columnWidth);
                                                            const targetY = startY + (targetNode.position.y * rowHeight);

                                                            const adjustedTargetX = Math.max(20, Math.min(targetX, 540));
                                                            const adjustedTargetY = Math.max(20, Math.min(targetY, 380));

                                                            const isConnectionActive = isAllocated && allocatedTalents.has(connectionId);

                                                            return (
                                                                <svg
                                                                    key={`${node.id}-${connectionId}`}
                                                                    className="absolute top-0 left-0 pointer-events-none"
                                                                    style={{ width: '100%', height: '100%', zIndex: 1 }}
                                                                >
                                                                    <line
                                                                        x1={adjustedX}
                                                                        y1={adjustedY}
                                                                        x2={adjustedTargetX}
                                                                        y2={adjustedTargetY}
                                                                        stroke={isConnectionActive ? '#10B981' : '#4B5563'}
                                                                        strokeWidth="2"
                                                                        strokeDasharray={isConnectionActive ? 'none' : '4,4'}
                                                                    />
                                                                    {isConnectionActive && (
                                                                        <>
                                                                            <circle cx={adjustedX} cy={adjustedY} r="3" fill="#10B981" />
                                                                            <circle cx={adjustedTargetX} cy={adjustedTargetY} r="3" fill="#10B981" />
                                                                        </>
                                                                    )}
                                                                </svg>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {/* --- 新增：天赋树节点预览框 --- */}
                                    {nodeTooltip.isVisible && nodeTooltip.node && (
                                        <div
                                            className="fixed z-55 rounded-lg shadow-lg p-3 w-64 transform transition-all duration-200 ease-out animate-fade-in-up"
                                            style={{
                                                left: `${nodeTooltip.position.x}px`,
                                                top: `${nodeTooltip.position.y}px`,
                                                // 精美的背景和边框样式
                                                background: 'linear-gradient(135deg, rgba(30, 20, 60, 0.98) 0%, rgba(15, 10, 30, 0.98) 100%)',
                                                border: '1px solid rgba(139, 92, 246, 0.6)', // 紫色边框
                                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(139, 92, 246, 0.3)',
                                            }}
                                        >
                                            {/* 预览框标题 */}
                                            <div className="mb-2">
                                                <div className="flex items-center">
                                                    <span className="text-lg mr-2">{nodeTooltip.node.icon}</span>
                                                    <h4 className="text-sm font-bold text-white">
                                                        {nodeTooltip.node.name}
                                                    </h4>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    {nodeTooltip.node.type === 'minor' ? '小型天赋' :
                                                        nodeTooltip.node.type === 'medium' ? '中型天赋' : '传奇天赋'}
                                                    {' · '}
                                                    最大点数: {nodeTooltip.node.maxPoints}
                                                </div>
                                            </div>

                                            {/* 描述 */}
                                            <div className="text-xs text-gray-300 mb-2 leading-relaxed">
                                                {nodeTooltip.node.description}
                                            </div>

                                            {/* 列要求 */}
                                            <div className="mt-2 pt-2 border-t border-purple-900/50">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-400">列要求:</span>
                                                    <span className="text-blue-400">{nodeTooltip.node.columnRequirement}点</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 已分配点数统计 */}
                                    <div className="mt-3 p-2 bg-gray-700/50 rounded-lg text-center">
                                        <div className="text-sm text-gray-300">
                                            已分配点数: <span className="text-green-400 font-bold">{getTotalAllocatedPoints()}</span> / ∞
                                            <div className="flex justify-center space-x-4 mt-1 text-xs">
                                                <div className="flex items-center space-x-1">
                                                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                                    <span>小型(3点)</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                                                    <span>中型(3点)</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                                                    <span>传奇(1点)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* --- 新增：天赋加成预览框 --- */}
                        {talentPreview.isVisible && (
                            <div
                                className="fixed z-50 bg-gray-800 border border-purple-500/50 rounded-lg shadow-xl p-3 w-56 pointer-events-none"
                                style={{
                                    left: `${talentPreview.position.x}px`,
                                    top: `${talentPreview.position.y}px`,
                                }}
                            >
                                <h4 className="text-xs font-bold text-purple-300 mb-2 border-b border-gray-700 pb-1">
                                    天赋加成预览
                                </h4>
                                <div className="space-y-1 text-xs">
                                    {talentPreview.bonuses.strength > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">力量:</span>
                                            <span className="text-green-400">+{talentPreview.bonuses.strength}</span>
                                        </div>
                                    )}
                                    {talentPreview.bonuses.dexterity > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">敏捷:</span>
                                            <span className="text-green-400">+{talentPreview.bonuses.dexterity}</span>
                                        </div>
                                    )}
                                    {talentPreview.bonuses.intelligence > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">智力:</span>
                                            <span className="text-green-400">+{talentPreview.bonuses.intelligence}</span>
                                        </div>
                                    )}
                                    {talentPreview.bonuses.vitality > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">活力:</span>
                                            <span className="text-green-400">+{talentPreview.bonuses.vitality}</span>
                                        </div>
                                    )}
                                    {talentPreview.bonuses.physicalDamage > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">物理伤害:</span>
                                            <span className="text-green-400">+{talentPreview.bonuses.physicalDamage}%</span>
                                        </div>
                                    )}
                                    {talentPreview.bonuses.elementalDamage > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">元素伤害:</span>
                                            <span className="text-green-400">+{talentPreview.bonuses.elementalDamage}%</span>
                                        </div>
                                    )}
                                    {talentPreview.bonuses.critChance > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">暴击几率:</span>
                                            <span className="text-green-400">+{talentPreview.bonuses.critChance}%</span>
                                        </div>
                                    )}
                                    {talentPreview.bonuses.critMultiplier > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">暴击伤害:</span>
                                            <span className="text-green-400">+{talentPreview.bonuses.critMultiplier}%</span>
                                        </div>
                                    )}
                                    {/* 如果没有任何加成 */}
                                    {Object.values(talentPreview.bonuses).every(value => value === 0) && (
                                        <div className="text-gray-400 italic">未分配任何天赋点</div>
                                    )}
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
                                        <div className="text-xs text-gray-300 mt-1">{currentTrait.desc}</div>
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
