import React from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const PremiumLock = ({ children, isLocked = true, title = "Premium Feature", message = "Upgrade to Premium to unlock this feature." }) => {
    const { currentUser } = useAuth();

    // If user is premium, super_admin, or feature is not locked, render children normally
    if (currentUser?.isPremium || currentUser?.role === 'super_admin' || !isLocked) {
        return children;
    }

    return (
        <div className="relative overflow-hidden group rounded-xl">
            {/* Blurred Content */}
            <div className="filter blur-sm pointer-events-none select-none opacity-60 grayscale scale-[1.02]">
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-primary-500/30 text-center shadow-2xl max-w-sm w-full"
                >
                    <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 border border-primary-100 dark:border-primary-800">
                        <Lock size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">{title}</h3>
                    <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
                        {message}
                    </p>
                    <Link
                        to="/pricing"
                        className="block w-full py-3 px-4 bg-gradient-to-r from-primary-50 to-primary-600 text-[#1A1A1A] font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
                    >
                        Upgrade to Unlock
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default PremiumLock;
