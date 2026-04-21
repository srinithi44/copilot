import FlashcardDeck from '../models/FlashcardDeck.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate Flashcards using AI
export const generateFlashcards = async (req, res) => {
    try {
        const { topic, amount = 5, context } = req.body;

        if (!topic && !context) {
            return res.status(400).json({ error: "Topic or context required" });
        }

        const prompt = `Create ${amount} flashcards for the topic: "${topic}" ${context ? `based on this context: ${context.substring(0, 500)}...` : ''}.

Return ONLY a valid JSON array in this exact format (no markdown, no extra text):
[
    { "front": "Question or term here", "back": "Answer or definition here" },
    { "front": "Another question", "back": "Another answer" }
]

Make the flashcards educational, clear, and concise.`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean the response - remove markdown code blocks if present
        let cleanedText = responseText.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/```\n?/g, '');
        }

        const cards = JSON.parse(cleanedText.trim());

        if (!Array.isArray(cards)) {
            throw new Error("Invalid response format");
        }

        res.json({ cards });

    } catch (error) {
        console.error("AI Flashcard Error:", error);
        res.status(500).json({
            error: "Failed to generate flashcards",
            details: error.message
        });
    }
};

// Save a new Deck
export const saveDeck = async (req, res) => {
    try {
        const { uid, topic, cards } = req.body;
        if (!uid || !cards) return res.status(400).json({ error: "Data incomplete" });

        const newDeck = new FlashcardDeck({
            userId: uid,
            topic,
            cards
        });
        await newDeck.save();
        res.json(newDeck);
    } catch (error) {
        res.status(500).json({ error: "Failed to save deck" });
    }
};

// Get User Decks
export const getDecks = async (req, res) => {
    try {
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ error: "UID required" });

        const decks = await FlashcardDeck.find({ userId: uid }).sort({ createdAt: -1 });
        res.json(decks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch decks" });
    }
};
