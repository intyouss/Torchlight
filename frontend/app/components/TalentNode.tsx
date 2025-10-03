import { useState } from 'react';
import { TalentNode, TalentPage } from '../type';
import Tooltip from './UI/Tooltip';

interface TalentNodeProps {
    node: TalentNode;
    talentPage: TalentPage;
    allocatedTalents: Set<string>;
    isColumnRequirementMet: (column: number) => boolean;
    areAllConnectedNodesMaxed: (node: TalentNode) => boolean;
    onAllocateTalent: (nodeId: string) => void;
}

export default function TalentNodeComponent({
                                                node,
                                                talentPage,
                                                allocatedTalents,
                                                isColumnRequirementMet,
                                                areAllConnectedNodesMaxed,
                                                onAllocateTalent
                                            }: TalentNodeProps) {
    const [tooltip, setTooltip] = useState<{
        isVisible: boolean;
        position: { x: number; y: number };
    }>({
        isVisible: false,
        position: { x: 0, y: 0 },
    });

    const isAllocated = allocatedTalents.has(node.id);
    const canAllocate =
        (!node.requirements || node.requirements.every(req => allocatedTalents.has(req))) &&
        isColumnRequirementMet(node.columnRequirement) &&
        (['medium', 'legendary'].includes(node.type) ? areAllConnectedNodesMaxed(node) : true);

    const columnWidth = 80;
    const rowHeight = 80;
    const startX = 60;
    const startY = 60;

    const x = startX + (node.position.x * columnWidth);
    const y = startY + (node.position.y * rowHeight);

    const adjustedX = Math.max(20, Math.min(x, 540));
    const adjustedY = Math.max(20, Math.min(y, 380));

    const getTalentColor = () => {
        switch (node.type) {
            case 'minor':
                return isAllocated ? 'bg-blue-500 border-blue-400 shadow-blue-500/50' : 'bg-blue-600 border-blue-400';
            case 'medium':
                return isAllocated ? 'bg-purple-500 border-purple-400 shadow-purple-500/50' : 'bg-purple-600 border-purple-400';
            case 'legendary':
                return isAllocated ? 'bg-orange-500 border-orange-400 shadow-orange-500/50' : 'bg-orange-600 border-orange-400';
            default:
                return isAllocated ? 'bg-green-500 border-green-400 shadow-green-500/50' : 'bg-purple-600 border-purple-400';
        }
    };

    return (
        <div key={node.id}>
            {/* 连接线 */}
            {node.connections?.map(connectionId => {
                const targetNode = talentPage.talentTree.find(n => n.id === connectionId);
                if (!targetNode) return null;

                const targetX = startX + (targetNode.position.x * columnWidth);
                const targetY = startY + (targetNode.position.y * rowHeight);

                const adjustedTargetX = Math.max(20, Math.min(targetX, 540));
                const adjustedTargetY = Math.max(20, Math.min(targetY, 380));

                const isConnectionActive = isAllocated && allocatedTalents.has(connectionId);

                return (
                    <svg
                        key={`${node.id}-${connectionId}`}
                        className="absolute top-0 left-0 pointer-events-none"
                        style={{ width: '100%', height: '100%', zIndex: 1 }}
                    >
                        <line
                            x1={adjustedX}
                            y1={adjustedY}
                            x2={adjustedTargetX}
                            y2={adjustedTargetY}
                            stroke={isConnectionActive ? '#10B981' : '#4B5563'}
                            strokeWidth="2"
                            strokeDasharray={isConnectionActive ? 'none' : '4,4'}
                        />
                        {isConnectionActive && (
                            <>
                                <circle cx={adjustedX} cy={adjustedY} r="3" fill="#10B981" />
                                <circle cx={adjustedTargetX} cy={adjustedTargetY} r="3" fill="#10B981" />
                            </>
                        )}
                    </svg>
                );
            })}

            {/* 天赋节点 */}
            <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 cursor-default"
                style={{
                    left: `${adjustedX}px`,
                    top: `${adjustedY}px`,
                    zIndex: 9
                }}
                onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                        isVisible: true,
                        position: {
                            x: rect.right + 10,
                            y: rect.top
                        },
                    });
                }}
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip(prev => ({
                        ...prev,
                        position: {
                            x: rect.right + 10,
                            y: rect.top
                        },
                    }));
                }}
                onMouseLeave={() => {
                    setTooltip(prev => ({ ...prev, isVisible: false }));
                }}
            >
                <button
                    onClick={() => onAllocateTalent(node.id)}
                    disabled={!canAllocate && !isAllocated}
                    className={`absolute inset-0 rounded-full border-2 flex flex-col items-center justify-center transition-all shadow-lg ${
                        isAllocated
                            ? `${getTalentColor()} text-white scale-105`
                            : canAllocate
                                ? `${getTalentColor()} text-white hover:scale-110 hover:shadow-xl`
                                : 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                    }`}
                    style={{
                        zIndex: 10
                    }}
                >
                    <span className="text-lg">{node.icon}</span>
                    {isAllocated && (
                        <div className="text-xs font-bold mt-0.5">
                            {node.currentPoints}/{node.maxPoints}
                        </div>
                    )}
                </button>
            </div>

            <Tooltip
                isVisible={tooltip.isVisible}
                position={tooltip.position}
                title={node.name}
                subtitle={`${node.type === 'minor' ? '小型天赋' : node.type === 'medium' ? '中型天赋' : '传奇天赋'} · 最大点数: ${node.maxPoints}`}
                description={node.description}
                extraInfo={`列要求: ${node.columnRequirement}点`}
            />
        </div>
    );
}