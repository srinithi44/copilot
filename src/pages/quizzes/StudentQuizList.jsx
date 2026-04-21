import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { API_BASE_URL } from '../../config/api';
import DashboardLayout from '../../components/Layout/DashboardLayout';

import Leaderboard from '../../components/Leaderboard';

export default function StudentQuizList() {
    const { currentUser } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('quizzes');
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) fetchQuizzes();
    }, [currentUser]);

    const fetchQuizzes = async () => {
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${API_BASE_URL}/quiz/list?uid=${currentUser.uid}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setQuizzes(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Student Quizzes</h1>
                </header>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('quizzes')}
                        className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'quizzes' ? 'text-[var(--primary-color)]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Available Quizzes
                        {activeTab === 'quizzes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'leaderboard' ? 'text-[var(--primary-color)]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Leaderboard
                        {activeTab === 'leaderboard' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)]" />}
                    </button>
                </div>

                {activeTab === 'quizzes' ? (
                    <div className="space-y-4">
                        {loading && <div className="text-center py-10">Loading quizzes...</div>}

                        {!loading && quizzes.length === 0 && (
                            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <p className="text-slate-500">No quizzes available for your college yet.</p>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {quizzes.map(quiz => (
                                <Card key={quiz._id} className="p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{quiz.title}</h3>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                <span className="flex items-center gap-1"><Clock size={16} /> {quiz.duration} mins</span>
                                                <span className="flex items-center gap-1"><CheckCircle2 size={16} /> {quiz.totalMarks} Marks</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => navigate(`/quiz/${quiz._id}`)}
                                            className="bg-[var(--primary-color)] text-white"
                                            icon={ArrowRight}
                                            iconPosition="right"
                                        >
                                            Start Quiz
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                        <Leaderboard />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
