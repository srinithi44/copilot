import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AILayout from '../components/Layout/AILayout';
import FlashcardViewer from '../components/Flashcard/FlashcardViewer';
import axios from 'axios';
import { Sparkles, Save, BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const GenerateFlashcards = () => {
    const { currentUser } = useAuth();
    const [topic, setTopic] = useState('');
    const [context, setContext] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedCards, setGeneratedCards] = useState([]);
    const [error, setError] = useState('');

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic) return;

        setIsGenerating(true);
        setError('');
        setGeneratedCards([]);

        try {
            const res = await axios.post(`${API_BASE_URL}/flashcards/generate`, {
                topic,
                context,
                amount: 8
            });
            setGeneratedCards(res.data.cards);
        } catch (err) {
            console.error(err);
            setError('Failed to generate flashcards. Try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveDeck = async () => {
        if (!generatedCards.length) return;
        try {
            await axios.post(`${API_BASE_URL}/flashcards/save`, {
                uid: currentUser.uid,
                topic,
                cards: generatedCards
            });
            alert('Deck saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save deck.');
        }
    };

    return (
        <AILayout>
            <div className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-8">

                {/* Left: Input Form */}
                <div className="w-full md:w-1/3 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl"
                    >
                        <div className="flex items-center gap-3 mb-4 text-orange-400">
                            <BookOpen size={24} />
                            <h2 className="text-xl font-bold text-white">Create Deck</h2>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Topic</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                    placeholder="e.g., Photosynthesis, React Hooks..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Context (Optional)</label>
                                <textarea
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition-colors h-32 resize-none"
                                    placeholder="Paste notes or text here to generate specific cards..."
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                            </button>
                        </form>

                        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
                    </motion.div>
                </div>

                {/* Right: Viewer */}
                <div className="w-full md:w-2/3">
                    {generatedCards.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-white">{topic}</h2>
                                <button
                                    onClick={handleSaveDeck}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    <Save size={18} /> Save Deck
                                </button>
                            </div>

                            <FlashcardViewer cards={generatedCards} />

                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/10 rounded-2xl min-h-[400px]">
                            <Sparkles size={48} className="mb-4 opacity-50" />
                            <p className="text-lg">Enter a topic to generate AI flashcards</p>
                        </div>
                    )}
                </div>

            </div>
        </AILayout>
    );
};

export default GenerateFlashcards;
