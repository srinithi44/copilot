import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import StreakCard from '../components/Dashboard/StreakCard';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

const StreakDemo = () => {
    const { currentUser } = useAuth();
    const [streakData, setStreakData] = useState({
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch streak data from API
        const fetchStreakData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/study/analytics?userId=${currentUser?.uid}`);
                const data = await response.json();
                setStreakData({
                    currentStreak: data.currentStreak || 0,
                    longestStreak: data.longestStreak || 0,
                    lastStudyDate: data.lastStudyDate || null
                });
            } catch (error) {
                console.error('Failed to fetch streak data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.uid) {
            fetchStreakData();
        }
    }, [currentUser]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <p className="text-[var(--text-secondary)]">Loading streak data...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                        Your Study Streak 🔥
                    </h1>
                    <p className="text-[var(--text-secondary)]">
                        Keep your momentum going! Study daily to maintain your streak.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StreakCard
                        currentStreak={streakData.currentStreak}
                        longestStreak={streakData.longestStreak}
                        lastStudyDate={streakData.lastStudyDate}
                    />

                    <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                            Streak Tips 💡
                        </h3>
                        <ul className="space-y-3 text-[var(--text-secondary)]">
                            <li className="flex items-start gap-2">
                                <span className="text-primary-500 mt-1">✓</span>
                                <span>Study at least once per day to maintain your streak</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary-500 mt-1">✓</span>
                                <span>Enable notifications in Settings to get reminders</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary-500 mt-1">✓</span>
                                <span>Even 15 minutes of study counts toward your streak</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary-500 mt-1">✓</span>
                                <span>Longer streaks unlock special achievements</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-2xl border border-purple-500/20">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                        Want to get reminded?
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-4">
                        Set up email or SMS notifications to never miss a day!
                    </p>
                    <button
                        onClick={() => window.location.href = '/settings'}
                        className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Configure Notifications
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StreakDemo;
