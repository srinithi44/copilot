import mongoose from 'mongoose';

const studyGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    weeklyTargetHours: {
        type: Number,
        required: true
    },
    completedHours: {
        type: Number,
        default: 0
    },
    weekStartDate: {
        type: Date,
        required: true // Should represent the start of the week (e.g., Monday 00:00:00)
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user has only one goal per subject per week
studyGoalSchema.index({ userId: 1, subject: 1, weekStartDate: 1 }, { unique: true });

const StudyGoal = mongoose.model('StudyGoal', studyGoalSchema);

export default StudyGoal;
