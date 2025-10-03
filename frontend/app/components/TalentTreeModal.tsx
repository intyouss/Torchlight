import { useState } from 'react';
import { TalentPage, TalentNode } from '../type';
import Modal from './UI/Modal';
import TalentNodeComponent from './TalentNode';

interface TalentTreeModalProps {
    isOpen: boolean;
    talentPage: TalentPage | null;
    onClose: () => void;
}

export default function TalentTreeModal({ isOpen, talentPage, onClose }: TalentTreeModalProps) {
    const [allocatedTalents, setAllocatedTalents] = useState<Set<string>>(new Set());
    const [currentTalentPage, setCurrentTalentPage] = useState<TalentPage | null>(talentPage);

    const getTotalAllocatedPoints = () => {
        if (!currentTalentPage) return 0;

        let total = 0;
        allocatedTalents.forEach(talentId => {
            const talent = currentTalentPage.talentTree.find(node => node.id === talentId);
            if (talent) {
                total += talent.currentPoints;
            }
        });
        return total;
    };

    const isColumnRequirementMet = (column: number) => {
        return getTotalAllocatedPoints() >= column;
    };

    const allocateTalent = (nodeId: string) => {
        if (!currentTalentPage?.talentTree) return;

        const node = currentTalentPage.talentTree.find(n => n.id === nodeId);
        if (!node || node.currentPoints >= node.maxPoints) return;

        const isFirstPointInNode = node.currentPoints === 0;

        setAllocatedTalents(prev => {
            const newAllocated = new Set(prev);
            newAllocated.add(nodeId);
            return newAllocated;
        });

        setCurrentTalentPage(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                talentTree: prev.talentTree.map(n => {
                    if (n.id === nodeId) {
                        if (isFirstPointInNode && ['medium', 'legendary'].includes(n.type)) {
                            autoMaxConnectedNodes(n);
                        }
                        return { ...n, currentPoints: n.currentPoints + 1 };
                    }
                    return n;
                })
            };
        });
    };

    const areAllConnectedNodesMaxed = (node: TalentNode): boolean => {
        if (!node.connections || node.connections.length === 0) {
            return true;
        }

        const validConnections = node.connections.filter(connId => {
            const connectedNode = currentTalentPage?.talentTree?.find(n => n.id === connId);
            return connectedNode && ['minor', 'medium'].includes(connectedNode.type);
        });

        if (validConnections.length === 0) {
            return true;
        }

        return validConnections.every(connId => {
            const connectedNode = currentTalentPage?.talentTree?.find(n => n.id === connId);
            return connectedNode && connectedNode.currentPoints >= connectedNode.maxPoints;
        });
    };

    const autoMaxConnectedNodes = (node: TalentNode) => {
        if (!node.connections || !currentTalentPage?.talentTree) return;

        node.connections.forEach(connId => {
            const connectedNode = currentTalentPage.talentTree.find(n => n.id === connId);
            if (connectedNode && ['minor', 'medium'].includes(connectedNode.type)) {
                if (connectedNode.currentPoints < connectedNode.maxPoints) {
                    setAllocatedTalents(prev => {
                        const newAllocated = new Set(prev);
                        newAllocated.add(connectedNode.id);
                        return newAllocated;
                    });

                    setCurrentTalentPage(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            talentTree: prev.talentTree.map(n =>
                                n.id === connectedNode.id
                                    ? { ...n, currentPoints: n.maxPoints }
                                    : n
                            )
                        };
                    });
                }
            }
        });
    };

    const resetTalentAllocation = () => {
        if (!currentTalentPage) return;

        const resetTree = currentTalentPage.talentTree.map(node => ({
            ...node,
            currentPoints: 0
        }));
        setAllocatedTalents(new Set());
        setCurrentTalentPage({ ...currentTalentPage, talentTree: resetTree });
    };

    if (!currentTalentPage) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={currentTalentPage.name} size="xl">
            <div className="space-y-4">
                <p className="text-gray-400 text-sm">{currentTalentPage.description}</p>

                <div className="relative bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                    {/* 列要求显示 */}
                    <div className="relative mb-2" style={{ width: '560px', height: '40px', margin: '0 auto' }}>
                        {[0, 3, 6, 9, 12, 15].map((requirement, index) => {
                            const columnWidth = 80;
                            const startX = 60;
                            const x = startX + (index * columnWidth);
                            const y = 20;

                            return (
                                <div
                                    key={index}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                                    style={{
                                        left: `${x}px`,
                                        top: `${y}px`,
                                        zIndex: 10
                                    }}
                                >
                                    <div className="absolute -top-4 w-0.5 h-3 bg-gradient-to-b from-transparent to-gray-500"></div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded-full border ${
                                        getTotalAllocatedPoints() >= requirement
                                            ? 'text-green-400 border-green-400 bg-green-400/10'
                                            : 'text-gray-400 border-gray-600 bg-gray-700/50'
                                    }`}>
                                        {requirement}
                                    </div>
                                    <div className="absolute -bottom-4 w-0.5 h-3 bg-gradient-to-t from-transparent to-gray-500"></div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 天赋树画布 */}
                    <div className="relative" style={{ width: '560px', height: '400px', margin: '0 auto' }}>
                        {currentTalentPage.talentTree?.map(node => (
                            <TalentNodeComponent
                                key={node.id}
                                node={node}
                                talentPage={currentTalentPage}
                                allocatedTalents={allocatedTalents}
                                isColumnRequirementMet={isColumnRequirementMet}
                                areAllConnectedNodesMaxed={areAllConnectedNodesMaxed}
                                onAllocateTalent={allocateTalent}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <button
                        onClick={resetTalentAllocation}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        重置
                    </button>

                    <div className="text-sm text-gray-300">
                        已分配点数: <span className="text-green-400 font-bold">{getTotalAllocatedPoints()}</span> / ∞
                    </div>
                </div>
            </div>
        </Modal>
    );
}