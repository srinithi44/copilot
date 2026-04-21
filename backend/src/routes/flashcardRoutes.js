import express from 'express';
import { generateFlashcards, saveDeck, getDecks } from '../controllers/FlashcardController.js';

const router = express.Router();

router.post('/generate', generateFlashcards);
router.post('/save', saveDeck);
router.get('/', getDecks);

export default router;
