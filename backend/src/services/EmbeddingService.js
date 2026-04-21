/**
 * Embedding service using Cohere API (free tier).
 * Migrated from OpenAI due to quota limits.
 * Cohere provides 100 calls/min and 1000 calls/month for free.
 */
import { CohereClient } from 'cohere-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Cohere client
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

// Cohere embed-english-v3.0 returns 1024 dimensions
// Note: This is different from OpenAI's 1536, so Pinecone index must be recreated
export const embeddingConfig = {
    dimension: 1024,
    indexName: 'study-copilot',
};
const EMBEDDING_DIM = embeddingConfig.dimension;

/**
 * Generate embeddings via Cohere.
 * @param {string[]} texts - Array of text strings to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
async function embedWithCohere(texts) {
    try {
        const response = await cohere.embed({
            texts: texts,
            model: 'embed-english-v3.0',
            inputType: 'search_document', // Optimized for document storage
            embeddingTypes: ['float'],
        });

        // Cohere returns embeddings in response.embeddings.float
        return response.embeddings.float;
    } catch (error) {
        console.error('Cohere Embedding Error:', error);
        throw new Error(`Cohere API error: ${error.message}`);
    }
}

/**
 * Generate embeddings for text chunks.
 * @param {string[]} texts - Array of text strings to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function generateEmbeddings(texts) {
    if (!texts || texts.length === 0) return [];

    // Validate Cohere API key
    if (!process.env.COHERE_API_KEY) {
        throw new Error(
            'COHERE_API_KEY is not set in environment variables. ' +
            'Please sign up at https://cohere.com and add your API key to .env'
        );
    }

    try {
        console.log(`Generating embeddings for ${texts.length} text chunks using Cohere...`);
        const embeddings = await embedWithCohere(texts);
        console.log(`Successfully generated ${embeddings.length} embeddings (${EMBEDDING_DIM}D)`);
        return embeddings;
    } catch (error) {
        console.error('Embedding Generation Failed:', error);
        throw error;
    }
}

export { EMBEDDING_DIM };
