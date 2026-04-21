import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react';
import './StreakCard.css';

const StreakCard = ({ currentStreak, longestStreak, lastStudyDate }) => {
    const getStreakLevel = (streak) => {
        if (streak === 0) return { level: 'Beginner', color: '#94a3b8' };
        if (streak < 7) return { level: 'Getting Started', color: '#f59e0b' };
        if (streak < 30) return { level: 'On Fire', color: '#ef4444' };
        return { level: 'Legendary', color: '#8b5cf6' };
    };

    const getMotivationalMessage = (streak) => {
        if (streak === 0) return 'Ready to start your journey?';
        if (streak === 1) return 'One down, keep it going!';
        if (streak < 7) return 'Consistency is key!';
        if (streak < 30) return 'Unstoppable momentum!';
        return 'You\'re a learning machine!';
    };

    const isStreakAtRisk = () => {
        if (!lastStudyDate) return false;
        const lastDate = new Date(lastStudyDate);
        const today = new Date();
        lastDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 1;
    };

    const atRisk = isStreakAtRisk();
    const streakLevel = getStreakLevel(currentStreak);

    return (
        <motion.div
            className="streak-card-modern"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="streak-card-header">
                <div className="header-left">
                    <Flame className="header-icon" size={24} />
                    <div>
                        <h3 className="card-title">Study Streak</h3>
                        <p className="card-subtitle" style={{ color: streakLevel.color }}>
                            {streakLevel.level}
                        </p>
                    </div>
                </div>
                {atRisk && (
                    <motion.div
                        className="risk-pill"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                    >
                        ⚠️ At Risk
                    </motion.div>
                )}
            </div>

            {/* Main Streak Display */}
            <div className="streak-main-modern">
                <motion.div
                    className="streak-circle"
                    style={{ borderColor: streakLevel.color }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                >
                    <div className="streak-number-large">{currentStreak}</div>
                    <div className="streak-label-small">days</div>
                </motion.div>
                <p className="motivational-text">{getMotivationalMessage(currentStreak)}</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-modern">
                <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                        <Trophy size={20} style={{ color: '#8b5cf6' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label-modern">Best Streak</div>
                        <div className="stat-value-modern">{longestStreak} days</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                        <Calendar size={20} style={{ color: '#3b82f6' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label-modern">Last Study</div>
                        <div className="stat-value-modern">
                            {lastStudyDate
                                ? new Date(lastStudyDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : 'Never'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning Banner */}
            {atRisk && (
                <motion.div
                    className="warning-banner"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.3 }}
                >
                    <TrendingUp size={16} />
                    <span>Study today to keep your streak alive!</span>
                </motion.div>
            )}
        </motion.div>
    );
};

export default StreakCard;
