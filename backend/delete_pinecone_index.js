import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function deleteIndex() {
    console.log('Deleting Pinecone Index...');

    if (!process.env.PINECONE_API_KEY) {
        console.error('Error: PINECONE_API_KEY missing from .env');
        return;
    }

    try {
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });

        const indexName = 'study-copilot';

        console.log(`Deleting index '${indexName}'...`);
        await pinecone.deleteIndex(indexName);
        console.log('✅ Index deleted successfully.');
        console.log('Please restart the backend to recreate it with new dimensions.');

    } catch (error) {
        console.error('Deletion Failed:', error);
    }
}

deleteIndex();
