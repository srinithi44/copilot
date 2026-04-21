import mongoose from 'mongoose';

const studyStreakSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastStudyDate: {
        type: Date,
        default: null
    },
    lastNotificationSent: {
        type: Date,
        default: null
    },
    notificationCount: {
        type: Number,
        default: 0
    },
    streakAtRisk: {
        type: Boolean,
        default: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const StudyStreak = mongoose.model('StudyStreak', studyStreakSchema);

export default StudyStreak;
