import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import { embeddingConfig } from '../services/EmbeddingService.js';

dotenv.config();

export async function ensurePineconeIndex() {
    if (!process.env.PINECONE_API_KEY) {
        throw new Error("PINECONE_API_KEY is missing in .env");
    }

    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });

    const { indexName, dimension } = embeddingConfig;
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.indexes?.some(idx => idx.name === indexName);

    if (indexExists) {
        console.log(`Pinecone index '${indexName}' already exists.`);
    } else {
        console.log(`Creating Pinecone index '${indexName}' (dimension ${dimension})...`);
        await pinecone.createIndex({
            name: indexName,
            dimension: dimension,
            metric: 'cosine',
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1'
                }
            }
        });
        console.log(`Pinecone index '${indexName}' created successfully.`);
    }
}

// Allow running directly: node src/scripts/initPinecone.js
if (process.argv[1]?.endsWith('initPinecone.js')) {
    ensurePineconeIndex().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
