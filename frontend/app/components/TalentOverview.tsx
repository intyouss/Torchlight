import { TalentBuild, TalentPage } from '../type';
import { useState } from 'react';

interface TalentOverviewProps {
    talentBuild: TalentBuild;
    onReset: () => void;
    onOpenTalentTree: (talentPage: TalentPage) => void;
}

export default function TalentOverview({ talentBuild, onReset, onOpenTalentTree }: TalentOverviewProps) {
    const [talentPreview, setTalentPreview] = useState<{
        isVisible: boolean;
        position: { x: number; y: number };
        bonuses: any;
    }>({
        isVisible: false,
        position: { x: 0, y: 0 },
        bonuses: {},
    });

    const calculateTalentBonuses = (talentTree: any[]): any => {
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

        talentTree.forEach(node => {
            if (node.currentPoints > 0) {
                const description = node.description.toLowerCase();
                const points = node.currentPoints;

                if (description.includes('力量')) {
                    const match = description.match(/力量\s*\+?(\d+)/);
                    if (match && match[1]) {
                        bonuses.strength += parseInt(match[1]) * points;
                    }
                }
                if (description.includes('敏捷')) {
                    const match = description.match(/敏捷\s*\+?(\d+)/);
                    if (match && match[1]) {
                        bonuses.dexterity += parseInt(match[1]) * points;
                    }
                }
                if (description.includes('智力')) {
                    const match = description.match(/智力\s*\+?(\d+)/);
                    if (match && match[1]) {
                        bonuses.intelligence += parseInt(match[1]) * points;
                    }
                }
                if (description.includes('活力')) {
                    const match = description.match(/活力\s*\+?(\d+)/);
                    if (match && match[1]) {
                        bonuses.vitality += parseInt(match[1]) * points;
                    }
                }
                if (description.includes('物理伤害')) {
                    const match = description.match(/物理伤害\s*\+?(\d+)%/);
                    if (match && match[1]) {
                        bonuses.physicalDamage += parseInt(match[1]) * points;
                    }
                }
                if (description.includes('元素伤害')) {
                    const match = description.match(/元素伤害\s*\+?(\d+)%/);
                    if (match && match[1]) {
                        bonuses.elementalDamage += parseInt(match[1]) * points;
                    }
                }
                if (description.includes('暴击几率')) {
                    const match = description.match(/暴击几率\s*\+?(\d+)%/);
                    if (match && match[1]) {
                        bonuses.critChance += parseInt(match[1]) * points;
                    }
                }
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

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-orange-300">天赋总览</h3>
                <button
                    onClick={onReset}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                >
                    重新选择
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {talentBuild.selectedPages.map((talentPage, index) => {
                    const bonuses = calculateTalentBonuses(talentPage.talentTree || []);

                    return (
                        <button
                            key={talentPage.id}
                            onClick={() => onOpenTalentTree(talentPage)}
                            onMouseEnter={(e) => {
                                setTalentPreview({
                                    isVisible: true,
                                    position: { x: e.clientX + 10, y: e.clientY + 10 },
                                    bonuses: bonuses,
                                });
                            }}
                            onMouseMove={(e) => {
                                setTalentPreview(prev => ({
                                    ...prev,
                                    position: { x: e.clientX + 10, y: e.clientY + 10 },
                                }));
                            }}
                            onMouseLeave={() => {
                                setTalentPreview(prev => ({ ...prev, isVisible: false }));
                            }}
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
                        {Object.values(talentPreview.bonuses).every(value => value === 0) && (
                            <div className="text-gray-400 italic">未分配任何天赋点</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}