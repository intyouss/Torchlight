import { Hero } from '../type';
import { Users } from 'lucide-react';

interface HeroSelectionProps {
    heroes: Hero[];
    selectedHero: string;
    onHeroChange: (heroId: string) => void;
}

export default function HeroSelection({ heroes, selectedHero, onHeroChange }: HeroSelectionProps) {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
            <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                <Users className="mr-2" /> 英雄选择
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {heroes.map(hero => (
                    <button
                        key={hero.id}
                        onClick={() => onHeroChange(hero.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                            selectedHero === hero.id
                                ? 'border-orange-500 bg-orange-500/10'
                                : 'border-gray-600 bg-gray-700/50 hover:border-orange-400/50'
                        }`}
                    >
                        <div className="flex flex-col h-full"> {/* 外层容器设置固定高度 */}
                            <div className="flex items-center justify-center h-20 flex-shrink-0"> {/* 固定高度且不收缩 */}
                                {hero.icon ? (
                                    hero.icon.startsWith('http') ? (
                                        <img
                                            src={hero.icon}
                                            alt={hero.name}
                                            className="w-16 h-16 object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <span className="text-5xl">{hero.icon}</span>
                                    )
                                ) : (
                                    <span className="text-5xl">❓</span>
                                )}
                            </div>
                            <div className="text-center pt-2">
                                <div className="font-semibold text-sm">{hero.name}</div>
                                <div className="text-xs text-gray-400 mt-1">{hero.desc}</div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}