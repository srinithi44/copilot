import express from 'express';
import { registerUser, getProfile, updateState } from '../controllers/AuthController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/profile', getProfile);
router.post('/update-state', updateState);

export default router;
