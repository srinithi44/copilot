import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId, // Optional if we want to track specific question answers
        questionText: String,
        selectedAnswer: String,
        isCorrect: Boolean
    }],
    completedAt: { type: Date, default: Date.now }
});

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
