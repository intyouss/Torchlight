import { Skill } from '../type';

interface SkillLibraryProps {
    skills: Skill[];
    selectedSupportSlot: {
        slotType: 'active' | 'passive';
        slotIndex: number;
        supportIndex: number;
    } | null;
    selectedSkillType: 'active' | 'passive' | 'trigger';
    selectedSlotIndex: number | null;
    onSelectMainSkill: (skill: Skill, slotType: 'active' | 'passive' | 'trigger', slotIndex: number) => void;
    onSelectSupportSkill: (supportSkill: Skill, slotType: 'active' | 'passive', slotIndex: number, supportIndex: number) => void;
    onClose: () => void;
}

export default function SkillLibrary({
                                         skills,
                                         selectedSupportSlot,
                                         selectedSkillType,
                                         selectedSlotIndex,
                                         onSelectMainSkill,
                                         onSelectSupportSkill,
                                         onClose
                                     }: SkillLibraryProps) {
    const filteredSkills = skills.filter(skill =>
        selectedSupportSlot ? skill.type === 'support' : skill.type === selectedSkillType
    );

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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-orange-500/20 p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-orange-400 mb-4">
                    {selectedSupportSlot ? '选择辅助技能' : `选择${selectedSkillType === 'active' ? '主动' : '被动'}技能`}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredSkills.map(skill => (
                        <button
                            key={skill.id}
                            onClick={() => handleSkillSelect(skill)}
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
                    onClick={onClose}
                    className="w-full mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                    取消
                </button>
            </div>
        </div>
    );
}