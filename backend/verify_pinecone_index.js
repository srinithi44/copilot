import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function verifyIndex() {
    console.log('Verifying Pinecone Index...');

    if (!process.env.PINECONE_API_KEY) {
        console.error('Error: PINECONE_API_KEY missing from .env');
        return;
    }

    try {
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });

        const indexName = 'study-copilot';

        // List indexes
        const { indexes } = await pinecone.listIndexes();
        console.log('Available Indexes:', indexes.map(i => i.name));

        const indexModel = indexes.find(i => i.name === indexName);

        if (!indexModel) {
            console.error(`Index '${indexName}' NOT FOUND.`);
            return;
        }

        console.log(`\nIndex '${indexModel.name}' Details:`);
        console.log(`- Dimension: ${indexModel.dimension}`);
        console.log(`- Metric: ${indexModel.metric}`);
        console.log(`- Status: ${indexModel.status.state}`);
        console.log(`- Host: ${indexModel.host}`);

        if (indexModel.dimension === 1024) {
            console.log('\n✅ SUCCESS: Index dimension matches Cohere (1024).');
        } else {
            console.error(`\n❌ MISMATCH: Index dimension is ${indexModel.dimension}, expected 1024.`);
            console.log('Action Required: Delete this index using Pinecone Console or script, and restart backend to recreate it.');
        }

    } catch (error) {
        console.error('Verification Failed:', error);
    }
}

verifyIndex();
