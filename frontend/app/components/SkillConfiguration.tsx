import { useState } from 'react';
import { Skill, SkillBuild, EquipmentStats } from '../type';
import { Sword } from 'lucide-react';
import SkillLibrary from './SkillLibrary';

interface SkillConfigurationProps {
    skills: Skill[];
    selectedHero: string;
    equipment: EquipmentStats | null;
}

export default function SkillConfiguration({ skills, selectedHero, equipment }: SkillConfigurationProps) {
    const [skillBuild, setSkillBuild] = useState<SkillBuild>({
        activeSlots: Array(5).fill(null).map(() => ({ mainSkill: null, supportSkills: Array(5).fill(null) })),
        passiveSlots: Array(4).fill(null).map(() => ({ mainSkill: null, supportSkills: Array(5).fill(null) })),
        triggerSlots: Array(3).fill(null).map(() => ({ mainSkill: null, supportSkills: Array(5).fill(null) }))
    });

    const [selectedSkillType, setSelectedSkillType] = useState<'active' | 'passive' | 'trigger'>('active');
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
    const [selectedSupportSlot, setSelectedSupportSlot] = useState<{
        slotType: 'active' | 'passive';
        slotIndex: number;
        supportIndex: number;
    } | null>(null);
    const [isSkillLibraryOpen, setIsSkillLibraryOpen] = useState(false);

    const getAvailableSkills = (slotType: 'active' | 'passive' | 'trigger', slotIndex?: number) => {
        return skills.filter(skill => {
            if (skill.type !== slotType && !(slotType === 'active' && skill.type === 'support')) {
                return false;
            }

            if (slotType === 'passive' && skill.type === 'passive') {
                const isUsedInOtherSlot = skillBuild.passiveSlots.some((slot, index) =>
                    index !== slotIndex && slot.mainSkill?.id === skill.id
                );
                if (isUsedInOtherSlot) return false;
            }

            return !(skill.weaponRestrictions && equipment?.weaponType && !skill.weaponRestrictions.includes(equipment.weaponType));
        });
    };

    const selectMainSkill = (skill: Skill, slotType: 'active' | 'passive' | 'trigger', slotIndex: number) => {
        if (slotType === 'passive' && skill.type === 'passive') {
            const isAlreadyUsed = skillBuild.passiveSlots.some((slot, index) =>
                index !== slotIndex && slot.mainSkill?.id === skill.id
            );

            if (isAlreadyUsed) {
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

    const selectSupportSkill = (supportSkill: Skill, slotType: 'active' | 'passive', slotIndex: number, supportIndex: number) => {
        setSkillBuild(prev => {
            const newBuild = { ...prev };
            const slotArray = slotType === 'active' ? newBuild.activeSlots : newBuild.passiveSlots;

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

    const clearSkillSlot = (slotType: 'active' | 'passive' | 'trigger', slotIndex: number) => {
        setSkillBuild(prev => {
            const newBuild = { ...prev };
            const slotArray = slotType === 'active' ? newBuild.activeSlots :
                slotType === 'passive' ? newBuild.passiveSlots : newBuild.triggerSlots;

            slotArray[slotIndex] = {
                mainSkill: null,
                supportSkills: Array(5).fill(null)
            };

            return newBuild;
        });
    };

    const openSkillLibrary = (skillType: 'active' | 'passive' | 'trigger', slotIndex: number) => {
        setSelectedSkillType(skillType);
        setSelectedSlotIndex(slotIndex);
        setIsSkillLibraryOpen(true);
    };

    const openSupportSkillLibrary = (slotType: 'active' | 'passive', slotIndex: number, supportIndex: number) => {
        setSelectedSupportSlot({ slotType, slotIndex, supportIndex });
        setIsSkillLibraryOpen(true);
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
            <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                <Sword className="mr-2" /> 技能配置
            </h2>

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

            {isSkillLibraryOpen && (
                <SkillLibrary
                    skills={skills}
                    selectedSupportSlot={selectedSupportSlot}
                    selectedSkillType={selectedSkillType}
                    onSelectMainSkill={selectMainSkill}
                    onSelectSupportSkill={selectSupportSkill}
                    onClose={() => {
                        setIsSkillLibraryOpen(false);
                        setSelectedSupportSlot(null);
                    }}
                    selectedSlotIndex={selectedSlotIndex}
                />
            )}
        </div>
    );
}