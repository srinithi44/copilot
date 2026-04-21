import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
    front: { type: String, required: true },
    back: { type: String, required: true },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'new'],
        default: 'new'
    },
    nextReview: { type: Date } // For spaced repetition later
});

const FlashcardDeckSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    topic: {
        type: String,
        required: true
    },
    cards: [CardSchema],
    tags: [String],
    isPublic: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('FlashcardDeck', FlashcardDeckSchema);
