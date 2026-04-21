import React, { useState } from 'react';
import { Menu, StickyNote } from 'lucide-react';
import SlideMenu from './SlideMenu';
import NotesPanel from '../Notes/NotesPanel';
import { motion, AnimatePresence } from 'framer-motion';

const AILayout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotesOpen, setIsNotesOpen] = useState(false);

    return (
        // Full screen container with the requested bold warm background
        <div className="min-h-screen w-full bg-gradient-to-br from-[#F5B300] to-[#F7C644] dark:from-slate-900 dark:to-slate-950 font-sans text-slate-900 dark:text-white relative overflow-x-hidden transition-colors duration-500">

            {/* Minimal Header */}
            <header className="fixed top-0 right-0 p-4 sm:p-6 z-30 flex gap-3">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsNotesOpen(!isNotesOpen)}
                    className={`w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-sm ${isNotesOpen ? 'bg-white text-orange-500' : 'bg-white/20 text-black/70 dark:text-white hover:bg-white/30'}`}
                    title="Smart Notes"
                >
                    <StickyNote size={20} />
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMenuOpen(true)}
                    className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-black/70 dark:text-white hover:bg-white/30 transition-all shadow-sm"
                >
                    <Menu size={20} />
                </motion.button>
            </header>

            {/* Main Content Area */}
            <main className="w-full h-full min-h-screen relative flex flex-col">
                {children}
            </main>

            {/* Slide Navigation */}
            <SlideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Smart Notes Panel */}
            <AnimatePresence>
                {isNotesOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed inset-0 z-50 pointer-events-none"
                    >
                        <div className="pointer-events-auto h-full w-full">
                            <NotesPanel isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AILayout;
