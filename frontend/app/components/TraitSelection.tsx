import {Hero, HeroTrait, TraitSelection as TraitSelectionType} from '../type';
import { Star } from 'lucide-react';

interface TraitSelectionProps {
    hero: Hero;
    traitSelections: { [key: number]: string };
    onTraitSelection: (level: number, traitId: string) => void;
}

export default function TraitSelection({ hero, traitSelections, onTraitSelection }: TraitSelectionProps) {
    const getTraitSelectionsForHero = (hero: Hero): TraitSelectionType[] => {
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

    const getSelectedTraitIds = (): string[] => {
        return Object.values(traitSelections).filter(Boolean) as string[];
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
            <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                <Star className="mr-2"/> 英雄特性选择
            </h2>

            <div className="space-y-6">
                {getTraitSelectionsForHero(hero).map((selection) => (
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
                                    onClick={() => onTraitSelection(selection.level, trait.id)}
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
                                            <div className="font-semibold text-orange-300">{trait.name}</div>
                                            <div className="text-sm text-gray-400">
                                                {selection.availableTraits.length === 1 && trait.isDefault ? '默认特性' : '可选特性'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-300 mb-3">{trait.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {getSelectedTraitIds().length > 0 && (
                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="text-sm font-semibold text-orange-300 mb-2">已选择特性:</div>
                    <div className="space-y-2">
                        {getSelectedTraitIds().map(traitId => {
                            const trait = hero.traits.find(t => t.id === traitId);
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
    );
}