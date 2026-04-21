import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MessageList({ messages, loading, onSuggestionClick }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    if (!messages.length) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-[#1A1A1A] mb-6 shadow-xl shadow-primary-500/20"
                >
                    <Sparkles size={32} />
                </motion.div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">How can I help you today?</h3>
                <p className="max-w-md mx-auto text-[var(--text-secondary)] mb-10 leading-relaxed">
                    I'm your AI study companion. Ask me about your syllabus, exam preparation, or difficult concepts.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                    <SuggestionCard text="Explain Quantum Physics simply" onClick={() => onSuggestionClick("Explain Quantum Physics simply")} />
                    <SuggestionCard text="Create a study schedule for finals" onClick={() => onSuggestionClick("Create a study schedule for finals")} />
                    <SuggestionCard text="What are the key themes in Hamlet?" onClick={() => onSuggestionClick("What are the key themes in Hamlet?")} />
                    <SuggestionCard text="Solve this calculus problem" onClick={() => onSuggestionClick("Solve this calculus problem")} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto w-full px-4 scroll-smooth">
            <div className="max-w-3xl mx-auto w-full py-6 space-y-6">
                {messages.map((msg, index) => (
                    <MessageBubble key={msg.id || index} message={msg} />
                ))}

                {loading && (
                    <div className="flex gap-4 p-4">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                            <Sparkles size={16} className="text-[var(--primary-color)] animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1 h-8">
                            <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} className="h-4" />
            </div>
        </div>
    );
}

function SuggestionCard({ text, onClick }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="group p-4 rounded-[var(--border-radius)] border border-[var(--border-color)] bg-[var(--surface-color)] hover:border-[var(--primary-color)] hover:bg-[var(--surface-hover)] text-left text-sm text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all duration-200 shadow-sm flex items-center justify-between"
        >
            <span>{text}</span>
            <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--primary-color)]" />
        </motion.button>
    );
}
