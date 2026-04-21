import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import Card from '../Card';

export default function DailyTracker() {
    // Mock Data - In real app, fetch from backend
    const [streak, setStreak] = useState(12);
    const [todayHours, setTodayHours] = useState(2.5);
    const [goalHours, setGoalHours] = useState(4);

    // Simple bar chart for weekly activity (CSS based)
    const weeklyData = [
        { day: 'M', hours: 3 },
        { day: 'T', hours: 5 },
        { day: 'W', hours: 2 },
        { day: 'T', hours: 4 },
        { day: 'F', hours: 6 },
        { day: 'S', hours: 1 },
        { day: 'S', hours: todayHours },
    ];
    const maxHours = Math.max(...weeklyData.map(d => d.hours), 6);

    return (
        <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">Daily Tracker</h3>
                    <p className="text-xs text-slate-500">Keep up the momentum!</p>
                </div>
                <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold text-sm">
                    <Flame size={16} fill="currentColor" />
                    <span>{streak} Day Streak</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase">Study Time</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{todayHours}h <span className="text-sm font-normal text-slate-400">/ {goalHours}h</span></p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                        <CheckCircle size={16} />
                        <span className="text-xs font-bold uppercase">Tasks Done</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">3 <span className="text-sm font-normal text-slate-400">/ 5</span></p>
                </div>
            </div>

            <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Weekly Activity</h4>
                <div className="flex justify-between items-end h-24 gap-2">
                    {weeklyData.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 w-full group">
                            <div className="relative w-full rounded-t-sm bg-slate-100 h-full flex items-end overflow-hidden">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(d.hours / maxHours) * 100}%` }}
                                    className={`w-full ${i === 6 ? 'bg-[var(--primary-color)]' : 'bg-slate-300 group-hover:bg-slate-400'}`}
                                />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
