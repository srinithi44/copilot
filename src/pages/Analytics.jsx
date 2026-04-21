import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
    Clock,
    Zap,
    CheckCircle,
    Target,
    BarChart2,
    PieChart,
    TrendingUp,
    Download
} from 'lucide-react';

const Analytics = () => {
    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 font-['Times_New_Roman',_serif] pb-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Learning Analytics</h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">Insights from your past week of focused study.</p>
                    </div>
                    <button
                        onClick={() => alert('Exporting report as PDF...')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-100 text-slate-900 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <Download size={16} /> Export Report
                    </button>
                </div>

                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "TIME SPENT", value: "24.5h", trend: "+12%", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
                        { label: "MASTERY", value: "78%", trend: "+5%", icon: Target, color: "text-blue-500", bg: "bg-blue-50" },
                        { label: "TASKS", value: "42", trend: "+8", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
                        { label: "SCORE", value: "88", trend: "+2", icon: Zap, color: "text-primary", bg: "bg-primary/10" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{stat.trend}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                            <div className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Focus Intensity Chart */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Focus Intensity</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hours Focused vs. Time of Day</p>
                            </div>
                            <select className="text-xs font-bold text-slate-400 bg-slate-50 border-none rounded-lg px-2 py-1 outline-none">
                                <option>This Week</option>
                                <option>Last Week</option>
                            </select>
                        </div>

                        <div className="flex-1 h-[250px] relative mt-4">
                            {/* Mock Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between">
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <div key={i} className="w-full border-t border-slate-50 border-dashed"></div>
                                ))}
                            </div>

                            {/* Simple visualization bar chart */}
                            <div className="absolute inset-0 flex items-end justify-between px-4 pb-2">
                                {[...Array(24)].map((_, i) => {
                                    const intensity = i >= 8 && i <= 12 ? 60 + Math.random() * 30 :
                                        i >= 18 && i <= 22 ? 70 + Math.random() * 30 :
                                            Math.random() * 30;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                            <div
                                                className={`w-2.5 rounded-full transition-all duration-1000 ${intensity > 70 ? 'bg-primary' : 'bg-slate-100'}`}
                                                style={{ height: `${intensity}%` }}
                                            ></div>
                                            {(i % 6 === 0) && <span className="text-[8px] font-bold text-slate-400 mt-4">{i}:00</span>}

                                            {/* Tooltip on hover */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {intensity.toFixed(1)}% Intensity
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Subject Breakdown */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="mb-8">
                            <h3 className="font-bold text-slate-900 text-lg">Subject Breakdown</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Study distribution</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { name: "Java Programming", color: "bg-primary", percent: 45 },
                                { name: "Data Structures", color: "bg-blue-600", percent: 30 },
                                { name: "Linear Algebra", color: "bg-blue-500", percent: 15 },
                                { name: "Philosophy", color: "bg-slate-200", percent: 10 },
                            ].map((sub, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-900">{sub.name}</span>
                                        <span className="text-slate-400">{sub.percent}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <div className={`h-full ${sub.color}`} style={{ width: `${sub.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap size={16} className="text-primary" />
                                <span className="text-xs font-bold text-blue-900">AI Productivity Insight</span>
                            </div>
                            <p className="text-[11px] text-blue-800 font-medium leading-relaxed italic">
                                "Your peak focus hours are between 8 PM and 11 PM. Shifting complex Java tasks to this window could improve mastery by 15%."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Weekly Goal Progress */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Daily Goal Progress</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hours vs. Target</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm bg-primary"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Actual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm bg-slate-100"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Target</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-48 flex items-end justify-between px-4 pb-2 border-b border-slate-100 relative">
                        {[4, 5.5, 3.8, 6.2, 7.5, 4.5, 2].map((actual, i) => {
                            const target = 5;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 max-w-[80px]">
                                    <div className="w-full flex justify-center items-end gap-1 h-40">
                                        <div
                                            className="w-4 bg-slate-100 rounded-t-sm"
                                            style={{ height: `${(target / 8) * 100}%` }}
                                        ></div>
                                        <div
                                            className="w-6 bg-primary rounded-t-sm shadow-sm"
                                            style={{ height: `${(actual / 8) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Analytics;
