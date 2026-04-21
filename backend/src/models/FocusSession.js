import mongoose from 'mongoose';

const FocusSessionSchema = new mongoose.Schema({
    userId: {
        type: String, // Firebase UID
        required: true,
        index: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    durationMinutes: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['work', 'break'],
        default: 'work'
    },
    status: {
        type: String,
        enum: ['completed', 'interrupted'],
        default: 'completed'
    }
}, { timestamps: true });

export default mongoose.model('FocusSession', FocusSessionSchema);
