import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
    generateMockTest,
    submitMockTestAttempt,
    getWeeklyMockTestProgress,
    uploadSyllabus,
    getDocuments
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Target, CheckCircle, Award, Upload } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Leaderboard from '../components/Leaderboard';

export default function MockTest() {
    const { currentUser } = useAuth();
    const [config, setConfig] = useState({
        topic: '',
        difficulty: 'Medium',
        questionCount: 5,
        questionType: 'MCQ',
        pdfId: ''
    });
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [progress, setProgress] = useState(null);
    const [attemptSaved, setAttemptSaved] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const syncWeeklyProgress = (nextProgress) => {
        setProgress(nextProgress);
        try {
            localStorage.setItem('weeklyMockProgress', JSON.stringify(nextProgress));
            window.dispatchEvent(new CustomEvent('weekly-mock-progress-updated', { detail: nextProgress }));
        } catch (_) {
            // Ignore storage errors
        }
    };

    const loadWeeklyProgress = async () => {
        try {
            const userId = currentUser?.uid || "guest";
            const data = await getWeeklyMockTestProgress(userId);
            syncWeeklyProgress(data);
        } catch (error) {
            console.error('Failed to fetch weekly mock progress:', error);
        }
    };

    const loadDocuments = async () => {
        try {
            const userId = currentUser?.uid || "guest";
            const docs = await getDocuments(userId);
            setDocuments(docs || []);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        }
    };

    useEffect(() => {
        if (currentUser?.uid) {
            loadWeeklyProgress();
            loadDocuments();
        }
    }, [currentUser?.uid]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTest(null);
        setAnswers({});
        setShowResults(false);
        setAttemptSaved(false);

        try {
            const userId = currentUser?.uid || "guest";
            const data = await generateMockTest({
                ...config,
                userId
            });
            setTest(data);
        } catch (error) {
            console.error(error);
            alert(error?.message || "Failed to generate test. Make sure you have uploaded a syllabus first.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (qId, option) => {
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const userId = currentUser?.uid || "guest";

        setUploadingPdf(true);
        try {
            const result = await uploadSyllabus(file, userId);
            await loadDocuments();
            setConfig(prev => ({ ...prev, pdfId: result.docId }));
            alert('PDF uploaded and selected for mock test generation.');
        } catch (error) {
            console.error(error);
            alert(error?.message || 'Failed to upload PDF');
        } finally {
            setUploadingPdf(false);
            e.target.value = '';
        }
    };

    const submitTest = async () => {
        let newScore = 0;
        const isTwoMarkTest = test?.questionType === 'TWO_MARKS';

        if (isTwoMarkTest) {
            test.questions.forEach(q => {
                if ((answers[q.id] || '').trim().length > 0) newScore++;
            });
        } else {
            test.questions.forEach(q => {
                if (answers[q.id] === q.correctAnswer) newScore++;
            });
        }

        setScore(newScore);
        setShowResults(true);
        const optimisticProgress = (() => {
            const prev = progress;
            const totalQuestions = test.questions.length;
            const nextAttempts = (prev?.attemptsThisWeek || 0) + 1;
            const nextCorrect = (prev?.totalCorrect || 0) + newScore;
            const nextTotalQuestions = (prev?.totalQuestions || 0) + totalQuestions;
            return {
                ...(prev || {}),
                attemptsThisWeek: nextAttempts,
                totalCorrect: nextCorrect,
                totalQuestions: nextTotalQuestions,
                averageAccuracy: nextTotalQuestions > 0 ? Number(((nextCorrect / nextTotalQuestions) * 100).toFixed(2)) : 0,
                progressPercent: Math.min(100, Math.round((nextAttempts / 3) * 100)),
            };
        })();
        syncWeeklyProgress(optimisticProgress);

        if (!attemptSaved) {
            try {
                const userId = currentUser?.uid || "guest";
                await submitMockTestAttempt({
                    userId,
                    topic: config.topic,
                    difficulty: config.difficulty,
                    score: newScore,
                    totalQuestions: test.questions.length
                });
                setAttemptSaved(true);
                await loadWeeklyProgress();
            } catch (error) {
                console.error('Failed to save mock test attempt:', error);
                alert('Test submitted, but progress was not saved to server. Please ensure backend is running on port 5000.');
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto pb-12">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">AI Mock Test</h1>
                    <p className="text-[var(--text-secondary)]">Test your knowledge with questions from your syllabus.</p>
                </div>

                {progress && (
                    <Card className="p-6 mb-8">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">Weekly Mock Test Progress</h3>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {progress.attemptsThisWeek} / 3 tests completed this week
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-[var(--text-secondary)]">Average Accuracy</p>
                                <p className="text-xl font-bold text-[var(--text-primary)]">{progress.averageAccuracy}%</p>
                            </div>
                        </div>

                        <div className="w-full h-3 rounded-full bg-[var(--surface-hover)] overflow-hidden mb-4">
                            <div
                                className="h-full bg-[var(--primary-color)] transition-all duration-500"
                                style={{ width: `${progress.progressPercent}%` }}
                            />
                        </div>

                        <div className="text-sm text-[var(--text-secondary)]">
                            Correct answers this week: <span className="font-semibold text-[var(--text-primary)]">{progress.totalCorrect}/{progress.totalQuestions}</span>
                        </div>
                    </Card>
                )}

                {!test ? (
                    /* Configuration & Leaderboard Grid */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2">
                            <Card className="p-8">
                                <form onSubmit={handleGenerate} className="space-y-6">
                                    <Input
                                        label="Topic / Chapter"
                                        icon={FileText}
                                        placeholder="e.g. Thermodynamics, Shakespeare"
                                        value={config.topic}
                                        onChange={e => setConfig({ ...config, topic: e.target.value })}
                                        required
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Difficulty</label>
                                            <select
                                                className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all"
                                                value={config.difficulty}
                                                onChange={e => setConfig({ ...config, difficulty: e.target.value })}
                                            >
                                                <option>Easy</option>
                                                <option>Medium</option>
                                                <option>Hard</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Questions</label>
                                            <select
                                                className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all"
                                                value={config.questionCount}
                                                onChange={e => setConfig({ ...config, questionCount: Number(e.target.value) })}
                                            >
                                                <option value="3">3 Questions</option>
                                                <option value="5">5 Questions</option>
                                                <option value="10">10 Questions</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Question Type</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all"
                                            value={config.questionType}
                                            onChange={e => setConfig({ ...config, questionType: e.target.value })}
                                        >
                                            <option value="MCQ">MCQ</option>
                                            <option value="TWO_MARKS">2 Marks Answer Type</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Syllabus PDF (Optional)</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <select
                                                className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all"
                                                value={config.pdfId}
                                                onChange={e => setConfig({ ...config, pdfId: e.target.value })}
                                            >
                                                <option value="">Use all uploaded syllabus data</option>
                                                {documents.map(doc => (
                                                    <option key={doc.docId} value={doc.docId}>
                                                        {doc.filename}
                                                    </option>
                                                ))}
                                            </select>

                                            <label className="w-full">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    className="hidden"
                                                    onChange={handlePdfUpload}
                                                    disabled={uploadingPdf}
                                                />
                                                <span className="w-full h-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[var(--border-color)] text-sm font-semibold text-[var(--text-secondary)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors cursor-pointer">
                                                    <Upload size={16} />
                                                    {uploadingPdf ? 'Uploading PDF...' : 'Upload PDF'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        width="full"
                                        size="lg"
                                        icon={Target}
                                        loading={loading}
                                    >
                                        Start Test
                                    </Button>
                                </form>
                            </Card>
                        </div>

                        {/* Leaderboard Widget */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-[var(--surface-color)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Award className="text-yellow-500" />
                                    Top Scorers
                                </h3>
                                <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                                    <Leaderboard />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Test Interface */
                    <div className="space-y-6">
                        {/* Results Header */}
                        {showResults && (
                            <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-2xl flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300">Test Completed!</h3>
                                    <p className="text-green-700 dark:text-green-400">
                                        {test.questionType === 'TWO_MARKS'
                                            ? `You answered ${score} out of ${test.questions.length} questions`
                                            : `You scored ${score} out of ${test.questions.length}`
                                        }
                                    </p>
                                </div>
                                <div className="h-16 w-16 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-green-800 dark:text-green-200">{Math.round((score / test.questions.length) * 100)}%</span>
                                </div>
                            </div>
                        )}

                        {/* Questions List */}
                        <div className="space-y-6">
                            {test.questions.map((q, idx) => (
                                <Card
                                    key={q.id || idx}
                                    className={`p-6 border-2 ${test.questionType === 'TWO_MARKS'
                                            ? 'border-transparent'
                                            : showResults
                                                ? (answers[q.id] === q.correctAnswer ? 'border-green-500/50' : 'border-red-500/50')
                                                : 'border-transparent'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 bg-[var(--surface-hover)] rounded-full flex flex-shrink-0 items-center justify-center font-bold text-[var(--primary-color)]">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <p className="text-lg font-medium text-[var(--text-primary)]">{q.text}</p>

                                            {test.questionType === 'TWO_MARKS' ? (
                                                <>
                                                    <textarea
                                                        value={answers[q.id] || ''}
                                                        onChange={(e) => !showResults && handleAnswer(q.id, e.target.value)}
                                                        disabled={showResults}
                                                        placeholder="Write your 2-mark answer here..."
                                                        className="w-full min-h-[110px] p-3 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-primary)]"
                                                    />
                                                    {showResults && (
                                                        <div className="mt-4 p-3 bg-[var(--surface-hover)] rounded-lg text-sm text-[var(--text-secondary)] space-y-2">
                                                            <div><span className="font-bold">Model Answer:</span> {q.modelAnswer}</div>
                                                            {Array.isArray(q.keyPoints) && q.keyPoints.length > 0 && (
                                                                <div>
                                                                    <span className="font-bold">Key Points:</span>
                                                                    <ul className="list-disc ml-5 mt-1">
                                                                        {q.keyPoints.map((point, pointIndex) => (
                                                                            <li key={pointIndex}>{point}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {q.options.map((opt, optIndex) => {
                                                            const letter = String.fromCharCode(65 + optIndex); // A, B, C...
                                                            const isSelected = answers[q.id] === letter;
                                                            const isCorrect = q.correctAnswer === letter;

                                                            let btnClass = "p-3 rounded-lg border text-left transition-all hover:bg-[var(--surface-hover)] ";

                                                            if (showResults) {
                                                                if (isCorrect) btnClass += "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 ";
                                                                else if (isSelected) btnClass += "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 ";
                                                                else btnClass += "border-[var(--border-color)] opacity-60 ";
                                                            } else {
                                                                if (isSelected) btnClass += "border-[var(--primary-color)] bg-[var(--primary-color)]/5 ring-1 ring-[var(--primary-color)] ";
                                                                else btnClass += "border-[var(--border-color)] ";
                                                            }

                                                            return (
                                                                <button
                                                                    key={optIndex}
                                                                    onClick={() => !showResults && handleAnswer(q.id, letter)}
                                                                    disabled={showResults}
                                                                    className={btnClass}
                                                                >
                                                                    <span className="font-bold mr-2 opacity-70">{letter}.</span>
                                                                    {opt}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {showResults && (
                                                        <div className="mt-4 p-3 bg-[var(--surface-hover)] rounded-lg text-sm text-[var(--text-secondary)]">
                                                            <span className="font-bold">Explanation:</span> {q.explanation}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Actions */}
                        {!showResults ? (
                            <div className="flex justify-end pt-4">
                                <Button
                                    size="lg"
                                    icon={CheckCircle}
                                    onClick={submitTest}
                                    disabled={
                                        test.questionType === 'TWO_MARKS'
                                            ? test.questions.some(q => !(answers[q.id] || '').trim())
                                            : Object.keys(answers).length < test.questions.length
                                    }
                                >
                                    Submit Test
                                </Button>
                            </div>
                        ) : (
                            <div className="flex justify-center pt-8">
                                <Button variant="outline" onClick={() => setTest(null)}>
                                    Take Another Test
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
