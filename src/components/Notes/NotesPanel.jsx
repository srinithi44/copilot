import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { X, Save, Trash2, Plus, StickyNote } from 'lucide-react';
import './NotesPanel.css'; // We'll create this CSS

const NotesPanel = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [notes, setNotes] = useState([]);
    const [activeNote, setActiveNote] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentUser && isOpen) {
            fetchNotes();
        }
    }, [currentUser, isOpen]);

    const fetchNotes = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/notes?uid=${currentUser.uid}`);
            setNotes(res.data);
            if (res.data.length > 0 && !activeNote) {
                selectNote(res.data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch notes", error);
        }
    };

    const selectNote = (note) => {
        setActiveNote(note);
        setTitle(note.title);
        setContent(note.content);
    };

    const createNewNote = () => {
        setActiveNote(null);
        setTitle('');
        setContent('');
    };

    const saveNote = async () => {
        if (!title.trim()) return;
        setIsSaving(true);
        try {
            if (activeNote) {
                // Update
                const res = await axios.put(`${API_BASE_URL}/notes/${activeNote._id}`, {
                    title,
                    content
                });
                setNotes(notes.map(n => n._id === activeNote._id ? res.data : n));
                setActiveNote(res.data);
            } else {
                // Create
                const res = await axios.post(`${API_BASE_URL}/notes`, {
                    uid: currentUser.uid,
                    title,
                    content
                });
                setNotes([res.data, ...notes]);
                setActiveNote(res.data);
            }
        } catch (error) {
            console.error("Failed to save note", error);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteNote = async (e, noteId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure?")) {
            try {
                await axios.delete(`${API_BASE_URL}/notes/${noteId}`);
                const newNotes = notes.filter(n => n._id !== noteId);
                setNotes(newNotes);
                if (activeNote?._id === noteId) {
                    createNewNote();
                }
            } catch (error) {
                console.error("Failed to delete note", error);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="notes-panel-overlay">
            <div className="notes-panel">
                <div className="notes-sidebar">
                    <div className="notes-header">
                        <h3><StickyNote size={18} /> My Notes</h3>
                        <button onClick={createNewNote} className="new-note-btn"><Plus size={16} /></button>
                    </div>
                    <div className="notes-list">
                        {notes.map(note => (
                            <div
                                key={note._id}
                                className={`note-item ${activeNote?._id === note._id ? 'active' : ''}`}
                                onClick={() => selectNote(note)}
                            >
                                <span className="note-title">{note.title}</span>
                                <button className="delete-btn" onClick={(e) => deleteNote(e, note._id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="notes-editor-area">
                    <div className="editor-toolbar">
                        <input
                            type="text"
                            placeholder="Note Title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="title-input"
                        />
                        <div className="editor-actions">
                            <button onClick={saveNote} disabled={isSaving} className="save-btn">
                                <Save size={18} /> {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={onClose} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        className="quill-editor"
                    />
                </div>
            </div>
        </div>
    );
};

export default NotesPanel;
