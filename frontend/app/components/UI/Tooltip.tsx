interface TooltipProps {
    isVisible: boolean;
    position: { x: number; y: number };
    title: string;
    subtitle: string;
    description: string;
    extraInfo?: string;
}

export default function Tooltip({ isVisible, position, title, subtitle, description, extraInfo }: TooltipProps) {
    if (!isVisible) return null;

    return (
        <div
            className="fixed z-55 rounded-lg shadow-lg p-3 w-64 transform transition-all duration-200 ease-out animate-fade-in-up"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                background: 'linear-gradient(135deg, rgba(30, 20, 60, 0.98) 0%, rgba(15, 10, 30, 0.98) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.6)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(139, 92, 246, 0.3)',
            }}
        >
            <div className="mb-2">
                <h4 className="text-sm font-bold text-white">{title}</h4>
                <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>
            </div>
            <div className="text-xs text-gray-300 mb-2 leading-relaxed">{description}</div>
            {extraInfo && (
                <div className="mt-2 pt-2 border-t border-purple-900/50">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">列要求:</span>
                        <span className="text-blue-400">{extraInfo.replace('列要求: ', '')}</span>
                    </div>
                </div>
            )}
        </div>
    );
}