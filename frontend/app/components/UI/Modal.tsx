import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-0">
            <div className={`bg-gray-800 rounded-xl border border-orange-500/20 p-6 ${sizeClasses[size]} max-h-[80vh] overflow-y-auto`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-orange-400">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-300 text-lg"
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}