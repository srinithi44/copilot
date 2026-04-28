import express from 'express';
import multer from 'multer';
import { uploadSyllabus, getDocuments } from '../controllers/DocumentController.js';
import {
    chatWithAI,
    generatePlan,
    generateTest,
    createPodcast,
    createFlowchart,
    submitMockTestAttempt,
    getWeeklyMockTestProgress
} from '../controllers/AIController.js';
import {
    summarizeSessionNotes,
    addExam
} from '../controllers/StudyController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Document Routes
router.post('/documents/upload', upload.single('file'), uploadSyllabus);
router.get('/documents', getDocuments);

import quizRoutes from './quizRoutes.js';
import institutionRoutes from './institutionRoutes.js';
import User from '../models/User.js';

// AI Routes
router.post('/ai/chat', chatWithAI);
router.post('/ai/plan', generatePlan);
router.post('/ai/test', generateTest);
router.post('/ai/test/submit', submitMockTestAttempt);
router.get('/ai/test/weekly-progress', getWeeklyMockTestProgress);
router.post('/ai/podcast', createPodcast);
router.post('/ai/flowchart', createFlowchart);

// TTS Proxy — fetches Google Translate audio server-side to avoid browser CORS
router.get('/ai/tts', async (req, res) => {
    const { text, lang = 'en' } = req.query;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8` +
        `&q=${encodeURIComponent(text)}&tl=${lang}&client=gtx&ttsspeed=0.9`;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://translate.google.com/',
            }
        });
        if (!response.ok) throw new Error(`Google TTS responded ${response.status}`);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        const buf = await response.arrayBuffer();
        res.send(Buffer.from(buf));
    } catch (e) {
        console.error('TTS Proxy error:', e.message);
        res.status(502).json({ error: 'TTS proxy failed', details: e.message });
    }
});


// Study Routes (Specific routes moved here from studyRoutes.js or added directly)
router.post('/study/summarize', summarizeSessionNotes);
router.post('/study/exams', addExam); // New endpoint for automation trigger

// Quiz Routes
router.use('/quiz', quizRoutes);

// Institution Routes
router.use('/institutions', institutionRoutes);

import studyRoutes from './studyRoutes.js';
// Study Tracker Routes
router.use('/study', studyRoutes);

import authRoutes from './authRoutes.js';
router.use('/auth', authRoutes);

import locationRoutes from './locationRoutes.js';
router.use('/location', locationRoutes);

import paymentRoutes from './paymentRoutes.js';
router.use('/payment', paymentRoutes);

import gamificationRoutes from './gamificationRoutes.js';
router.use('/gamification', gamificationRoutes);

import notesRoutes from './notesRoutes.js';
router.use('/notes', notesRoutes);

import flashcardRoutes from './flashcardRoutes.js';
router.use('/flashcards', flashcardRoutes);

import forumRoutes from './forumRoutes.js';
router.use('/forum', forumRoutes);

// User Routes (Directly here for simplicity)
router.get('/users/profile', async (req, res) => {
    try {
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ error: "UID required" });

        let user = await User.findOne({ uid });
        if (!user) {
            // Return 200 with flag to avoid console 404 errors during fresh signup
            return res.json({ exists: false });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Mark User as Verified
router.post('/users/verify-email', async (req, res) => {
    try {
        const { uid } = req.body;
        if (!uid) return res.status(400).json({ error: "UID required" });

        const user = await User.findOneAndUpdate(
            { uid },
            { isVerified: true },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ success: true, isVerified: user.isVerified });
    } catch (error) {
        console.error("Verification update error:", error);
        res.status(500).json({ error: "Failed to update verification status" });
    }
});

// Update User Profile
router.put('/users/profile', async (req, res) => {
    try {
        const { uid, institutionId, location } = req.body;
        if (!uid) return res.status(400).json({ error: "UID required" });

        const user = await User.findOneAndUpdate(
            { uid },
            { institutionId, location },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json(user);
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// Auth/Misc (Existing OTP route can be moved here or kept, keeping it simple for now)
// router.post('/auth/otp', otpController);


// Get Users by Institution (Admin/Prof only)
router.get('/users/list', async (req, res) => {
    try {
        const { uid } = req.query;
        const currentUser = await User.findOne({ uid });

        if (!currentUser) return res.status(404).json({ error: "User not found" });

        // Fetch users from same institution
        const users = await User.find({ institutionId: currentUser.institutionId })
            .select('email role location createdAt')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

export default router;
