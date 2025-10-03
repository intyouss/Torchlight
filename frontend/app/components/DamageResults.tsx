import { DamageResult } from '../type';
import { Calculator, Loader2 } from 'lucide-react';

interface DamageResultsProps {
    damageResult: DamageResult | null;
    calculating: boolean;
    onCalculate: () => void;
    disabled: boolean;
}

export default function DamageResults({ damageResult, calculating, onCalculate, disabled }: DamageResultsProps) {
    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
                <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center justify-center">
                    <Calculator className="mr-2" /> 伤害计算结果
                </h2>

                {damageResult ? (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-4 border border-orange-500/30 text-center">
                            <div className="text-sm text-gray-300">总伤害</div>
                            <div className="text-3xl font-bold text-orange-400">
                                {damageResult.total.toLocaleString()}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                                <div className="text-sm text-gray-300">物理伤害</div>
                                <div className="text-xl font-semibold text-white">
                                    {damageResult.physical.toLocaleString()}
                                </div>
                            </div>

                            <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                                <div className="text-sm text-gray-300">元素伤害</div>
                                <div className="text-xl font-semibold text-blue-400">
                                    {damageResult.elemental.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                                <div className="text-sm text-gray-300">DPS (每秒伤害)</div>
                                <div className="text-2xl font-bold text-green-400">
                                    {damageResult.dps.toLocaleString()}
                                </div>
                            </div>

                            <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                                <div className="text-sm text-gray-300">暴击几率</div>
                                <div className="text-xl font-semibold text-yellow-400">
                                    {damageResult.critChance.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-400">
                        点击"计算伤害"按钮查看结果
                    </div>
                )}

                <div className="flex justify-center mt-4">
                    <button
                        onClick={onCalculate}
                        disabled={calculating || disabled}
                        className="w-full max-w-md py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
                    >
                        {calculating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                计算中...
                            </>
                        ) : (
                            '计算伤害'
                        )}
                    </button>
                </div>
            </div>

            {damageResult && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
                    <h3 className="text-lg font-bold text-orange-400 mb-3 text-center">伤害分布</h3>
                    <div className="space-y-3">
                        {Object.entries(damageResult.damageDistribution).map(([type, percentage]) => (
                            percentage > 0 && (
                                <div key={type}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300 capitalize">
                                            {type === 'physical' ? '物理' :
                                                type === 'fire' ? '火焰' :
                                                    type === 'lightning' ? '闪电' :
                                                        type === 'cold' ? '冰冷' : '毒素'}伤害
                                        </span>
                                        <span className="text-white">{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                type === 'physical' ? 'bg-gray-400' :
                                                    type === 'fire' ? 'bg-red-500' :
                                                        type === 'lightning' ? 'bg-yellow-400' :
                                                            type === 'cold' ? 'bg-blue-400' : 'bg-green-500'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}