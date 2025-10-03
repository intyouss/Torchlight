import { EquipmentStats } from '../type';
import { Shield } from 'lucide-react';

interface EquipmentConfigurationProps {
    equipment: EquipmentStats;
    onEquipmentChange: (equipment: EquipmentStats) => void;
}

export default function EquipmentConfiguration({ equipment, onEquipmentChange }: EquipmentConfigurationProps) {
    const handleEquipmentChange = (field: keyof EquipmentStats, value: any) => {
        onEquipmentChange({
            ...equipment,
            [field]: value
        });
    };

    const handleWeaponDamageChange = (field: 'min' | 'max', value: string) => {
        const numValue = parseInt(value) || 0;
        onEquipmentChange({
            ...equipment,
            weaponDamage: {
                ...equipment.weaponDamage,
                [field]: numValue
            }
        });
    };

    const handleElementalDamageChange = (element: keyof NonNullable<EquipmentStats['elementalDamage']>, value: string) => {
        const numValue = parseInt(value) || 0;
        onEquipmentChange({
            ...equipment,
            elementalDamage: {
                ...(equipment.elementalDamage || { fire: 0, lightning: 0, cold: 0, poison: 0 }),
                [element]: numValue
            }
        });
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
            <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                <Shield className="mr-2"/> 装备配置
            </h2>
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
        </div>
    );
}