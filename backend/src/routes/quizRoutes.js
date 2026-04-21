import express from 'express';
import { createQuiz, getQuizzes, getQuizById, submitQuiz, getLeaderboard } from '../controllers/QuizController.js';

const router = express.Router();

router.post('/create', createQuiz);
router.get('/list', getQuizzes);
router.get('/:id', getQuizById);
router.post('/submit', submitQuiz);
router.get('/leaderboard/all', getLeaderboard);

export default router;
