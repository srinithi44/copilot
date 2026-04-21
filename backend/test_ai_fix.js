import AIService from './src/services/AIService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testAI() {
    console.log("Starting AI Service Test with New Key...");
    try {
        const result = await AIService.generateStudyPlan("test-user", {
            examDate: "2026-05-01",
            subjects: "History",
            goal: "Learn",
            hoursPerDay: 2
        });
        console.log("Test Success!");
        console.log("Plan generated successfully.");
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testAI();
