// Test script for Cohere embeddings integration
import { generateEmbeddings, embeddingConfig } from './src/services/EmbeddingService.js';

console.log('🧪 Testing Cohere Embeddings Integration...\n');
console.log(`📊 Configuration:`);
console.log(`   - Model: Cohere embed-english-v3.0`);
console.log(`   - Dimension: ${embeddingConfig.dimension}`);
console.log(`   - Index: ${embeddingConfig.indexName}\n`);

const testTexts = [
    'Machine learning is a subset of artificial intelligence.',
    'Python is a popular programming language for data science.',
    'Neural networks are inspired by the human brain.',
];

async function testEmbeddings() {
    try {
        console.log(`📝 Generating embeddings for ${testTexts.length} sample texts...\n`);

        const embeddings = await generateEmbeddings(testTexts);

        console.log('✅ SUCCESS! Embeddings generated successfully\n');
        console.log(`📊 Results:`);
        console.log(`   - Number of embeddings: ${embeddings.length}`);
        console.log(`   - Embedding dimension: ${embeddings[0].length}`);
        console.log(`   - Expected dimension: ${embeddingConfig.dimension}`);
        console.log(`   - Dimension match: ${embeddings[0].length === embeddingConfig.dimension ? '✅ YES' : '❌ NO'}\n`);

        // Show first few values of first embedding
        console.log(`📈 Sample embedding values (first 10):`);
        console.log(`   ${embeddings[0].slice(0, 10).map(v => v.toFixed(4)).join(', ')}...\n`);

        console.log('✨ Cohere embeddings are working correctly!');
        console.log('🎯 Ready to use for document processing and RAG queries.');

    } catch (error) {
        console.error('❌ FAILED! Error generating embeddings:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check that COHERE_API_KEY is set in .env');
        console.error('   2. Verify the API key is valid at https://cohere.com');
        console.error('   3. Ensure you have internet connectivity');
        process.exit(1);
    }
}

testEmbeddings();
