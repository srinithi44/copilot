import express from 'express';
import { handleAIRequest } from '../mcp/index.js';

const router = express.Router();

/**
 * @route POST /api/mcp/chat
 * @desc  Chat with the AI Copilot (MCP enabled)
 * @access Private
 */
router.post('/chat', async (req, res) => {
    try {
        const { userId, message } = req.body; // In real app, get userId from auth middleware

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        console.log(`[MCP API] Chat request from ${userId}: ${message}`);

        // Delegate to MCP Service
        const response = await handleAIRequest(userId || "default-user", message);

        res.json({
            success: true,
            response
        });

    } catch (error) {
        console.error("[MCP API] Error handling chat request:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

/**
 * @route GET /api/mcp/tools
 * @desc  List available tools (for debugging or frontend discovery)
 * @access Private
 */
router.get('/tools', (req, res) => {
    import('../mcp/index.js').then(({ registry }) => {
        res.json(registry.getToolDefinitions());
    });
});

export default router;
