import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
    X,
    LayoutDashboard,
    Calendar,
    MessageSquare,
    FileText,
    PieChart,
    Settings,
    LogOut,
    Sparkles,
    CreditCard,
    Users,
    Mic
} from 'lucide-react';

const SlideMenu = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Home', path: '/' },
        { icon: Calendar, label: 'Study Plan', path: '/study-plan' },
        { icon: MessageSquare, label: 'AI Chat', path: '/ask-doubt' },
        { icon: FileText, label: 'Mock Test', path: '/mock-test' },
        { icon: Sparkles, label: 'Generate Quiz', path: '/generate-quiz' },
        { icon: CreditCard, label: 'Flashcards', path: '/flashcards' },
        { icon: Calendar, label: 'Study Calendar', path: '/calendar' },
        { icon: Users, label: 'Community', path: '/community' },
        { icon: Mic, label: 'Voice Assistant', path: '/ask-doubt' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-[280px] max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col p-6"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-yellow-500 text-white flex items-center justify-center">
                                    <Sparkles size={18} />
                                </div>
                                <span className="font-bold text-lg dark:text-white">Menu</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Nav Items */}
                        <nav className="flex-1 space-y-2">
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) => `
                                        flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium
                                        ${isActive
                                            ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }
                                    `}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Footer */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
                            >
                                <LogOut size={20} />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SlideMenu;
