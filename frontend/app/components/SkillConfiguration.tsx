import { useState } from 'react';
import { Skill, SkillBuild, EquipmentStats } from '../type';
import { Sword } from 'lucide-react';
import SkillLibrary from './SkillLibrary';

interface SkillConfigurationProps {
    activeSkills: Skill[];
    passiveSkills: Skill[];
    supportSkills: Skill[];
    selectedHero: string;
    equipment: EquipmentStats | null;
}

export default function SkillConfiguration({
                                               activeSkills,
                                               passiveSkills,
                                               supportSkills,
                                               selectedHero,
                                               equipment
                                           }: SkillConfigurationProps) {
    
    const [skillBuild, setSkillBuild] = useState<SkillBuild>({
        activeSlots: Array(5).fill(null).map(() => ({ mainSkill: null, supportSkills: Array(5).fill(null) })),
        passiveSlots: Array(4).fill(null).map(() => ({ mainSkill: null, supportSkills: Array(5).fill(null) }))
        // 移除 triggerSlots
    });

    const [selectedSkillType, setSelectedSkillType] = useState<'active' | 'passive'>('active'); // 移除 'trigger'
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
    const [selectedSupportSlot, setSelectedSupportSlot] = useState<{
        slotType: 'active' | 'passive';
        slotIndex: number;
        supportIndex: number;
    } | null>(null);
    const [isSkillLibraryOpen, setIsSkillLibraryOpen] = useState(false);

    // 修复后的过滤逻辑
    const getAvailableSkills = (slotType: 'active' | 'passive', slotIndex?: number) => {
        let availableSkills: Skill[] = [];

        switch (slotType) {
            case 'active':
                availableSkills = activeSkills;
                break;
            case 'passive':
                availableSkills = passiveSkills;
                break;
        }

        return availableSkills.filter(skill => {
            // 检查被动技能重复（只在选择被动技能时检查）
            if (slotType === 'passive' && skill.type === 'passive') {
                const isUsedInOtherSlot = skillBuild.passiveSlots.some((slot, index) =>
                    index !== slotIndex && slot.mainSkill?.id === skill.id
                );
                if (isUsedInOtherSlot) return false;
            }

            return true;
        });
    };

    const getAvailableSupportSkills = (slotType: 'active' | 'passive', slotIndex: number) => {
        const currentSlot = skillBuild[slotType === 'active' ? 'activeSlots' : 'passiveSlots'][slotIndex];
        const existingSupportSkillIds = currentSlot.supportSkills
            .filter(skill => skill !== null)
            .map(skill => skill!.id);

        return supportSkills.filter(skill => {
            // 过滤掉当前技能槽内已存在的辅助技能
            return !existingSupportSkillIds.includes(skill.id);
        });
    };

    const selectMainSkill = (skill: Skill, slotType: 'active' | 'passive', slotIndex: number) => {
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
            const slotArray = slotType === 'active' ? newBuild.activeSlots : newBuild.passiveSlots;

            slotArray[slotIndex] = {
                mainSkill: skill,
                supportSkills: Array(5).fill(null)
            };

            return newBuild;
        });
        setIsSkillLibraryOpen(false);
    };

    const selectSupportSkill = (supportSkill: Skill, slotType: 'active' | 'passive', slotIndex: number, supportIndex: number) => {
        // 检查当前技能槽内是否已存在相同的辅助技能
        const currentSlot = skillBuild[slotType === 'active' ? 'activeSlots' : 'passiveSlots'][slotIndex];
        const isDuplicateInSameSlot = currentSlot.supportSkills.some((skill, index) =>
            index !== supportIndex && skill?.id === supportSkill.id
        );

        if (isDuplicateInSameSlot) {
            alert(`辅助技能 "${supportSkill.name}" 已经安装在该技能栏位中，同一个辅助技能不能重复安装。`);
            return;
        }

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

    const clearSkillSlot = (slotType: 'active' | 'passive', slotIndex: number) => {
        setSkillBuild(prev => {
            const newBuild = { ...prev };
            const slotArray = slotType === 'active' ? newBuild.activeSlots : newBuild.passiveSlots;

            slotArray[slotIndex] = {
                mainSkill: null,
                supportSkills: Array(5).fill(null)
            };

            return newBuild;
        });
    };

    const openSkillLibrary = (skillType: 'active' | 'passive', slotIndex: number) => {
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
                                            {slot.mainSkill.icon ? (
                                                slot.mainSkill.icon.startsWith('http') ? (
                                                    <img
                                                        src={slot.mainSkill.icon}
                                                        alt={slot.mainSkill.name}
                                                        className="w-6 h-6 object-cover rounded"
                                                    />
                                                ) : (
                                                    <span className="text-xl">{slot.mainSkill.icon}</span>
                                                )
                                            ) : (
                                                <span className="text-xl">❓</span>
                                            )}
                                            <div className="flex-1">
                                                <div className="font-semibold text-orange-300 text-sm">{slot.mainSkill.name}</div>
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
                                                            {supportSkill.icon ? (
                                                                supportSkill.icon.startsWith('http') ? (
                                                                    <img
                                                                        src={supportSkill.icon}
                                                                        alt={supportSkill.name}
                                                                        className="w-5 h-5 object-cover rounded"
                                                                    />
                                                                ) : (
                                                                    <span className="text-lg">{supportSkill.icon}</span>
                                                                )
                                                            ) : (
                                                                <span className="text-lg">❓</span>
                                                            )}
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium text-gray-300">{supportSkill.name}</div>
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
                                                {slot.mainSkill.icon ? (
                                                    slot.mainSkill.icon.startsWith('http') ? (
                                                        <img
                                                            src={slot.mainSkill.icon}
                                                            alt={slot.mainSkill.name}
                                                            className="w-6 h-6 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <span className="text-xl">{slot.mainSkill.icon}</span>
                                                    )
                                                ) : (
                                                    <span className="text-xl">❓</span>
                                                )}
                                                <div className="flex-1">
                                                    <div className={`font-semibold text-sm ${
                                                        isDuplicate ? 'text-red-300' : 'text-blue-300'
                                                    }`}>
                                                        {slot.mainSkill.name}
                                                    </div>
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
                    activeSkills={activeSkills}
                    passiveSkills={passiveSkills}
                    supportSkills={supportSkills}
                    selectedSupportSlot={selectedSupportSlot}
                    selectedSkillType={selectedSkillType}
                    onSelectMainSkill={selectMainSkill}
                    onSelectSupportSkill={selectSupportSkill}
                    onClose={() => {
                        setIsSkillLibraryOpen(false);
                        setSelectedSupportSlot(null);
                    }}
                    selectedSlotIndex={selectedSlotIndex}
                    getAvailableSkills={getAvailableSkills}
                    getAvailableSupportSkills={() => {
                        if (selectedSupportSlot) {
                            return getAvailableSupportSkills(selectedSupportSlot.slotType, selectedSupportSlot.slotIndex);
                        }
                        return supportSkills;
                    }}
                />
            )}
        </div>
    );
}