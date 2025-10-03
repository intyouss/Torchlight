import { useState, useEffect } from 'react';
import { TalentBuild, TalentBook, TalentPage } from '../type';
import { Star } from 'lucide-react';
import { apiService } from '../lib/api';
import TalentBookSelection from './TalentBookSelection';
import TalentPageSelection from './TalentPageSelection';
import TalentTreeModal from './TalentTreeModal';
import TalentOverview from './TalentOverview';

export default function TalentSystem() {
    const [talentBuild, setTalentBuild] = useState<TalentBuild>({
        selectedPages: [],
        isComplete: false
    });
    const [talentBooks, setTalentBooks] = useState<TalentBook[]>([]);
    const [selectedBook, setSelectedBook] = useState<TalentBook | null>(null);
    const [isBookSelectionOpen, setIsBookSelectionOpen] = useState(false);
    const [isPageSelectionOpen, setIsPageSelectionOpen] = useState(false);
    const [selectedTalentPage, setSelectedTalentPage] = useState<TalentPage | null>(null);
    const [isTalentTreeOpen, setIsTalentTreeOpen] = useState(false);

    useEffect(() => {
        const fetchTalentBooks = async () => {
            const books = await apiService.getTalentBooks();
            setTalentBooks(books);
        };
        fetchTalentBooks();
    }, []);

    const openBookSelection = () => {
        setIsBookSelectionOpen(true);
    };

    const selectBook = (book: TalentBook) => {
        setSelectedBook(book);
        setIsBookSelectionOpen(false);
        setIsPageSelectionOpen(true);
    };

    const selectTalentPage = (talentPage: TalentPage) => {
        if (talentBuild.selectedPages.length >= 4) {
            alert('最多只能选择4个天赋页');
            return;
        }

        setTalentBuild(prev => {
            const newSelectedPages = [...prev.selectedPages, talentPage];
            return {
                selectedPages: newSelectedPages,
                isComplete: newSelectedPages.length === 4
            };
        });

        setIsPageSelectionOpen(false);
        setSelectedBook(null);
    };

    const removeTalentPage = (pageId: string) => {
        setTalentBuild(prev => ({
            selectedPages: prev.selectedPages.filter(page => page.id !== pageId),
            isComplete: false
        }));
    };

    const resetTalentBuild = () => {
        setTalentBuild({
            selectedPages: [],
            isComplete: false
        });
    };

    const openTalentTree = (talentPage: TalentPage) => {
        setSelectedTalentPage(talentPage);
        setIsTalentTreeOpen(true);
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
            <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                <Star className="mr-2" /> 天赋选择
            </h2>

            {talentBuild.isComplete ? (
                <TalentOverview
                    talentBuild={talentBuild}
                    onReset={resetTalentBuild}
                    onOpenTalentTree={openTalentTree}
                />
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-orange-300">选择天赋页</h3>
                        <div className="text-sm text-gray-400">
                            已选择: {talentBuild.selectedPages.length}/4
                        </div>
                    </div>

                    <button
                        onClick={openBookSelection}
                        className="w-full p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-400/50 transition-colors text-gray-400 hover:text-gray-300 mb-4"
                    >
                        <div className="text-3xl mb-2">📚</div>
                        <div className="text-lg">选择六神天赋</div>
                    </button>

                    {talentBuild.selectedPages.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-300">已选择的天赋页:</div>
                            <div className="grid grid-cols-2 gap-2">
                                {talentBuild.selectedPages.map((page, index) => (
                                    <div key={page.id} className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">{page.icon}</span>
                                            <div>
                                                <div className="text-sm font-medium text-purple-300">{page.name}</div>
                                                <div className="text-xs text-gray-400">{page.description}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeTalentPage(page.id)}
                                            className="text-xs text-red-400 hover:text-red-300"
                                        >
                                            移除
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <TalentBookSelection
                isOpen={isBookSelectionOpen}
                talentBooks={talentBooks}
                onSelectBook={selectBook}
                onClose={() => setIsBookSelectionOpen(false)}
            />

            <TalentPageSelection
                isOpen={isPageSelectionOpen}
                selectedBook={selectedBook}
                selectedPages={talentBuild.selectedPages}
                onSelectPage={selectTalentPage}
                onClose={() => {
                    setIsPageSelectionOpen(false);
                    setSelectedBook(null);
                }}
            />

            <TalentTreeModal
                isOpen={isTalentTreeOpen}
                talentPage={selectedTalentPage}
                onClose={() => {
                    setIsTalentTreeOpen(false);
                    setSelectedTalentPage(null);
                }}
            />
        </div>
    );
}