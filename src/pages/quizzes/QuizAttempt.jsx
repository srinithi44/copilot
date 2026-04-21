import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../../components/Button';
import { API_BASE_URL } from '../../config/api';

export default function QuizAttempt() {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({}); // { questionIndex: optionIndex }
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const fetchQuiz = async () => {
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${API_BASE_URL}/quiz/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setQuiz(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (qIndex, oIndex) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
    };

    const handleSubmit = async () => {
        if (!confirm("Are you sure you want to submit?")) return;

        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${API_BASE_URL}/quiz/submit?uid=${currentUser.uid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    quizId: id,
                    answers // sending raw indices for now
                })
            });
            const result = await res.json();
            setScore(result.score);
            setSubmitted(true);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Quiz...</div>;
    if (!quiz) return <div className="p-8 text-center">Quiz not found.</div>;

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                        <CheckCircle size={40} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Quiz Completed!</h2>
                        <p className="text-slate-500 mt-2">You have successfully submitted the quiz.</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <p className="text-sm font-bold text-slate-500 uppercase">Your Score</p>
                        <p className="text-4xl font-bold text-[var(--primary-color)] mt-2">{score} / {quiz.totalMarks}</p>
                    </div>
                    <Button width="full" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header */}
            <div className="fixed top-0 inset-x-0 bg-white shadow-sm z-10 px-6 py-4 flex justify-between items-center h-16">
                <div>
                    <h1 className="font-bold text-lg">{quiz.title}</h1>
                    <p className="text-xs text-slate-500">{quiz.questions.length} Questions</p>
                </div>
                <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-bold">
                    <Clock size={16} />
                    <span>{quiz.duration}:00</span>
                </div>
            </div>

            <div className="max-w-3xl mx-auto pt-24 px-4 space-y-8">
                {quiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex gap-3">
                            <span className="text-slate-400">Q{qIndex + 1}.</span>
                            {q.question}
                        </h3>
                        <div className="space-y-3">
                            {q.options.map((opt, oIndex) => (
                                <button
                                    key={oIndex}
                                    onClick={() => handleSelectOption(qIndex, oIndex)}
                                    className={`w-full text-left p-4 rounded-lg border transition-all
                                        ${answers[qIndex] === oIndex
                                            ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 font-medium shadow-sm'
                                            : 'border-slate-200 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                                            ${answers[qIndex] === oIndex ? 'border-[var(--primary-color)] bg-[var(--primary-color)]' : 'border-slate-300'}
                                        `}>
                                            {answers[qIndex] === oIndex && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        {opt}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4 z-10">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <p className="text-sm text-slate-500">
                        {Object.keys(answers).length} / {quiz.questions.length} Answered
                    </p>
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={() => navigate('/dashboard')}>Exit</Button>
                        <Button
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={handleSubmit}
                        >
                            Submit Quiz
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
