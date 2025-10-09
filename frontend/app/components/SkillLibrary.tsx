import { Skill } from '../type';
import { createPortal } from 'react-dom';
import {useEffect, useState} from "react";

interface SkillLibraryProps {
    activeSkills: Skill[];
    passiveSkills: Skill[];
    supportSkills: Skill[];
    selectedSupportSlot: {
        slotType: 'active' | 'passive';
        slotIndex: number;
        supportIndex: number;
    } | null;
    selectedSkillType: 'active' | 'passive';
    selectedSlotIndex: number | null;
    onSelectMainSkill: (skill: Skill, slotType: 'active' | 'passive', slotIndex: number) => void;
    onSelectSupportSkill: (supportSkill: Skill, slotType: 'active' | 'passive', slotIndex: number, supportIndex: number) => void;
    onClose: () => void;
    getAvailableSkills?: (slotType: 'active' | 'passive', slotIndex?: number) => Skill[];
    getAvailableSupportSkills?: () => Skill[];
}

export default function SkillLibrary({
                                         activeSkills,
                                         passiveSkills,
                                         supportSkills,
                                         selectedSupportSlot,
                                         selectedSkillType,
                                         selectedSlotIndex,
                                         onSelectMainSkill,
                                         onSelectSupportSkill,
                                         onClose,
                                         getAvailableSkills,
                                         getAvailableSupportSkills
                                     }: SkillLibraryProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (mounted) {
            // 禁用 body 滚动
            document.body.style.overflow = 'hidden';

            // 清理函数：重新启用滚动
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [mounted]);

    // 根据选择类型获取对应的技能列表
    const getFilteredSkills = () => {
        if (selectedSupportSlot) {
            // 选择辅助技能时，使用 supportSkills 或通过过滤函数
            if (getAvailableSupportSkills) {
                return getAvailableSupportSkills();
            }
            return supportSkills;
        } else {
            // 选择主技能时，根据技能类型过滤
            if (getAvailableSkills && selectedSlotIndex !== null) {
                return getAvailableSkills(selectedSkillType, selectedSlotIndex);
            }

            // 如果没有过滤函数，使用默认的对应技能列表
            switch (selectedSkillType) {
                case 'active':
                    return activeSkills;
                case 'passive':
                    return passiveSkills;
                default:
                    return [];
            }
        }
    };

    const filteredSkills = getFilteredSkills();

    const handleSkillSelect = (skill: Skill) => {
        if (selectedSupportSlot) {
            onSelectSupportSkill(
                skill,
                selectedSupportSlot.slotType,
                selectedSupportSlot.slotIndex,
                selectedSupportSlot.supportIndex
            );
        } else if (selectedSlotIndex !== null) {
            onSelectMainSkill(skill, selectedSkillType, selectedSlotIndex);
        }
    };

    const getLibraryTitle = () => {
        if (selectedSupportSlot) {
            return '选择辅助技能';
        } else {
            return selectedSkillType === 'active' ? '选择主动技能' : '选择被动技能';
        }
    };

    const getSkillTypeText = (skill: Skill) => {
        switch (skill.type) {
            case 'active':
                return '主动';
            case 'passive':
                return '被动';
            case 'support':
                return '辅助';
            default:
                return '未知';
        }
    };

    // 渲染技能标签
    const renderTags = (tags: string[]) => {
        return (
            <div className="flex flex-wrap gap-1 mt-1">
                {tags.map(tag => (
                    <span
                        key={tag}
                        className="px-1 py-0.5 bg-gray-600 rounded text-xs text-gray-300"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        );
    };

    // 渲染武器限制
    const renderWeaponRestrictions = (weaponRestrictions?: string[]) => {
        if (!weaponRestrictions || weaponRestrictions.length === 0) {
            return null;
        }
        return (
            <div className="text-xs text-yellow-400 mt-1">
                武器限制: {weaponRestrictions.join(', ')}
            </div>
        );
    };

    // 渲染技能属性
    const renderSkillProperties = (skill: Skill) => {
        return (
            <div className="space-y-1 mt-2">
                {skill.mainAttribute && (
                    <div className="text-xs text-purple-600">
                        主属性: {skill.mainAttribute}
                    </div>
                )}
                {skill.manaCost && (
                    <div className="text-xs text-blue-300">
                        魔力消耗: {skill.manaCost}
                    </div>
                )}
                {skill.magicSeal && (
                    <div className="text-xs text-blue-400">
                        魔力封印: {skill.magicSeal}
                    </div>
                )}
                {skill.castingSpeed && (
                    <div className="text-xs text-green-400">
                        施法速度: {skill.castingSpeed}秒
                    </div>
                )}
                {skill.cooldown && (
                    <div className="text-xs text-purple-400">
                        冷却时间: {skill.cooldown}秒
                    </div>
                )}
                {skill.damageMatch && (
                    <div className="text-xs text-red-600">
                        伤害倍率: {skill.damageMatch}
                    </div>
                )}
                {skill.manaCostMatch && (
                    <div className="text-xs text-blue-500">
                        魔力消耗倍率: {skill.manaCostMatch}
                    </div>
                )}
                {renderWeaponRestrictions(skill.weaponRestrictions)}
            </div>
        );
    };

    // SkillLibrary.tsx - 在返回的 JSX 中添加调试
    const modalContent = (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-xl border border-orange-500/20 w-[900px] h-[550px] flex flex-col">
                {/* 固定头部 */}
                <div className="flex justify-between items-center p-6 border-b border-orange-500/20 flex-shrink-0">
                    <h3 className="text-xl font-bold text-orange-400">
                        {getLibraryTitle()}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors text-xl"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 skill-library-scrollbar min-h-0">
                    {filteredSkills.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-lg">没有可用的技能</div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-4">
                                {filteredSkills.map((skill, index) => {
                                    return (
                                        <button
                                            key={skill.id}
                                            onClick={() => handleSkillSelect(skill)}
                                            className="p-4 rounded-lg border-2 border-gray-600 bg-gray-700/50 hover:border-orange-400/50 transition-all text-left group w-full flex flex-col h-full"
                                        >
                                            {/* 图标和基本信息 - 上半部分 */}
                                            <div className="flex flex-col items-center justify-center mb-3 flex-shrink-0">
                                                <div className="flex items-center justify-center h-16 w-16 mb-2">
                                                    {skill.icon ? (
                                                        skill.icon.startsWith('http') ? (
                                                            <img
                                                                src={skill.icon}
                                                                alt={skill.name}
                                                                className="w-12 h-12 object-contain"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-4xl">{skill.icon}</span>
                                                        )
                                                    ) : (
                                                        <span className="text-4xl">❓</span>
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold text-orange-300 text-sm group-hover:text-orange-200">
                                                        {skill.name}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {getSkillTypeText(skill)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 技能描述、标签、属性 - 下半部分 */}
                                            <div className="flex-1 flex flex-col">
                                                {/* 技能描述 */}
                                                <div className="text-xs text-gray-300 mb-2 flex-shrink-0">
                                                    {skill.description}
                                                </div>

                                                {/* 技能标签 */}
                                                {skill.tags && skill.tags.length > 0 && (
                                                    <div className="flex-shrink-0">
                                                        {renderTags(skill.tags)}
                                                    </div>
                                                )}

                                                {/* 技能属性 */}
                                                <div className="mt-auto pt-2">
                                                    {renderSkillProperties(skill)}
                                                </div>

                                                {/* 技能ID（调试用） */}
                                                <div className="text-xs text-gray-500 mt-2">
                                                    ID: {skill.id}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
    if (!mounted) return null;

    return createPortal(modalContent, document.body);
}