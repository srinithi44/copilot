import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    studyDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    relatedDocumentId: {
        type: String, // Storing as String to accommodate various ID formats (UUID or ObjectId)
        default: null
    },
    references: [{
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, enum: ['youtube', 'article', 'website'], default: 'website' }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying of user sessions by date (for analytics)
studySessionSchema.index({ userId: 1, studyDate: -1 });

const StudySession = mongoose.model('StudySession', studySessionSchema);

export default StudySession;
