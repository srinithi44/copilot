import React, { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
    CheckCircle,
    Circle,
    Clock,
    AlertCircle,
    Plus,
    Search,
    MoreVertical,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Tasks = () => {
    const [tasks, setTasks] = useState([
        { id: 1, title: "Review Java Collection Framework", subject: "Advanced Java", priority: "high", due: "Today, 5:00 PM", completed: false },
        { id: 2, title: "Practice Linear Algebra Problems", subject: "Math", priority: "medium", due: "Tomorrow", completed: false },
        { id: 3, title: "Read Macroeconomics Chapter 4", subject: "Economics", priority: "low", due: "Oct 28", completed: true },
    ]);

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-50';
            case 'medium': return 'text-amber-500 bg-amber-50';
            case 'low': return 'text-blue-500 bg-blue-50';
            default: return 'text-slate-500 bg-slate-50';
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 font-['Times_New_Roman',_serif] pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Study Tasks</h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">Manage and track your academic micro-goals.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95">
                        <Plus size={18} /> Add New Task
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 p-1 bg-slate-100/40 backdrop-blur-sm rounded-xl">
                        {['All', 'Active', 'Completed'].map((tab) => (
                            <button key={tab} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'All' ? 'bg-white text-primary shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]' : 'text-slate-500 hover:text-slate-700'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find a task..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {/* Task List */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {tasks.map((task) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -2, scale: 1.01 }}
                                className={`p-5 rounded-2xl ${task.completed ? 'bg-white/40 opacity-60 border border-slate-200/50' : 'glass-premium'} flex items-center gap-4 group transition-all cursor-pointer`}
                                onClick={() => toggleTask(task.id)}
                            >
                                <button className={`transition-colors ${task.completed ? 'text-green-500' : 'text-slate-300 group-hover:text-primary'}`}>
                                    {task.completed ? <CheckCircle size={22} fill="currentColor" className="text-white fill-green-500" /> : <Circle size={22} />}
                                </button>

                                <div className="flex-1">
                                    <h3 className={`font-bold text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{task.subject}</span>
                                        <span className="text-[10px] text-slate-300">•</span>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                            <Calendar size={10} /> {task.due}
                                        </div>
                                    </div>
                                </div>

                                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </div>

                                <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors opacity-0 group-hover:opacity-100">
                                    <MoreVertical size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Tasks;
