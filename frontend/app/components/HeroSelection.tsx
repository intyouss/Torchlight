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
                        <div className="text-2xl mb-1">{hero.icon}</div>
                        <div className="font-semibold text-sm">{hero.name}</div>
                        <div className="text-xs text-gray-400">{hero.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}