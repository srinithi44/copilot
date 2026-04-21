import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PINECONE_API_KEY) {
    console.warn("Missing PINECONE_API_KEY in environment variables");
}

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

export const indexName = "study-copilot";

export default pinecone;
