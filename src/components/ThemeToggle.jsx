import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative w-14 h-7 bg-slate-200 dark:bg-slate-700 rounded-full p-1 transition-colors duration-300"
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                className="w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow-md flex items-center justify-center"
                animate={{ x: isDark ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                {isDark ? (
                    <Moon size={12} className="text-blue-400" />
                ) : (
                    <Sun size={12} className="text-yellow-500" />
                )}
            </motion.div>
        </motion.button>
    );
}
