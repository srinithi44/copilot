
import AIService from './src/services/AIService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testAIService() {
    console.log("Testing AIService with Sarvam Integration...");
    try {
        const query = "What is the capital of France?";
        const userId = "test_user_sarvam";

        console.log(`Asking: "${query}"`);
        const response = await AIService.chat(query, userId);

        console.log("\n✅ AI Response:");
        console.log(response);

        if (response && response.length > 0) {
            console.log("\n✅ Verification Successful: Received response from Sarvam.");
        } else {
            console.error("\n❌ Verification Failed: Empty response.");
        }

    } catch (error) {
        console.error("\n❌ Verification Failed with Error:", error);
    }
}

testAIService();
