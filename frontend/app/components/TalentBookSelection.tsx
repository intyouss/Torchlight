import { TalentBook } from '../type';
import Modal from './UI/Modal';

interface TalentBookSelectionProps {
    isOpen: boolean;
    talentBooks: TalentBook[];
    onSelectBook: (book: TalentBook) => void;
    onClose: () => void;
}

export default function TalentBookSelection({ isOpen, talentBooks, onSelectBook, onClose }: TalentBookSelectionProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="选择六神天赋" size="xl">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {talentBooks.map(book => (
                    <button
                        key={book.id}
                        onClick={() => onSelectBook(book)}
                        className="p-4 rounded-lg border-2 border-gray-600 bg-gray-700/50 hover:border-purple-400/50 transition-all text-left"
                    >
                        <div className="text-3xl mb-2">{book.icon}</div>
                        <div className="font-semibold text-purple-300">{book.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{book.description}</div>
                        <div className="text-xs text-gray-500 mt-2">{book.pages.length} 个天赋页</div>
                    </button>
                ))}
            </div>
        </Modal>
    );
}