import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

/**
 * Send a message to the MCP AI Copilot
 * @param {string} userId - The user's ID
 * @param {string} message - The user's message
 * @returns {Promise<object>} - The AI's response (text + structured data)
 */
export const sendMCPMessage = async (userId, message) => {
    try {
        const response = await axios.post(`${API_URL}/mcp/chat`, {
            userId,
            message
        });
        return response.data;
    } catch (error) {
        console.error('Error in MCP Chat:', error);
        throw error;
    }
};

/**
 * Get available tool definitions (optional, for debugging or help UI)
 */
export const getMCPTools = async () => {
    try {
        const response = await axios.get(`${API_URL}/mcp/tools`);
        return response.data;
    } catch (error) {
        console.error('Error fetching MCP tools:', error);
        return [];
    }
};
