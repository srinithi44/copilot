import mongoose from 'mongoose';

const mockTestAttemptSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    topic: {
        type: String,
        required: true,
        trim: true
    },
    difficulty: {
        type: String,
        default: 'Medium'
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 1
    },
    accuracy: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

mockTestAttemptSchema.index({ uid: 1, submittedAt: -1 });

const MockTestAttempt = mongoose.model('MockTestAttempt', mockTestAttemptSchema);

export default MockTestAttempt;
