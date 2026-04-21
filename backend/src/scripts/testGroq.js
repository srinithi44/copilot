import AIService from '../services/AIService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testGroq() {
    console.log("Testing Groq Integration...");
    try {
        const response = await AIService.generateCompletion([
            { role: "user", content: "Hello, say 'Groq is working' if you can hear me." }
        ]);
        console.log("Response:", response);

        if (response && response.includes("Groq")) {
            console.log("✅ Groq integration successful!");
        } else {
            console.log("⚠️ Response received but unexpected content.");
        }

    } catch (error) {
        console.error("❌ Groq Verification Failed:", error);
    }
}

testGroq();
