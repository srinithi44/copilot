import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
    BookOpen,
    Plus,
    MoreVertical,
    Code,
    Sigma,
    LineChart,
    ExternalLink,
    Search,
    ChevronDown,
    Brain,
    Calendar,
    CheckCircle
} from 'lucide-react';

const Syllabus = () => {
    const navigate = useNavigate();
    const subjects = [
        {
            id: 1,
            title: "Advanced Java Programming",
            code: "CS201 • Fall 2023",
            progress: 75,
            icon: Code,
            color: "text-orange-500",
            bg: "bg-orange-50",
            tasks: "12/16 Tasks",
            aiFeedback: "You're doing great in OOP concepts! Focus more on HashMaps."
        },
        {
            id: 2,
            title: "Linear Algebra",
            code: "MATH302 • Semester 2",
            progress: 42,
            icon: Sigma,
            color: "text-blue-500",
            bg: "bg-blue-50",
            tasks: "5/12 Tasks",
            aiFeedback: "Need help with Eigenvectors? I've prepared some practice problems."
        },
        {
            id: 3,
            title: "Macroeconomics",
            code: "ECON101 • Core",
            progress: 65,
            icon: LineChart,
            color: "text-amber-500",
            bg: "bg-amber-50",
            tasks: "8/12 Tasks",
            aiFeedback: "Your recent quiz on Supply/Demand was excellent (95%)."
        },
    ];

    const milestones = [
        { id: 1, title: "Course Onboarding", date: "SEP 15", completed: true },
        { id: 2, title: "Midterm Assessment", date: "OCT 23", completed: false },
        { id: 3, title: "Project Submission", date: "NOV 12", completed: false },
        { id: 4, title: "Final Examination", date: "DEC 18", completed: false },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 font-['Times_New_Roman',_serif] pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Subjects</h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">Manage your active courses and tracks.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-slate-50">
                            <span className="text-xs font-bold text-slate-900">All Subjects</span>
                            <ChevronDown size={14} className="text-slate-400" />
                        </div>
                        <button
                            onClick={() => navigate('/study-plan')}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                            <Plus size={16} /> Add New Subject
                        </button>
                    </div>
                </div>

                {/* Subjects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((sub) => (
                        <div key={sub.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 group hover:shadow-lg hover:border-orange-100 transition-all cursor-pointer">
                            <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 rounded-2xl ${sub.bg} ${sub.color} flex items-center justify-center`}>
                                    <sub.icon size={24} />
                                </div>
                                <button className="text-slate-300 hover:text-slate-900 transition-colors"><MoreVertical size={18} /></button>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{sub.title}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub.code}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-400 uppercase">Mastery Progress</span>
                                    <span className="text-slate-900">{sub.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div className={`h-full ${sub.progress > 70 ? 'bg-green-500' : 'bg-orange-400'} rounded-full`} style={{ width: `${sub.progress}%` }}></div>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
                                    <span>{sub.tasks}</span>
                                    <span className="flex items-center gap-1"><Calendar size={10} /> Next: Mon</span>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl flex gap-3">
                                <div className="text-orange-500 shrink-0 mt-0.5"><Brain size={16} /></div>
                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                                    "{sub.aiFeedback}"
                                </p>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    onClick={() => navigate('/syllabus')}
                                    className="flex-1 py-2.5 bg-slate-50 text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors"
                                >
                                    View Syllabus
                                </button>
                                <button
                                    onClick={() => navigate('/study-plan')}
                                    className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Learning Milestones */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 text-lg mb-8 italic">Learning Milestones</h3>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-50"></div>

                        <div className="flex flex-wrap md:flex-nowrap justify-between items-start relative z-10 px-0 gap-y-8">
                            {milestones.map((ms, i) => (
                                <div
                                    key={ms.id}
                                    onClick={() => navigate('/calendar')}
                                    className="flex flex-col items-center gap-4 text-center group cursor-pointer"
                                >
                                    <div className={`w-8 h-8 rounded-full border-2 ${ms.completed ? 'bg-primary border-primary' : 'bg-white border-slate-100'} flex items-center justify-center transition-all group-hover:scale-110`}>
                                        {ms.completed ? <CheckCircle size={16} className="text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>}
                                    </div>
                                    <div>
                                        <h4 className={`text-[11px] font-bold ${ms.completed ? 'text-slate-900' : 'text-slate-400'} uppercase transition-colors`}>{ms.title}</h4>
                                        <span className="text-[10px] font-bold text-slate-300 mt-1">{ms.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Syllabus;
