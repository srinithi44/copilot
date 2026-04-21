import React, { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
// import ReactMarkdown from 'react-markdown'; // Consumed by UI update
import { Sparkles, Calendar, Clock, BookOpen, Target, ArrowRight, Loader2 } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { generateStudyPlan } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PremiumLock from '../components/PremiumLock';

export default function StudyPlan() {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        subjects: '',
        duration: '',
        hoursPerDay: '',
        goal: ''
    });
    const [planData, setPlanData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPlanData(null);

        try {
            const userId = currentUser?.uid || "guest";
            const data = await generateStudyPlan({
                subjects: formData.subjects,
                examDate: formData.duration,
                hoursPerDay: formData.hoursPerDay,
                goal: formData.goal,
                userId
            });

            // Ensure data structure validity
            if (data && (data.schedule || data.learning_path)) {
                setPlanData(data);
            } else {
                throw new Error("Invalid response structure");
            }

        } catch (error) {
            console.error(error);
            alert('Failed to generate plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
                <div className="text-center space-y-2 mb-6">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">AI Study Planner</h1>
                    <p className="text-[var(--text-secondary)]">Tell us your goals, and we'll build the perfect detailed schedule for you.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Input Form */}
                    <Card className="p-8 lg:col-span-1 border-t-4 border-t-[var(--primary-color)]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
                                    <BookOpen size={16} className="text-[var(--primary-color)]" />
                                    Subjects / Topics
                                </label>
                                <textarea
                                    required
                                    className="w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all outline-none resize-none h-32 text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                                    placeholder="e.g. Java DSA, System Design"
                                    value={formData.subjects}
                                    onChange={e => setFormData({ ...formData, subjects: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Duration"
                                    icon={Calendar}
                                    placeholder="e.g. 2 weeks"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Daily Time"
                                    icon={Clock}
                                    placeholder="e.g. 4 hours"
                                    value={formData.hoursPerDay}
                                    onChange={e => setFormData({ ...formData, hoursPerDay: e.target.value })}
                                    required
                                />
                            </div>

                            <Input
                                label="Main Goal"
                                icon={Target}
                                placeholder="e.g. Master Graph Algorithms"
                                value={formData.goal}
                                onChange={e => setFormData({ ...formData, goal: e.target.value })}
                                required
                            />

                            <Button
                                type="submit"
                                width="full"
                                size="lg"
                                loading={loading}
                                icon={Sparkles}
                                className="mt-2 text-white bg-[var(--primary-color)] hover:brightness-110 shadow-lg shadow-[var(--primary-color)]/30"
                            >
                                Generate Detailed Plan
                            </Button>

                            <PremiumLock title="Visual Flowchart" message="Upgrade to Premium to unlock AI Flowchart Generator for your study plans.">
                                <Button
                                    type="button"
                                    width="full"
                                    size="lg"
                                    disabled={!currentUser?.isPremium}
                                    className="mt-2 text-[var(--primary-color)] border border-[var(--primary-color)] bg-[var(--surface-color)] opacity-50 cursor-not-allowed"
                                >
                                    Generate Flowchart (Premium)
                                </Button>
                            </PremiumLock>
                        </form>
                    </Card>

                    {/* Results Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {loading && (
                            <div className="flex flex-col items-center justify-center p-12 bg-[var(--surface-color)] rounded-2xl border border-[var(--border-color)] text-center animate-pulse">
                                <Loader2 size={48} className="text-[var(--primary-color)] animate-spin mb-4" />
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Crafting your plan...</h3>
                                <p className="text-[var(--text-secondary)]">Analyzing topics, scheduling tasks, and finding resources.</p>
                            </div>
                        )}

                        {!loading && !planData && (
                            <div className="flex flex-col items-center justify-center p-12 bg-[var(--surface-color)]/50 rounded-2xl border-2 border-dashed border-[var(--border-color)] text-center min-h-[400px]">
                                <div className="w-16 h-16 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mb-6">
                                    <Sparkles className="text-[var(--primary-color)]" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Ready to Plan</h3>
                                <p className="text-[var(--text-secondary)] max-w-sm">Enter your subjects and schedule details to generate a comprehensive tabular study roadmap.</p>
                            </div>
                        )}

                        {!loading && planData && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                                {/* Plan Header */}
                                <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                                {planData.title}
                                                <span className="text-xs px-2 py-1 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-full border border-[var(--primary-color)]/20">AI Generated</span>
                                            </h2>
                                            <p className="text-[var(--text-secondary)] mt-1">{planData.goal_summary || planData.goal}</p>
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">Estimated Time</p>
                                            <p className="text-lg font-bold text-[var(--text-primary)]">{planData.total_estimated_time || planData.estimated_time}</p>
                                        </div>
                                    </div>
                                    {planData.prerequisites && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            <span className="text-xs font-bold text-[var(--text-muted)] self-center mr-2">PREREQUISITES:</span>
                                            {Array.isArray(planData.prerequisites)
                                                ? planData.prerequisites.map((req, i) => (
                                                    <span key={i} className="px-3 py-1 bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded-lg text-xs font-medium border border-[var(--border-color)]">
                                                        {req}
                                                    </span>
                                                ))
                                                : <span className="text-sm text-[var(--text-secondary)]">{planData.prerequisites}</span>
                                            }
                                        </div>
                                    )}
                                </div>

                                {/* Schedule Table */}
                                {planData.schedule && (
                                    <div className="bg-[var(--surface-color)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-[var(--border-color)]">
                                            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                                <Calendar size={20} className="text-[var(--primary-color)]" />
                                                Detailed Schedule
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-[var(--surface-hover)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                                                        <th className="p-4 font-bold border-b border-[var(--border-color)] w-24">Time Frame</th>
                                                        <th className="p-4 font-bold border-b border-[var(--border-color)] w-48">Focus Area</th>
                                                        <th className="p-4 font-bold border-b border-[var(--border-color)]">Tasks & Activities</th>
                                                        <th className="p-4 font-bold border-b border-[var(--border-color)] w-24">Duration</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm text-[var(--text-primary)]">
                                                    {planData.schedule.map((slot, idx) => (
                                                        <tr key={idx} className="hover:bg-[var(--surface-hover)]/50 transition-colors border-b border-[var(--border-color)] last:border-0">
                                                            <td className="p-4 font-bold text-[var(--primary-color)] align-top">{slot.day}</td>
                                                            <td className="p-4 font-medium align-top">{slot.focus}</td>
                                                            <td className="p-4 align-top">
                                                                <ul className="space-y-1 list-disc list-inside text-[var(--text-secondary)]">
                                                                    {slot.tasks.map((task, tIdx) => (
                                                                        <li key={tIdx}>{task}</li>
                                                                    ))}
                                                                </ul>
                                                            </td>
                                                            <td className="p-4 text-[var(--text-muted)] font-medium align-top whitespace-nowrap">{slot.hours}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Important Topics Grid */}
                                {planData.important_topics && planData.important_topics.length > 0 && (
                                    <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                            <Target size={20} className="text-red-500" />
                                            Important Topics (High Yield)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {planData.important_topics.map((item, idx) => (
                                                <div key={idx} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                                                    <h4 className="font-bold text-red-600 mb-1">{item.topic}</h4>
                                                    <p className="text-sm text-[var(--text-secondary)]">{item.why_important}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Extra Resources List */}
                                {planData.extra_resources && planData.extra_resources.length > 0 && (
                                    <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                            <ArrowRight size={20} className="text-blue-500" />
                                            Recommended Resources
                                        </h3>
                                        <div className="space-y-3">
                                            {planData.extra_resources.map((res, idx) => (
                                                <a
                                                    key={idx}
                                                    href={res.link.startsWith('http') ? res.link : `https://www.google.com/search?q=${encodeURIComponent(res.link)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                                                >
                                                    <div>
                                                        <h4 className="font-bold text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">{res.title}</h4>
                                                        <span className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] bg-[var(--surface-hover)] px-2 py-0.5 rounded mr-2">
                                                            {res.type}
                                                        </span>
                                                    </div>
                                                    <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
