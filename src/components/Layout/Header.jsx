import React, { useState } from 'react';
import { 
    Bell, 
    User, 
    Sparkles, 
    Headphones, 
    GitBranch, 
    PieChart, 
    Calendar, 
    CheckCircle, 
    BookOpen, 
    BarChart3,
    Menu,
    X,
    Settings,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const userName = currentUser?.displayName?.split(' ')[0] || 'Scholar';

    const primaryNav = [
        { label: 'AI Assistant', path: '/ask-doubt', icon: <Sparkles size={16} /> },
        { label: 'Podcast', path: '/podcast', icon: <Headphones size={16} /> },
        { label: 'Flowchart', path: '/flowchart', icon: <GitBranch size={16} /> },
        { label: 'Analytics', path: '/analytics', icon: <PieChart size={16} /> },
    ];

    const secondaryNav = [
        { label: 'Study Plan', path: '/study-plan', icon: <Calendar size={16} /> },
        { label: 'Tasks', path: '/tasks', icon: <CheckCircle size={16} /> },
        { label: 'Subjects', path: '/subjects', icon: <BookOpen size={16} /> },
        { label: 'Progress', path: '/progress', icon: <BarChart3 size={16} /> },
    ];

    const NavItem = ({ item }) => {
        const isActive = location.pathname === item.path;
        return (
            <Link
                to={item.path}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-black transition-all relative ${
                    isActive 
                    ? 'text-primary bg-primary/5' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
                <span className={`${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary transition-colors'}`}>
                    {item.icon}
                </span>
                {item.label}
                {isActive && (
                    <motion.div 
                        layoutId="active-underline"
                        className="absolute bottom-[-14px] left-5 right-5 h-1 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                )}
            </Link>
        );
    };

    return (
        <header className="sticky top-0 w-full z-50 glass-premium border-b border-slate-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 sm:h-24 flex items-center justify-between gap-4 sm:gap-8 lg:gap-12">
                {/* Left: Logo */}
                <div className="flex items-center gap-3 cursor-pointer shrink-0 group" onClick={() => navigate('/dashboard')}>
                    <div className="w-11 h-11 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform">
                        <BookOpen size={24} />
                    </div>
                    <span className="font-black text-xl sm:text-2xl tracking-tighter text-slate-900 hidden sm:block">StudyPlan<span className="text-secondary">Copilot</span></span>
                </div>

                {/* Center: Navigation (Desktop) */}
                <nav className="hidden lg:flex items-center gap-3 bg-white/50 backdrop-blur-xl p-1.5 rounded-[24px] border border-slate-200/50 shadow-sm">
                    {/* Primary Group */}
                    <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200">
                        {primaryNav.map(item => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </div>
                    {/* Secondary Group */}
                    <div className="flex items-center gap-1.5 pl-1.5">
                        {secondaryNav.map(item => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </div>
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-6 shrink-0">
                    <div className="hidden md:flex items-center gap-3">
                        <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all relative border border-transparent">
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 p-2 pl-4 rounded-2xl border border-slate-200/60 hover:border-primary/50 transition-all bg-white/80 backdrop-blur-md shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-lg active:scale-95"
                        >
                            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center overflow-hidden border border-sky-100">
                                {currentUser?.photoURL ? (
                                    <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-secondary" />
                                )}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Scholar</p>
                                <p className="text-sm font-bold text-slate-900">{userName}</p>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-64 glass-premium rounded-[24px] shadow-2xl p-2 z-50 overflow-hidden"
                                >
                                    <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-50 mb-1 rounded-t-[18px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Connected Account</p>
                                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.email || 'user@college.edu'}</p>
                                    </div>
                                    <div className="p-1 space-y-1">
                                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all">
                                            <Settings size={18} className="text-slate-400" /> Account Settings
                                        </button>
                                        <button 
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                            <LogOut size={18} /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-t border-slate-100 overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 space-y-10">
                            <div>
                                <div className="flex items-center gap-2 mb-6 px-4">
                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Learning Features</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {primaryNav.map(item => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                                                location.pathname === item.path 
                                                ? 'bg-primary/5 text-primary border border-primary/10' 
                                                : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                                            }`}
                                        >
                                            <div className={`${location.pathname === item.path ? 'text-primary' : 'text-slate-400'}`}>
                                                {item.icon}
                                            </div>
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-6 px-4">
                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Study Management</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {secondaryNav.map(item => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                                                location.pathname === item.path 
                                                ? 'bg-primary/5 text-primary border border-primary/10' 
                                                : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                                            }`}
                                        >
                                            <div className={`${location.pathname === item.path ? 'text-primary' : 'text-slate-400'}`}>
                                                {item.icon}
                                            </div>
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
