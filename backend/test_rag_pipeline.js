import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbeddings } from './src/services/EmbeddingService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const INDEX_NAME = 'study-copilot';

async function testRAGPipeline() {
    console.log('🧪 Starting RAG Pipeline Test...');

    // 1. Generate Embedding for a test document chunk
    const testText = "The mitochondria is the powerhouse of the cell.";
    console.log(`\n1. Generating embedding for text: "${testText}"`);

    try {
        const embeddings = await generateEmbeddings([testText]);
        const embedding = embeddings[0]; // Get the first vector
        console.log(`✅ Embedding generated. Dimension: ${embedding.length}`);

        if (embedding.length !== 1024) {
            throw new Error(`Expected 1024 dimensions, got ${embedding.length}`);
        }

        // 2. Upload to Pinecone
        console.log('\n2. Uploading to Pinecone...');
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const index = pinecone.Index(INDEX_NAME);

        const testId = 'test-doc-1';
        await index.upsert([
            {
                id: testId,
                values: embedding,
                metadata: { text: testText, source: 'test_script' }
            }
        ]);
        console.log('✅ Vector upserted successfully.');

        // Wait for index to update (eventual consistency)
        console.log('   Waiting 5 seconds for indexing...');
        await new Promise(r => setTimeout(r, 5000));

        // 3. Query
        const queryText = "What is the powerhouse of the cell?";
        console.log(`\n3. Querying for: "${queryText}"`);
        const queryEmbeddings = await generateEmbeddings([queryText]);
        const queryVector = queryEmbeddings[0];

        const queryResponse = await index.query({
            vector: queryVector,
            topK: 1,
            includeMetadata: true
        });

        console.log('   Query Results:', JSON.stringify(queryResponse, null, 2));

        if (queryResponse.matches.length > 0 && queryResponse.matches[0].id === testId) {
            console.log('\n✅ SUCCESS: Retrieved the correct document!');
        } else {
            console.error('\n❌ FAILED: Did not retrieve the test document.');
        }

    } catch (error) {
        console.error('\n🛑 TEST FAILED:', error);
    }
}

testRAGPipeline();
