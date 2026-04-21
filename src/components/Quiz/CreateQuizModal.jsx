import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button';
import Input from '../Input';
import { Plus, Trash2, X } from 'lucide-react';

export default function CreateQuizModal({ isOpen, onClose, onCreate }) {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(30);
    const [questions, setQuestions] = useState([
        { question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }
    ]);
    const [loading, setLoading] = useState(false);

    const handleAddQuestion = () => {
        setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]);
    };

    const handleRemoveQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async () => {
        setLoading(true);
        await onCreate({ title, duration, questions, totalMarks: questions.length }); // Simple marks logic
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Create New Quiz</h2>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <Input label="Quiz Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Physics Midterm" />
                        </div>
                        <div>
                            <Input label="Duration (mins)" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-700">Questions</h3>
                            <Button size="sm" onClick={handleAddQuestion} icon={Plus}>Add Question</Button>
                        </div>

                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 relative">
                                <button onClick={() => handleRemoveQuestion(qIndex)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                                <Input
                                    placeholder={`Question ${qIndex + 1}`}
                                    value={q.question}
                                    onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)}
                                    className="bg-white"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`q-${qIndex}`}
                                                checked={q.correctAnswer === oIndex}
                                                onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                                                className="accent-[var(--primary-color)]"
                                            />
                                            <input
                                                className="flex-1 p-2 rounded-lg border border-slate-200 text-sm"
                                                placeholder={`Option ${oIndex + 1}`}
                                                value={opt}
                                                onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={loading} className="bg-[var(--primary-color)] text-white">Create Quiz</Button>
                </div>
            </motion.div>
        </div>
    );
}
