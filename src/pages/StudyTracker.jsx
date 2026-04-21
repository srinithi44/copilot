import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2, Clock, Calendar, TrendingUp, Plus,
    BookOpen, Trash2, Award, Zap, MoreHorizontal, Link as LinkIcon, Youtube, ChevronDown, ChevronUp, ExternalLink, Sparkles
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import DailyTracker from '../components/Dashboard/DailyTracker';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const COLORS = ['#38BDF8', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#0EA5E9'];

// Helper Component for Stats
const StatsCard = ({ icon: Icon, label, value, subtext, color, bgColor }) => (
    <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm flex items-start justify-between hover:-translate-y-1 transition-transform duration-300">
        <div>
            <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{value}</h3>
            <p className="text-xs text-[var(--text-muted)]">{subtext}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

// Fallback Icon
const PieChartIcon = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
        <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    </svg>
);

const StudyTracker = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [goals, setGoals] = useState([]);
    const [documents, setDocuments] = useState([]);

    // Time Table State
    const [timetable, setTimetable] = useState([]);
    const [showTimetableModal, setShowTimetableModal] = useState(false);
    const [newSlot, setNewSlot] = useState({ day: 'Monday', startTime: '09:00', endTime: '10:00', subject: '' });
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Form State for Logging Session
    const [sessionForm, setSessionForm] = useState({
        subject: '',
        topic: '',
        duration: 60,
        studyDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        notes: '',
        relatedDocumentId: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [newReference, setNewReference] = useState({ title: '', url: '' });
    const [expandedSessionId, setExpandedSessionId] = useState(null);

    const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const addReference = () => {
        if (!newReference.title || !newReference.url) return;
        const type = newReference.url.includes('youtube.com') || newReference.url.includes('youtu.be') ? 'youtube' : 'website';
        setSessionForm({
            ...sessionForm,
            references: [...(sessionForm.references || []), { ...newReference, type }]
        });
        setNewReference({ title: '', url: '' });
    };

    const removeReference = (index) => {
        const updatedRefs = sessionForm.references.filter((_, i) => i !== index);
        setSessionForm({ ...sessionForm, references: updatedRefs });
    };

    const fetchTimetable = async () => {
        try {
            const userId = currentUser?.uid;
            const res = await fetch(`${API_URL}/study/timetable?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setTimetable(data);
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (currentUser) {
            fetchData();
            fetchDocuments();
            fetchTimetable();
        }
    }, [currentUser]);

    const fetchData = async () => {
        try {
            const userId = currentUser?.uid;
            if (!userId) return;

            const [analyticsRes, historyRes, goalsRes] = await Promise.all([
                fetch(`${API_URL}/study/analytics?userId=${userId}`),
                fetch(`${API_URL}/study/sessions/history?userId=${userId}`),
                fetch(`${API_URL}/study/goals?userId=${userId}`)
            ]);

            const analytics = await analyticsRes.json();
            const hist = await historyRes.json();
            const goalsData = await goalsRes.json();

            setStats(analytics);
            setHistory(hist);
            setGoals(goalsData);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch study data", error);
            setLoading(false);
        }
    };

    const fetchDocuments = async () => {
        try {
            const userId = currentUser?.uid;
            const res = await fetch(`${API_URL}/documents?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddSlot = async () => {
        const updatedSchedule = [...timetable, newSlot];
        try {
            const res = await fetch(`${API_URL}/study/timetable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.uid, schedule: updatedSchedule })
            });
            if (res.ok) {
                const data = await res.json();
                setTimetable(data);
                setShowTimetableModal(false);
                setNewSlot({ day: 'Monday', startTime: '09:00', endTime: '10:00', subject: '' });
            }
        } catch (e) { console.error("Failed to add timetable slot", e); }
    };

    const handleDeleteSlot = async (index) => {
        const updatedSchedule = timetable.filter((_, i) => i !== index);
        try {
            const res = await fetch(`${API_URL}/study/timetable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.uid, schedule: updatedSchedule })
            });
            if (res.ok) {
                const data = await res.json();
                setTimetable(data);
            }
        } catch (e) { console.error("Failed to delete timetable slot", e); }
    };

    const handleLogSession = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/study/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...sessionForm,
                    userId: currentUser?.uid,
                    duration: parseInt(sessionForm.duration)
                })
            });

            if (response.ok) {
                // Refresh data
                fetchData();
                setSessionForm({
                    subject: '',
                    topic: '',
                    duration: 60,
                    studyDate: new Date().toISOString().split('T')[0],
                    notes: '',
                    relatedDocumentId: '',
                    references: []
                });
            }
        } catch (error) {
            console.error("Log session failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSummarize = async () => {
        if (!sessionForm.notes || sessionForm.notes.length < 50) {
            alert("Please enter at least 50 characters of notes to summarize.");
            return;
        }
        setIsSummarizing(true);
        try {
            const res = await fetch(`${API_URL}/study/summarize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: sessionForm.notes })
            });
            if (res.ok) {
                const data = await res.json();
                setSessionForm({ ...sessionForm, notes: data.summary });
            }
        } catch (e) {
            console.error(e);
            alert("Failed to summarize notes.");
        } finally {
            setIsSummarizing(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <header>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
                        <BarChart2 className="text-[var(--primary-color)]" />
                        Study Tracker
                    </h1>
                    <p className="text-[var(--text-secondary)]">Track your progress, build streaks, and achieve your learning goals.</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        icon={Clock}
                        label="Total Hours"
                        value={stats?.totalHours || '0'}
                        subtext="All time"
                        color="text-blue-500"
                        bgColor="bg-blue-500/10"
                    />
                    <StatsCard
                        icon={Zap}
                        label="Current Streak"
                        value={`${stats?.currentStreak || 0} Days`}
                        subtext={`Best: ${stats?.longestStreak || 0}`}
                        color="text-primary"
                        bgColor="bg-primary/10"
                    />
                    <StatsCard
                        icon={TrendingUp}
                        label="Weekly Goal"
                        value="80%"
                        subtext="On track"
                        color="text-green-500"
                        bgColor="bg-green-500/10"
                    />
                    <StatsCard
                        icon={Award}
                        label="Focus Level"
                        value="High"
                        subtext="Top 10%"
                        color="text-purple-500"
                        bgColor="bg-purple-500/10"
                    />
                </div>

                {/* Time Table Section */}
                <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Calendar size={20} className="text-[var(--primary-color)]" />
                            Weekly Schedule
                        </h2>
                        <Button onClick={() => setShowTimetableModal(true)} className="flex items-center gap-2">
                            <Plus size={16} /> Add Slot
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 overflow-x-auto">
                        {DAYS.map(day => (
                            <div key={day} className="min-w-[140px]">
                                <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-3 text-center uppercase tracking-wider">{day.slice(0, 3)}</h3>
                                <div className="space-y-3">
                                    {timetable.filter(t => t.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime)).map((slot, idx) => (
                                        <div key={idx} className="bg-[var(--background-color)] p-3 rounded-xl border border-[var(--border-color)] relative group">
                                            <p className="text-xs text-[var(--text-muted)] font-medium mb-1">{slot.startTime} - {slot.endTime}</p>
                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate" title={slot.subject}>{slot.subject}</p>
                                            <button
                                                onClick={() => handleDeleteSlot(timetable.indexOf(slot))}
                                                className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {timetable.filter(t => t.day === day).length === 0 && (
                                        <div className="h-20 rounded-xl border-2 border-dashed border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] text-xs">
                                            Free
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal for Adding Slot */}
                {showTimetableModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[var(--surface-color)] p-6 rounded-2xl w-full max-w-md shadow-2xl border border-[var(--border-color)]"
                        >
                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Add Schedule Slot</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Day</label>
                                    <select
                                        value={newSlot.day}
                                        onChange={e => setNewSlot({ ...newSlot, day: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                                    >
                                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[var(--text-secondary)] mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={newSlot.startTime}
                                            onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                            className="w-full px-4 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[var(--text-secondary)] mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={newSlot.endTime}
                                            onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                            className="w-full px-4 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Subject / Activity</label>
                                    <input
                                        type="text"
                                        value={newSlot.subject}
                                        onChange={e => setNewSlot({ ...newSlot, subject: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                                        placeholder="e.g. Physics Class"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setShowTimetableModal(false)}
                                        className="px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <Button onClick={handleAddSlot}>Add Slot</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area (2 cols) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Daily Tracker & Charts */}
                        {(() => {
                            const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                            const today = new Date();
                            // Generate last 7 days data from history
                            const weeklyData = Array.from({ length: 7 }, (_, i) => {
                                const d = new Date();
                                d.setDate(today.getDate() - (6 - i));
                                const dayStr = d.toISOString().split('T')[0];
                                const daySessions = history.filter(s => s.studyDate.startsWith(dayStr));
                                const hours = daySessions.reduce((acc, s) => acc + s.duration, 0) / 60;
                                return {
                                    day: days[d.getDay()],
                                    hours: parseFloat(hours.toFixed(1)),
                                    isToday: i === 6
                                };
                            });
                            const todayHours = weeklyData[6].hours;

                            return (
                                <DailyTracker
                                    streak={stats?.currentStreak || 0}
                                    todayHours={todayHours}
                                    goalHours={4}
                                    weeklyData={weeklyData}
                                />
                            );
                        })()}

                        {/* Session Logger */}
                        <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                <Plus size={20} className="text-[var(--primary-color)]" />
                                Log Study Session
                            </h2>
                            <form onSubmit={handleLogSession} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={sessionForm.subject}
                                        onChange={e => setSessionForm({ ...sessionForm, subject: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                        placeholder="e.g. Mathematics"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Topic</label>
                                    <input
                                        type="text"
                                        required
                                        value={sessionForm.topic}
                                        onChange={e => setSessionForm({ ...sessionForm, topic: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                        placeholder="e.g. Calculus II"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={sessionForm.duration}
                                        onChange={e => setSessionForm({ ...sessionForm, duration: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={sessionForm.studyDate}
                                        onChange={e => setSessionForm({ ...sessionForm, studyDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Related Document (Optional)</label>
                                    <select
                                        value={sessionForm.relatedDocumentId}
                                        onChange={e => setSessionForm({ ...sessionForm, relatedDocumentId: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                    >
                                        <option value="">Select a document...</option>
                                        {documents.map(doc => (
                                            <option key={doc.docId} value={doc.docId}>{doc.filename}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    <label className="block text-sm font-medium text-[var(--text-secondary)]">Study Notes</label>
                                    <div className="relative">
                                        <textarea
                                            value={sessionForm.notes}
                                            onChange={e => setSessionForm({ ...sessionForm, notes: e.target.value })}
                                            className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all min-h-[100px]"
                                            placeholder="Write key concepts, formulas, revision summary..."
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSummarize}
                                            disabled={isSummarizing || !sessionForm.notes}
                                            className="absolute top-2 right-2 p-2 bg-[var(--surface-color)] hover:bg-[var(--surface-hover)] rounded-lg text-[var(--primary-color)] disabled:opacity-50 transition-colors"
                                            title="Summarize with AI"
                                        >
                                            {isSummarizing ? <div className="w-4 h-4 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    <label className="block text-sm font-medium text-[var(--text-secondary)]">External References</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Title (e.g. YouTube Video)"
                                            value={newReference.title}
                                            onChange={e => setNewReference({ ...newReference, title: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="URL"
                                            value={newReference.url}
                                            onChange={e => setNewReference({ ...newReference, url: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={addReference}
                                            className="p-2 bg-[var(--surface-hover)] hover:bg-[var(--border-color)] rounded-xl transition-colors"
                                        >
                                            <Plus size={24} className="text-[var(--primary-color)]" />
                                        </button>
                                    </div>
                                    {/* Display Added References */}
                                    {sessionForm.references && sessionForm.references.length > 0 && (
                                        <div className="grid grid-cols-1 gap-2">
                                            {sessionForm.references.map((ref, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-[var(--background-color)] rounded-lg border border-[var(--border-color)]">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        {ref.type === 'youtube' ? <Youtube size={16} className="text-red-500 shrink-0" /> : <LinkIcon size={16} className="text-blue-500 shrink-0" />}
                                                        <div className="truncate">
                                                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{ref.title}</p>
                                                            <p className="text-xs text-[var(--text-muted)] truncate">{ref.url}</p>
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => removeReference(idx)} className="text-[var(--text-muted)] hover:text-red-500">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2 flex justify-end">
                                    <Button
                                        type="submit"
                                        loading={isSubmitting}
                                        className="bg-primary text-white px-8 py-3 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 font-bold"
                                    >
                                        Log Session
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* History Table */}
                        <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                <Calendar size={20} className="text-[var(--text-muted)]" />
                                Recent History
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] text-sm">
                                            <th className="py-3 font-semibold">Date</th>
                                            <th className="py-3 font-semibold">Subject</th>
                                            <th className="py-3 font-semibold">Topic</th>
                                            <th className="py-3 font-semibold">Time</th>
                                            <th className="py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {history.length > 0 ? history.map((session) => (
                                            <React.Fragment key={session._id}>
                                                <tr className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors cursor-pointer" onClick={() => setExpandedSessionId(expandedSessionId === session._id ? null : session._id)}>
                                                    <td className="py-4 text-[var(--text-primary)]">
                                                        {new Date(session.studyDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 font-medium text-[var(--text-primary)]">{session.subject}</td>
                                                    <td className="py-4 text-[var(--text-secondary)]">{session.topic}</td>
                                                    <td className="py-4 text-[var(--text-secondary)]">
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                                                            {session.duration} min
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 text-[var(--text-muted)]">
                                                            {expandedSessionId === session._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedSessionId === session._id && (
                                                    <tr className="bg-[var(--surface-hover)]">
                                                        <td colSpan="5" className="p-4 rounded-b-xl">
                                                            <div className="space-y-4 animate-in fade-in duration-300">
                                                                {session.notes && (
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Notes</h4>
                                                                        <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{session.notes}</p>
                                                                    </div>
                                                                )}

                                                                {session.references && session.references.length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">References</h4>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            {session.references.map((ref, idx) => (
                                                                                <div key={idx} className="bg-[var(--background-color)] rounded-xl border border-[var(--border-color)] overflow-hidden hover:border-[var(--primary-color)] transition-colors">
                                                                                    {ref.type === 'youtube' && getYouTubeId(ref.url) ? (
                                                                                        <div className="aspect-video w-full bg-black">
                                                                                            <iframe
                                                                                                width="100%"
                                                                                                height="100%"
                                                                                                src={`https://www.youtube.com/embed/${getYouTubeId(ref.url)}`}
                                                                                                title={ref.title}
                                                                                                frameBorder="0"
                                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                                allowFullScreen
                                                                                            ></iframe>
                                                                                        </div>
                                                                                    ) : null}
                                                                                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="p-3 block">
                                                                                        <div className="flex items-center justify-between">
                                                                                            <span className="text-sm font-bold text-[var(--text-primary)] truncate">{ref.title}</span>
                                                                                            <ExternalLink size={14} className="text-[var(--text-muted)]" />
                                                                                        </div>
                                                                                        <p className="text-xs text-[var(--text-secondary)] truncate mt-1">{ref.url}</p>
                                                                                    </a>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {!session.notes && (!session.references || session.references.length === 0) && (
                                                                    <p className="text-sm text-[var(--text-muted)] italic">No detailed notes or references for this session.</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-[var(--text-muted)]">No sessions logged yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Content (Charts & Goals) */}
                    <div className="space-y-8">
                        {/* Subject Distribution */}
                        <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Subject Breakdown</h2>
                            <div className="h-[250px] w-full">
                                {stats?.subjectDistribution && stats.subjectDistribution.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.subjectDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stats.subjectDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                itemStyle={{ color: 'var(--text-primary)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                                        <PieChartIcon size={48} className="mb-2 opacity-20" />
                                        <p>No data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Goals List */}
                        <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Weekly Goals</h2>
                                <button className="text-[var(--primary-color)] text-sm font-bold hover:underline">+ New Goal</button>
                            </div>

                            <div className="space-y-6">
                                {goals.length > 0 ? goals.map(goal => (
                                    <div key={goal._id}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-[var(--text-primary)]">{goal.subject}</span>
                                            <span className="text-[var(--text-secondary)]">{goal.completedHours} / {goal.weeklyTargetHours} hrs</span>
                                        </div>
                                        <div className="w-full bg-[var(--background-color)] rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-[var(--primary-color)] h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, (goal.completedHours / goal.weeklyTargetHours) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-[var(--text-muted)] text-center py-4">No goals set for this week.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout >
    );
};

export default StudyTracker;
