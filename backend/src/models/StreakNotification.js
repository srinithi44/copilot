import mongoose from 'mongoose';

const streakNotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notificationType: {
        type: String,
        enum: ['email', 'sms'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['sent', 'failed', 'pending'],
        default: 'pending'
    },
    sentAt: {
        type: Date,
        default: null
    },
    errorMessage: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
streakNotificationSchema.index({ userId: 1, createdAt: -1 });
streakNotificationSchema.index({ status: 1 });

const StreakNotification = mongoose.model('StreakNotification', streakNotificationSchema);

export default StreakNotification;
