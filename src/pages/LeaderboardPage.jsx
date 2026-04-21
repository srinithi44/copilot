import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
    Trophy,
    Globe,
    MapPin,
    Crown,
    Medal,
    Star,
    Sparkles,
    ChevronUp,
    ChevronDown,
    Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

const LeaderboardPage = () => {
    const { currentUser } = useAuth();
    const [filter, setFilter] = useState('global');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLeaderboard();
    }, [filter]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const userId = currentUser?.uid;
            let query = `type=${filter}&uid=${encodeURIComponent(userId)}`;

            const res = await fetch(`${API_URL}/gamification/leaderboard?${query}`);
            const data = await res.json();

            if (res.ok) {
                setLeaderboardData(data.leaderboard || []);
                setUserRank(data.userRank);
            } else {
                // Mock data for demonstration if API fails
                setLeaderboardData([
                    { uid: '1', name: "Alex Johnson", rank: 1, points: 12450, level: "Dean's List", location: { state: "California" } },
                    { uid: '2', name: "Sarah Williams", rank: 2, points: 11200, level: "Honor Roll", location: { state: "New York" } },
                    { uid: '3', name: "Michael Chen", rank: 3, points: 10800, level: "Honor Roll", location: { state: "Ontario" } },
                    { uid: '4', name: "Emma Davice", rank: 4, points: 9500, level: "Scholar", location: { state: "London" } },
                    { uid: '5', name: "David Kim", rank: 5, points: 8200, level: "Scholar", location: { state: "Seoul" } },
                ]);
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center border-2 border-primary"><Crown className="text-primary" size={16} /></div>;
        if (rank === 2) return <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-300"><Medal className="text-slate-400" size={16} /></div>;
        if (rank === 3) return <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center border-2 border-orange-200"><Medal className="text-orange-400" size={16} /></div>;
        return <span className="text-slate-300 font-black text-sm w-8 text-center">{rank}</span>;
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 font-['Times_New_Roman',_serif] pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">
                            <Star size={10} fill="currentColor" /> Global Rankings
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 leading-tight">Academic Excellence<br />Leaderboard</h1>
                    </div>

                    <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
                        {[
                            { id: 'global', label: 'Global', icon: Globe },
                            { id: 'country', label: 'National', icon: Trophy },
                            { id: 'state', label: 'Local', icon: MapPin },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${filter === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-900'}`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Rankings Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-6">
                            <div className="flex items-center justify-between mb-8 px-4">
                                <h2 className="font-bold text-slate-900">Top Performers</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input type="text" placeholder="Search students..." className="pl-9 pr-4 py-1.5 bg-slate-50 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                {loading ? (
                                    <div className="py-20 text-center text-slate-400 font-medium">Fetching global rankings...</div>
                                ) : (
                                    leaderboardData.map((user, i) => (
                                        <motion.div
                                            key={user.uid}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`flex items-center gap-6 p-4 rounded-2xl transition-all group hover:bg-slate-50 ${currentUser?.uid === user.uid ? 'bg-primary/5 border border-primary/20 shadow-sm' : ''}`}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                {getRankIcon(user.rank)}
                                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-bold text-sm">
                                                    {user.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                        {user.name}
                                                        {currentUser?.uid === user.uid && <span className="text-[10px] px-2 py-0.5 bg-primary text-white rounded-full font-black">YOU</span>}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{user.level || "Dean's List"} • {user.location?.state || 'California'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-slate-900 text-sm">{user.points?.toLocaleString()} <span className="text-[10px] text-slate-400 uppercase tracking-tighter ml-1">Pts</span></div>
                                                <div className="flex items-center justify-end gap-1 mt-0.5 text-green-500">
                                                    <ChevronUp size={12} /> <span className="text-[9px] font-black">+2 spots</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Personal Rank & Cabinet */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/30 transition-colors"></div>

                            <div className="relative z-10 space-y-8 text-center">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Personal Standing</p>
                                    <div className="text-6xl font-bold">#{userRank?.rank || 12}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-6">
                                    <div>
                                        <div className="text-xl font-bold">{userRank?.points?.toLocaleString() || '18,240'}</div>
                                        <div className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-1">Total Points</div>
                                    </div>
                                    <div className="border-l border-white/10">
                                        <div className="text-xl font-bold">{userRank?.trophies?.length || 8}</div>
                                        <div className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-1">Achievements</div>
                                    </div>
                                </div>

                                <button className="w-full py-3 bg-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                    View Full History
                                </button>
                            </div>
                        </div>

                        {/* Recent Awards */}
                        <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 px-2">
                                <Sparkles size={16} className="text-primary" /> Recent Awards
                            </h3>

                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center border transition-all hover:scale-110 cursor-help ${i < 4 ? 'bg-blue-50 border-blue-100 text-primary' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                                        <Trophy size={18} fill={i < 4 ? "currentColor" : "none"} />
                                    </div>
                                ))}
                            </div>

                            <div className="px-2 pt-2">
                                <p className="text-[10px] font-bold text-slate-400 text-center leading-relaxed">
                                    Complete 2 more daily challenges to unlock the <span className="text-slate-900">"Master Strategist"</span> badge.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LeaderboardPage;
