import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import AIService from './src/services/AIService.js';

async function runGenerations() {
    console.log("---------------------------------------------------------");
    console.log("🔍 Simulating context retrieval (skipping Pinecone DB)...");
    
    // We mock the context extraction to avoid needing an uploaded PDF for this test
    AIService.getContext = async () => "Newton's laws of motion are three basic laws of classical mechanics that describe the relationship between the motion of an object and the forces acting on it. The first law states that an object at rest remains at rest, and an object in motion remains in motion at constant speed and in a straight line unless acted on by an unbalanced force. The second law states that the acceleration of an object depends on the mass of the object and the amount of force applied. The third law states that whenever one object exerts a force on another object, the second object exerts an equal and opposite on the first.";

    console.log("🚀 Generating Dynamic Questions for Topic: 'Newton's Laws'...");
    
    try {
        const mockTest = await AIService.generateMockTest('test-user-id', {
            topic: 'Newton\'s Laws',
            difficulty: 'Hard',
            questionCount: 2
        });
        
        console.log("\n✅ DYNAMIC QUESTION GENERATION SUCCESSFUL!");
        console.log(JSON.stringify(mockTest, null, 2));
    } catch (error) {
        console.error("\n❌ Error during generation:", error.message);
    }
    console.log("---------------------------------------------------------");
}

runGenerations().then(() => process.exit(0));
