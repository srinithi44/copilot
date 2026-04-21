import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

export default function Leaderboard() {
    const { currentUser } = useAuth();
    const [leaders, setLeaders] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = API_BASE_URL;

    useEffect(() => {
        if (currentUser) fetchLeaderboard();
    }, [currentUser]);

    const fetchLeaderboard = async () => {
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${API_URL}/gamification/leaderboard?uid=${currentUser.uid}&type=global`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch leaderboard");

            const data = await res.json();

            if (Array.isArray(data)) {
                setLeaders(data);
            } else if (data && data.leaderboard) {
                setLeaders(data.leaderboard || []);
                setUserRank(data.userRank || null);
            } else {
                console.warn("Leaderboard format warning:", data);
                setLeaders([]);
            }
        } catch (e) {
            console.error("Leaderboard fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-sm text-slate-500">Loading ranks...</div>;

    // Ensure leaders is an array to prevent crash
    const finalLeaders = Array.isArray(leaders) ? [...leaders] : [];

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="text-yellow-500" size={20} fill="#EAB308" />;
        if (index === 1) return <Medal className="text-slate-400" size={20} fill="#94A3B8" />;
        if (index === 2) return <Award className="text-amber-700" size={20} fill="#B45309" />;
        return <span className="font-bold text-slate-500 w-5 text-center">{index + 1}</span>;
    };

    return (
        <div className="space-y-4">
            {finalLeaders.length === 0 && <div className="p-4 text-center text-sm text-slate-500">No data yet. Be the first!</div>}

            {finalLeaders.map((user, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-xl border
                        ${user.uid === currentUser?.uid ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' :
                            index === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-100'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 flex justify-center">
                            {getRankIcon(index)}
                        </div>
                        <div>
                            <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                {user.name || "Anonymous User"}
                                {user.uid === currentUser?.uid && <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full">YOU</span>}
                            </p>
                            <p className="text-xs text-slate-500">{user.level || "Beginner"} • {user.trophies?.length || 0} Trophies</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-[var(--primary-color)]">{user.points || 0}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Points</p>
                    </div>
                </motion.div>
            ))}

            {/* Show current user rank if not in top list */}
            {userRank && userRank.rank && !finalLeaders.find(l => l.uid === currentUser?.uid) && (
                <>
                    <div className="flex justify-center my-2">
                        <span className="h-1 w-1 bg-slate-300 rounded-full mx-1"></span>
                        <span className="h-1 w-1 bg-slate-300 rounded-full mx-1"></span>
                        <span className="h-1 w-1 bg-slate-300 rounded-full mx-1"></span>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 rounded-xl border bg-blue-50 border-blue-200 ring-1 ring-blue-300"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 flex justify-center font-bold text-slate-500">
                                #{userRank.rank}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                    {userRank.name || "You"} (You)
                                </p>
                                <p className="text-xs text-slate-500">{userRank.level || "Beginner"}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-[var(--primary-color)]">{userRank.points || 0}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Points</p>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
