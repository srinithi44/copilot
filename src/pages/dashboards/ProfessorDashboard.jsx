import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { BookOpen, Users, BarChart3, Plus, Trash2 } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CreateQuizModal from '../../components/Quiz/CreateQuizModal';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';

export default function ProfessorDashboard() {
    const { currentUser } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchQuizzes();
        }
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

    const handleCreateQuiz = async (quizData) => {
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${API_BASE_URL}/quiz/create?uid=${currentUser.uid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(quizData)
            });
            if (res.ok) {
                fetchQuizzes();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <DashboardLayout>
            <CreateQuizModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateQuiz}
            />

            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Professor Dashboard</h1>
                        <p className="text-[var(--text-secondary)]">Manage your courses, quizzes, and track student progress.</p>
                    </div>
                    <Button icon={Plus} onClick={() => setIsModalOpen(true)} className="bg-[var(--primary-color)] text-white">Create Quiz</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase">Total Students</p>
                                <h3 className="text-3xl font-bold text-slate-800 mt-2">124</h3>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                <Users size={24} />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase">Active Quizzes</p>
                                <h3 className="text-3xl font-bold text-slate-800 mt-2">{quizzes.length}</h3>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full text-green-600">
                                <BookOpen size={24} />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-l-4 border-purple-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase">Avg Class Score</p>
                                <h3 className="text-3xl font-bold text-slate-800 mt-2">82%</h3>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                                <BarChart3 size={24} />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="p-6 min-h-[300px]">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Quizzes</h3>
                        <div className="space-y-3">
                            {quizzes.length === 0 ? (
                                <div className="text-center text-slate-500 py-12">No quizzes created yet.</div>
                            ) : (
                                quizzes.map(quiz => (
                                    <div key={quiz._id} className="p-4 border border-slate-100 rounded-xl flex justify-between items-center hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="font-bold text-slate-800">{quiz.title}</p>
                                            <p className="text-xs text-slate-500">{quiz.questions.length} Questions • {quiz.duration} mins</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                    <Card className="p-6 min-h-[300px]">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Student Performance</h3>
                        <div className="text-center text-slate-500 py-12">No data available.</div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
