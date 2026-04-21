import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

async function listModels() {
    if (!GOOGLE_API_KEY) {
        console.error("No API Key found in .env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY}`;

    try {
        console.log("Fetching available models...");
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
        }
        const data = await response.json();
        const models = data.models || [];

        console.log("\n--- Available Models for GenerateContent ---");
        const generateModels = models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name.replace("models/", ""));

        console.log(generateModels.join("\n"));

        fs.writeFileSync(path.join(process.cwd(), 'models.txt'), generateModels.join("\n"));
        console.log("--------------------------------------------\nMODELS WRITTEN TO models.txt");

    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

listModels();
