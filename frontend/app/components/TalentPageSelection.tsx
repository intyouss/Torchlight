import { TalentBook, TalentPage } from '../type';
import Modal from './UI/Modal';

interface TalentPageSelectionProps {
    isOpen: boolean;
    selectedBook: TalentBook | null;
    selectedPages: TalentPage[];
    onSelectPage: (page: TalentPage) => void;
    onClose: () => void;
}

export default function TalentPageSelection({
                                                isOpen,
                                                selectedBook,
                                                selectedPages,
                                                onSelectPage,
                                                onClose
                                            }: TalentPageSelectionProps) {
    if (!selectedBook) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`选择天赋页 - ${selectedBook.name}`} size="xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedBook.pages.map(page => (
                    <button
                        key={page.id}
                        onClick={() => onSelectPage(page)}
                        disabled={selectedPages.some(selected => selected.id === page.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                            selectedPages.some(selected => selected.id === page.id)
                                ? 'border-gray-500 bg-gray-600/50 cursor-not-allowed opacity-50'
                                : 'border-gray-600 bg-gray-700/50 hover:border-purple-400/50'
                        }`}
                    >
                        <div className="text-2xl mb-2">{page.icon}</div>
                        <div className="font-semibold text-purple-300">{page.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{page.description}</div>
                        {selectedPages.some(selected => selected.id === page.id) && (
                            <div className="text-xs text-red-400 mt-2">已选择</div>
                        )}
                    </button>
                ))}
            </div>
        </Modal>
    );
}