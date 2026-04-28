import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle,
    Clock,
    Zap,
    Flame,
    ChevronRight,
    Search,
    Mic,
    Paperclip,
    Send,
    Play,
    Sparkles,
    ArrowRight,
    BookOpen,
    PieChart
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [aiQuery, setAiQuery] = React.useState("");
    const userName = (currentUser?.name || currentUser?.displayName || 'User').split(' ')[0];

    const handleAskAI = () => {
        if (!aiQuery.trim()) return;
        navigate('/ask-doubt', { state: { initialQuery: aiQuery } });
    };

    const stats = [
        { label: "TODAY'S TASKS", value: "5", trend: "+2 today", icon: CheckCircle, color: "text-primary", bg: "bg-sky-50", path: "/tasks" },
        { label: "STUDY HOURS", value: "3.5", sub: "hrs", trend: "vs 4h goal", icon: Clock, color: "text-secondary", bg: "bg-sky-50", path: "/analytics" },
        { label: "PROD. SCORE", value: "87%", trend: "+4%", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50", path: "/analytics" },
        { label: "CURRENT STREAK", value: "12", sub: "days", trend: "Personal Best: 14", icon: Flame, color: "text-blue-600", bg: "bg-blue-50", path: "/leaderboard" },
    ];

    const tasks = [
        { id: 1, title: "Review Data Structure Algorithms", subject: "DSA BASICS", due: "DUE TODAY, 5:00 PM", status: "high" },
        { id: 2, title: "Draft Essay: History of the Internet", subject: "HISTORY 101", due: "TOMORROW", status: "medium" },
        { id: 3, title: "Practice Chemistry Quiz #4", subject: "CHEM 202", due: "OCT 25", status: "low" },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8 font-sans">
                {/* Greeting */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h1 className="text-3xl font-extrabold text-slate-900">Good Evening, {userName} 👋</h1>
                        <p className="text-slate-500 mt-2 text-sm font-medium leading-relaxed max-w-xl">
                            You are on track with your study goals. <span className="text-secondary font-black">85%</span> of your weekly targets are complete.
                        </p>
                    </div>
                    <div className="absolute right-[-5%] top-[-10%] w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
                </motion.div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => navigate(stat.path)}
                            className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 flex items-start gap-4 cursor-pointer hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner`}>
                                <stat.icon size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                                    {stat.sub && <span className="text-xs font-bold text-slate-400">{stat.sub}</span>}
                                </div>
                                <span className={`text-[10px] font-black mt-2 leading-none ${stat.trend.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Active Study Plans */}
                        <section>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Study Plans</h2>
                                <button
                                    onClick={() => navigate('/study-plan')}
                                    className="text-xs font-black text-secondary hover:text-primary transition-colors uppercase tracking-widest"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-8 right-8 flex items-center gap-2">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest">Active</span>
                                </div>
                                
                                <span className="inline-block px-3 py-1 bg-sky-50 text-secondary text-[10px] font-black rounded-lg uppercase tracking-widest border border-sky-100 mb-6">COMPUTER SCIENCE</span>

                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                    <div className="space-y-4 flex-1">
                                        <h3 className="text-2xl font-black text-slate-900 max-w-sm">Java Programming Masterclass</h3>
                                        <p className="text-sm text-slate-500 font-medium">Next: <span className="text-slate-900 font-bold">OOP Concepts & Inheritance</span></p>

                                        <div className="space-y-3 max-w-sm pt-4">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-slate-400">Course Progress</span>
                                                <span className="text-secondary">65%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                <div className="h-full gradient-bg rounded-full shadow-lg shadow-primary/20" style={{ width: '65%' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center md:items-end gap-3">
                                        <button
                                            onClick={() => navigate('/study-plan')}
                                            className="px-8 py-3 gradient-bg text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.05] hover:shadow-2xl transition-all flex items-center gap-2 active:scale-95"
                                        >
                                            Continue Learning
                                        </button>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">4 weeks left in track</span>
                                    </div>
                                </div>
                                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary/5 blur-3xl rounded-full" />
                            </div>
                        </section>

                        {/* Recent Tasks */}
                        <section>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Tasks</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate('/tasks')}
                                        className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary shadow-sm transition-all"
                                    >
                                        <Search size={18} />
                                    </button>
                                    <button
                                        onClick={() => navigate('/tasks')}
                                        className="p-2.5 gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.05] transition-all"
                                    >
                                        <Play size={18} fill="currentColor" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => navigate('/tasks')}
                                        className="p-5 flex items-center gap-5 group hover:bg-slate-50 transition-all cursor-pointer"
                                    >
                                        <div className="w-6 h-6 rounded-lg border-2 border-slate-200 group-hover:border-primary group-hover:bg-primary/5 transition-all flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-sm bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{task.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.subject}</span>
                                                <span className="text-[10px] font-bold text-slate-400">• {task.due}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                task.status === 'high' ? 'bg-rose-50 text-rose-500' : 
                                                task.status === 'medium' ? 'bg-amber-50 text-amber-500' : 
                                                'bg-sky-50 text-secondary'
                                            }`}>
                                                {task.status} priority
                                            </div>
                                            <ChevronRight size={18} className="text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* AI Assistant Widget */}
                        <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-secondary border border-sky-100 shadow-inner">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 tracking-tight">AI Assistant</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Online & Ready</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-[24px] rounded-tl-none italic text-sm text-slate-600 leading-relaxed font-medium border border-slate-100 relative z-10">
                                "{userName}! Want me to summarize your Java notes or create a quick quiz for tonight's session?"
                            </div>

                            <div className="relative z-10">
                                <textarea
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm text-slate-900 outline-none resize-none pt-4 pb-12 min-h-[120px] focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 font-medium"
                                />
                                <div className="absolute bottom-4 left-4 flex gap-3">
                                    <button className="text-slate-400 hover:text-secondary transition-colors"><Mic size={20} /></button>
                                    <button className="text-slate-400 hover:text-secondary transition-colors"><Paperclip size={20} /></button>
                                </div>
                                <button
                                    onClick={handleAskAI}
                                    className="absolute bottom-3 right-3 w-10 h-10 gradient-bg text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <div className="absolute -right-10 -top-10 w-48 h-48 bg-secondary/5 blur-3xl rounded-full" />
                        </div>

                        {/* Progress Chart Widget */}
                        <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div>
                                    <h3 className="font-black text-slate-900 tracking-tight">Weekly Progress</h3>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Study Activity</span>
                                </div>
                                <button
                                    onClick={() => navigate('/analytics')}
                                    className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:text-secondary hover:bg-white border border-slate-100 transition-all font-bold"
                                >
                                    <PieChart size={20} />
                                </button>
                            </div>

                            <div className="h-44 flex items-end justify-between gap-2 px-2 relative z-10">
                                {[3, 5, 4, 3, 6, 4, 2].map((height, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                        <div className="relative w-full">
                                            <div
                                                className={`w-full rounded-2xl transition-all duration-700 ${i === 4 ? 'gradient-bg shadow-xl shadow-primary/30' : 'bg-slate-50 group-hover:bg-sky-50 border border-slate-100 group-hover:border-sky-100'}`}
                                                style={{ height: `${height * 18}%` }}
                                            >
                                                {i === 4 && <div className="absolute -top-1 left-1.5 right-1.5 h-1 bg-white/40 blur-sm rounded-full" />}
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${i === 4 ? 'text-secondary font-black' : 'text-slate-400'}`}>
                                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
