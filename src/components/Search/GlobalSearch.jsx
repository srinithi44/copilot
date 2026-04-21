import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, FileText, BookOpen, Clock, Hash, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Mock Pages Navigation
    const pages = [
        { title: 'Dashboard', path: '/', type: 'Navigation', icon: Hash },
        { title: 'Study Tracker', path: '/study-tracker', type: 'Navigation', icon: Clock },
        { title: 'Mock Test', path: '/mock-test', type: 'Navigation', icon: FileText },
        { title: 'Ask Doubt', path: '/ask-doubt', type: 'Navigation', icon: Command },
        { title: 'Settings', path: '/settings', type: 'Navigation', icon: Command },
        { title: 'Quizzes', path: '/quizzes', type: 'Navigation', icon: BookOpen },
    ];

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filteredPages = pages.filter(p => p.title.toLowerCase().includes(lowerQuery));

        // In a real app, you would also filter active quizzes or documents here
        setResults([...filteredPages]);

    }, [query]);

    const handleSelect = (path) => {
        navigate(path);
        setIsOpen(false);
        setQuery("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[60vh]"
            >
                <div className="flex items-center px-4 py-4 border-b border-slate-100">
                    <Search className="text-slate-400 mr-3" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search pages, quizzes, documents..."
                        className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 placeholder-slate-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded">ESC</div>
                </div>

                <div className="overflow-y-auto flex-1 p-2">
                    {results.length > 0 ? (
                        <>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Navigation</div>
                            {results.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelect(result.path)}
                                    className="w-full text-left px-3 py-3 rounded-lg hover:bg-slate-100 flex items-center justify-between group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
                                            <result.icon size={18} />
                                        </div>
                                        <span className="font-medium text-slate-700 group-hover:text-slate-900">{result.title}</span>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </button>
                            ))}
                        </>
                    ) : query ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            No results found for "{query}"
                        </div>
                    ) : (
                        <div className="p-4">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Suggestions</div>
                            {pages.slice(0, 3).map((page, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelect(page.path)}
                                    className="block w-full text-left py-2 px-3 text-sm text-slate-600 hover:bg-slate-50 rounded-lg hover:text-[var(--primary-color)] transition-colors"
                                >
                                    {page.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                    <span>Search powered by Antigravity</span>
                    <div className="flex gap-2">
                        <span><kbd className="font-sans px-1 bg-white border rounded shadow-sm">↑</kbd> <kbd className="font-sans px-1 bg-white border rounded shadow-sm">↓</kbd> to navigate</span>
                        <span><kbd className="font-sans px-1 bg-white border rounded shadow-sm">↵</kbd> to select</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
