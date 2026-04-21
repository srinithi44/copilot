import Note from '../models/Note.js';

// Get all notes for a user
export const getNotes = async (req, res) => {
    try {
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ error: "UID required" });

        const notes = await Note.find({ userId: uid }).sort({ isPinned: -1, updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notes" });
    }
};

// Create a new note
export const createNote = async (req, res) => {
    try {
        const { uid, title, content, tags } = req.body;
        if (!uid) return res.status(400).json({ error: "UID required" });

        const newNote = new Note({
            userId: uid,
            title: title || 'Untitled Note',
            content,
            tags
        });
        await newNote.save();
        res.json(newNote);
    } catch (error) {
        res.status(500).json({ error: "Failed to create note" });
    }
};

// Update a note
export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, tags, isPinned } = req.body;

        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { title, content, tags, isPinned },
            { new: true }
        );

        if (!updatedNote) return res.status(404).json({ error: "Note not found" });
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ error: "Failed to update note" });
    }
};

// Delete a note
export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        await Note.findByIdAndDelete(id);
        res.json({ success: true, message: "Note deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete note" });
    }
};
