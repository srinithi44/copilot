import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
    userId: {
        type: String, // Firebase UID
        required: true,
        index: true
    },
    title: {
        type: String,
        default: 'Untitled Note'
    },
    content: {
        type: String, // HTML or JSON from rich text editor
        default: ''
    },
    tags: [{
        type: String
    }],
    isPinned: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('Note', NoteSchema);
