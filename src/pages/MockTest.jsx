import React, { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { generateMockTest } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Target, CheckCircle, Clock, Award, Loader2, ArrowRight } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Leaderboard from '../components/Leaderboard';

export default function MockTest() {
    const { currentUser } = useAuth();
    const [config, setConfig] = useState({
        topic: '',
        difficulty: 'Medium',
        questionCount: 5
    });
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTest(null);
        setAnswers({});
        setShowResults(false);

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

    const submitTest = () => {
        let newScore = 0;
        test.questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) newScore++;
        });
        setScore(newScore);
        setShowResults(true);
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto pb-12">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">AI Mock Test</h1>
                    <p className="text-[var(--text-secondary)]">Test your knowledge with questions from your syllabus.</p>
                </div>

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
                                    <p className="text-green-700 dark:text-green-400">You scored {score} out of {test.questions.length}</p>
                                </div>
                                <div className="h-16 w-16 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-green-800 dark:text-green-200">{Math.round((score / test.questions.length) * 100)}%</span>
                                </div>
                            </div>
                        )}

                        {/* Questions List */}
                        <div className="space-y-6">
                            {test.questions.map((q, idx) => (
                                <Card key={q.id || idx} className={`p-6 border-2 ${showResults ? (answers[q.id] === q.correctAnswer ? 'border-green-500/50' : 'border-red-500/50') : 'border-transparent'}`}>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 bg-[var(--surface-hover)] rounded-full flex flex-shrink-0 items-center justify-center font-bold text-[var(--primary-color)]">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <p className="text-lg font-medium text-[var(--text-primary)]">{q.text}</p>

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
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Actions */}
                        {!showResults ? (
                            <div className="flex justify-end pt-4">
                                <Button size="lg" icon={CheckCircle} onClick={submitTest} disabled={Object.keys(answers).length < test.questions.length}>
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
