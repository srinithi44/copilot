import express from 'express';
import { logSession, getAnalytics, getGoals, setGoal, getHistory } from '../controllers/StudyController.js';

const router = express.Router();

router.post('/sessions', logSession);
router.get('/sessions/history', getHistory);
router.get('/analytics', getAnalytics);
router.get('/goals', getGoals);
router.post('/goals', setGoal);

import { getTimeTable, saveTimeTable } from '../controllers/StudyController.js';
router.get('/timetable', getTimeTable);
router.post('/timetable', saveTimeTable);

// AI Summary
import { summarizeSessionNotes } from '../controllers/StudyController.js';
router.post('/summarize', summarizeSessionNotes);

export default router;
