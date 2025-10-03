import { CharacterStats } from '../type';
import { Settings } from 'lucide-react';

interface StatsConfigurationProps {
    stats: CharacterStats;
    onStatChange: (stat: keyof CharacterStats, value: string) => void;
}

export default function StatsConfiguration({ stats, onStatChange }: StatsConfigurationProps) {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
            <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                <Settings className="mr-2"/> 属性配置
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.keys(stats) as Array<keyof CharacterStats>).map((stat) => (
                    <div key={stat} className="bg-gray-700/30 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                            {stat}
                        </label>
                        <input
                            type="number"
                            value={stats[stat]}
                            onChange={(e) => onStatChange(stat, e.target.value)}
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}