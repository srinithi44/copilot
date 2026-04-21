
import SarvamService from './src/services/SarvamService.js';
import dotenv from 'dotenv';
dotenv.config();

console.log("Starting Sarvam API Test...");

async function testSarvam() {
    const apiKey = process.env.SARVAM_API_KEY;

    if (!apiKey) {
        console.error("❌ SARVAM_API_KEY is missing in process.env");
        console.log("Current env keys:", Object.keys(process.env).filter(k => k.includes('API')));
        return;
    }

    console.log(`✅ SARVAM_API_KEY found (${apiKey.length} chars)`);

    try {
        console.log("Sending request to Sarvam...");
        const response = await SarvamService.generateResponse("Hello, simple test.");
        console.log("✅ Success!");

        const fs = await import('fs');
        fs.writeFileSync('sarvam_success.log', JSON.stringify(response, null, 2));
        console.log("Response written to sarvam_success.log");

    } catch (error) {
        console.error("\n❌ Test Failed!");
        console.error("Error Message:", error.message);
        // The service throws a new Error, so we might lose the original axios error details 
        // unless we modify the service or look at what's logged by the service.
    }
}

testSarvam();
