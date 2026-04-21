import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questions: [{
        question: String,
        options: [String],
        correctAnswer: String, // option index or text
        marks: { type: Number, default: 1 }
    }],
    totalMarks: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number, // in minutes
        default: 30
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
