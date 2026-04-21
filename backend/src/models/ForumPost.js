import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ForumPostSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: 'Anonymous' },
    userAvatar: { type: String }, // URL to avatar
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['General', 'Doubts', 'Projects', 'Resources', 'Exam Prep'],
        default: 'General'
    },
    likes: [{ type: String }], // Array of userIds who liked
    comments: [CommentSchema],
    views: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('ForumPost', ForumPostSchema);
