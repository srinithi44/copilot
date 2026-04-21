
import AIService from './src/services/AIService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testLanguageSupport() {
    console.log("Testing AIService with Language Support...");
    try {
        const query = "What is the capital of France?";
        const userId = "test_user_hindi";
        const language = "Hindi";

        console.log(`Asking: "${query}" in Language: "${language}"`);
        const response = await AIService.chat(query, userId, language);

        console.log("\n✅ AI Response:");
        console.log(response);

        if (response && response.length > 0) {
            // Simple check for Hindi characters or devanagari range
            const hasHindi = /[\u0900-\u097F]/.test(response);

            const fs = await import('fs');
            fs.writeFileSync('verify_language_output.log', response);

            if (hasHindi) {
                console.log("\n✅ Verification Successful: Received Hindi response.");
            } else {
                console.warn("\n⚠️ Verification Warning: Response might not be in Hindi. Check verify_language_output.log.");
            }
        } else {
            console.error("\n❌ Verification Failed: Empty response.");
        }

    } catch (error) {
        console.error("\n❌ Verification Failed with Error:", error);
    }
}

testLanguageSupport();
