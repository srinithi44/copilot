
import express from 'express';
import SarvamService from '../services/SarvamService.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
    try {
        const { message, language, subject, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Context can include history, preferred language, current subject, etc.
        const context = {
            history,
            language,
            subject
        };

        const response = await SarvamService.generateResponse(message, context);

        // Extract the actual content from the response
        const aiMessage = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        res.json({
            success: true,
            response: aiMessage,
            raw: response // Optional: return raw response for debugging
        });

    } catch (error) {
        console.error('StudyPlan Copilot Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
