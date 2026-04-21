import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Type, BarChart2, Hash, Sparkles, CheckCircle, XCircle, ChevronRight, AlertCircle, Clock, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';
import PremiumLock from '../components/PremiumLock';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const GenerateQuiz = () => {
    const { currentUser } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generationLoading, setGenerationLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [error, setError] = useState('');

    // Form State
    const [selectedDocId, setSelectedDocId] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [questionType, setQuestionType] = useState('MCQ');
    const [numQuestions, setNumQuestions] = useState(5);

    // Quiz Taking State
    const [userAnswers, setUserAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        fetchDocuments();
        checkUserInstitution();
    }, []);

    const [hasInstitution, setHasInstitution] = useState(null); // null = loading

    const checkUserInstitution = async () => {
        try {
            const userId = currentUser?.uid;
            if (!userId) return;

            const response = await fetch(`${API_URL}/users/profile?uid=${encodeURIComponent(userId)}`);
            if (response.ok) {
                const userProfile = await response.json();
                setHasInstitution(!!userProfile?.institutionId);
            } else {
                // If user not found or error, assume false for safety or handle gracefully
                setHasInstitution(false);
            }
        } catch (e) {
            console.error(e);
            setHasInstitution(false);
        }
    };

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const userId = currentUser?.uid || 'guest';
            const response = await fetch(`${API_URL}/documents?userId=${encodeURIComponent(userId)}`);
            const data = await response.json();
            if (response.ok) {
                setDocuments(data);
                if (data.length > 0) setSelectedDocId(data[0].docId);
            } else {
                setError(data.error || 'Failed to fetch documents');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load documents. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedDocId) {
            setError("Please select a document first.");
            return;
        }
        setError('');
        setGenerationLoading(true);
        setQuiz(null);
        setSubmitted(false);
        setUserAnswers({});
        setResults(null);

        try {
            const response = await fetch(`${API_URL}/quiz/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pdfId: selectedDocId,
                    difficulty,
                    questionType,
                    numberOfQuestions: numQuestions,
                    userId: currentUser?.uid || 'guest'
                })
            });

            const data = await response.json();
            if (response.ok) {
                setQuiz(data);
            } else {
                setError(data.error || "Failed to generate quiz.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setGenerationLoading(false);
        }
    };

    const handleOptionSelect = (questionId, option) => {
        if (submitted) return;
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    const handleSubmitQuiz = async () => {
        if (!quiz) return;

        // Basic validation
        if (Object.keys(userAnswers).length < quiz.questions.length) {
            if (!window.confirm("You haven't answered all questions. Submit anyway?")) return;
        }

        try {
            const answersPayload = Object.entries(userAnswers).map(([qId, ans]) => ({
                questionId: qId,
                selectedAnswer: ans
            }));

            const response = await fetch(`${API_URL}/quiz/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId: quiz._id,
                    answers: answersPayload,
                    userId: currentUser?.uid
                })
            });

            const data = await response.json();
            if (response.ok) {
                setResults(data);
                setSubmitted(true);
            }
        } catch (err) {
            setError("Failed to submit quiz.");
        }
    };

    const getScoreColor = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 80) return 'text-green-500';
        if (percentage >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
                        <Sparkles className="text-[var(--primary-color)]" />
                        AI Quiz Generator
                    </h1>
                    <p className="text-[var(--text-secondary)]">
                        Generate personalized quizzes from your study materials.
                    </p>
                </header>

                {hasInstitution === false && !loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-2xl mx-auto"
                    >
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building size={32} className="text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-amber-800 mb-2">Institution Required</h2>
                        <p className="text-amber-700 mb-6">
                            To generate personalized quizzes, you must first select your institution. This helps us tailor the content to your curriculum.
                        </p>
                        <div className="flex justify-center gap-4">
                            <a href="/settings" className="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors shadow-lg shadow-amber-500/20">
                                Go to Settings
                            </a>
                        </div>
                    </motion.div>
                )}

                {hasInstitution !== false && !quiz && !generationLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {/* Configuration Card */}
                        <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <FileText size={20} className="text-[var(--primary-color)]" />
                                Quiz Settings
                            </h2>

                            <div className="space-y-6">
                                {/* Document Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Select Material</label>
                                    <div className="relative">
                                        <select
                                            value={selectedDocId}
                                            onChange={(e) => setSelectedDocId(e.target.value)}
                                            className="w-full bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] outline-none appearance-none transition-all"
                                        >
                                            <option value="" disabled>Select an uploaded PDF...</option>
                                            {documents.map(doc => (
                                                <option key={doc.docId} value={doc.docId}>
                                                    {doc.filename || "Untitled Document"} ({new Date(doc.uploadDate).toLocaleDateString()})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                                            <ChevronRight size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                    {documents.length === 0 && !loading && (
                                        <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                                            <AlertCircle size={12} /> No documents found. Please upload a syllabus first.
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Difficulty */}
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Difficulty</label>
                                        <div className="grid grid-cols-3 gap-2 p-1 bg-[var(--background-color)] rounded-xl border border-[var(--border-color)]">
                                            {['Easy', 'Medium', 'Hard'].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setDifficulty(level)}
                                                    className={`
                                                    py-2 rounded-lg text-sm font-medium transition-all
                                                    ${difficulty === level
                                                            ? 'bg-[var(--primary-color)] text-white shadow-md'
                                                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                                        }
                                                `}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Question Count */}
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Questions</label>
                                        <div className="flex items-center gap-4 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl px-4 py-2.5">
                                            <Hash size={18} className="text-[var(--text-muted)]" />
                                            <input
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={numQuestions}
                                                onChange={(e) => setNumQuestions(Math.min(20, Math.max(1, parseInt(e.target.value) || 5)))}
                                                className="bg-transparent border-none outline-none w-full text-[var(--text-primary)] font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Question Type */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Question Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setQuestionType('MCQ')}
                                            className={`
                                            flex items-center justify-center gap-2 py-3 rounded-xl border transition-all
                                            ${questionType === 'MCQ'
                                                    ? 'border-[var(--primary-color)] bg-amber-500/10 text-[var(--primary-color)] font-medium'
                                                    : 'border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                                                }
                                        `}
                                        >
                                            <CheckCircle size={18} />
                                            MCQ
                                        </button>

                                        {currentUser?.isPremium ? (
                                            <button
                                                onClick={() => setQuestionType('Descriptive')}
                                                className={`
                                                flex items-center justify-center gap-2 py-3 rounded-xl border transition-all
                                                ${questionType === 'Descriptive'
                                                        ? 'border-[var(--primary-color)] bg-amber-500/10 text-[var(--primary-color)] font-medium'
                                                        : 'border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                                                    }
                                            `}
                                            >
                                                <Type size={18} />
                                                Descriptive
                                            </button>
                                        ) : (
                                            <div className="relative group">
                                                <button
                                                    disabled
                                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border-color)] bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-70"
                                                >
                                                    <Type size={18} />
                                                    Descriptive
                                                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1 shadow-md">
                                                        <div className="w-3 h-3 flex items-center justify-center text-[10px] font-bold">🔒</div>
                                                    </div>
                                                </button>
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                                                    Upgrade to Premium to unlock Descriptive Questions.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={loading || documents.length === 0}
                                className={`
                                w-full mt-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg shadow-amber-500/20 transition-all transform active:scale-[0.98]
                                ${loading || documents.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[var(--primary-color)] hover:brightness-110'
                                    }
                            `}
                            >
                                Generate Quiz
                            </button>
                        </div>

                        {/* Preview / Instructions */}
                        <div className="flex flex-col justify-center items-center text-center p-8 border-2 border-dashed border-[var(--border-color)] rounded-2xl text-[var(--text-muted)]">
                            <div className="w-16 h-16 bg-[var(--surface-color)] rounded-full flex items-center justify-center mb-4">
                                <Clock size={32} className="text-[var(--primary-color)]" opacity={0.6} />
                            </div>
                            <h3 className="text-lg font-medium text-[var(--text-secondary)] mb-2">Ready to test your knowledge?</h3>
                            <p className="max-w-xs mx-auto">
                                Our AI will analyze your documents and create custom questions to help you prepare for your exams effectively.
                            </p>
                        </div>
                    </motion.div>
                )}

                {generationLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-[var(--surface-color)] border-t-[var(--primary-color)] rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-medium text-[var(--text-primary)]">Generating your quiz...</h3>
                        <p className="text-[var(--text-secondary)] mt-2 animate-pulse">Analyzing document content...</p>
                    </div>
                )}

                {quiz && !generationLoading && (
                    <div className="space-y-8">
                        {/* Quiz Header */}
                        <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] flex justify-between items-center shadow-sm">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{quiz.title}</h2>
                                <div className="flex gap-3 mt-2 text-sm">
                                    <span className={`px-2 py-1 rounded bg-[var(--primary-color)] text-white text-xs font-bold uppercase`}>
                                        {quiz.difficulty}
                                    </span>
                                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[var(--text-secondary)] text-xs font-bold uppercase border border-[var(--border-color)]">
                                        {quiz.questions.length} Questions
                                    </span>
                                </div>
                            </div>
                            {submitted && results && (
                                <div className="text-right">
                                    <div className="text-sm text-[var(--text-muted)] uppercase tracking-wider font-bold">Score</div>
                                    <div className={`text-4xl font-black ${getScoreColor(results.score, results.total)}`}>
                                        {results.score} / {results.total}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Questions List */}
                        <div className="space-y-6">
                            {quiz.questions.map((q, idx) => (
                                <motion.div
                                    key={q._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`
                                    bg-[var(--surface-color)] p-6 rounded-2xl border transition-all
                                    ${submitted
                                            ? q.correctAnswer === userAnswers[q._id]
                                                ? 'border-green-500/30 bg-green-500/5'
                                                : userAnswers[q._id] // If answered strictly wrong
                                                    ? 'border-red-500/30 bg-red-500/5'
                                                    : 'border-[var(--border-color)]' // Unanswered or descriptive
                                            : 'border-[var(--border-color)] hover:border-[var(--primary-color)]'
                                        }
                                `}
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--background-color)] flex items-center justify-center font-bold text-[var(--text-muted)] border border-[var(--border-color)]">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">{q.question}</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.options.map((option, optIdx) => {
                                                    const isSelected = userAnswers[q._id] === option;
                                                    const isCorrect = q.correctAnswer === option;

                                                    let buttonStyle = "border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]";

                                                    if (submitted) {
                                                        if (isCorrect) buttonStyle = "border-green-500 bg-green-500 text-white font-bold";
                                                        else if (isSelected) buttonStyle = "border-red-500 bg-red-500 text-white font-bold";
                                                        else buttonStyle = "border-[var(--border-color)] opacity-50";
                                                    } else if (isSelected) {
                                                        buttonStyle = "border-[var(--primary-color)] bg-[var(--primary-color)] text-white shadow-md font-medium";
                                                    }

                                                    return (
                                                        <button
                                                            key={optIdx}
                                                            onClick={() => handleOptionSelect(q._id, option)}
                                                            disabled={submitted}
                                                            className={`
                                                            w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between
                                                            ${buttonStyle}
                                                        `}
                                                        >
                                                            <span>{option}</span>
                                                            {submitted && isCorrect && <CheckCircle size={16} />}
                                                            {submitted && isSelected && !isCorrect && <XCircle size={16} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Explanation */}
                                            {submitted && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-4 pt-4 border-t border-[var(--border-color)] text-sm"
                                                >
                                                    <span className="font-bold text-[var(--text-primary)]">Explanation: </span>
                                                    <span className="text-[var(--text-secondary)]">{q.explanation}</span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        {!submitted && (
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSubmitQuiz}
                                    className="px-8 py-4 bg-[var(--primary-color)] text-white text-lg font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    Submit Answers
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}

                        {submitted && (
                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={() => setQuiz(null)} // Reset
                                    className="px-6 py-3 bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium rounded-xl hover:bg-[var(--surface-hover)] transition-all"
                                >
                                    Generate Another Quiz
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default GenerateQuiz;
