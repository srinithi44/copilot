import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    BookOpen, 
    Clock, 
    CheckCircle2, 
    Sparkles, 
    TrendingUp, 
    MoreHorizontal,
    ChevronRight,
    Search,
    Bell,
    ArrowUpRight,
    Zap,
    Flame,
    Target,
    Layers,
    FileText,
    PlayCircle
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CentralizedDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    
    const userName = currentUser?.displayName?.split(' ')[0] || 'Nithish';

    // Mock Data for the centralized view
    const activeStudyPlan = {
        title: "Full-Stack Web Development Mastery",
        progress: 68,
        nextLesson: "OAuth2 Implementation with Node.js",
        timeLeft: "3 days until next milestone",
        category: "Computer Science"
    };

    const upcomingTasks = [
        { id: 1, title: "Review Graph Theory Notes", due: "Today, 4 PM", priority: "High", color: "rose" },
        { id: 2, title: "Complete SQL Practice Quiz", due: "Tomorrow", priority: "Medium", color: "amber" },
        { id: 3, title: "Submit Project Proposal", due: "Friday", priority: "Low", color: "sky" }
    ];

    const todayTimeline = [
        { time: "09:00 AM", event: "Morning Focus: Java Concurrency", type: "study", completed: true },
        { time: "01:30 PM", event: "AI Tutor: Solve DSA Logic Doubt", type: "ai-session", completed: false },
        { time: "05:00 PM", event: "Weekly Test Recap", type: "test", completed: false }
    ];

    const knowledgeGaps = [
        { topic: "Redux Thunk Middleware", confidence: 45, reason: "Missed 2 questions in last quiz" },
        { topic: "B-Tree Insertion", confidence: 60, reason: "Manual review requested" }
    ];

    const recentMaterials = [
        { title: "React Design Patterns.pdf", type: "PDF", date: "2h ago", icon: FileText },
        { title: "Algorithm Analysis Lecture", type: "Video", date: "Yesterday", icon: PlayCircle },
        { title: "System Design Cheatsheet", type: "Notes", date: "3 days ago", icon: Layers }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8 min-h-screen bg-[#FBFDFE]">
                
                {/* Search & Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
                    <div className="flex-1 max-w-2xl relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search your courses, materials, or ask AI..."
                            className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-primary hover:border-primary/20 transition-all shadow-sm relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="h-10 w-[1px] bg-slate-100 hidden md:block mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-none">{userName}</p>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Free Tier</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20">
                                {userName[0]}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Greeting & Quick Pulse */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    <div className="md:col-span-2 lg:col-span-3">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden"
                        >
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ready to excel, {userName}? 🚀</h1>
                                    <p className="text-slate-500 font-medium max-w-lg">
                                        You completed <span className="text-primary font-bold">4 lessons</span> yesterday. Your focus score is peak today at <span className="text-primary font-bold">92%</span>.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100/50 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                                            <Flame size={20} strokeWidth={3} />
                                        </div>
                                        <div className="leading-tight">
                                            <p className="text-xs font-black text-orange-400 uppercase tracking-widest">STREAK</p>
                                            <p className="text-xl font-black text-slate-900">12 Days</p>
                                        </div>
                                    </div>
                                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <Target size={20} />
                                        </div>
                                        <div className="leading-tight">
                                            <p className="text-xs font-black text-primary uppercase tracking-widest">RANK</p>
                                            <p className="text-xl font-black text-slate-900">Top 5%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute right-[-2%] top-[-10%] w-64 h-64 bg-primary/5 blur-[80px] rounded-full" />
                        </motion.div>
                    </div>
                </div>

                {/* Main Content Hub */}
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT Column (Longer) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* FEATURED: Active Study Plan */}
                        <section className="bg-white rounded-[36px] border border-slate-100 shadow-sm overflow-hidden group">
                            <div className="p-8 pb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                        <BookOpen size={20} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Learning Path</h2>
                                </div>
                                <button onClick={() => navigate('/study-plan')} className="text-[10px] font-black text-slate-400 hover:text-primary transition-all uppercase tracking-widest flex items-center gap-1 group/btn">
                                    View All Plans <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            
                            <div className="p-8 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50/50 rounded-[28px] p-6 border border-slate-100 group-hover:border-primary/20 transition-all">
                                    <div className="space-y-6">
                                        <div>
                                            <span className="text-[10px] font-black text-primary px-2 py-1 bg-primary/5 rounded-lg border border-primary/10 uppercase tracking-widest">{activeStudyPlan.category}</span>
                                            <h3 className="text-2xl font-black text-slate-900 mt-3 leading-tight group-hover:text-primary transition-colors">{activeStudyPlan.title}</h3>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-slate-400">Course Progress</span>
                                                <span className="text-primary">{activeStudyPlan.progress}%</span>
                                            </div>
                                            <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${activeStudyPlan.progress}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full" 
                                                />
                                            </div>
                                        </div>

                                        <p className="text-sm font-medium text-slate-500">
                                            Current: <span className="text-slate-900 font-bold">{activeStudyPlan.nextLesson}</span>
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="relative w-40 h-40 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white shadow-inner" />
                                                <motion.circle 
                                                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                                    strokeDasharray={440} 
                                                    initial={{ strokeDashoffset: 440 }}
                                                    animate={{ strokeDashoffset: 440 - (440 * activeStudyPlan.progress) / 100 }}
                                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                                    className="text-primary" 
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-black text-slate-900">{activeStudyPlan.progress}%</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Completed</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/study-plan')}
                                            className="w-full py-4 bg-primary text-white text-sm font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            Resume Learning <ArrowUpRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Recent Materials shelf */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <Layers size={18} className="text-slate-400" />
                                    Recent Materials
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {recentMaterials.map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        whileHover={{ y: -5 }}
                                        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            <item.icon size={20} />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 mt-4 group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.type}</span>
                                            <span className="text-[10px] font-bold text-slate-300">{item.date}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT Column (Sidebar style) */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Task Pulse */}
                        <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                    To-Do Pulse
                                </h3>
                                <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400"><MoreHorizontal size={18} /></button>
                            </div>
                            
                            <div className="space-y-3">
                                {upcomingTasks.map((task) => (
                                    <div key={task.id} className="group flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer">
                                        <div className={`w-1 h-8 rounded-full bg-${task.color}-400 group-hover:h-10 transition-all`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{task.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{task.due}</p>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-${task.color}-50 text-${task.color}-500 border border-${task.color}-100`}>
                                            {task.priority}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => navigate('/tasks')}
                                className="w-full py-3 border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Open Task Manager
                            </button>
                        </section>

                        {/* Today's Timeline */}
                        <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <Clock size={18} className="text-indigo-500" />
                                    Today's Timeline
                                </h3>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>

                            <div className="space-y-6 relative ml-2">
                                <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-slate-100" />
                                {todayTimeline.map((item, i) => (
                                    <div key={i} className="relative pl-6">
                                        <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full border-2 border-white ring-2 ${item.completed ? 'bg-emerald-500 ring-emerald-100' : 'bg-slate-200 ring-slate-50'}`} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.time}</p>
                                        <p className={`text-sm font-bold ${item.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.event}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* AI Insights Card */}
                        <section className="bg-gradient-to-br from-indigo-600 to-primary p-7 rounded-[32px] shadow-xl shadow-primary/20 text-white relative overflow-hidden group">
                           <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                                        <Sparkles size={20} className="text-white" />
                                    </div>
                                    <h3 className="font-bold tracking-tight">AI Learning Insights</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    {knowledgeGaps.map((gap, i) => (
                                        <div key={i} className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-xs font-black uppercase tracking-widest text-white/70">Focus Required</p>
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/20 text-rose-200 rounded-full">{gap.confidence}% Mastery</span>
                                            </div>
                                            <p className="text-sm font-bold mb-1">{gap.topic}</p>
                                            <p className="text-[10px] text-white/60 font-medium">💡 {gap.reason}</p>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => navigate('/ask-doubt')}
                                    className="w-full py-3 bg-white text-primary text-xs font-black rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group/ai"
                                >
                                    Review with AI Session <Zap size={14} className="fill-primary group-hover/ai:scale-125 transition-transform" />
                                </button>
                           </div>
                           
                           {/* Background decorative elements */}
                           <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
                           <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/10 blur-2xl rounded-full" />
                        </section>
                    </div>
                </div>

                {/* Bottom Stats & Trends */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-100">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Productivity</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-900">+18%</span>
                                <span className="text-[10px] font-bold text-emerald-500">vs last week</span>
                            </div>
                        </div>
                    </div>
                    {/* ... Add more mini stats here if needed */}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CentralizedDashboard;
