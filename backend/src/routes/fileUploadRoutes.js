import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import RAGService from '../services/RAGService.js';
import AIService from '../services/AIService.js';
import PodcastEpisode from '../models/PodcastEpisode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Ensure upload directories exist
['files', 'podcasts', 'covers'].forEach(dir => {
    const p = path.join(uploadsDir, dir);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const router = express.Router();

// ── File upload for AI Chat ──────────────────────────────────────────────────

const fileStorage = multer.memoryStorage();
const fileUpload = multer({
    storage: fileStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.docx', '.txt', '.csv', '.png', '.jpg', '.jpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported file type: ${ext}. Allowed: ${allowed.join(', ')}`));
        }
    }
});

/**
 * POST /api/files/upload
 * Upload a file for AI analysis. Extracts text and returns it.
 */
router.post('/upload', fileUpload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.body.userId || 'dev_user';
        const filename = req.file.originalname;
        const ext = path.extname(filename).toLowerCase();

        console.log(`[FileUpload] Processing ${filename} (${(req.file.size / 1024).toFixed(1)}KB) for user ${userId}`);

        let extractedText = '';
        let fileType = 'document';

        // Image files — describe them instead of extracting text
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            fileType = 'image';
            try {
                const description = await AIService.analyzeImage(req.file.buffer, req.file.mimetype);
                extractedText = `[Uploaded Image Analysis for ${filename}]:\n${description}`;
            } catch (imageErr) {
                console.error('[FileUpload] Image analysis failed:', imageErr.message);
                extractedText = `[Uploaded image: ${filename}, Size: ${(req.file.size / 1024).toFixed(1)}KB]. Note: Failed to perform AI image analysis.`;
            }
        } else if (['.txt', '.csv', '.md'].includes(ext)) {
            // Plain text files — read directly
            extractedText = req.file.buffer.toString('utf-8');
        } else {
            // PDF, DOCX — use RAGService
            try {
                extractedText = await RAGService.extractTextFromFile(req.file.buffer, filename);
            } catch (extractErr) {
                console.error('[FileUpload] RAGService extraction failed:', extractErr.message);
                // Fallback: try reading as plain text
                extractedText = req.file.buffer.toString('utf-8');
                if (extractedText.length < 50 || extractedText.includes('\x00')) {
                    throw new Error(`Could not extract text from ${ext} file: ${extractErr.message}`);
                }
            }
        }

        console.log(`[FileUpload] Success: extracted ${extractedText.length} chars from ${filename}`);

        res.status(200).json({
            success: true,
            filename,
            fileType,
            textLength: extractedText.length,
            extractedText: extractedText.substring(0, 50000),
        });
    } catch (error) {
        console.error('[FileUpload] Error:', error.message, error.stack);
        res.status(500).json({
            error: 'File processing failed',
            details: error.message
        });
    }
});

/**
 * POST /api/files/chat
 * Chat with AI including file context.
 */
router.post('/chat', async (req, res) => {
    try {
        const { query, userId, language, fileContent, fileName } = req.body;
        const uid = userId || 'dev_user';

        if (!query) return res.status(400).json({ error: 'Query is required' });

        let enhancedQuery = query;
        if (fileContent) {
            const truncated = fileContent.substring(0, 30000);
            enhancedQuery = `The user has uploaded a file named "${fileName || 'document'}". Here is the file content:\n\n---FILE CONTENT START---\n${truncated}\n---FILE CONTENT END---\n\nUser's question: ${query}`;
        }

        const response = await AIService.chat(enhancedQuery, uid, language || 'English');
        res.status(200).json({ response });
    } catch (error) {
        console.error('[FileChat] Error:', error);
        res.status(500).json({ error: 'AI Chat failed', details: error.message });
    }
});


// ── Podcast audio upload ────────────────────────────────────────────────────

const podcastStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fieldDir = file.fieldname === 'cover' ? 'covers' : 'podcasts';
        cb(null, path.join(uploadsDir, fieldDir));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const podcastUpload = multer({
    storage: podcastStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max for audio
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'audio') {
            const allowed = ['.mp3', '.wav', '.m4a'];
            const ext = path.extname(file.originalname).toLowerCase();
            if (allowed.includes(ext)) return cb(null, true);
            return cb(new Error(`Unsupported audio format: ${ext}. Allowed: MP3, WAV, M4A`));
        }
        if (file.fieldname === 'cover') {
            const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
            const ext = path.extname(file.originalname).toLowerCase();
            if (allowed.includes(ext)) return cb(null, true);
            return cb(new Error(`Unsupported image format: ${ext}`));
        }
        cb(null, true);
    }
});

/**
 * POST /api/podcast/upload
 * Upload a podcast episode (audio + optional cover image).
 */
router.post('/podcast/upload', podcastUpload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), async (req, res) => {
    try {
        const audioFile = req.files?.audio?.[0];
        if (!audioFile) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }

        const userId = req.body.userId || 'dev_user';
        const title = req.body.title || audioFile.originalname;
        const description = req.body.description || '';

        const episode = await PodcastEpisode.create({
            userId,
            title,
            description,
            audioFilename: audioFile.originalname,
            audioPath: `/uploads/podcasts/${audioFile.filename}`,
            coverImagePath: req.files?.cover?.[0]
                ? `/uploads/covers/${req.files.cover[0].filename}`
                : '',
            duration: parseInt(req.body.duration) || 0,
            format: path.extname(audioFile.originalname).replace('.', ''),
            fileSize: audioFile.size
        });

        console.log(`[Podcast] Uploaded: "${title}" (${(audioFile.size / 1024 / 1024).toFixed(1)}MB)`);

        res.status(200).json({
            success: true,
            episode: {
                _id: episode._id,
                title: episode.title,
                description: episode.description,
                audioPath: episode.audioPath,
                coverImagePath: episode.coverImagePath,
                duration: episode.duration,
                format: episode.format,
                fileSize: episode.fileSize,
                createdAt: episode.createdAt
            }
        });
    } catch (error) {
        console.error('[Podcast Upload] Error:', error);
        res.status(500).json({ error: 'Podcast upload failed', details: error.message });
    }
});

/**
 * GET /api/podcast/episodes
 * List uploaded podcast episodes for a user.
 */
router.get('/podcast/episodes', async (req, res) => {
    try {
        const userId = req.query.userId || 'dev_user';
        const episodes = await PodcastEpisode.find({ userId })
            .sort({ createdAt: -1 })
            .lean();
        res.json(episodes);
    } catch (error) {
        console.error('[Podcast List] Error:', error);
        res.status(500).json({ error: 'Failed to fetch episodes' });
    }
});

/**
 * DELETE /api/podcast/episodes/:id
 * Delete a podcast episode.
 */
router.delete('/podcast/episodes/:id', async (req, res) => {
    try {
        const episode = await PodcastEpisode.findByIdAndDelete(req.params.id);
        if (!episode) return res.status(404).json({ error: 'Episode not found' });

        // Delete files from disk
        const audioFullPath = path.join(uploadsDir, '..', episode.audioPath);
        if (fs.existsSync(audioFullPath)) fs.unlinkSync(audioFullPath);
        if (episode.coverImagePath) {
            const coverFullPath = path.join(uploadsDir, '..', episode.coverImagePath);
            if (fs.existsSync(coverFullPath)) fs.unlinkSync(coverFullPath);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[Podcast Delete] Error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Multer error handler
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File too large. Max: 10MB for documents, 50MB for audio.' });
        }
        return res.status(400).json({ error: err.message });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

export default router;
