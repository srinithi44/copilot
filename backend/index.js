import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import apiRoutes from './src/routes/api.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import studyCopilotRoutes from './src/routes/studyCopilotRoutes.js';
import fileUploadRoutes from './src/routes/fileUploadRoutes.js';
import { generateOTPEmailContent } from './src/services/GroqService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from './src/config/db.js';
import { ensurePineconeIndex } from './src/scripts/initPinecone.js';
import SchedulerService from './src/services/SchedulerService.js';
import mcpRoutes from './src/routes/mcpRoutes.js';
import { initMCP } from './src/mcp/index.js';
import automationEngine from './src/mcp/automation/engine.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api', apiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/copilot', studyCopilotRoutes);
app.use('/api/files', fileUploadRoutes);
app.use('/api', fileUploadRoutes);

// OTP route
app.post('/api/send-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
    try {
        const emailContent = await generateOTPEmailContent(email, otp);
        const { data, error } = await resend.emails.send({
            from: 'StudyPlanCopilot <onboarding@resend.dev>',
            to: [email],
            subject: emailContent.subject,
            html: emailContent.html,
        });
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ success: true, id: data.id });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
});

// Start Server after DB Connection
const startServer = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('✅ Database connected successfully.');

        ensurePineconeIndex().catch((err) => {
            console.warn('Pinecone init warning:', err.message);
        });

        app.listen(port, '0.0.0.0', () => {
            console.log(`🚀 Backend running on http://localhost:${port}`);
            SchedulerService.init();
            initMCP();
            automationEngine.init();
        });
    } catch (err) {
        console.error('❌ SERVER STARTUP FAILED:');
        console.error(err.message);
        console.log('Please check your MONGO_URI in .env and verify your IP is whitelisted in Atlas.');
        process.exit(1);
    }
};

startServer();
