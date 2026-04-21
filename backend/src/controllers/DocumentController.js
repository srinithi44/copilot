import RAGService from '../services/RAGService.js';
import Document from '../models/Document.js';
import { v4 as uuidv4 } from 'uuid';

export const uploadSyllabus = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Ideally get userId from auth middleware req.user.uid
        // For dev/testing allowing body override or fallback
        const userId = req.body.userId || req.user?.uid || "dev_user";
        const docId = uuidv4();

        console.log(`Starting process for file: ${req.file.originalname}`);

        const result = await RAGService.processDocument(req.file.buffer, userId, docId, req.file.originalname);

        // Save metadata to MongoDB
        await Document.create({
            userId,
            docId,
            filename: req.file.originalname
        });

        res.status(200).json({
            success: true,
            message: "Syllabus processed and embedded successfully",
            docId: docId,
            chunks: result.chunks
        });

    } catch (error) {
        console.error("Upload Controller Error:", error);
        const details = error.message || String(error);
        res.status(500).json({
            error: "Document processing failed",
            details
        });
    }
};

export const getDocuments = async (req, res) => {
    try {
        const userId = req.query.userId || req.user?.uid || "dev_user";
        const documents = await Document.find({ userId }).sort({ uploadDate: -1 });
        res.json(documents);
    } catch (error) {
        console.error("Get Documents Error:", error);
        res.status(500).json({ error: "Failed to fetch documents" });
    }
};
