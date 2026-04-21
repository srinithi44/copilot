import express from 'express';
import { updatePoints, getLeaderboard, logSession } from '../controllers/GamificationController.js';

const router = express.Router();

// Routes
router.post('/update', updatePoints);
router.post('/log-session', logSession);
router.get('/leaderboard', getLeaderboard);

export default router;
